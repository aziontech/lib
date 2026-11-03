import type { AzionCache } from '../../../../../types';
import CacheProcessConfigStrategy from './cacheProcessConfigStrategy';

describe('CacheProcessConfigStrategy (v6)', () => {
  let strategy: CacheProcessConfigStrategy;

  beforeEach(() => {
    strategy = new CacheProcessConfigStrategy();
  });

  describe('transformToManifest', () => {
    it('should return an empty array when there are no cache settings', () => {
      expect(strategy.transformToManifest([])).toEqual([]);
      expect(strategy.transformToManifest(undefined as unknown as AzionCache[])).toEqual([]);
    });

    it('should apply the defaults to a minimal cache setting', () => {
      expect(strategy.transformToManifest([{ name: 'my-cache' }])).toEqual([
        {
          name: 'my-cache',
          browser_cache: { behavior: 'honor', max_age: 0 },
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
              cache_vary_by_querystring: { behavior: 'ignore', fields: [], sort_enabled: false },
              cache_vary_by_cookies: { behavior: 'ignore', cookie_names: [] },
              cache_vary_by_devices: { behavior: 'ignore', device_group: [] },
            },
          },
        },
      ]);
    });

    it('should map every field of the cache setting to the manifest', () => {
      const [cache] = strategy.transformToManifest([
        {
          name: 'my-cache',
          stale: true,
          queryStringSort: true,
          tieredCache: { enabled: true, topology: 'br-east-1' },
          methods: { post: true, options: true },
          browser: { maxAgeSeconds: 7200 },
          edge: { maxAgeSeconds: 86400 },
          cacheByCookie: { option: 'allowlist', list: ['session'] },
          cacheByQueryString: { option: 'denylist', list: ['utm'] },
        },
      ]);

      expect(cache).toEqual({
        name: 'my-cache',
        browser_cache: { behavior: 'override', max_age: 7200 },
        modules: {
          cache: {
            behavior: 'override',
            max_age: 86400,
            stale_cache: { enabled: true },
            large_file_cache: { enabled: false, offset: 1024 },
            tiered_cache: { enabled: true, topology: 'br-east-1' },
          },
          application_accelerator: {
            cache_vary_by_method: ['post', 'options'],
            cache_vary_by_querystring: { behavior: 'denylist', fields: ['utm'], sort_enabled: true },
            cache_vary_by_cookies: { behavior: 'allowlist', cookie_names: ['session'] },
            cache_vary_by_devices: { behavior: 'ignore', device_group: [] },
          },
        },
      });
    });

    it('should evaluate a mathematical expression as the max age', () => {
      const [cache] = strategy.transformToManifest([
        { name: 'my-cache', browser: { maxAgeSeconds: '60 * 60' }, edge: { maxAgeSeconds: '60 * 60 * 24 * 7' } },
      ]);

      expect(cache.browser_cache.max_age).toBe(3600);
      expect(cache.modules.cache.max_age).toBe(604800);
    });

    it('should accept the limits of the max age and throw out of them (v6 API: 0 to 31536000)', () => {
      const withMaxAge = (browser: number | string, edge: number | string) =>
        strategy.transformToManifest([
          { name: 'my-cache', browser: { maxAgeSeconds: browser }, edge: { maxAgeSeconds: edge } },
        ]);

      expect(() => withMaxAge(0, 31536000)).not.toThrow();
      expect(() => withMaxAge('60 * 60 * 24 * 365', 10)).not.toThrow();
      expect(() => withMaxAge('60 * 60 * 24 * 366', 10)).toThrow(
        'Cache "my-cache" has browser.maxAgeSeconds "60 * 60 * 24 * 366" which is not a number of seconds between 0 and 31536000.',
      );
      expect(() => withMaxAge(10, 31536001)).toThrow('edge.maxAgeSeconds');
      expect(() => withMaxAge(-1, 10)).toThrow('browser.maxAgeSeconds');
      expect(() => withMaxAge('1 / 0', 10)).toThrow('which is not a number of seconds');
    });

    it('should throw when the max age is not a mathematical expression', () => {
      expect(() =>
        strategy.transformToManifest([{ name: 'my-cache', browser: { maxAgeSeconds: 'process.exit()' } }]),
      ).toThrow('Expression is not purely mathematical: process.exit()');
    });

    it('should leave the topology out when the tiered cache is not enabled', () => {
      const [cache] = strategy.transformToManifest([
        { name: 'my-cache', tieredCache: { enabled: false, topology: 'us-east-1' } },
      ]);

      expect(cache.modules.cache.tiered_cache).toEqual({ enabled: false });
    });
  });

  describe('transformToConfig', () => {
    it('should return an empty array when there is nothing to convert', () => {
      expect(strategy.transformToConfig([])).toEqual([]);
    });

    it('should round trip a cache setting through the manifest', () => {
      const cache: AzionCache = {
        name: 'my-cache',
        stale: true,
        browser: { maxAgeSeconds: 7200 },
        edge: { maxAgeSeconds: 86400 },
        methods: { post: true, options: false },
        queryStringSort: true,
        tieredCache: { enabled: true, topology: 'nearest-region' },
        cacheByQueryString: { option: 'allowlist', list: ['q'] },
        cacheByCookie: { option: 'denylist', list: ['c'] },
      };

      expect(strategy.transformToConfig(strategy.transformToManifest([cache]))).toEqual([cache]);
    });
  });
});
