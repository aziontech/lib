import { JsonObjectQueryExecutionResponse } from './utils/mappers/to-object';

/* eslint-disable no-unused-vars */
export interface Database {
  id: number;
  name: string;
  client_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  query?: (statements: string[]) => Promise<QueryResponse | null>;
  execute?: (statements: string[]) => Promise<QueryResponse | null>;
}

export interface DeletedDatabase {
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

export interface SQLClient {
  createDatabase: (name: string) => Promise<Database | null>;
  deleteDatabase: (id: number) => Promise<DeletedDatabase | null>;
  getDatabaseById?: (id: number) => Promise<Database | null>;
  getDatabases: (params?: {
    ordering?: string;
    page?: number;
    page_size?: number;
    search?: string;
  }) => Promise<Database[] | null>;
}

export interface SQLClient {
  createDatabase: (name: string) => Promise<Database | null>;
  deleteDatabase: (id: number) => Promise<DeletedDatabase | null>;
  getDatabase?: (name: string) => Promise<Database | null>;
  getDatabases: (params?: {
    ordering?: string;
    page?: number;
    page_size?: number;
    search?: string;
  }) => Promise<Database[] | null>;
}
export type CreateSQLClient = (config?: Partial<{ token: string; debug: boolean }>) => SQLClient;

export type DatabaseCollectionOptions = {
  ordering?: string;
  page?: number;
  page_size?: number;
  search?: string;
};
