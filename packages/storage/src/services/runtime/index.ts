import { Azion } from 'azion/types';
import { AzionBucket, AzionBucketObject, AzionDeletedBucketObject } from '../../types';

export const isInternalStorageAvailable = (): boolean => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (globalThis as any).Azion?.Sql || null;
};

export class InternalStorageClient implements AzionBucket {
  private storage: Azion.Storage.StorageInstance | null = null;

  constructor(
    private token: string,
    private debug: boolean | undefined,
  ) {}

  private initializeStorage(bucketName: string) {
    if (!this.storage) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.storage = new (globalThis as any).Azion.Storage(bucketName);
    }
  }

  name: string = '';
  edge_access: string = 'unknown';

  async getBucket(name: string): Promise<AzionBucket | null> {
    this.initializeStorage(name);
    if (this.storage) {
      return {
        name,
        edge_access: 'unknown',
        state: 'executed-runtime',
        getObjects: (bucketName: string) => this.getObjects(bucketName),
        getObjectByKey: (bucketName: string, objectKey: string) => this.getObjectByKey(bucketName, objectKey),
        createObject: (bucketName: string, objectKey: string, file: string, options?: { content_type?: string }) =>
          this.createObject(bucketName, objectKey, file, options),
        updateObject: (bucketName: string, objectKey: string, file: string, options?: { content_type?: string }) =>
          this.updateObject(bucketName, objectKey, file, options),
        deleteObject: (bucketName: string, objectKey: string) => this.deleteObject(bucketName, objectKey),
      };
    }
    return null;
  }

  async getObjects(bucketName: string): Promise<AzionBucketObject[] | null> {
    this.initializeStorage(bucketName);
    try {
      const objectList = await this.storage!.list();
      return objectList.entries.map((entry: { key: string; content_length?: number }) => ({
        key: entry.key,
        size: entry.content_length,
      }));
    } catch (error) {
      if (this.debug) console.error('Error getting objects:', error);
      return null;
    }
  }

  async getObjectByKey(bucketName: string, objectKey: string): Promise<AzionBucketObject | null> {
    this.initializeStorage(bucketName);
    try {
      const storageObject = await this.storage!.get(objectKey);
      const uint8Array = new Uint8Array(storageObject);
      const content = btoa(String.fromCharCode.apply(null, Array.from(uint8Array)));
      return {
        state: 'executed-runtime',
        key: objectKey,
        size: storageObject.byteLength,
        content: content,
      };
    } catch (error) {
      if (this.debug) console.error('Error getting object by key:', error);
      return null;
    }
  }

  async createObject(
    bucketName: string,
    objectKey: string,
    content: string,
    options?: { content_type?: string },
  ): Promise<AzionBucketObject | null> {
    this.initializeStorage(bucketName);
    try {
      const contentBuffer = new TextEncoder().encode(content);
      await this.storage!.put(objectKey, contentBuffer, {
        'content-type': options?.content_type,
      });
      return {
        state: 'executed-runtime',
        key: objectKey,
        size: contentBuffer.byteLength,
        content_type: options?.content_type,
        content: content,
      };
    } catch (error) {
      if (this.debug) console.error('Error creating object:', error);
      return null;
    }
  }

  async updateObject(
    bucketName: string,
    objectKey: string,
    content: string,
    options?: { content_type?: string },
  ): Promise<AzionBucketObject | null> {
    return this.createObject(bucketName, objectKey, content, options);
  }

  async deleteObject(bucketName: string, objectKey: string): Promise<AzionDeletedBucketObject | null> {
    this.initializeStorage(bucketName);
    try {
      await this.storage!.delete(objectKey);
      return { key: objectKey, state: 'executed-runtime' };
    } catch (error) {
      if (this.debug) console.error('Error deleting object:', error);
      return null;
    }
  }
}
