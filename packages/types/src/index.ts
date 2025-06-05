// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Azion {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  export declare namespace Storage {
    export interface StorageInstance {
      list(): Promise<{ entries: { key: string; content_length?: number }[] }>;
      put(
        key: string,
        value: ArrayBuffer,
        options?: { 'content-length'?: string; 'content-type'?: string },
      ): Promise<void>;
      delete(key: string): Promise<void>;
      get(key: string): Promise<StorageObject>;
    }

    export interface StorageObject {
      arrayBuffer(): Promise<ArrayBuffer>;
      AzionRuntimeRequestMetadata: Map<string, string>;
      contentType: string;
      contentLength: number;
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-namespace
  export namespace Sql {
    interface Connection {
      query: (sql: string) => Promise<Rows>;
      execute: (sql: string) => Promise<null>;
    }
    export interface Rows {
      next: () => Promise<Row>;
      columnCount: () => number;
      columnName: (index: number) => string;
      columnType: (index: number) => string;
    }
    export interface Row {
      columnName: (index: number) => string;
      columnType: (index: number) => string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      getValue: (index: number) => any;
      getString: (index: number) => string;
    }
    export interface Database {
      connection: Connection;
      open?: (name: string) => Promise<Connection>;
    }
  }
}

export interface AzionRuntimeRequestMetadata {
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
 * Base event interface for Azion
 */
export interface AzionFetchEvent extends Event {
  request: Request & {
    AzionRuntimeRequestMetadata: AzionRuntimeRequestMetadata;
  };
  waitUntil: (promise: Promise<unknown>) => void;
  respondWith: (response: Response | Promise<Response>) => void;
}

/**
 * Firewall event interface
 */
export interface AzionFirewallEvent extends AzionFetchEvent {
  deny: () => void;
  drop: () => void;
  continue: () => void;
}

/**
 * Event listener type for fetch events
 */
export type FetchEventListener = (event: AzionFetchEvent, args?: Record<string, unknown>) => void | Promise<void>;

/**
 * Event listener type for firewall events
 */
export type FirewallEventListener = (event: AzionFirewallEvent, args?: Record<string, unknown>) => void | Promise<void>;
/**
 * Base context for Azion modules
 */
export interface AzionRuntimeCtx {
  waitUntil: (promise: Promise<unknown>) => void;
  args?: Record<string, unknown>;
}

/**
 * Specific context for firewall modules
 */
export interface AzionRuntimeFirewallCtx extends AzionRuntimeCtx {
  deny: () => void;
  continue: () => void;
  drop: () => void;
}

/**
 * Type for Azion request with metadata
 */
export type AzionRuntimeRequest = Request & {
  metadata: AzionRuntimeRequestMetadata;
};

/**
 * Generic module type that can handle any combination of fetch and firewall events
 */
export interface AzionRuntimeModule {
  fetch?: (request: AzionRuntimeRequest, ctx: AzionRuntimeCtx, env?: null) => Promise<Response>;
  firewall?: (request: AzionRuntimeRequest, ctx: AzionRuntimeCtx, env?: null) => Promise<Response>;
}
