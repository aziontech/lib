/* eslint-disable no-unused-vars */
export interface ApiDatabaseResponse {
  id: number;
  name: string;
  clientId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  isActive: boolean;
}

export interface ApiListDatabasesResponse {
  count?: number;
  links?: {
    first: string | null;
    last: string | null;
    next: string | null;
    prev: string | null;
  };
  results?: ApiDatabaseResponse[];
  error?: ApiError;
}

export type ApiError = {
  message: string;
  operation: string;
};

export interface ApiQueryExecutionResponse {
  state?: 'executed' | 'pending' | 'failed';
  data?: {
    results: {
      columns: string[];
      rows: (number | string)[][];
      rows_read?: number;
      rows_written?: number;
      query_duration_ms?: number;
    };
  }[];
  error?: ApiError;
}

export interface ApiCreateDatabaseResponse {
  state?: 'executed' | 'pending' | 'failed';
  data?: ApiDatabaseResponse;
  error?: ApiError;
}

export interface ApiDeleteDatabaseResponse {
  state?: 'executed' | 'pending';
  data?: { id: number };
  error?: ApiError;
}
