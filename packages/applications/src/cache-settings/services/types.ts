export enum BrowserCacheSettings {
  HONOR = 'honor',
  OVERRIDE = 'override',
  IGNORE = 'ignore',
}

export enum CdnCacheSettings {
  HONOR = 'honor',
  OVERRIDE = 'override',
}

export enum CacheByQueryString {
  IGNORE = 'ignore',
  WHITELIST = 'whitelist',
  BLACKLIST = 'blacklist',
  ALL = 'all',
}

export enum CacheByCookies {
  IGNORE = 'ignore',
  WHITELIST = 'whitelist',
  BLACKLIST = 'blacklist',
  ALL = 'all',
}

export enum AdaptiveDeliveryAction {
  IGNORE = 'ignore',
  OPTIMIZE = 'optimize',
}

export interface ApiBaseCacheSettingPayload {
  name: string;
  browser_cache_settings?: BrowserCacheSettings;
  browser_cache_settings_maximum_ttl?: number;
  cdn_cache_settings?: CdnCacheSettings;
  cdn_cache_settings_maximum_ttl?: number;
  cache_by_query_string?: CacheByQueryString;
  query_string_fields?: string[];
  enable_query_string_sort?: boolean;
  cache_by_cookies?: CacheByCookies;
  cookie_names?: string[];
  adaptive_delivery_action?: AdaptiveDeliveryAction;
  device_group?: string[];
  enable_caching_for_post?: boolean;
  l2_caching_enabled?: boolean;
  is_slice_configuration_enabled?: boolean;
  is_slice_edge_caching_enabled?: boolean;
  is_slice_l2_caching_enabled?: boolean;
  slice_configuration_range?: number;
  enable_caching_for_options?: boolean;
  enable_stale_cache?: boolean;
  l2_region?: string | null;
}

// eslint-disable-next-line
export interface ApiCreateCacheSettingPayload extends ApiBaseCacheSettingPayload {}

export interface ApiCacheSetting extends ApiBaseCacheSettingPayload {
  id: number;
}

export interface ApiListCacheSettingsParams {
  page?: number;
  page_size?: number;
  sort?: 'name' | 'id';
  order?: 'asc' | 'desc';
}

export interface ApiListCacheSettingsResponse {
  count: number;
  total_pages: number;
  schema_version: number;
  links: {
    previous: string | null;
    next: string | null;
  };
  results: ApiCacheSetting[];
}

export interface ApiGetCacheSettingResponse {
  results: ApiCacheSetting;
  schema_version: number;
}

export interface ApiCreateCacheSettingResponse {
  results: ApiCacheSetting;
  schema_version: number;
}

// eslint-disable-next-line
export interface ApiUpdateCacheSettingPayload extends Partial<ApiBaseCacheSettingPayload> {}

export interface ApiUpdateCacheSettingResponse {
  results: ApiCacheSetting;
  schema_version: number;
}

export interface ApiDeleteCacheSettingResponse {
  schema_version: number;
}
