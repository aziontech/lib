export interface ApiBaseDeviceGroupPayload {
  name: string;
  user_agent: string;
}

export interface ApiCreateDeviceGroupPayload extends ApiBaseDeviceGroupPayload {}

export interface ApiDeviceGroup extends ApiBaseDeviceGroupPayload {
  id: number;
}

export interface ApiListDeviceGroupsParams {
  page?: number;
  page_size?: number;
  sort?: 'name' | 'id';
  order?: 'asc' | 'desc';
}

export interface ApiListDeviceGroupsResponse {
  count: number;
  total_pages: number;
  schema_version: number;
  links: {
    previous: string | null;
    next: string | null;
  };
  results: ApiDeviceGroup[];
}

export interface ApiGetDeviceGroupResponse {
  results: ApiDeviceGroup;
  schema_version: number;
}

export interface ApiCreateDeviceGroupResponse {
  results: ApiDeviceGroup;
  schema_version: number;
}

export interface ApiUpdateDeviceGroupPayload extends Partial<ApiBaseDeviceGroupPayload> {}

export interface ApiUpdateDeviceGroupResponse {
  results: ApiDeviceGroup;
  schema_version: number;
}

export interface ApiDeleteDeviceGroupResponse {
  schema_version: number;
}
