import { AzionConfig as AzionConfigType } from './types';

/**
 * Configures and validates the options for the Azion Edge Application.
 *
 * @param {AzionConfig} config - The configuration object for the Azion Edge Application.
 * @param {Object[]} [config.origin] - Array of origin configurations.
 * @param {string} config.origin[].name - Name of the origin.
 * @param {string} config.origin[].type - Type of the origin (e.g., 'single_origin', 'load_balancer').
 * @param {string} [config.origin[].bucket] - Bucket name for storage origins.
 * @param {string} [config.origin[].prefix] - Prefix for storage origins.
 * @param {string[]} [config.origin[].addresses] - Array of addresses for the origin.
 * @param {string} [config.origin[].hostHeader] - Custom host header.
 *
 * @param {Object[]} [config.cache] - Array of cache configurations.
 * @param {string} config.cache[].name - Name of the cache configuration.
 * @param {boolean} [config.cache[].stale] - Whether to allow stale content.
 * @param {boolean} [config.cache[].queryStringSort] - Whether to sort query string parameters.
 * @param {Object} [config.cache[].methods] - HTTP methods to cache.
 * @param {boolean} [config.cache[].methods.post] - Whether to cache POST requests.
 * @param {boolean} [config.cache[].methods.options] - Whether to cache OPTIONS requests.
 * @param {Object} [config.cache[].browser] - Browser cache settings.
 * @param {number|string} config.cache[].browser.maxAgeSeconds - Maximum age for browser cache in seconds.
 * @param {Object} [config.cache[].edge] - Edge cache settings.
 * @param {number|string} config.cache[].edge.maxAgeSeconds - Maximum age for edge cache in seconds.
 * @param {Object} [config.cache[].cacheByCookie] - Cache by cookie settings.
 * @param {('ignore'|'varies'|'whitelist'|'blacklist')} config.cache[].cacheByCookie.option - Cache by cookie option.
 * @param {string[]} [config.cache[].cacheByCookie.list] - List of cookies to use for caching.
 * @param {Object} [config.cache[].cacheByQueryString] - Cache by query string settings.
 * @param {('ignore'|'varies'|'whitelist'|'blacklist')} config.cache[].cacheByQueryString.option - Cache by query string option.
 * @param {string[]} [config.cache[].cacheByQueryString.list] - List of query string parameters to use for caching.
 *
 * @param {Object} [config.rules] - Rules configuration.
 * @param {Object[]} [config.rules.request] - Array of request rules.
 * @param {string} config.rules.request[].name - Name of the request rule.
 * @param {string} [config.rules.request[].description] - Description of the request rule.
 * @param {boolean} [config.rules.request[].active] - Whether the rule is active.
 * @param {string} config.rules.request[].match - Match condition for the rule.
 * @param {string} [config.rules.request[].variable] - Variable to match against.
 * @param {Object} [config.rules.request[].behavior] - Behavior to apply when the rule matches.
 *
 * @param {Object[]} [config.networkList] - Array of network list configurations.
 * @param {number} config.networkList[].id - ID of the network list.
 * @param {string} config.networkList[].listType - Type of the network list.
 * @param {string[]} config.networkList[].listContent - Content of the network list.
 *
 * @returns {AzionConfig} The validated configuration object.
 *
 * @example
 * const config = AzionConfig({
 *   origin: [
 *     {
 *       name: 'My Origin',
 *       type: 'single_origin',
 *       addresses: ['example.com'],
 *     },
 *   ],
 *   cache: [
 *     {
 *       name: 'Default Cache',
 *       browser: {
 *         maxAgeSeconds: 3600,
 *       },
 *       edge: {
 *         maxAgeSeconds: 7200,
 *       },
 *     },
 *   ],
 *   // ... other configurations
 * });
 */
export function AzionConfig(config: AzionConfigType): AzionConfigType {
  return config;
}

export * from './types';
