import { createClient } from 'azion/storage';
import {
  AzionClientOptions,
  AzionEnvironment,
  AzionKVClient,
  AzionStorageResponse,
  CacheEntry,
  CreateAzionKVClient,
  KVCacheManager,
  KVConfig,
  KVContext,
  KVInstance,
  KVKeys,
  KVListOptions,
  KVPutOptions,
  KVValue,
} from './types';

// Global context to manage instances (kept for createClient compatibility)
const contexts = new Map<string, KVContext>();

/**
 * Determines if the code is running in a browser environment.
 */
const isBrowserEnvironment = (): boolean => {
  return typeof window !== 'undefined' && typeof window.document !== 'undefined';
};

const envDebugFlag = !isBrowserEnvironment() && process?.env.AZION_DEBUG === 'true';

const resolveToken = (token?: string) => {
  if (isBrowserEnvironment()) {
    return token ?? '';
  }
  return token ?? process?.env.AZION_TOKEN ?? '';
};

const resolveDebug = (debug?: boolean) => debug ?? !!envDebugFlag;

const resolveEnv = (env?: AzionEnvironment): AzionEnvironment => {
  if (isBrowserEnvironment()) {
    return env ?? 'production';
  }
  return env ?? (process?.env.AZION_ENV as AzionEnvironment) ?? 'production';
};

/**
 * Resolves client options by applying default values for debug and environment settings
 */
const resolveClientOptions = (options?: AzionClientOptions): AzionClientOptions => ({
  ...options,
  debug: resolveDebug(options?.debug),
  env: resolveEnv(options?.env),
});

function getStorageKey(context: KVContext, key: string): string {
  // Remove o prefixo se já existir na chave
  return key.startsWith(context.config.prefix) ? key : `${context.config.prefix}${key}`;
}

function getCacheKey(context: KVContext, key: string): string {
  // Remove o prefixo se já existir na chave
  const cleanKey = key.startsWith(context.config.prefix) ? key : `${context.config.prefix}${key}`;

  // Sanitiza a chave para URL válida
  return cleanKey.replace(/[^a-zA-Z0-9-_]/g, '_');
}

// Private cache functions
async function setCacheEntry(context: KVContext, key: string, data: CacheEntry): Promise<void> {
  const cacheKey = getCacheKey(context, key);

  // Web Cache API if available
  if (context.cache) {
    try {
      // Create internal request with sanitized URL
      const request = new Request(`https://kv.local/${cacheKey}`);
      const response = new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': `max-age=${Math.floor((data.expiresAt - Date.now()) / 1000)}`,
          'X-KV-Key': key,
          'X-KV-Expires': data.expiresAt.toString(),
        },
      });
      await context.cache.put(request, response);
    } catch (error) {
      console.warn('Error storing in Web Cache:', error);
    }
  }
}

async function getCacheEntry(context: KVContext, key: string): Promise<CacheEntry | null> {
  const cacheKey = getCacheKey(context, key);

  // Try Web Cache API
  if (context.cache) {
    try {
      // Create internal request with sanitized URL
      const request = new Request(`https://kv.local/${cacheKey}`);
      const response = await context.cache.match(request);

      if (response) {
        const data = await response.json();
        if (Date.now() < data.expiresAt) {
          return data;
        } else {
          // Expired, remove
          await context.cache.delete(request);
        }
      }
    } catch (error) {
      console.warn('Error fetching from Web Cache:', error);
    }
  }

  return null;
}

async function deleteCacheEntry(context: KVContext, key: string): Promise<void> {
  const cacheKey = getCacheKey(context, key);

  // Remove from Web Cache API
  if (context.cache) {
    try {
      // Create internal request with sanitized URL
      const request = new Request(`https://kv.local/${cacheKey}`);
      await context.cache.delete(request);
    } catch (error) {
      console.warn('Error removing from Web Cache:', error);
    }
  }
}

/**
 * Creates a KV instance with the given configuration
 */
async function createKVInstance(config: KVConfig, token?: string, options?: AzionClientOptions): Promise<KVInstance> {
  const resolvedOptions = resolveClientOptions(options);
  const resolvedToken = resolveToken(token);

  if (resolvedOptions.debug) {
    console.log('Creating KV instance:', config);
  }

  const fullConfig: Required<KVConfig> = {
    bucket: config.bucket,
    ttl: config.ttl ?? 300,
    cache: config.cache ?? true,
    prefix: config.prefix ?? 'kv:',
    edge_access: config.edge_access ?? 'read_write',
  };

  // Create storage client with token (force external to use cloud storage)
  const storageClient = createClient({
    token: resolvedToken,
    options: {
      debug: resolvedOptions.debug,
      env: resolvedOptions.env,
      external: true,
    },
  });

  // Check if bucket exists, create if it doesn't
  try {
    const bucketResult = await storageClient.getBucket({ name: fullConfig.bucket });
    if (!bucketResult.data) {
      if (resolvedOptions.debug) {
        console.log(`KV: Bucket '${fullConfig.bucket}' not found, creating...`);
      }

      // Create bucket with configured edge access
      const createResult = await storageClient.createBucket({
        name: fullConfig.bucket,
        edge_access: fullConfig.edge_access,
      });

      if (!createResult.data) {
        throw new Error(`Failed to create bucket '${fullConfig.bucket}': ${createResult.error?.message}`);
      }

      if (resolvedOptions.debug) {
        console.log(`KV: Bucket '${fullConfig.bucket}' created successfully`);
      }
    } else {
      if (resolvedOptions.debug) {
        console.log(`KV: Using existing bucket '${fullConfig.bucket}'`);
      }
    }
  } catch (error) {
    if (resolvedOptions.debug) {
      console.error('KV: Error checking/creating bucket:', error);
    }
    throw new Error(
      `Failed to initialize KV bucket '${fullConfig.bucket}': ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  let cache: Cache | null = null;

  // Initialize cache if available
  if (fullConfig.cache && typeof caches !== 'undefined') {
    try {
      cache = await caches.open(`kv-cache-${fullConfig.bucket}`);
    } catch (error) {
      if (resolvedOptions.debug) {
        console.warn('Web Cache API not available:', error);
      }
    }
  }

  const context: KVContext = {
    storage: storageClient,
    cache,
    config: fullConfig,
  };

  // Create cache manager
  const cacheManager: KVCacheManager = {
    invalidate: async (key: string): Promise<AzionStorageResponse<boolean>> => {
      try {
        if (context.config.cache) {
          await deleteCacheEntry(context, key);

          if (resolvedOptions.debug) {
            console.log(`KV: Cache invalidated for key: ${key}`);
          }
        }

        return { data: true };
      } catch (error) {
        return {
          error: {
            message: error instanceof Error ? error.message : 'Error invalidating cache',
            operation: 'cache.invalidate',
          },
        };
      }
    },

    clear: async (): Promise<AzionStorageResponse<boolean>> => {
      try {
        if (context.config.cache && context.cache) {
          // Get all storage keys to find corresponding cache entries
          const listResult = await context.storage.getBucket({ name: context.config.bucket }).then(async (bucket) => {
            if (!bucket.data) return { data: { objects: [] } };
            return bucket.data.getObjects({ params: {} });
          });

          const allKeys = listResult.data?.objects || [];
          const cacheKeys = allKeys
            .map((entry: { key: string }) => entry.key)
            .filter((key: string) => key.startsWith(context.config.prefix))
            .map((key: string) => key.substring(context.config.prefix.length));

          const deleteCachePromises = cacheKeys.map((key) => deleteCacheEntry(context, key));
          await Promise.all(deleteCachePromises);

          if (resolvedOptions.debug) {
            console.log('KV: All cache entries cleared');
          }
        }

        return { data: true };
      } catch (error) {
        return {
          error: {
            message: error instanceof Error ? error.message : 'Error clearing cache',
            operation: 'cache.clear',
          },
        };
      }
    },
  };

  // Return KV instance with methods bound to this context
  return {
    put: async <T = unknown>(
      key: string,
      value: T,
      putOptions?: KVPutOptions,
    ): Promise<AzionStorageResponse<boolean>> => {
      try {
        const storageKey = getStorageKey(context, key);
        const ttl = putOptions?.ttl ?? context.config.ttl;
        const expiresAt = Date.now() + ttl * 1000;

        // Prepare data to store
        const kvData = {
          value,
          expiresAt,
          metadata: putOptions?.metadata,
          createdAt: Date.now(),
        };

        // Store in storage - try update first, then create
        const jsonData = JSON.stringify(kvData);
        const bucketResult = await context.storage.getBucket({ name: context.config.bucket });

        if (bucketResult.error || !bucketResult.data) {
          return {
            error: {
              message: bucketResult.error?.message || 'Bucket not found',
              operation: 'put',
            },
          };
        }

        // Try to update first (if exists), then create if needed
        const updateResult = await bucketResult.data.updateObject({ key: storageKey, content: jsonData });
        if (updateResult.error) {
          // If update fails, try to create
          const createResult = await bucketResult.data.createObject({ key: storageKey, content: jsonData });
          if (createResult.error) {
            return {
              error: {
                message: createResult.error.message,
                operation: 'put',
              },
            };
          }
        }

        // Store in cache if enabled
        if (context.config.cache) {
          await setCacheEntry(context, key, kvData);
        }

        if (resolvedOptions.debug) {
          console.log(`KV: Value stored with key: ${key}`);
        }

        return { data: true };
      } catch (error) {
        return {
          error: {
            message: error instanceof Error ? error.message : 'Error storing value',
            operation: 'put',
          },
        };
      }
    },

    get: async <T = unknown>(key: string): Promise<AzionStorageResponse<KVValue<T>>> => {
      try {
        // Try to fetch from cache first
        if (context.config.cache) {
          const cached = await getCacheEntry(context, key);
          if (cached) {
            if (resolvedOptions.debug) {
              console.log(`KV: Value found in cache: ${key}`);
            }
            return {
              data: {
                value: cached.value as T,
                fromCache: true,
                metadata: cached.metadata,
                expiresAt: cached.expiresAt,
              },
            };
          }
        }

        // Fetch from Storage
        const storageKey = getStorageKey(context, key);
        const bucketResult = await context.storage.getBucket({ name: context.config.bucket });

        if (bucketResult.error || !bucketResult.data) {
          return {
            error: {
              message: 'Value not found',
              operation: 'get',
            },
          };
        }

        const objectResult = await bucketResult.data.getObjectByKey({ key: storageKey });
        if (objectResult.error || !objectResult.data?.content) {
          return {
            error: {
              message: 'Value not found',
              operation: 'get',
            },
          };
        }

        const kvData = JSON.parse(objectResult.data.content);

        // Check if expired
        if (kvData.expiresAt && Date.now() > kvData.expiresAt) {
          // Item expired, remove it
          await context.storage.getBucket({ name: context.config.bucket }).then((bucket) => {
            if (bucket.data) {
              bucket.data.deleteObject({ key: storageKey });
            }
          });
          return {
            error: {
              message: 'Value not found or expired',
              operation: 'get',
            },
          };
        }

        // Update cache
        if (context.config.cache) {
          await setCacheEntry(context, key, kvData);
        }

        if (resolvedOptions.debug) {
          console.log(`KV: Value found in storage: ${key}`);
        }

        return {
          data: {
            value: kvData.value,
            fromCache: false,
            metadata: kvData.metadata,
            expiresAt: kvData.expiresAt,
          },
        };
      } catch (error) {
        return {
          error: {
            message: 'Value not found',
            operation: 'get',
          },
        };
      }
    },

    delete: async (key: string): Promise<AzionStorageResponse<boolean>> => {
      try {
        const storageKey = getStorageKey(context, key);

        try {
          const bucket = await context.storage.getBucket({ name: context.config.bucket });
          if (bucket.data) {
            await bucket.data.deleteObject({ key: storageKey });
          }
        } catch (error) {
          // Ignore error if doesn't exist
        }

        // Remove from cache
        if (context.config.cache) {
          await deleteCacheEntry(context, key);
        }

        if (resolvedOptions.debug) {
          console.log(`KV: Value removed: ${key}`);
        }

        return { data: true };
      } catch (error) {
        return {
          error: {
            message: error instanceof Error ? error.message : 'Error removing value',
            operation: 'delete',
          },
        };
      }
    },

    list: async (listOptions?: KVListOptions): Promise<AzionStorageResponse<KVKeys>> => {
      try {
        const bucket = await context.storage.getBucket({ name: context.config.bucket });
        if (!bucket.data) {
          return {
            error: {
              message: 'Error listing keys',
              operation: 'list',
            },
          };
        }
        const result = await bucket.data.getObjects({ params: {} });

        const allKeys = result.data?.objects || [];

        // Filter only KV keys and remove prefix
        let kvKeys = allKeys
          .map((entry: { key: string }) => entry.key)
          .filter((key: string) => key.startsWith(context.config.prefix))
          .map((key: string) => key.substring(context.config.prefix.length));

        // Filter by prefix if specified
        if (listOptions?.prefix) {
          kvKeys = kvKeys.filter((key: string) => key.startsWith(listOptions.prefix!));
        }

        // Apply limit if specified
        const hasMore = listOptions?.limit ? kvKeys.length > listOptions.limit : false;
        if (listOptions?.limit) {
          kvKeys = kvKeys.slice(0, listOptions.limit);
        }

        if (resolvedOptions.debug) {
          console.log(`KV: Listing returned ${kvKeys.length} keys`);
        }

        return {
          data: {
            keys: kvKeys,
            hasMore,
          },
        };
      } catch (error) {
        return {
          error: {
            message: error instanceof Error ? error.message : 'Error listing keys',
            operation: 'list',
          },
        };
      }
    },

    has: async (key: string): Promise<AzionStorageResponse<boolean>> => {
      const result = await context.storage.getBucket({ name: context.config.bucket }).then(async (bucket) => {
        if (!bucket.data) return null;
        try {
          const storageKey = getStorageKey(context, key);
          const result = await bucket.data.getObjectByKey({ key: storageKey });
          return result.data?.content ? true : false;
        } catch {
          return false;
        }
      });
      return { data: !!result };
    },

    clear: async (): Promise<AzionStorageResponse<boolean>> => {
      try {
        const listResult = await context.storage.getBucket({ name: context.config.bucket }).then(async (bucket) => {
          if (!bucket.data) return { data: { objects: [] } };
          return bucket.data.getObjects({ params: {} });
        });

        const allKeys = listResult.data?.objects || [];
        const kvKeys = allKeys
          .map((entry: { key: string }) => entry.key)
          .filter((key: string) => key.startsWith(context.config.prefix));

        const bucket = await context.storage.getBucket({ name: context.config.bucket });
        if (bucket.data) {
          const deletePromises = kvKeys.map((key) => bucket.data!.deleteObject({ key }));
          await Promise.all(deletePromises);
        }

        // Clear cache
        if (context.config.cache && context.cache) {
          // Clear all cache entries for this bucket
          const cacheKeys = allKeys
            .map((entry: { key: string }) => entry.key)
            .filter((key: string) => key.startsWith(context.config.prefix))
            .map((key: string) => key.substring(context.config.prefix.length));

          const deleteCachePromises = cacheKeys.map((key) => deleteCacheEntry(context, key));
          await Promise.all(deleteCachePromises);
        }

        if (resolvedOptions.debug) {
          console.log('KV: All values have been removed');
        }

        return { data: true };
      } catch (error) {
        return {
          error: {
            message: error instanceof Error ? error.message : 'Error clearing KV',
            operation: 'clear',
          },
        };
      }
    },

    // Cache manager
    cache: cacheManager,
  };
}

// Legacy methods for backward compatibility
function getContext(bucket?: string): KVContext {
  const contextKey = bucket ?? 'default';
  let context = contexts.get(contextKey);

  if (!context) {
    // Auto-configure with defaults
    const config: Required<KVConfig> = {
      bucket: contextKey,
      ttl: 300,
      cache: true,
      prefix: 'kv:',
      edge_access: 'read_write',
    };

    // Create storage client (force external to use cloud storage)
    const storageClient = createClient({ options: { external: false } });

    context = {
      storage: storageClient,
      cache: null,
      config,
    };
    contexts.set(contextKey, context);

    // Try to initialize cache asynchronously
    if (typeof caches !== 'undefined') {
      caches
        .open(`kv-cache-${contextKey}`)
        .then((cache) => {
          context!.cache = cache;
        })
        .catch(() => {
          // Ignore error silently
        });
    }
  }

  return context;
}

/**
 * Configure and initialize KV
 */
export const configureMethod = async (
  token: string,
  config: KVConfig,
  options?: AzionClientOptions,
): Promise<AzionStorageResponse<boolean>> => {
  try {
    const resolvedOptions = resolveClientOptions(options);

    if (resolvedOptions.debug) {
      console.log('Configuring KV:', config);
    }

    const fullConfig: Required<KVConfig> = {
      bucket: config.bucket,
      ttl: config.ttl ?? 300,
      cache: config.cache ?? true,
      prefix: config.prefix ?? 'kv:',
      edge_access: config.edge_access ?? 'read_write',
    };

    // Create storage client with token (force external to use cloud storage)
    const storageClient = createClient({
      token,
      options: {
        debug: resolvedOptions.debug,
        env: resolvedOptions.env,
        external: true,
      },
    });
    let cache: Cache | null = null;

    // Initialize cache if available
    if (fullConfig.cache && typeof caches !== 'undefined') {
      try {
        cache = await caches.open(`kv-cache-${fullConfig.bucket}`);
      } catch (error) {
        if (resolvedOptions.debug) {
          console.warn('Web Cache API not available:', error);
        }
      }
    }

    contexts.set(fullConfig.bucket, {
      storage: storageClient,
      cache,
      config: fullConfig,
    });

    return { data: true };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        operation: 'configure',
      },
    };
  }
};

/**
 * Store a value in KV
 */
export const putMethod = async <T = unknown>(
  token: string,
  key: string,
  value: T,
  putOptions?: KVPutOptions,
  options?: AzionClientOptions,
): Promise<AzionStorageResponse<boolean>> => {
  try {
    const resolvedOptions = resolveClientOptions(options);
    const context = getContext();
    const storageKey = getStorageKey(context, key);
    const ttl = putOptions?.ttl ?? context.config.ttl;
    const expiresAt = Date.now() + ttl * 1000;

    // Prepare data to store
    const kvData = {
      value,
      expiresAt,
      metadata: putOptions?.metadata,
      createdAt: Date.now(),
    };

    // Store in storage - try update first, then create
    const jsonData = JSON.stringify(kvData);
    const bucketResult = await context.storage.getBucket({ name: context.config.bucket });

    if (bucketResult.error || !bucketResult.data) {
      return {
        error: {
          message: bucketResult.error?.message || 'Bucket not found',
          operation: 'put',
        },
      };
    }

    // Try to update first (if exists), then create if needed
    const updateResult = await bucketResult.data.updateObject({ key: storageKey, content: jsonData });
    if (updateResult.error) {
      // If update fails, try to create
      const createResult = await bucketResult.data.createObject({ key: storageKey, content: jsonData });
      if (createResult.error) {
        return {
          error: {
            message: createResult.error.message,
            operation: 'put',
          },
        };
      }
    }

    // Store in cache if enabled
    if (context.config.cache) {
      await setCacheEntry(context, key, kvData);
    }

    if (resolvedOptions.debug) {
      console.log(`KV: Value stored with key: ${key}`);
    }

    return { data: true };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Error storing value',
        operation: 'put',
      },
    };
  }
};

/**
 * Retrieve a value from KV
 */
export const getMethod = async <T = unknown>(
  token: string,
  key: string,
  options?: AzionClientOptions,
): Promise<AzionStorageResponse<KVValue<T>>> => {
  try {
    const resolvedOptions = resolveClientOptions(options);
    const context = getContext();

    // Try to fetch from cache first
    if (context.config.cache) {
      const cached = await getCacheEntry(context, key);
      if (cached) {
        if (resolvedOptions.debug) {
          console.log(`KV: Value found in cache: ${key}`);
        }
        return {
          data: {
            value: cached.value as T,
            fromCache: true,
            metadata: cached.metadata,
            expiresAt: cached.expiresAt,
          },
        };
      }
    }

    // Fetch from Storage
    const storageKey = getStorageKey(context, key);
    const bucket = await context.storage.getBucket({ name: context.config.bucket });
    if (!bucket.data) {
      return {
        error: {
          message: 'Value not found',
          operation: 'get',
        },
      };
    }
    const result = await bucket.data.getObjectByKey({ key: storageKey });

    if (!result.data?.content) {
      return {
        error: {
          message: 'Value not found',
          operation: 'get',
        },
      };
    }

    const kvData = JSON.parse(result.data.content);

    // Check if expired
    if (kvData.expiresAt && Date.now() > kvData.expiresAt) {
      // Item expired, remove it
      await deleteMethod(token, key, options);
      return {
        error: {
          message: 'Value not found or expired',
          operation: 'get',
        },
      };
    }

    // Update cache
    if (context.config.cache) {
      await setCacheEntry(context, key, kvData);
    }

    if (resolvedOptions.debug) {
      console.log(`KV: Value found in storage: ${key}`);
    }

    return {
      data: {
        value: kvData.value,
        fromCache: false,
        metadata: kvData.metadata,
        expiresAt: kvData.expiresAt,
      },
    };
  } catch (error) {
    return {
      error: {
        message: 'Value not found',
        operation: 'get',
      },
    };
  }
};

/**
 * Remove a value from KV
 */
export const deleteMethod = async (
  token: string,
  key: string,
  options?: AzionClientOptions,
): Promise<AzionStorageResponse<boolean>> => {
  try {
    const resolvedOptions = resolveClientOptions(options);
    const context = getContext();
    const storageKey = getStorageKey(context, key);

    try {
      const bucket = await context.storage.getBucket({ name: context.config.bucket });
      if (bucket.data) {
        await bucket.data.deleteObject({ key: storageKey });
      }
    } catch (error) {
      // Ignore error if doesn't exist
    }

    // Remove from cache
    if (context.config.cache) {
      await deleteCacheEntry(context, key);
    }

    if (resolvedOptions.debug) {
      console.log(`KV: Value removed: ${key}`);
    }

    return { data: true };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Error removing value',
        operation: 'delete',
      },
    };
  }
};

/**
 * List KV keys
 */
export const listMethod = async (
  token: string,
  listOptions?: KVListOptions,
  options?: AzionClientOptions,
): Promise<AzionStorageResponse<KVKeys>> => {
  try {
    const resolvedOptions = resolveClientOptions(options);
    const context = getContext();

    const bucket = await context.storage.getBucket({ name: context.config.bucket });
    if (!bucket.data) {
      return {
        error: {
          message: 'Error listing keys',
          operation: 'list',
        },
      };
    }
    const result = await bucket.data.getObjects({ params: {} });

    const allKeys = result.data?.objects || [];

    // Filter only KV keys and remove prefix
    let kvKeys = allKeys
      .map((entry: { key: string }) => entry.key)
      .filter((key: string) => key.startsWith(context.config.prefix))
      .map((key: string) => key.substring(context.config.prefix.length));

    // Filter by prefix if specified
    if (listOptions?.prefix) {
      kvKeys = kvKeys.filter((key: string) => key.startsWith(listOptions.prefix!));
    }

    // Apply limit if specified
    const hasMore = listOptions?.limit ? kvKeys.length > listOptions.limit : false;
    if (listOptions?.limit) {
      kvKeys = kvKeys.slice(0, listOptions.limit);
    }

    if (resolvedOptions.debug) {
      console.log(`KV: Listing returned ${kvKeys.length} keys`);
    }

    return {
      data: {
        keys: kvKeys,
        hasMore,
      },
    };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Error listing keys',
        operation: 'list',
      },
    };
  }
};

/**
 * Check if a key exists
 */
export const hasMethod = async (
  token: string,
  key: string,
  options?: AzionClientOptions,
): Promise<AzionStorageResponse<boolean>> => {
  const result = await getMethod(token, key, options);
  return { data: !!result.data };
};

/**
 * Clear all KV items
 */
export const clearMethod = async (
  token: string,
  options?: AzionClientOptions,
): Promise<AzionStorageResponse<boolean>> => {
  try {
    const resolvedOptions = resolveClientOptions(options);
    const listResult = await listMethod(token, undefined, options);

    if (listResult.data) {
      const deletePromises = listResult.data.keys.map((key) => deleteMethod(token, key, options));
      await Promise.all(deletePromises);
    }

    if (resolvedOptions.debug) {
      console.log('KV: All values have been removed');
    }

    return { data: true };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Error clearing KV',
        operation: 'clear',
      },
    };
  }
};

// Wrapper functions (without token) - kept for backward compatibility

const putWrapper = <T = unknown>({
  key,
  value,
  putOptions,
  options,
}: {
  key: string;
  value: T;
  putOptions?: KVPutOptions;
  options?: AzionClientOptions;
}): Promise<AzionStorageResponse<boolean>> =>
  putMethod(resolveToken(), key, value, putOptions, resolveClientOptions(options));

const getWrapper = <T = unknown>({
  key,
  options,
}: {
  key: string;
  options?: AzionClientOptions;
}): Promise<AzionStorageResponse<KVValue<T>>> => getMethod(resolveToken(), key, resolveClientOptions(options));

const deleteWrapper = ({
  key,
  options,
}: {
  key: string;
  options?: AzionClientOptions;
}): Promise<AzionStorageResponse<boolean>> => deleteMethod(resolveToken(), key, resolveClientOptions(options));

const listWrapper = ({
  listOptions,
  options,
}: {
  listOptions?: KVListOptions;
  options?: AzionClientOptions;
} = {}): Promise<AzionStorageResponse<KVKeys>> =>
  listMethod(resolveToken(), listOptions, resolveClientOptions(options));

const hasWrapper = ({
  key,
  options,
}: {
  key: string;
  options?: AzionClientOptions;
}): Promise<AzionStorageResponse<boolean>> => hasMethod(resolveToken(), key, resolveClientOptions(options));

const clearWrapper = ({
  options,
}: {
  options?: AzionClientOptions;
} = {}): Promise<AzionStorageResponse<boolean>> => clearMethod(resolveToken(), resolveClientOptions(options));

/**
 * Creates a KV client with methods to interact with Azion KV storage.
 *
 * @param {Partial<{ token?: string; options?: AzionClientOptions }>} [config] - Configuration options for the KV client.
 * @returns {AzionKVClient} An object with methods to interact with KV storage.
 *
 * @example
 * const kvClient = createClient({ token: 'your-api-token', options: { debug: true } });
 *
 * // Configure KV
 * await kvClient.configure({ bucket: 'my-bucket', ttl: 300 });
 *
 * // Store a value
 * await kvClient.put({ key: 'user:123', value: { name: 'John' } });
 *
 * // Get a value
 * const user = await kvClient.get({ key: 'user:123' });
 */
const client: CreateAzionKVClient = (
  config?: Partial<{ token?: string; options?: AzionClientOptions }>,
): AzionKVClient => {
  const tokenValue = resolveToken(config?.token);
  const resolvedOptions = resolveClientOptions(config?.options);

  return {
    configure: (kvConfig: KVConfig) => configureMethod(tokenValue, kvConfig, resolvedOptions),
    put: <T = unknown>({
      key,
      value,
      options,
    }: {
      key: string;
      value: T;
      options?: KVPutOptions & AzionClientOptions;
    }) => {
      const { ttl, metadata, ...azionOptions } = options || {};
      return putMethod(tokenValue, key, value, { ttl, metadata }, { ...resolvedOptions, ...azionOptions });
    },
    get: <T = unknown>({
      key,
      options,
    }: {
      key: string;
      options?: AzionClientOptions;
    }): Promise<AzionStorageResponse<KVValue<T>>> => getMethod<T>(tokenValue, key, { ...resolvedOptions, ...options }),
    delete: ({ key, options }: { key: string; options?: AzionClientOptions }) =>
      deleteMethod(tokenValue, key, { ...resolvedOptions, ...options }),
    list: (params?: KVListOptions & AzionClientOptions) => {
      const { prefix, limit, ...azionOptions } = params || {};
      return listMethod(tokenValue, { prefix, limit }, { ...resolvedOptions, ...azionOptions });
    },
    has: ({ key, options }: { key: string; options?: AzionClientOptions }) =>
      hasMethod(tokenValue, key, { ...resolvedOptions, ...options }),
    clear: (params?: AzionClientOptions) => clearMethod(tokenValue, { ...resolvedOptions, ...params }),
  };
};

/**
 * Sets up a KV store with the given configuration.
 * Automatically creates the bucket if it doesn't exist.
 * This is a wrapper function that uses environment token automatically.
 *
 * @param {KVConfig} config - KV configuration
 * @param {AzionClientOptions} [options] - Client options
 * @returns {Promise<KVInstance>} Configured KV instance
 *
 * @example
 * const kv = await setupKV({ bucket: 'my-bucket', ttl: 300 });
 * await kv.put('key', 'value');
 */
const setupKV = async (config: KVConfig, options?: AzionClientOptions): Promise<KVInstance> =>
  createKVInstance(config, resolveToken(), resolveClientOptions(options));

/**
 * Creates a new KV store with the given configuration.
 * Fails if the bucket already exists.
 * This is a wrapper function that uses environment token automatically.
 *
 * @param {KVConfig} config - KV configuration
 * @param {AzionClientOptions} [options] - Client options
 * @returns {Promise<KVInstance>} Configured KV instance
 *
 * @example
 * const kv = await createKV({ bucket: 'new-bucket', ttl: 300 });
 * await kv.put('key', 'value');
 */
const createKV = async (config: KVConfig, options?: AzionClientOptions): Promise<KVInstance> => {
  const resolvedOptions = resolveClientOptions(options);
  const resolvedToken = resolveToken();

  if (resolvedOptions.debug) {
    console.log('Creating new KV instance (strict mode):', config);
  }

  const fullConfig: Required<KVConfig> = {
    bucket: config.bucket,
    ttl: config.ttl ?? 300,
    cache: config.cache ?? true,
    prefix: config.prefix ?? 'kv:',
    edge_access: config.edge_access ?? 'read_write',
  };

  // Create storage client with token (force external to use cloud storage)
  const storageClient = createClient({
    token: resolvedToken,
    options: {
      debug: resolvedOptions.debug,
      env: resolvedOptions.env,
      external: true,
    },
  });

  // Check if bucket exists - fail if it does
  try {
    const bucketResult = await storageClient.getBucket({ name: fullConfig.bucket });
    if (bucketResult.data) {
      throw new Error(
        `Bucket '${fullConfig.bucket}' already exists. Use setupKV() to get existing bucket or choose a different name.`,
      );
    }
  } catch (error) {
    // If error is not "bucket already exists", continue to create
    if (error instanceof Error && error.message.includes('already exists')) {
      throw error;
    }
    // Bucket doesn't exist, which is what we want for createKV
  }

  // Create new bucket
  if (resolvedOptions.debug) {
    console.log(`KV: Creating new bucket '${fullConfig.bucket}'...`);
  }

  const createResult = await storageClient.createBucket({
    name: fullConfig.bucket,
    edge_access: fullConfig.edge_access,
  });

  if (!createResult.data) {
    throw new Error(`Failed to create bucket '${fullConfig.bucket}': ${createResult.error?.message}`);
  }

  if (resolvedOptions.debug) {
    console.log(`KV: New bucket '${fullConfig.bucket}' created successfully`);
  }

  let cache: Cache | null = null;

  // Initialize cache if available
  if (fullConfig.cache && typeof caches !== 'undefined') {
    try {
      cache = await caches.open(`kv-cache-${fullConfig.bucket}`);
    } catch (error) {
      if (resolvedOptions.debug) {
        console.warn('Web Cache API not available:', error);
      }
    }
  }

  const context: KVContext = {
    storage: storageClient,
    cache,
    config: fullConfig,
  };

  // Return the same KV instance structure as setupKV
  return createKVInstanceFromContext(context, resolvedOptions);
};

/**
 * Helper function to create KV instance from context
 */
const createKVInstanceFromContext = (context: KVContext, resolvedOptions: AzionClientOptions): KVInstance => {
  // Create cache manager
  const cacheManager: KVCacheManager = {
    invalidate: async (key: string): Promise<AzionStorageResponse<boolean>> => {
      try {
        if (context.config.cache) {
          await deleteCacheEntry(context, key);

          if (resolvedOptions.debug) {
            console.log(`KV: Cache invalidated for key: ${key}`);
          }
        }

        return { data: true };
      } catch (error) {
        return {
          error: {
            message: error instanceof Error ? error.message : 'Error invalidating cache',
            operation: 'cache.invalidate',
          },
        };
      }
    },

    clear: async (): Promise<AzionStorageResponse<boolean>> => {
      try {
        if (context.config.cache && context.cache) {
          // Get all storage keys to find corresponding cache entries
          const listResult = await context.storage.getBucket({ name: context.config.bucket }).then(async (bucket) => {
            if (!bucket.data) return { data: { objects: [] } };
            return bucket.data.getObjects({ params: {} });
          });

          const allKeys = listResult.data?.objects || [];
          const cacheKeys = allKeys
            .map((entry: { key: string }) => entry.key)
            .filter((key: string) => key.startsWith(context.config.prefix))
            .map((key: string) => key.substring(context.config.prefix.length));

          const deleteCachePromises = cacheKeys.map((key) => deleteCacheEntry(context, key));
          await Promise.all(deleteCachePromises);

          if (resolvedOptions.debug) {
            console.log('KV: All cache entries cleared');
          }
        }

        return { data: true };
      } catch (error) {
        return {
          error: {
            message: error instanceof Error ? error.message : 'Error clearing cache',
            operation: 'cache.clear',
          },
        };
      }
    },
  };

  // Return KV instance with methods bound to this context
  return {
    put: async <T = unknown>(
      key: string,
      value: T,
      putOptions?: KVPutOptions,
    ): Promise<AzionStorageResponse<boolean>> => {
      try {
        const storageKey = getStorageKey(context, key);
        const ttl = putOptions?.ttl ?? context.config.ttl;
        const expiresAt = Date.now() + ttl * 1000;

        // Prepare data to store
        const kvData = {
          value,
          expiresAt,
          metadata: putOptions?.metadata,
          createdAt: Date.now(),
        };

        // Store in storage - try update first, then create
        const jsonData = JSON.stringify(kvData);
        const bucketResult = await context.storage.getBucket({ name: context.config.bucket });

        if (bucketResult.error || !bucketResult.data) {
          return {
            error: {
              message: bucketResult.error?.message || 'Bucket not found',
              operation: 'put',
            },
          };
        }

        // Try to update first (if exists), then create if needed
        const updateResult = await bucketResult.data.updateObject({ key: storageKey, content: jsonData });
        if (updateResult.error) {
          // If update fails, try to create
          const createResult = await bucketResult.data.createObject({ key: storageKey, content: jsonData });
          if (createResult.error) {
            return {
              error: {
                message: createResult.error.message,
                operation: 'put',
              },
            };
          }
        }

        // Store in cache if enabled
        if (context.config.cache) {
          await setCacheEntry(context, key, kvData);
        }

        if (resolvedOptions.debug) {
          console.log(`KV: Value stored with key: ${key}`);
        }

        return { data: true };
      } catch (error) {
        return {
          error: {
            message: error instanceof Error ? error.message : 'Error storing value',
            operation: 'put',
          },
        };
      }
    },

    get: async <T = unknown>(key: string): Promise<AzionStorageResponse<KVValue<T>>> => {
      try {
        // Try to fetch from cache first
        if (context.config.cache) {
          const cached = await getCacheEntry(context, key);
          if (cached) {
            if (resolvedOptions.debug) {
              console.log(`KV: Value found in cache: ${key}`);
            }
            return {
              data: {
                value: cached.value as T,
                fromCache: true,
                metadata: cached.metadata,
                expiresAt: cached.expiresAt,
              },
            };
          }
        }

        // Fetch from Storage
        const storageKey = getStorageKey(context, key);
        const bucketResult = await context.storage.getBucket({ name: context.config.bucket });

        if (bucketResult.error || !bucketResult.data) {
          return {
            error: {
              message: 'Value not found',
              operation: 'get',
            },
          };
        }

        const objectResult = await bucketResult.data.getObjectByKey({ key: storageKey });
        if (objectResult.error || !objectResult.data?.content) {
          return {
            error: {
              message: 'Value not found',
              operation: 'get',
            },
          };
        }

        const kvData = JSON.parse(objectResult.data.content);

        // Check if expired
        if (kvData.expiresAt && Date.now() > kvData.expiresAt) {
          // Item expired, remove it
          await context.storage.getBucket({ name: context.config.bucket }).then((bucket) => {
            if (bucket.data) {
              bucket.data.deleteObject({ key: storageKey });
            }
          });
          return {
            error: {
              message: 'Value not found or expired',
              operation: 'get',
            },
          };
        }

        // Update cache
        if (context.config.cache) {
          await setCacheEntry(context, key, kvData);
        }

        if (resolvedOptions.debug) {
          console.log(`KV: Value found in storage: ${key}`);
        }

        return {
          data: {
            value: kvData.value,
            fromCache: false,
            metadata: kvData.metadata,
            expiresAt: kvData.expiresAt,
          },
        };
      } catch (error) {
        return {
          error: {
            message: 'Value not found',
            operation: 'get',
          },
        };
      }
    },

    delete: async (key: string): Promise<AzionStorageResponse<boolean>> => {
      try {
        const storageKey = getStorageKey(context, key);

        try {
          const bucket = await context.storage.getBucket({ name: context.config.bucket });
          if (bucket.data) {
            await bucket.data.deleteObject({ key: storageKey });
          }
        } catch (error) {
          // Ignore error if doesn't exist
        }

        // Remove from cache
        if (context.config.cache) {
          await deleteCacheEntry(context, key);
        }

        if (resolvedOptions.debug) {
          console.log(`KV: Value removed: ${key}`);
        }

        return { data: true };
      } catch (error) {
        return {
          error: {
            message: error instanceof Error ? error.message : 'Error removing value',
            operation: 'delete',
          },
        };
      }
    },

    list: async (listOptions?: KVListOptions): Promise<AzionStorageResponse<KVKeys>> => {
      try {
        const bucket = await context.storage.getBucket({ name: context.config.bucket });
        if (!bucket.data) {
          return {
            error: {
              message: 'Error listing keys',
              operation: 'list',
            },
          };
        }
        const result = await bucket.data.getObjects({ params: {} });

        const allKeys = result.data?.objects || [];

        // Filter only KV keys and remove prefix
        let kvKeys = allKeys
          .map((entry: { key: string }) => entry.key)
          .filter((key: string) => key.startsWith(context.config.prefix))
          .map((key: string) => key.substring(context.config.prefix.length));

        // Filter by prefix if specified
        if (listOptions?.prefix) {
          kvKeys = kvKeys.filter((key: string) => key.startsWith(listOptions.prefix!));
        }

        // Apply limit if specified
        const hasMore = listOptions?.limit ? kvKeys.length > listOptions.limit : false;
        if (listOptions?.limit) {
          kvKeys = kvKeys.slice(0, listOptions.limit);
        }

        if (resolvedOptions.debug) {
          console.log(`KV: Listing returned ${kvKeys.length} keys`);
        }

        return {
          data: {
            keys: kvKeys,
            hasMore,
          },
        };
      } catch (error) {
        return {
          error: {
            message: error instanceof Error ? error.message : 'Error listing keys',
            operation: 'list',
          },
        };
      }
    },

    has: async (key: string): Promise<AzionStorageResponse<boolean>> => {
      const result = await context.storage.getBucket({ name: context.config.bucket }).then(async (bucket) => {
        if (!bucket.data) return null;
        try {
          const storageKey = getStorageKey(context, key);
          const result = await bucket.data.getObjectByKey({ key: storageKey });
          return result.data?.content ? true : false;
        } catch {
          return false;
        }
      });
      return { data: !!result };
    },

    clear: async (): Promise<AzionStorageResponse<boolean>> => {
      try {
        const listResult = await context.storage.getBucket({ name: context.config.bucket }).then(async (bucket) => {
          if (!bucket.data) return { data: { objects: [] } };
          return bucket.data.getObjects({ params: {} });
        });

        const allKeys = listResult.data?.objects || [];
        const kvKeys = allKeys
          .map((entry: { key: string }) => entry.key)
          .filter((key: string) => key.startsWith(context.config.prefix));

        const bucket = await context.storage.getBucket({ name: context.config.bucket });
        if (bucket.data) {
          const deletePromises = kvKeys.map((key) => bucket.data!.deleteObject({ key }));
          await Promise.all(deletePromises);
        }

        // Clear cache
        if (context.config.cache && context.cache) {
          // Clear all cache entries for this bucket
          const cacheKeys = allKeys
            .map((entry: { key: string }) => entry.key)
            .filter((key: string) => key.startsWith(context.config.prefix))
            .map((key: string) => key.substring(context.config.prefix.length));

          const deleteCachePromises = cacheKeys.map((key) => deleteCacheEntry(context, key));
          await Promise.all(deleteCachePromises);
        }

        if (resolvedOptions.debug) {
          console.log('KV: All values have been removed');
        }

        return { data: true };
      } catch (error) {
        return {
          error: {
            message: error instanceof Error ? error.message : 'Error clearing KV',
            operation: 'clear',
          },
        };
      }
    },

    // Cache manager
    cache: cacheManager,
  };
};

// Exports
export {
  clearWrapper as clear,
  client as createClient,
  createKV,
  deleteWrapper as del,
  deleteWrapper as delete,
  getWrapper as get,
  hasWrapper as has,
  listWrapper as list,
  putWrapper as put,
  setupKV,
};
