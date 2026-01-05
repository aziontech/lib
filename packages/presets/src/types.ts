/**
 * Base context for Azion handlers.
 * Provides common functionality like waitUntil for background tasks.
 */
export interface AzionBaseContext {
  waitUntil: (promise: Promise<unknown>) => void;
  respondWith: (response: Response | Promise<Response>) => void;
}

/**
 * Firewall-specific context for Azion handlers.
 * Extends the base context with firewall-specific actions.
 */
export interface AzionFirewallContext extends AzionBaseContext {
  deny: () => void; // Deny the request
  continue: () => void; // Continue processing the request
  drop: () => void; // Drop the connection
  addRequestHeader: (name: string, value: string) => void;
  addResponseHeader: (name: string, value: string) => void;
}

/**
 * Request metadata interface
 */
export interface AzionRequestMetadata {
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
  server_fingerprint: string;
  server_fingerprint_ja4h: string;

  // TLS
  ssl_cipher: string;
  ssl_protocol: string;

  // Other
  client_fingerprint: string;
  client_id: string;
  configuration_id: string;
  edge_connector_id: string;
  function_id: string;
  http_ssl_ja4: string;
  request_id: string;
  solution_id: string;

  // Allows additional unspecified fields
  [key: string]: string;
}

/**
 * Extended Request interface with Azion metadata
 */
export interface AzionRequest extends Request {
  metadata: AzionRequestMetadata;
}

/**
 * Standard Azion handler interface.
 * Used for regular request handling with fetch event.
 */
export interface AzionFetchHandler {
  fetch: (request: AzionRequest, ctx: AzionBaseContext, env?: null) => Promise<Response>;
}

/**
 * Firewall-specific handler interface.
 * Used for firewall rule processing.
 */
export interface AzionFirewallHandler {
  firewall: (request: AzionRequest, ctx: AzionFirewallContext, env?: null) => Promise<Response>;
}

/**
 * Union type representing any valid Azion worker.
 * Can be either a standard handler or a firewall handler.
 */
export type AzionWorker = AzionFetchHandler | AzionFirewallHandler;
