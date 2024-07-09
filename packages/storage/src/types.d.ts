/* eslint-disable no-unused-vars */
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
  edge_access?: string;
  state?: 'executed' | 'pending';
  getObjects?: () => Promise<BucketObject[] | null>;
  getObjectByKey?: (objectKey: string) => Promise<BucketObject | null>;
  createObject?: (objectKey: string, file: string) => Promise<BucketObject | null>;
  updateObject?: (objectKey: string, file: string) => Promise<BucketObject | null>;
  deleteObject?: (objectKey: string) => Promise<DeletedBucketObject | null>;
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
export interface StorageInternalClient {
  getBuckets: (options?: BucketCollectionOptions) => Promise<Bucket[] | null>;
  createBucket: (name: string, edge_access: string) => Promise<Bucket | null>;
  updateBucket: (name: string, edge_access: string) => Promise<Bucket | null>;
  deleteBucket: (name: string) => Promise<DeletedBucket | null>;
  getBucketByName: (name: string) => Promise<Bucket | null>;
}

export type BucketCollectionOptions = {
  page?: number;
  page_size?: number;
};

export type CreateStorageInternalClient = (token?: string, debug?: boolean) => StorageInternalClient;
