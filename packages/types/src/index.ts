// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Azion {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  export declare namespace Storage {
    export type ContentObjectStorage = ArrayBuffer | ReadableStream | string | Uint8Array;
    export interface StorageInstance {
      list(): Promise<{ entries: { key: string; content_length?: number }[] }>;
      put(
        key: string,
        value: ContentObjectStorage,
        options?: { 'content-length'?: string; 'content-type'?: string },
      ): Promise<void>;
      delete(key: string): Promise<void>;
      get(key: string): Promise<StorageObject>;
    }

    export interface StorageObject {
      arrayBuffer(): Promise<ArrayBuffer>;
      metadata: Map<string, string>;
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
