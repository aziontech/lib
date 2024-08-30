export interface ApiListFunctionInstancesParams {
  page?: number;
  page_size?: number;
  sort?: 'asc' | 'desc';
  order_by?: string;
  filter?: string;
}

export interface ApiListFunctionInstancesResponse {
  count: number;
  total_pages: number;
  schema_version: number;
  links: {
    previous: string | null;
    next: string | null;
  };
  results: FunctionInstance[];
}

export interface ApiGetFunctionInstanceResponse {
  results: FunctionInstance;
  schema_version: number;
}

export interface ApiCreateFunctionInstanceRequest {
  name: string;
  edge_function_id: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args: Record<string, any>;
}

export interface ApiCreateFunctionInstanceResponse {
  results: FunctionInstance;
  schema_version: number;
}

export interface ApiUpdateFunctionInstanceRequest {
  name?: string;
  edge_function_id?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args?: Record<string, any>;
}

export interface ApiUpdateFunctionInstanceResponse {
  results: FunctionInstance;
  schema_version: number;
}

export interface ApiDeleteFunctionInstanceResponse {
  schema_version: number;
}

export interface FunctionInstance {
  id: number;
  name: string;
  edge_function_id: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args: Record<string, any>;
}
