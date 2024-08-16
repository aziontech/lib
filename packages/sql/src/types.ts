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
  query?: (statements: string[], options?: OptionsParams) => Promise<QueryResponse | null>;
  execute?: (statements: string[], options?: OptionsParams) => Promise<QueryResponse | null>;
}

export interface DeletedAzionDatabase {
  id: number;
  state: 'executed' | 'pending';
  data: null;
}

export type QueryParams = string | number | boolean | null;

export type QueryExecutionParams = {
  statements: string[];
  params?: (QueryParams | Record<string, QueryParams>)[];
};

export type QueryExecutionInfo = {
  rowsRead?: number;
  rowsWritten?: number;
  durationMs?: number;
};

export type NonSelectQueryResult = {
  info?: QueryExecutionInfo;
};

export type QueryResult = {
  columns?: string[];
  rows?: (number | string)[][];
  statement?: string;
  info?: QueryExecutionInfo;
};

export type QueryResponse = {
  state: 'executed' | 'pending';
  data: QueryResult[] | NonSelectQueryResult;
  toObject?: () => JsonObjectQueryExecutionResponse;
};

export interface AzionSQLClient {
  createDatabase: (name: string) => Promise<AzionDatabase | null>;
  deleteDatabase: (id: number) => Promise<DeletedAzionDatabase | null>;
  getDatabase?: (name: string) => Promise<AzionDatabase | null>;
  getDatabases: (params?: {
    ordering?: string;
    page?: number;
    page_size?: number;
    search?: string;
  }) => Promise<AzionDatabase[] | null>;
}
export type CreateAzionSQLClient = (config?: Partial<{ token: string; options?: OptionsParams }>) => AzionSQLClient;

export type DatabaseCollectionOptions = {
  ordering?: string;
  page?: number;
  page_size?: number;
  search?: string;
};

export type OptionsParams = {
  debug?: boolean;
  force?: boolean;
};
