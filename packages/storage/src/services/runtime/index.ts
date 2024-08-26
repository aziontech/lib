import { Azion } from 'azion/types';
import { AzionBucket, AzionBucketObject, AzionDeletedBucketObject } from '../../types';
import { removeLeadingSlash, retryWithBackoff } from '../../utils/index';

export const isInternalStorageAvailable = (): boolean => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (globalThis as any).Azion?.Sql || null;
};

/**
 * InternalStorageClient class to interact with Azion's Runtime  Storage API.
 *
 * This class provides methods to perform CRUD operations on the storage.
 * Due to eventual consistency, operations may fail temporarily after creating a storage instance.
 * To handle this, methods use retry with exponential backoff.
 */
export class InternalStorageClient implements AzionBucket {
  private storage: Azion.Storage.StorageInstance | null = null;

  constructor(
    private token: string,
    private debug: boolean | undefined,
  ) {}

  /**
   * Initializes the storage instance if not already initialized.
   *
   * @param {string} bucketName The name of the bucket to initialize.
   */
  private initializeStorage(bucketName: string) {
    if (!this.storage) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.storage = new (globalThis as any).Azion.Storage(bucketName);
    }
  }

  name: string = '';
  edge_access: string = 'unknown';

  /**
   * Retrieves a bucket by name.
   *
   * @param {string} name The name of the bucket.
   * @returns {Promise<AzionBucket | null>} The bucket object or null if not found.
   */
  async getBucket(name: string): Promise<AzionBucket | null> {
    this.initializeStorage(name);
    if (this.storage) {
      this.name = name;
      return {
        name,
        edge_access: 'unknown',
        state: 'executed-runtime',
        getObjects: this.getObjects.bind(this),
        getObjectByKey: this.getObjectByKey.bind(this),
        createObject: this.createObject.bind(this),
        updateObject: this.updateObject.bind(this),
        deleteObject: this.deleteObject.bind(this),
      };
    }
    return null;
  }

  /**
   * Retrieves all objects in the bucket.
   *
   * Uses retry with exponential backoff to handle eventual consistency delays.
   *
   * @returns {Promise<AzionBucketObject[] | null>} The list of objects or null if an error occurs.
   */
  async getObjects(): Promise<AzionBucketObject[] | null> {
    this.initializeStorage(this.name);
    try {
      const objectList = await retryWithBackoff(() => this.storage!.list());
      const objects = await Promise.all(
        objectList.entries.map(async (entry: { key: string; content_length?: number }) => {
          return {
            key: removeLeadingSlash(entry.key),
            size: entry.content_length,
            state: 'executed-runtime' as const,
          };
        }),
      );
      return objects;
    } catch (error) {
      if (this.debug) console.error('Error getting objects:', error);
      return null;
    }
  }

  /**
   * Retrieves an object by key.
   *
   * Uses retry with exponential backoff to handle eventual consistency delays.
   *
   * @param {string} objectKey The key of the object to retrieve.
   * @returns {Promise<AzionBucketObject | null>} The object or null if an error occurs.
   */
  async getObjectByKey(objectKey: string): Promise<AzionBucketObject | null> {
    this.initializeStorage(this.name);
    try {
      const storageObject = await retryWithBackoff(() => this.storage!.get(objectKey));
      const arrayBuffer = await storageObject.arrayBuffer();
      const decoder = new TextDecoder();
      const content = decoder.decode(arrayBuffer);
      return {
        state: 'executed-runtime',
        key: removeLeadingSlash(objectKey),
        size: storageObject.contentLength,
        content: content,
        content_type: storageObject.metadata.get('content-type'),
      };
    } catch (error) {
      if (this.debug) console.error('Error getting object by key:', error);
      return null;
    }
  }

  /**
   * Creates a new object in the bucket.
   *
   * Uses retry with exponential backoff to handle eventual consistency delays.
   *
   * @param {string} objectKey The key of the object to create.
   * @param {string} content The content of the object.
   * @param {{ content_type?: string }} [options] Optional metadata for the object.
   * @returns {Promise<AzionBucketObject | null>} The created object or null if an error occurs.
   */
  async createObject(
    objectKey: string,
    content: string,
    options?: { content_type?: string },
  ): Promise<AzionBucketObject | null> {
    this.initializeStorage(this.name);
    try {
      const contentBuffer = new TextEncoder().encode(content);
      await retryWithBackoff(() =>
        this.storage!.put(objectKey, contentBuffer, {
          'content-type': options?.content_type,
        }),
      );
      return {
        state: 'executed-runtime',
        key: removeLeadingSlash(objectKey),
        size: contentBuffer.byteLength,
        content_type: options?.content_type,
        content: content,
      };
    } catch (error) {
      if (this.debug) console.error('Error creating object:', error);
      return null;
    }
  }

  /**
   * Updates an existing object in the bucket.
   *
   * Uses retry with exponential backoff to handle eventual consistency delays.
   *
   * @param {string} objectKey The key of the object to update.
   * @param {string} content The new content of the object.
   * @param {{ content_type?: string }} [options] Optional metadata for the object.
   * @returns {Promise<AzionBucketObject | null>} The updated object or null if an error occurs.
   */
  async updateObject(
    objectKey: string,
    content: string,
    options?: { content_type?: string },
  ): Promise<AzionBucketObject | null> {
    return this.createObject(objectKey, content, options);
  }

  /**
   * Deletes an object from the bucket.
   *
   * Uses retry with exponential backoff to handle eventual consistency delays.
   *
   * @param {string} objectKey The key of the object to delete.
   * @returns {Promise<AzionDeletedBucketObject | null>} Confirmation of deletion or null if an error occurs.
   */
  async deleteObject(objectKey: string): Promise<AzionDeletedBucketObject | null> {
    this.initializeStorage(this.name);
    try {
      await retryWithBackoff(() => this.storage!.delete(objectKey));
      return { key: removeLeadingSlash(objectKey), state: 'executed-runtime' };
    } catch (error) {
      if (this.debug) console.error('Error deleting object:', error);
      return null;
    }
  }
}
