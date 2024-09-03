export interface ApiListOriginsParams {
  page?: number;
  page_size?: number;
  sort?: 'name' | 'id';
  order?: OrderDirection;
  filter?: string;
}

export interface ApiListOriginsResponse {
  count: number;
  total_pages: number;
  schema_version: number;
  links: {
    previous: string | null;
    next: string | null;
  };
  results: Origin[];
}

export interface ApiGetOriginResponse {
  results: Origin;
  schema_version: number;
}

export enum OrderDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export enum OriginType {
  SINGLE_ORIGIN = 'single_origin',
  LOAD_BALANCER = 'load_balancer',
}

export enum OriginProtocolPolicy {
  PRESERVE = 'preserve',
  HTTP = 'http',
  HTTPS = 'https',
}

export enum ServerRole {
  PRIMARY = 'primary',
  BACKUP = 'backup',
}

export interface Address {
  address: string;
  weight?: number | null;
  server_role?: ServerRole;
  is_active?: boolean;
}

export interface ApiCreateOriginPayload {
  name: string;
  origin_type: OriginType;
  addresses: Address[];
  origin_protocol_policy: OriginProtocolPolicy;
  host_header: string;
  origin_path?: string;
  hmac_authentication?: boolean;
  hmac_region_name?: string;
  hmac_access_key?: string;
  hmac_secret_key?: string;
  connection_timeout?: number;
  timeout_between_bytes?: number;
}

export interface ApiCreateOriginResponse {
  results: Origin;
  schema_version: number;
}

export interface ApiUpdateOriginRequest extends Partial<ApiCreateOriginPayload> {}

export interface ApiUpdateOriginResponse {
  results: Origin;
  schema_version: number;
}

export interface ApiDeleteOriginResponse {
  schema_version: number;
}

export interface Origin {
  origin_id: number;
  origin_key: string;
  name: string;
  origin_type: OriginType;
  addresses: Address[];
  origin_protocol_policy: OriginProtocolPolicy;
  is_origin_redirection_enabled: boolean;
  host_header: string;
  method: string;
  origin_path: string;
  connection_timeout: number;
  timeout_between_bytes: number;
  hmac_authentication: boolean;
  hmac_region_name: string;
  hmac_access_key: string;
  hmac_secret_key: string;
}
