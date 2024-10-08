export enum DeliveryProtocol {
  HTTP = 'http',
  HTTPS = 'https',
  HTTP_HTTPS = 'http,https',
}

export enum HttpPort {
  PORT_80 = 80,
  PORT_8008 = 8008,
  PORT_8080 = 8080,
}

export enum HttpsPort {
  PORT_443 = 443,
  PORT_8443 = 8443,
  PORT_9440 = 9440,
  PORT_9441 = 9441,
  PORT_9442 = 9442,
  PORT_9443 = 9443,
}

export enum TlsVersion {
  TLS_1_0 = 'tls_1_0',
  TLS_1_1 = 'tls_1_1',
  TLS_1_2 = 'tls_1_2',
  TLS_1_3 = 'tls_1_3',
}

export enum SupportedCiphers {
  ALL = 'all',
  TLSv1_2_2018 = 'TLSv1.2_2018',
  TLSv1_2_2019 = 'TLSv1.2_2019',
  TLSv1_2_2021 = 'TLSv1.2_2021',
  TLSv1_3_2022 = 'TLSv1.3_2022',
}

export interface ApiBaseApplicationPayload {
  name: string;
  delivery_protocol?: DeliveryProtocol;
  http3?: boolean;
  http_port?: HttpPort[];
  https_port?: HttpsPort[];
  minimum_tls_version?: TlsVersion;
  active?: boolean;
  debug_rules?: boolean;
  application_acceleration?: boolean;
  caching?: boolean;
  device_detection?: boolean;
  edge_firewall?: boolean;
  edge_functions?: boolean;
  image_optimization?: boolean;
  l2_caching?: boolean;
  load_balancer?: boolean;
  raw_logs?: boolean;
  web_application_firewall?: boolean;
  supported_ciphers?: SupportedCiphers;
}

export interface ApiCreateApplicationPayload extends ApiBaseApplicationPayload {}

export interface ApiApplication extends ApiBaseApplicationPayload {
  id: number;
}

export interface ApiListApplicationsParams {
  page?: number;
  page_size?: number;
  sort?: 'name' | 'id';
  order_by?: string;
}

export interface ApiListApplicationsResponse {
  count: number;
  total_pages: number;
  schema_version: number;
  links: {
    previous: string | null;
    next: string | null;
  };
  results: ApiApplication[];
}

export interface ApiGetApplicationResponse {
  results: ApiApplication;
  schema_version: number;
}

export interface ApiCreateApplicationResponse {
  results: ApiApplication;
  schema_version: number;
}

export interface ApiUpdateApplicationPayload extends Partial<ApiBaseApplicationPayload> {}

export interface ApiUpdateApplicationResponse {
  results: ApiApplication;
  schema_version: number;
}

export interface ApiDeleteApplicationResponse {
  schema_version: number;
}
