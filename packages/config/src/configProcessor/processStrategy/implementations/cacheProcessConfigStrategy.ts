import { all, create } from 'mathjs';
import { AzionCache, AzionConfig } from '../../../types';
import ProcessConfigStrategy from '../processConfigStrategy';

const math = create(all);

/**
 * CacheProcessConfigStrategy
 * @class CacheProcessConfigStrategy
 * @description This class is implementation of the Cache ProcessConfig Strategy.
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

  transformToManifest(config: AzionConfig) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any[] = [];
    if (!Array.isArray(config?.cache) || config?.cache.length === 0) {
      return;
    }
    config?.cache.forEach((cache) => {
      const maxAgeSecondsBrowser = cache?.browser ? this.evaluateMathExpression(cache.browser.maxAgeSeconds) : 0;
      const maxAgeSecondsEdge = cache?.edge ? this.evaluateMathExpression(cache.edge.maxAgeSeconds) : 60;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cacheSetting: any = {
        name: cache.name,
        browser_cache_settings: cache?.browser ? 'override' : 'honor',
        browser_cache_settings_maximum_ttl: maxAgeSecondsBrowser,
        cdn_cache_settings: cache?.edge ? 'override' : 'honor',
        cdn_cache_settings_maximum_ttl: maxAgeSecondsEdge,
        enable_caching_for_post: cache?.methods?.post || false,
        enable_caching_for_options: cache?.methods?.options || false,
        enable_query_string_sort: cache?.queryStringSort || false,
      };

      if (cache.cacheByQueryString) {
        cacheSetting.cache_by_query_string =
          cache.cacheByQueryString.option === 'varies' ? 'all' : cache.cacheByQueryString.option;
        if (cache.cacheByQueryString.option === 'whitelist' || cache.cacheByQueryString.option === 'blacklist') {
          cacheSetting.query_string_fields = cache.cacheByQueryString.list || [];
        } else {
          cacheSetting.query_string_fields = [];
        }
      }

      if (cache.cacheByCookie) {
        cacheSetting.cache_by_cookie = cache.cacheByCookie.option === 'varies' ? 'all' : cache.cacheByCookie.option;
        if (cache.cacheByCookie.option === 'whitelist' || cache.cacheByCookie.option === 'blacklist') {
          cacheSetting.cookie_names = cache.cacheByCookie.list || [];
        } else {
          cacheSetting.cookie_names = [];
        }
      }

      payload.push(cacheSetting);
    });
    return payload;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformToConfig(payload: any, transformedPayload: AzionConfig) {
    const config = payload.cache;
    if (!Array.isArray(config) || config.length === 0) {
      return;
    }
    transformedPayload.cache = [];
    config.forEach((cache) => {
      const maxAgeSecondsBrowser = cache.browser_cache_settings_maximum_ttl
        ? this.evaluateMathExpression(cache.browser_cache_settings_maximum_ttl)
        : 0;
      const maxAgeSecondsEdge = cache.cdn_cache_settings_maximum_ttl
        ? this.evaluateMathExpression(cache.cdn_cache_settings_maximum_ttl)
        : 60;
      const cacheSetting: AzionCache = {
        name: cache.name,
        stale: cache.stale,
        browser: {
          maxAgeSeconds: maxAgeSecondsBrowser,
        },
        edge: {
          maxAgeSeconds: maxAgeSecondsEdge,
        },
        methods: {
          post: cache.enable_caching_for_post,
          options: cache.enable_caching_for_options,
        },
        queryStringSort: cache.enable_query_string_sort,
      };

      if (cache.cache_by_query_string) {
        cacheSetting.cacheByQueryString = {
          option:
            // eslint-disable-next-line no-nested-ternary
            cache.cache_by_query_string === 'varies' ? 'all' : cache.cache_by_query_string,
        };
        if (cache.cache_by_query_string === 'whitelist' || cache.cache_by_query_string === 'blacklist') {
          cacheSetting.cacheByQueryString = {
            ...cacheSetting.cacheByQueryString,
            list: cache.query_string_fields || [],
          };
        } else {
          cacheSetting.cacheByQueryString = {
            ...cacheSetting.cacheByQueryString,
            list: [],
          };
        }
      }

      if (cache.cache_by_cookie) {
        cacheSetting.cacheByCookie = {
          option: cache.cache_by_cookie === 'varies' ? 'all' : cache.cache_by_cookie,
        };
        if (cache.cache_by_cookie === 'whitelist' || cache.cache_by_cookie === 'blacklist') {
          cacheSetting.cacheByCookie = {
            ...cacheSetting.cacheByCookie,
            list: cache.cookie_names || [],
          };
        } else {
          cacheSetting.cacheByCookie = {
            ...cacheSetting.cacheByCookie,
            list: [],
          };
        }
      }

      transformedPayload.cache!.push(cacheSetting);
    });
    return transformedPayload.cache;
  }
}

export default CacheProcessConfigStrategy;
