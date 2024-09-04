export interface ApiBucket {
  name: string;
  edge_access: string;
}

export type ApiError = {
  message: string;
  operation: string;
};

export interface ApiGetBucket {
  data?: {
    name: string;
    edge_access: string;
  };
  error?: ApiError;
}

export interface ApiListBucketsResponse {
  links?: {
    next: string | null;
    previous: string | null;
  };
  count?: number;
  results?: ApiBucket[];
  error?: ApiError;
}

export interface ApiCreateBucketResponse {
  state?: 'executed' | 'pending';
  data?: ApiBucket;
  error?: ApiError;
}

export interface ApiEditBucketResponse {
  state?: 'executed' | 'pending';
  data?: ApiBucket;
  error?: ApiError;
}

export interface ApiDeleteBucketResponse {
  state?: 'executed' | 'pending';
  data?: Bucket;
  error?: ApiError;
}

export interface ApiListObjectsResponse {
  continuation_token?: string | null;
  results?: BucketObject[];
  error?: ApiError;
}

export interface ApiCreateObjectResponse {
  state?: 'executed' | 'pending';
  data?: {
    object_key: string;
  };
  error?: ApiError;
}

export interface ApiDeleteObjectResponse {
  state?: 'executed' | 'pending';
  data?: {
    object_key: string;
  };
  error?: ApiError;
}

export interface ApiUpdateObjectResponse {
  state: 'executed' | 'pending';
  data: {
    object_key: string;
  };
}

export type ApiListBucketsParams = {
  page?: number;
  page_size?: number;
};

export type ApiListObjectsParams = {
  max_object_count?: number;
};
