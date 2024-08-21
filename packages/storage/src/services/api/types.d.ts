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

export type ApiListBucketsOptions = {
  page?: number;
  page_size?: number;
};
