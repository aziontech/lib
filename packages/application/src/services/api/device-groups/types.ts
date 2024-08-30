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
  results: DeviceGroup[];
}

export interface ApiGetDeviceGroupResponse {
  results: DeviceGroup;
  schema_version: number;
}

export interface ApiCreateDeviceGroupRequest {
  name: string;
  user_agent: string;
}

export interface ApiCreateDeviceGroupResponse {
  results: DeviceGroup;
  schema_version: number;
}

export interface ApiUpdateDeviceGroupRequest {
  name?: string;
  user_agent?: string;
}

export interface ApiUpdateDeviceGroupResponse {
  results: DeviceGroup;
  schema_version: number;
}

export interface ApiDeleteDeviceGroupResponse {
  schema_version: number;
}

export interface DeviceGroup {
  id: number;
  name: string;
  user_agent: string;
}
