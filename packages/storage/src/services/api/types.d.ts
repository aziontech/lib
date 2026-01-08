export type ApiBucketObject = {
  key: string;
  last_modified: string;
  size: number;
};

export interface ApiBucket {
  name: string;
  workloads_access: string;
  last_editor?: string;
  last_modified?: string;
  product_version?: string;
}

export type ApiError = {
  message: string;
  operation: string;
};

export interface ApiGetBucket {
  data?: ApiBucket;
  error?: ApiError;
}

export interface ApiGetBucketResponse {
  data?: ApiBucket;
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
  data?: ApiBucket;
  error?: ApiError;
}

export interface ApiListObjectsResponse {
  continuation_token?: string | null;
  results?: ApiBucketObject[];
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
  search?: string;
  ordering?: string;
  fields?: string;
};

export type ApiListObjectsParams = {
  max_object_count?: number;
};
