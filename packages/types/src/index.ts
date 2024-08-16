export interface Metadata {
  // GeoIP
  geoip_asn: string;
  geoip_city: string;
  geoip_city_continent_code: string;
  geoip_city_country_code: string;
  geoip_city_country_name: string;
  geoip_continent_code: string;
  geoip_country_code: string;
  geoip_country_name: string;
  geoip_region: string;
  geoip_region_name: string;

  // Remote
  remote_addr: string;
  remote_port: string;
  remote_user: string;

  // Server
  server_protocol: string;

  // TLS
  ssl_cipher: string;
  ssl_protocol: string;

  // Allows additional unspecified fields
  [key: string]: string;
}

/**
 * Represents the FetchEvent interface.
 */
export interface FetchEvent extends Event {
  request: Request & {
    metadata: Metadata;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  waitUntil(promise: Promise<any>): void;
  respondWith(response: Response | Promise<Response>): void;
}

/**
 * Represents the FirewallEvent interface.
 */
export interface FirewallEvent extends Event {
  request: Request & {
    headers: Headers;
    metadata: Metadata;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  waitUntil(promise: Promise<any>): void;
  deny(): void;
  drop(): void;
  addRequestHeader(name: string, value: string): void;
  addResponseHeader(name: string, value: string): void;
  respondWith(response: Response | Promise<Response>): void;
  continue(): void;
}
