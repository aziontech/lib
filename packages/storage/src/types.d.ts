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

export interface ApiBucket {
  name: string;
  edge_access: string;
}

export interface ApiListBucketsResponse {
  links: {
    next: string | null;
    previous: string | null;
  };
  count: number;
  results: ApiBucket[];
}

export interface ApiCreateBucketResponse {
  state: 'executed' | 'pending';
  data: ApiBucket;
}

export interface ApiEditBucketResponse {
  state: 'executed' | 'pending';
  data: ApiBucket;
}

export interface ApiDeleteBucketResponse {
  state: 'executed' | 'pending';
  data: Bucket;
}

export interface ApiListObjectsResponse {
  continuation_token: string | null;
  results: BucketObject[];
}

export interface ApiCreateObjectResponse {
  state: 'executed' | 'pending';
  data: {
    object_key: string;
  };
}

export interface ApiDeleteObjectResponse {
  state: 'executed' | 'pending';
  data: {
    object_key: string;
  };
}

export interface ApiUpdateObjectResponse {
  state: 'executed' | 'pending';
  data: {
    object_key: string;
  };
}

export interface Bucket {
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

export interface BucketObject {
  key: string;
  state?: 'executed' | 'pending';
  size?: number;
  last_modified?: string;
  content_type?: string;
  content?: string;
}

export interface DeletedBucketObject {
  key: string;
  state: 'executed' | 'pending';
}

export interface DeletedBucket {
  name: string;
  state: 'executed' | 'pending';
}
export interface StorageClient {
  getBuckets: (options?: BucketCollectionOptions) => Promise<Bucket[] | null>;
  createBucket: (name: string, edge_access: string) => Promise<Bucket | null>;
  updateBucket: (name: string, edge_access: string) => Promise<Bucket | null>;
  deleteBucket: (name: string) => Promise<DeletedBucket | null>;
  getBucket: (name: string) => Promise<Bucket | null>;
}

export type BucketCollectionOptions = {
  page?: number;
  page_size?: number;
};

export type CreateStorageClient = (token?: string, debug?: boolean) => StorageClient;
