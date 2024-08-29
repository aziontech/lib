// eslint-disable-next-line @typescript-eslint/no-namespace

export interface AzionBucket {
  name: string;
  edge_access: string;
  state?: 'executed' | 'executed-runtime' | 'pending';
  getObjects: (params: { params: AzionObjectCollectionParams }) => Promise<AzionBucketObject[] | null>;
  getObjectByKey: (params: { key: string }) => Promise<AzionBucketObject | null>;
  createObject: (params: {
    key: string;
    content: string;
    options?: { content_type?: string };
  }) => Promise<AzionBucketObject | null>;
  updateObject: (params: {
    key: string;
    content: string;
    options?: { content_type?: string };
  }) => Promise<AzionBucketObject | null>;
  deleteObject: (params: { key: string }) => Promise<AzionDeletedBucketObject | null>;
}

export interface AzionBucketObject {
  key: string;
  state?: 'executed' | 'executed-runtime' | 'pending';
  size?: number;
  last_modified?: string;
  content_type?: string;
  content?: string;
}

export interface AzionDeletedBucketObject {
  key: string;
  state?: 'executed' | 'executed-runtime' | 'pending';
}

export interface AzionDeletedBucket {
  name: string;
  state?: 'executed' | 'executed-runtime' | 'pending';
}

export interface AzionStorageClient {
  getBuckets: (params?: { params?: AzionBucketCollectionParams }) => Promise<AzionBucket[] | null>;
  createBucket: (params: { name: string; edge_access: string }) => Promise<AzionBucket | null>;
  updateBucket: (params: { name: string; edge_access: string }) => Promise<AzionBucket | null>;
  deleteBucket: (params: { name: string }) => Promise<AzionDeletedBucket | null>;
  getBucket: (params: { name: string }) => Promise<AzionBucket | null>;
}

export type AzionBucketCollectionParams = {
  page?: number;
  page_size?: number;
};

export type AzionObjectCollectionParams = {
  max_object_count?: number;
};

export type AzionClientOptions = {
  debug?: boolean;
  force?: boolean;
};

export type CreateAzionStorageClient = (
  config?: Partial<{ token: string; options?: AzionClientOptions }>,
) => AzionStorageClient;
