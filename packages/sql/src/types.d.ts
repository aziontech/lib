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

export interface Database {
  id: number;
  name: string;
  client_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  query?: (statements: string[]) => Promise<QueryResponse>;
  execute?: (statements: string[]) => Promise<QueryResponse>;
}

export interface DeletedDatabase {
  id: number;
  state: 'executed' | 'pending';
  data: null;
}

export interface Query {
  state: string;
  columns: string[];
  rows: (number | string)[][];
}

export interface SQLInternalClient {
  createDatabase: (name: string) => Promise<Database | null>;
  deleteDatabase: (id: number) => Promise<DeletedDatabase | null>;
  getDatabaseById: (id: number) => Promise<Database | null>;
  getDatabases: (params?: {
    ordering?: string;
    page?: number;
    page_size?: number;
    search?: string;
  }) => Promise<Database[] | null>;
}

export interface SQLInternalClient {
  createDatabase: (name: string) => Promise<Database | null>;
  deleteDatabase: (id: number) => Promise<DeletedDatabase | null>;
  getDatabaseById: (id: number) => Promise<Database | null>;
  getDatabases: (params?: {
    ordering?: string;
    page?: number;
    page_size?: number;
    search?: string;
  }) => Promise<Database[] | null>;
}
export type CreateSQLInternalClient = (config?: Partial<{ token: string; debug: boolean }>) => SQLInternalClient;

export type DatabaseCollectionOptions = {
  ordering?: string;
  page?: number;
  page_size?: number;
  search?: string;
};
