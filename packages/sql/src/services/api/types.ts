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
  count: number;
  links?: {
    first: string | null;
    last: string | null;
    next: string | null;
    prev: string | null;
  };
  results: ApiDatabaseResponse[];
}

export interface ApiQueryExecutionResponse {
  state: 'executed' | 'pending' | 'failed';
  data?: {
    results: {
      columns: string[];
      rows: (number | string)[][];
      rows_read?: number;
      rows_written?: number;
      query_duration_ms?: number;
    };
  }[];
  error?: {
    detail: string;
  };
}

export interface ApiCreateDatabaseResponse {
  state: 'executed' | 'pending' | 'failed';
  data?: ApiDatabaseResponse;
  error?: {
    detail: string;
  };
}

export interface ApiDeleteDatabaseResponse {
  state: 'executed' | 'pending';
  data: null;
}
