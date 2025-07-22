import { Azion } from 'azion/types';
import {
  AzionBucket,
  AzionBucketObject,
  AzionBucketObjects,
  AzionDeletedBucketObject,
  AzionObjectCollectionParams,
  AzionStorageResponse,
} from '../../types';
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
  // @ts-expect-error - edge_access is not defined in the AzionBucket interface
  edge_access: string = 'unknown';

  /**
   * Retrieves a bucket by name.
   *
   * @param {Object} params - Parameters for retrieving a bucket.
   * @param {string} params.name - The name of the bucket.
   * @returns {Promise<AzionBucket | null>} The bucket object or null if not found.
   */
  async getBucket({ name }: { name: string }): Promise<AzionBucket | null> {
    this.initializeStorage(name);
    if (this.storage) {
      this.name = name;
      return {
        name,
        // @ts-expect-error - edge_access is not defined in the AzionBucket interface
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
   * @param {Object} params - Parameters for object collection.
   * @param {AzionObjectCollectionParams} [params.params] - Parameters for object collection.
   * @returns {Promise<AzionStorageResponse<AzionBucketObjects>>} The list of objects or error message.
   */
  async getObjects({
    params,
  }: {
    params?: AzionObjectCollectionParams;
  }): Promise<AzionStorageResponse<AzionBucketObjects>> {
    this.initializeStorage(this.name);
    try {
      const objectList = await retryWithBackoff(() => this.storage!.list());
      const max_object_count = params?.max_object_count ?? objectList.entries.length;
      const objects = await Promise.all(
        objectList.entries.slice(0, max_object_count).map(async (entry: { key: string; content_length?: number }) => {
          return {
            key: removeLeadingSlash(entry.key),
            size: entry.content_length,
            state: 'executed-runtime' as const,
          };
        }),
      );
      return {
        data: {
          objects,
          count: objects.length,
        },
      };
    } catch (error) {
      if (this.debug) console.error('Error getting objects:', error);
      return {
        error: {
          message: (error as Error)?.message ?? 'Error getting objects',
          operation: 'getObjects',
        },
      };
    }
  }

  /**
   * Retrieves an object by key.
   *
   * Uses retry with exponential backoff to handle eventual consistency delays.
   *
   * @param {Object} params - Parameters for retrieving an object.
   * @param {string} params.key - The key of the object to retrieve.
   * @returns {Promise<AzionStorageResponse<AzionBucketObject>>} The object or null if an error occurs.
   */
  async getObjectByKey({ key }: { key: string }): Promise<AzionStorageResponse<AzionBucketObject>> {
    this.initializeStorage(this.name);
    try {
      const storageObject = await retryWithBackoff(() => this.storage!.get(key));
      const arrayBuffer = await storageObject.arrayBuffer();
      const decoder = new TextDecoder();
      const content = decoder.decode(arrayBuffer);
      return {
        data: {
          state: 'executed-runtime',
          key: removeLeadingSlash(key),
          size: storageObject.contentLength,
          content: content,
          content_type: storageObject.metadata?.get('content-type'),
        },
      };
    } catch (error) {
      if (this.debug) console.error('Error getting object by key:', error);
      return {
        error: {
          message: (error as Error)?.message ?? 'Error getting object by key',
          operation: 'getObjectByKey',
        },
      };
    }
  }

  /**
   * Creates a new object in the bucket.
   *
   * Uses retry with exponential backoff to handle eventual consistency delays.
   *
   * @param {Object} params - Parameters for creating an object.
   * @param {string} params.key - The key of the object to create.
   * @param {string} params.content - The content of the object.
   * @param {{ content_type?: string }} [params.options] - Optional metadata for the object.
   * @returns {Promise<AzionStorageResponse<AzionBucketObject>>} The created object or error message.
   */
  async createObject({
    key,
    content,
    options,
  }: {
    key: string;
    content: string;
    options?: { content_type?: string };
  }): Promise<AzionStorageResponse<AzionBucketObject>> {
    this.initializeStorage(this.name);
    try {
      const contentBuffer = new TextEncoder().encode(content);
      await retryWithBackoff(() =>
        this.storage!.put(key, contentBuffer.buffer, {
          'content-type': options?.content_type,
        }),
      );
      return {
        data: {
          state: 'executed-runtime',
          key: removeLeadingSlash(key),
          size: contentBuffer.byteLength,
          content_type: options?.content_type,
          content: content,
        },
      };
    } catch (error) {
      if (this.debug) console.error('Error creating object:', error);
      return {
        error: {
          message: (error as Error)?.message ?? 'Error creating object',
          operation: 'createObject',
        },
      };
    }
  }

  /**
   * Updates an existing object in the bucket.
   *
   * Uses retry with exponential backoff to handle eventual consistency delays.
   *
   * @param {Object} params - Parameters for updating an object.
   * @param {string} params.key - The key of the object to update.
   * @param {string} params.content - The new content of the object.
   * @param {{ content_type?: string }} [params.options] - Optional metadata for the object.
   * @returns {Promise<AzionStorageResponse<AzionBucketObject>>} The updated object or error message.
   */
  async updateObject({
    key,
    content,
    options,
  }: {
    key: string;
    content: string;
    options?: { content_type?: string };
  }): Promise<AzionStorageResponse<AzionBucketObject>> {
    return this.createObject({ key, content, options });
  }

  /**
   * Deletes an object from the bucket.
   *
   * Uses retry with exponential backoff to handle eventual consistency delays.
   *
   * @param {Object} params - Parameters for deleting an object.
   * @param {string} params.key - The key of the object to delete.
   * @returns {Promise<AzionStorageResponse<AzionDeletedBucketObject>>} Confirmation of deletion or error if an error occurs.
   */
  async deleteObject({ key }: { key: string }): Promise<AzionStorageResponse<AzionDeletedBucketObject>> {
    this.initializeStorage(this.name);
    try {
      await retryWithBackoff(() => this.storage!.delete(key));
      return { data: { key: removeLeadingSlash(key), state: 'executed-runtime' } };
    } catch (error) {
      if (this.debug) console.error('Error deleting object:', error);
      return {
        error: {
          message: (error as Error)?.message ?? 'Error deleting object',
          operation: 'deleteObject',
        },
      };
    }
  }
}
