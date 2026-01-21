export interface KVClientOptions {
  namespace?: string;
  timeout?: number;
  provider?: 'auto' | 'native' | 'api';
  apiToken?: string;
  environment?: 'production' | 'stage';
}

export interface KVGetOptions {
  metadata?: boolean;
  cacheTtl?: number;
  type?: 'text' | 'json' | 'arrayBuffer' | 'stream';
}
//EX seconds -- Set the specified expire time, in seconds (a positive integer).
//PX milliseconds -- Set the specified expire time, in milliseconds (a positive integer).
//EXAT timestamp-seconds -- Set the specified Unix time at which the key will expire, in seconds (a positive integer).
//PXAT timestamp-milliseconds -- Set the specified Unix time at which the key will expire, in milliseconds (a positive integer).
//KEEPTTL -- Retain the time to live associated with the key.
export interface KVSetOptions {
  expiration?: {
    type: 'EX' | 'PX' | 'EXAT' | 'PXAT' | 'KEEPTTL';
    value?: number;
  };
  expirationTtl?: number;
  metadata?: Record<string, unknown>;
}

export type KVGetValue = string | ArrayBuffer | ReadableStream | Record<string, unknown>;

export interface KVGetResult {
  value: KVGetValue | null;
  metadata?: Record<string, unknown>;
}

export type KVValue = string | ArrayBuffer | ReadableStream;
