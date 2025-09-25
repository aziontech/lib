import { all, create } from 'mathjs';
import { AzionCache } from '../../../../types';
import ProcessConfigStrategy from '../../processConfigStrategy';

const math = create(all);

/**
 * CacheProcessConfigStrategy V4
 * @class CacheProcessConfigStrategy
 * @description This class is implementation of the Cache ProcessConfig Strategy for API V4.
 */
class CacheProcessConfigStrategy extends ProcessConfigStrategy {
  // Helper function to safely evaluate mathematical expressions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private evaluateMathExpression = (expression: any) => {
    if (typeof expression === 'number') {
      return expression;
    }
    if (/^[0-9+\-*/.() ]+$/.test(expression)) {
      return math.evaluate(expression);
    }
    throw new Error(`Expression is not purely mathematical: ${expression}`);
  };

  /**
   * Transform azion.config cache settings to V4 manifest format
   */
  transformToManifest(applicationCache: AzionCache[]) {
    if (!Array.isArray(applicationCache) || applicationCache.length === 0) {
      return [];
    }

    return applicationCache.map((cache) => {
      const maxAgeSecondsBrowser = cache?.browser ? this.evaluateMathExpression(cache.browser.maxAgeSeconds) : 0;
      const maxAgeSecondsEdge = cache?.edge ? this.evaluateMathExpression(cache.edge.maxAgeSeconds) : 60;

      // Build cache_vary_by_method array based on methods configuration
      const cacheVaryByMethod: string[] = [];
      if (cache?.methods?.post) cacheVaryByMethod.push('post');
      if (cache?.methods?.options) cacheVaryByMethod.push('options');

      // Build cache_vary_by_querystring object
      const cacheVaryByQuerystring = {
        behavior: cache?.cacheByQueryString?.option || 'ignore',
        fields: cache?.cacheByQueryString?.list || [],
        sort_enabled: cache?.queryStringSort || false,
      };

      // Build cache_vary_by_cookies object
      const cacheVaryByCookies = {
        behavior: cache?.cacheByCookie?.option || 'ignore',
        cookie_names: cache?.cacheByCookie?.list || [],
      };

      return {
        name: cache.name,
        browser_cache: {
          behavior: cache?.browser ? 'override' : 'honor',
          max_age: maxAgeSecondsBrowser,
        },
        modules: {
          cache: {
            behavior: cache?.edge ? 'override' : 'honor',
            max_age: maxAgeSecondsEdge,
            stale_cache: {
              enabled: cache?.stale || false,
            },
            large_file_cache: {
              enabled: false, // Default for now, could be extended later
              offset: 1024, // Default offset
            },
            tiered_cache: {
              topology: 'near-edge', // Default topology
            },
          },
          application_accelerator: {
            cache_vary_by_method: cacheVaryByMethod,
            cache_vary_by_querystring: cacheVaryByQuerystring,
            cache_vary_by_cookies: cacheVaryByCookies,
            cache_vary_by_devices: {
              behavior: 'ignore', // Default behavior
              device_group: [],
            },
          },
        },
      };
    });
  }

  /**
   * Transform V4 manifest format back to azion.config cache settings
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformToConfig(cacheSettings: any[]) {
    if (!Array.isArray(cacheSettings) || cacheSettings.length === 0) {
      return [];
    }

    return cacheSettings.map((cache) => {
      const maxAgeSecondsBrowser = cache.browser_cache?.max_age
        ? this.evaluateMathExpression(cache.browser_cache.max_age)
        : 0;
      const maxAgeSecondsEdge = cache.modules?.cache?.max_age
        ? this.evaluateMathExpression(cache.modules.cache.max_age)
        : 60;

      const cacheSetting: AzionCache = {
        name: cache.name,
        stale: cache.modules?.cache?.stale_cache?.enabled || false,
        browser: {
          maxAgeSeconds: maxAgeSecondsBrowser,
        },
        edge: {
          maxAgeSeconds: maxAgeSecondsEdge,
        },
        methods: {
          post: cache.modules?.application_accelerator?.cache_vary_by_method?.includes('post') || false,
          options: cache.modules?.application_accelerator?.cache_vary_by_method?.includes('options') || false,
        },
        queryStringSort: cache.modules?.application_accelerator?.cache_vary_by_querystring?.sort_enabled || false,
      };

      // Handle cache by query string
      if (cache.modules?.application_accelerator?.cache_vary_by_querystring) {
        const queryStringConfig = cache.modules.application_accelerator.cache_vary_by_querystring;
        cacheSetting.cacheByQueryString = {
          option: queryStringConfig.behavior,
          list: queryStringConfig.fields || [],
        };
      }

      // Handle cache by cookie
      if (cache.modules?.application_accelerator?.cache_vary_by_cookies) {
        const cookieConfig = cache.modules.application_accelerator.cache_vary_by_cookies;
        cacheSetting.cacheByCookie = {
          option: cookieConfig.behavior,
          list: cookieConfig.cookie_names || [],
        };
      }

      return cacheSetting;
    });
  }
}

export default CacheProcessConfigStrategy;
