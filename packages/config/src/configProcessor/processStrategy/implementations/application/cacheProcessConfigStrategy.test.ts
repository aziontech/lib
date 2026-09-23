import { AzionCache } from '../../../../types';
import CacheProcessConfigStrategy from './cacheProcessConfigStrategy';

describe('CacheProcessConfigStrategy', () => {
  let strategy: CacheProcessConfigStrategy;

  beforeEach(() => {
    strategy = new CacheProcessConfigStrategy();
  });

  describe('transformToManifest', () => {
    it('should return empty array when no cache settings are provided', () => {
      const result = strategy.transformToManifest(undefined as unknown as AzionCache[]);
      expect(result).toEqual([]);
    });

    it('should return empty array when cache settings array is empty', () => {
      const result = strategy.transformToManifest([]);
      expect(result).toEqual([]);
    });

    it('should transform a minimal cache setting using default values', () => {
      const cache: AzionCache[] = [{ name: 'default-cache' }];

      const result = strategy.transformToManifest(cache);

      expect(result).toEqual([
        {
          name: 'default-cache',
          browser_cache: {
            behavior: 'honor',
            max_age: 0,
          },
          modules: {
            cache: {
              behavior: 'honor',
              max_age: 60,
              stale_cache: { enabled: false },
              large_file_cache: { enabled: false, offset: 1024 },
              tiered_cache: { enabled: false },
            },
            application_accelerator: {
              cache_vary_by_method: [],
              cache_vary_by_querystring: {
                behavior: 'ignore',
                fields: [],
                sort_enabled: false,
              },
              cache_vary_by_cookies: {
                behavior: 'ignore',
                cookie_names: [],
              },
              cache_vary_by_devices: {
                behavior: 'ignore',
                device_group: [],
              },
            },
          },
        },
      ]);
    });

    it('should override browser and edge max age when provided', () => {
      const cache: AzionCache[] = [
        {
          name: 'custom-cache',
          browser: { maxAgeSeconds: 300 },
          edge: { maxAgeSeconds: 600 },
        },
      ];

      const result = strategy.transformToManifest(cache);

      expect(result![0].browser_cache).toEqual({ behavior: 'override', max_age: 300 });
      expect(result![0].modules.cache).toMatchObject({ behavior: 'override', max_age: 600 });
    });

    it('should evaluate mathematical expressions for max age', () => {
      const cache: AzionCache[] = [
        {
          name: 'math-cache',
          browser: { maxAgeSeconds: '60 * 60' },
          edge: { maxAgeSeconds: '60 * 60 * 24' },
        },
      ];

      const result = strategy.transformToManifest(cache);

      expect(result![0].browser_cache.max_age).toBe(3600);
      expect(result![0].modules.cache.max_age).toBe(86400);
    });

    it('should throw an error when max age expression is not purely mathematical', () => {
      const cache: AzionCache[] = [
        {
          name: 'invalid-cache',
          browser: { maxAgeSeconds: '60; DROP TABLE users' },
        },
      ];

      expect(() => strategy.transformToManifest(cache)).toThrow(
        'Expression is not purely mathematical: 60; DROP TABLE users',
      );
    });

    it('should set cache_vary_by_method based on methods configuration', () => {
      const cache: AzionCache[] = [
        {
          name: 'methods-cache',
          methods: { post: true, options: true },
        },
      ];

      const result = strategy.transformToManifest(cache);

      expect(result![0].modules.application_accelerator.cache_vary_by_method).toEqual(['post', 'options']);
    });

    it('should build cache_vary_by_querystring from cacheByQueryString', () => {
      const cache: AzionCache[] = [
        {
          name: 'querystring-cache',
          queryStringSort: true,
          cacheByQueryString: { option: 'allowlist', list: ['page', 'sort'] },
        },
      ];

      const result = strategy.transformToManifest(cache);

      expect(result![0].modules.application_accelerator.cache_vary_by_querystring).toEqual({
        behavior: 'allowlist',
        fields: ['page', 'sort'],
        sort_enabled: true,
      });
    });

    it('should build cache_vary_by_cookies from cacheByCookie', () => {
      const cache: AzionCache[] = [
        {
          name: 'cookie-cache',
          cacheByCookie: { option: 'denylist', list: ['session_id'] },
        },
      ];

      const result = strategy.transformToManifest(cache);

      expect(result![0].modules.application_accelerator.cache_vary_by_cookies).toEqual({
        behavior: 'denylist',
        cookie_names: ['session_id'],
      });
    });

    it('should enable stale cache when configured', () => {
      const cache: AzionCache[] = [{ name: 'stale-cache', stale: true }];

      const result = strategy.transformToManifest(cache);

      expect(result![0].modules.cache.stale_cache.enabled).toBe(true);
    });

    it('should include tiered_cache topology only when tieredCache is enabled', () => {
      const cache: AzionCache[] = [
        {
          name: 'tiered-cache-enabled',
          tieredCache: { enabled: true, topology: 'br-east-1' },
        },
        {
          name: 'tiered-cache-disabled',
          tieredCache: { enabled: false },
        },
      ];

      const result = strategy.transformToManifest(cache);

      expect(result![0].modules.cache.tiered_cache).toEqual({ enabled: true, topology: 'br-east-1' });
      expect(result![1].modules.cache.tiered_cache).toEqual({ enabled: false });
      expect(result![1].modules.cache.tiered_cache.topology).toBeUndefined();
    });

    it('should transform multiple cache settings', () => {
      const cache: AzionCache[] = [{ name: 'cache-1' }, { name: 'cache-2' }];

      const result = strategy.transformToManifest(cache);

      expect(result).toHaveLength(2);
      expect(result![0].name).toBe('cache-1');
      expect(result![1].name).toBe('cache-2');
    });
  });

  describe('transformToConfig', () => {
    it('should return empty array when no cache settings are provided', () => {
      const result = strategy.transformToConfig(undefined as unknown as unknown[]);
      expect(result).toEqual([]);
    });

    it('should return empty array when cache settings array is empty', () => {
      const result = strategy.transformToConfig([]);
      expect(result).toEqual([]);
    });

    it('should transform a manifest cache setting to config format using default values', () => {
      const payload = [
        {
          name: 'default-cache',
          browser_cache: { behavior: 'honor', max_age: 0 },
          modules: {
            cache: {
              behavior: 'honor',
              max_age: 60,
              stale_cache: { enabled: false },
              tiered_cache: { enabled: false },
            },
            application_accelerator: {
              cache_vary_by_method: [],
              cache_vary_by_querystring: { behavior: 'ignore', fields: [], sort_enabled: false },
              cache_vary_by_cookies: { behavior: 'ignore', cookie_names: [] },
            },
          },
        },
      ];

      const result = strategy.transformToConfig(payload);

      expect(result).toEqual([
        {
          name: 'default-cache',
          stale: false,
          browser: { maxAgeSeconds: 0 },
          edge: { maxAgeSeconds: 60 },
          methods: { post: false, options: false },
          queryStringSort: false,
          tieredCache: { enabled: false },
          cacheByQueryString: { option: 'ignore', list: [] },
          cacheByCookie: { option: 'ignore', list: [] },
        },
      ]);
    });

    it('should transform cache_vary_by_method into methods', () => {
      const payload = [
        {
          name: 'methods-cache',
          modules: {
            cache: {},
            application_accelerator: { cache_vary_by_method: ['post', 'options'] },
          },
        },
      ];

      const result = strategy.transformToConfig(payload);

      expect(result[0].methods).toEqual({ post: true, options: true });
    });

    it('should include tieredCache topology only when tiered_cache is enabled', () => {
      const payload = [
        {
          name: 'tiered-cache-enabled',
          modules: {
            cache: { tiered_cache: { enabled: true, topology: 'us-east-1' } },
            application_accelerator: {},
          },
        },
        {
          name: 'tiered-cache-disabled',
          modules: {
            cache: { tiered_cache: { enabled: false } },
            application_accelerator: {},
          },
        },
      ];

      const result = strategy.transformToConfig(payload);

      expect(result[0].tieredCache).toEqual({ enabled: true, topology: 'us-east-1' });
      expect(result[1].tieredCache).toEqual({ enabled: false });
      expect(result[1].tieredCache!.topology).toBeUndefined();
    });

    it('should evaluate mathematical expressions for max age', () => {
      const payload = [
        {
          name: 'math-cache',
          browser_cache: { max_age: '60 * 60' },
          modules: {
            cache: { max_age: '60 * 60 * 24' },
            application_accelerator: {},
          },
        },
      ];

      const result = strategy.transformToConfig(payload);

      expect(result[0].browser!.maxAgeSeconds).toBe(3600);
      expect(result[0].edge!.maxAgeSeconds).toBe(86400);
    });

    it('should transform multiple cache settings', () => {
      const payload = [
        { name: 'cache-1', modules: { cache: {}, application_accelerator: {} } },
        { name: 'cache-2', modules: { cache: {}, application_accelerator: {} } },
      ];

      const result = strategy.transformToConfig(payload);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('cache-1');
      expect(result[1].name).toBe('cache-2');
    });
  });
});
