import { all, create } from 'mathjs';
import { AzionCache, AzionConfig } from '../../../types';
import ProcessConfigStrategy from '../processConfigStrategy';

const math = create(all);

/**
 * CacheProcessConfigStrategy para API v4
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
    if (!Array.isArray(config?.cache) || config?.cache.length === 0) {
      return undefined;
    }

    return config.cache.map((cache) => ({
      name: cache.name,
      browser_cache: {
        behavior: cache.browser?.behavior || 'honor',
        max_age: cache.browser?.maxAge || 0,
      },
      edge_cache: {
        behavior: cache.edge?.behavior || 'honor',
        max_age: cache.edge?.maxAge || 60,
      },
      caching_for_post_enabled: cache.enablePost ?? false,
      caching_for_options_enabled: cache.enableOptions ?? false,
      stale_cache_enabled: cache.stale ?? false,
      tiered_cache_enabled: cache.tieredCache ?? false,
      tiered_cache_region: cache.tieredRegion || null,
      application_controls: {
        cache_by_query_string: cache.controls?.queryString || 'ignore',
        query_string_fields: cache.controls?.queryStringFields || [],
        query_string_sort_enabled: cache.controls?.queryStringSort ?? false,
        cache_by_cookies: cache.controls?.cookies || 'ignore',
        cookie_names: cache.controls?.cookieNames || [],
        adaptive_delivery_action: cache.controls?.adaptiveDelivery || 'ignore',
        device_group: cache.controls?.deviceGroup || [],
      },
      slice_controls: cache.slice
        ? {
            slice_configuration_enabled: cache.slice.enabled ?? false,
            slice_edge_caching_enabled: cache.slice.edgeCaching ?? false,
            slice_tiered_caching_enabled: cache.slice.tieredCaching ?? false,
            slice_configuration_range: cache.slice.range ?? 1024,
          }
        : {
            slice_configuration_enabled: false,
            slice_edge_caching_enabled: false,
            slice_tiered_caching_enabled: false,
            slice_configuration_range: 1024,
          },
    }));
  }

  transformToConfig(payload: Record<string, unknown>, transformedPayload: AzionConfig) {
    const cachePayload = payload.cache;

    if (!Array.isArray(cachePayload) || cachePayload.length === 0) {
      return undefined;
    }

    transformedPayload.cache = cachePayload.map((cache: Record<string, unknown>) => {
      const browserCache = cache.browser_cache as Record<string, unknown>;
      const edgeCache = cache.edge_cache as Record<string, unknown>;
      const appControls = cache.application_controls as Record<string, unknown>;
      const sliceControls = cache.slice_controls as Record<string, unknown>;

      const cacheConfig: AzionCache = {
        name: cache.name as string,
        browser: {
          behavior: (browserCache?.behavior as 'honor' | 'override' | 'no-cache') || 'honor',
          maxAge: Number(browserCache?.max_age) || 0,
        },
        edge: {
          behavior: (edgeCache?.behavior as 'honor' | 'override') || 'honor',
          maxAge: Number(edgeCache?.max_age) || 60,
        },
        enablePost: (cache.caching_for_post_enabled as boolean) ?? false,
        enableOptions: (cache.caching_for_options_enabled as boolean) ?? false,
        stale: (cache.stale_cache_enabled as boolean) ?? false,
        tieredCache: (cache.tiered_cache_enabled as boolean) ?? false,
        tieredRegion: (cache.tiered_cache_region as string) || undefined,
        controls: {
          queryString: (appControls?.cache_by_query_string as 'ignore' | 'whitelist' | 'blacklist' | 'all') || 'ignore',
          queryStringFields: (appControls?.query_string_fields as string[]) || [],
          queryStringSort: (appControls?.query_string_sort_enabled as boolean) ?? false,
          cookies: (appControls?.cache_by_cookies as 'ignore' | 'whitelist' | 'blacklist' | 'all') || 'ignore',
          cookieNames: (appControls?.cookie_names as string[]) || [],
          adaptiveDelivery: (appControls?.adaptive_delivery_action as 'ignore' | 'whitelist') || 'ignore',
          deviceGroup: (appControls?.device_group as number[]) || [],
        },
      };

      if (sliceControls) {
        cacheConfig.slice = {
          enabled: (sliceControls.slice_configuration_enabled as boolean) ?? false,
          edgeCaching: (sliceControls.slice_edge_caching_enabled as boolean) ?? false,
          tieredCaching: (sliceControls.slice_tiered_caching_enabled as boolean) ?? false,
          range: (sliceControls.slice_configuration_range as number) ?? 1024,
        };
      }

      return cacheConfig;
    });

    return transformedPayload.cache;
  }
}

export default CacheProcessConfigStrategy;
