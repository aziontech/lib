export declare namespace Azion {
  class Storage {
    constructor(bucketName: string);
    list(): Promise<{ entries: { key: string }[] }>;
    put(
      key: string,
      value: ArrayBuffer,
      options?: { 'content-length'?: string; 'content-type'?: string },
    ): Promise<void>;
    delete(key: string): Promise<void>;
    get(key: string): Promise<ArrayBuffer>;
  }
}

export interface AzionBucket {
  name: string;
  edge_access: string;
  state?: 'executed' | 'pending';
  getObjects: (bucketName: string) => Promise<BucketObject[] | null>;
  getObjectByKey: (bucketName: string, objectKey: string) => Promise<BucketObject | null>;
  createObject: (
    bucketName: string,
    objectKey: string,
    file: string,
    options?: { content_type?: string },
  ) => Promise<BucketObject | null>;
  updateObject: (
    bucketName: string,
    objectKey: string,
    file: string,
    options?: { content_type?: string },
  ) => Promise<BucketObject | null>;
  deleteObject: (bucketName: string, objectKey: string) => Promise<DeletedBucketObject | null>;
}

export interface AzionBucketObject {
  key: string;
  state?: 'executed' | 'pending';
  size?: number;
  last_modified?: string;
  content_type?: string;
  content?: string;
}

export interface AzionDeletedBucketObject {
  key: string;
  state: 'executed' | 'pending';
}

export interface AzionDeletedBucket {
  name: string;
  state: 'executed' | 'pending';
}
export interface AzionStorageClient {
  getBuckets: (options?: BucketCollectionOptions) => Promise<Bucket[] | null>;
  createBucket: (name: string, edge_access: string) => Promise<Bucket | null>;
  updateBucket: (name: string, edge_access: string) => Promise<Bucket | null>;
  deleteBucket: (name: string) => Promise<DeletedBucket | null>;
  getBucket: (name: string) => Promise<Bucket | null>;
}

export type AzionBucketCollectionOptions = {
  page?: number;
  page_size?: number;
};

export type AzionClientOptions = {
  debug?: boolean;
  force?: boolean;
};

export type CreateAzionStorageClient = (
  config?: Partial<{ token: string; options?: AzionClientOptions }>,
) => AzionStorageClient;
