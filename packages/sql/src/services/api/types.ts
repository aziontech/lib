export type ApiDatabase = {
  id: number;
  name: string;
  status: 'creating' | 'created' | 'deleting';
  active: boolean;
  last_modified: string;
  last_editor: string | null;
  product_version: string;
};

export type ApiError = {
  message: string;
  operation: string;
  metadata?: Record<string, unknown>;
};

export type ApiDatabaseListResponse = {
  count?: number;
  results?: ApiDatabase[];
  error?: ApiError;
};

export type ApiRetrieveDatabaseResponse = {
  data?: ApiDatabase;
  error?: ApiError;
};

export type ApiCreateDatabaseResponse = {
  state?: 'executed' | 'pending' | 'failed';
  data?: ApiDatabase;
  error?: ApiError;
};

export type ApiDeleteDatabaseResponse = {
  state?: 'executed' | 'pending';
  error?: ApiError;
};

export type ApiQueryExecutionData = {
  columns: string[];
  rows: (number | string)[][];
  rows_read?: number;
  rows_written?: number;
  query_duration_ms?: number;
};

export type ApiQueryExecutionResponse = {
  state?: 'executed' | 'pending' | 'failed';
  data?: ApiQueryExecutionData;
  error?: ApiError;
};
