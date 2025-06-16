/**
 * Defines the execution environment for the Azion client.
 */
export type AzionEnvironment = 'development' | 'staging' | 'production';

/**
 * Options for configuring the Azion client behavior.
 */
export interface AzionClientOptions {
  /** Enable debug mode for detailed logging */
  debug?: boolean;
  /** Environment to use (development, staging, production) */
  env?: AzionEnvironment;
  /** Force external calls instead of runtime */
  external?: boolean;
}

export interface AzionStorageResponse<T> {
  /** Response data */
  data?: T;
  /** Error message if any */
  error?: {
    message: string;
    operation: string;
  };
}

export interface KVConfig {
  /** Bucket name to use */
  bucket: string;
  /** Default TTL for cache in seconds (default: 300 = 5 minutes) */
  ttl?: number;
  /** Whether to use cache (default: true) */
  cache?: boolean;
  /** Prefix for keys (default: 'kv:') */
  prefix?: string;
  /** Edge access configuration for bucket creation (default: 'read_write') */
  edge_access?: 'read_only' | 'read_write' | 'restricted';
}

export interface KVPutOptions {
  /** Time to live in seconds for this specific item */
  ttl?: number;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

export interface KVValue<T = unknown> {
  /** Stored value */
  value: T;
  /** Whether it came from cache */
  fromCache?: boolean;
  /** Associated metadata */
  metadata?: Record<string, unknown>;
  /** Expiration timestamp */
  expiresAt?: number;
}

export interface KVListOptions {
  /** Prefix to filter keys */
  prefix?: string;
  /** Result limit */
  limit?: number;
}

export interface KVKeys {
  /** Found keys list */
  keys: string[];
  /** Whether there are more results available */
  hasMore: boolean;
}

export interface CacheEntry {
  /** Cached value */
  value: unknown;
  /** Timestamp when it expires */
  expiresAt: number;
  /** Metadata */
  metadata?: Record<string, unknown>;
  /** Creation timestamp */
  createdAt: number;
}

export interface KVContext {
  storage: import('azion/storage').AzionStorageClient;
  cache: Cache | null;
  config: Required<KVConfig>;
}

export interface CreateAzionKVClient {
  (config?: Partial<{ token?: string; options?: AzionClientOptions }>): AzionKVClient;
}

export interface AzionKVClient {
  /** Configure KV */
  configure: (config: KVConfig) => Promise<AzionStorageResponse<boolean>>;
  /** Store a value */
  put: <T = unknown>(params: {
    key: string;
    value: T;
    options?: KVPutOptions & AzionClientOptions;
  }) => Promise<AzionStorageResponse<boolean>>;
  /** Retrieve a value */
  get: <T = unknown>(params: {
    key: string;
    options?: AzionClientOptions;
  }) => Promise<AzionStorageResponse<KVValue<T>>>;
  /** Remove a value */
  delete: (params: { key: string; options?: AzionClientOptions }) => Promise<AzionStorageResponse<boolean>>;
  /** List keys */
  list: (params?: KVListOptions & AzionClientOptions) => Promise<AzionStorageResponse<KVKeys>>;
  /** Check if exists */
  has: (params: { key: string; options?: AzionClientOptions }) => Promise<AzionStorageResponse<boolean>>;
  /** Clear everything */
  clear: (params?: AzionClientOptions) => Promise<AzionStorageResponse<boolean>>;
}

/**
 * Cache management interface
 */
export interface KVCacheManager {
  /** Invalidate cache for a specific key */
  invalidate: (key: string) => Promise<AzionStorageResponse<boolean>>;
  /** Clear all cache entries */
  clear: () => Promise<AzionStorageResponse<boolean>>;
}

/**
 * KV Instance - represents a configured KV store
 */
export interface KVInstance {
  /** Store a value */
  put: <T = unknown>(key: string, value: T, options?: KVPutOptions) => Promise<AzionStorageResponse<boolean>>;
  /** Retrieve a value */
  get: <T = unknown>(key: string) => Promise<AzionStorageResponse<KVValue<T>>>;
  /** Remove a value */
  delete: (key: string) => Promise<AzionStorageResponse<boolean>>;
  /** List keys */
  list: (options?: KVListOptions) => Promise<AzionStorageResponse<KVKeys>>;
  /** Check if exists */
  has: (key: string) => Promise<AzionStorageResponse<boolean>>;
  /** Clear everything */
  clear: () => Promise<AzionStorageResponse<boolean>>;
  /** Cache management */
  cache: KVCacheManager;
}
