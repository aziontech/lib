// eslint-disable-next-line @typescript-eslint/no-namespace

export interface AzionBucket {
  name: string;
  edge_access: string;
  state?: 'executed' | 'executed-runtime' | 'pending';
  getObjects: () => Promise<AzionBucketObject[] | null>;
  getObjectByKey: (objectKey: string) => Promise<AzionBucketObject | null>;
  createObject: (
    objectKey: string,
    file: string,
    options?: { content_type?: string },
  ) => Promise<AzionBucketObject | null>;
  updateObject: (
    objectKey: string,
    file: string,
    options?: { content_type?: string },
  ) => Promise<AzionBucketObject | null>;
  deleteObject: (objectKey: string) => Promise<AzionDeletedBucketObject | null>;
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
  getBuckets: (options?: AzionBucketCollectionOptions) => Promise<AzionBucket[] | null>;
  createBucket: (name: string, edge_access: string) => Promise<AzionBucket | null>;
  updateBucket: (name: string, edge_access: string) => Promise<AzionBucket | null>;
  deleteBucket: (name: string) => Promise<AzionDeletedBucket | null>;
  getBucket: (name: string) => Promise<AzionBucket | null>;
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
