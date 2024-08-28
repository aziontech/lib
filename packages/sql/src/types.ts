import { JsonObjectQueryExecutionResponse } from './utils/mappers/to-object';

/* eslint-disable no-unused-vars */
export interface AzionDatabase {
  id: number;
  name: string;
  client_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  query?: (statements: string[], options?: AzionClientOptions) => Promise<AzionQueryResponse | null>;
  execute?: (statements: string[], options?: AzionClientOptions) => Promise<AzionQueryResponse | null>;
  listTables?: (options?: AzionClientOptions) => Promise<AzionQueryResponse | null>;
}

export interface AzionDeletedDatabase {
  id: number;
  state: 'executed' | 'pending';
  data: null;
}

export type AzionQueryParams = string | number | boolean | null;

export type AzionQueryExecutionParams = {
  statements: string[];
  params?: (AzionQueryParams | Record<string, AzionQueryParams>)[];
};

export type AzionQueryExecutionInfo = {
  rowsRead?: number;
  rowsWritten?: number;
  durationMs?: number;
};

export type NonSelectQueryResult = {
  info?: AzionQueryExecutionInfo;
};

export type QueryResult = {
  columns?: string[];
  rows?: (number | string)[][];
  statement?: string;
  info?: AzionQueryExecutionInfo;
};

export type AzionQueryResponse = {
  state: 'executed' | 'pending' | 'executed-runtime';
  data: QueryResult[] | NonSelectQueryResult;
  toObject?: () => JsonObjectQueryExecutionResponse;
};

export interface AzionSQLClient {
  createDatabase: (name: string) => Promise<AzionDatabase | null>;
  deleteDatabase: (id: number) => Promise<AzionDeletedDatabase | null>;
  getDatabase?: (name: string) => Promise<AzionDatabase | null>;
  getDatabases: (params?: {
    ordering?: string;
    page?: number;
    page_size?: number;
    search?: string;
  }) => Promise<AzionDatabase[] | null>;
}
export type CreateAzionSQLClient = (
  config?: Partial<{ token?: string; options?: AzionClientOptions }>,
) => AzionSQLClient;

export type AzionDatabaseCollectionOptions = {
  ordering?: string;
  page?: number;
  page_size?: number;
  search?: string;
};

export type AzionClientOptions = {
  debug?: boolean;
  force?: boolean;
};
