/* eslint-disable no-unused-vars */
export interface ApiDatabaseResponse {
  id: number;
  name: string;
  client_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  is_active: boolean;
}

export interface ApiListDatabasesResponse {
  count: number;
  links: {
    first: string | null;
    last: string | null;
    next: string | null;
    prev: string | null;
  };
  results: ApiDatabaseResponse[];
}

export interface ApiQueryExecutionResponse {
  state: 'executed' | 'pending';
  data: {
    results: {
      columns: string[];
      rows: (number | string)[][];
      rows_read?: number;
      rows_written?: number;
      query_duration_ms?: number;
    };
  }[];
}

export interface ApiCreateDatabaseResponse {
  state: 'executed' | 'pending';
  data: ApiDatabaseResponse;
}

export interface ApiDeleteDatabaseResponse {
  state: 'executed' | 'pending';
  data: null;
}
