import type { KVGetOptions, KVGetResult, KVGetValue, KVSetOptions, KVValue } from '../types';

export interface KVProvider {
  get(key: string, options?: KVGetOptions): Promise<KVGetValue | null>;
  getWithMetadata(key: string, options?: KVGetOptions): Promise<KVGetResult>;
  set(key: string, value: KVValue, options?: KVSetOptions): Promise<void>;
  delete(key: string): Promise<void>;
}

export interface AzionKVNamespace {
  open(namespace: string): Promise<Omit<AzionKVNamespace, 'open'>>;
  get(
    key: string,
    type?: 'text' | 'json' | 'arrayBuffer' | 'stream',
    options?: { cacheTtl?: number },
  ): Promise<string | ArrayBuffer | ReadableStream | Record<string, unknown>>;
  getWithMetadata(
    key: string,
    type?: 'text' | 'json' | 'arrayBuffer' | 'stream',
    options?: { cacheTtl?: number },
  ): Promise<{
    value: string | ArrayBuffer | ReadableStream | Record<string, unknown>;
    metadata: Record<string, unknown> | null;
  }>;
  put(
    key: string,
    value: string | ArrayBuffer | ReadableStream,
    options?: {
      expiration?: number;
      expirationTtl?: number;
      metadata?: Record<string, unknown>;
    },
  ): Promise<void>;
  delete(key: string): Promise<void>;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace globalThis {
    const Azion:
      | {
          KV?: AzionKVNamespace;
        }
      | undefined;
  }
}
