export interface ApiBaseFunctionInstancePayload {
  name: string;
  code: string;
  language: 'JavaScript';
  initiator_type: 'edge_application' | 'edge_firewall';
  active: boolean;
  json_args: Record<string, unknown>;
}

export interface ApiCreateFunctionInstancePayload {
  name: string;
  edge_function_id: number;
  args: Record<string, unknown>;
}

export interface ApiFunctionInstance extends ApiBaseFunctionInstancePayload {
  id: number;
}

export interface ApiListFunctionInstancesParams {
  page?: number;
  page_size?: number;
  sort?: 'name' | 'id';
  order?: 'asc' | 'desc';
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
  results: ApiFunctionInstance[];
}

export interface ApiGetFunctionInstanceResponse {
  results: ApiFunctionInstance;
  schema_version: number;
}

export interface ApiCreateFunctionInstanceResponse {
  results: ApiFunctionInstance;
  schema_version: number;
}

export interface ApiUpdateFunctionInstancePayload extends Partial<ApiBaseFunctionInstancePayload> {}

export interface ApiUpdateFunctionInstanceResponse {
  results: ApiFunctionInstance;
  schema_version: number;
}

export interface ApiDeleteFunctionInstanceResponse {
  schema_version: number;
}
