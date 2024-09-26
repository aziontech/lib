import { convertJsonConfigToObject, processConfig, validateConfig } from './processConfig/index';
import { AzionConfig } from './types';

/**
 * Configures and validates the options for the Azion Edge Application.
 *
 * @param {AzionConfig} config - The configuration object for the Azion Edge Application.
 *
 * @param {Object} [config.build] - Configuration for the build.
 * @param {string} config.build.builder - Bundler to use for the build.
 * @param {string} config.build.entry - Entry file for the build.
 * @param {Object} config.build.preset - Preset configuration for the build.
 * @param {string} config.build.preset.name - Name of the preset.
 * @param {Object} [config.build.memoryFS] - Configuration for the MemoryFS.
 * @param {string[]} config.build.memoryFS.injectionDirs - List of directories to inject.
 * @param {string} config.build.memoryFS.removePathPrefix - Path prefix to remove.
 * @param {boolean} [config.build.polyfills] - Whether to enable polyfills.
 * @param {boolean} [config.build.worker] - Whether to use the owner worker with addEventListener.
 * @param {Object} [config.build.custom] - Custom configuration for the bundler.
 * @param {Object} [config.build.custom.*] - Custom configuration options for the bundler.
 * @param {Object} [config.domain] - Configuration for the domain.
 * @param {string} config.domain.name - The domain name.
 * @param {boolean} [config.domain.cnameAccessOnly] - Whether to restrict access only to CNAMEs.
 * @param {string[]} [config.domain.cnames] - List of CNAMEs for the domain.
 * @param {number} [config.domain.Id] - ID of the edge application.
 * @param {number} [config.domain.edgeFirewallId] - ID of the edge firewall.
 * @param {string|number|null} [config.domain.digitalCertificateId] - ID of the digital certificate.
 * @param {Object} [config.domain.mtls] - Configuration for mTLS.
 * @param {('enforce'|'permissive')} config.domain.mtls.verification - mTLS verification mode.
 * @param {number} config.domain.mtls.trustedCaCertificateId - ID of the trusted CA certificate.
 * @param {number[]} [config.domain.mtls.crlList] - List of Certificate Revocation Lists (CRLs).
 *
 * @param {Object[]} [config.origin] - Array of origin configurations.
 * @param {number} [config.origin[].id] - ID of the origin.
 * @param {string} [config.origin[].key] - Key for the origin.
 * @param {string} config.origin[].name - Name of the origin.
 * @param {string} config.origin[].type - Type of the origin (e.g., 'single_origin', 'load_balancer').
 * @param {string} [config.origin[].bucket] - Bucket name for storage origins.
 * @param {string} [config.origin[].prefix] - Prefix for storage origins.
 * @param {Array<string|{address: string, weight?: number}>} [config.origin[].addresses] - Array of addresses for the origin.
 * @param {string} [config.origin[].hostHeader] - Custom host header.
 * @param {('http'|'https'|'preserve')} [config.origin[].protocolPolicy] - Protocol policy for the origin.
 * @param {boolean} [config.origin[].redirection] - Whether to enable redirection.
 * @param {('ip_hash'|'least_connections'|'round_robin')} [config.origin[].method] - Load balancing method.
 * @param {string} [config.origin[].path] - Path for the origin.
 * @param {number} [config.origin[].connectionTimeout] - Connection timeout in seconds.
 * @param {number} [config.origin[].timeoutBetweenBytes] - Timeout between bytes in seconds.
 * @param {Object} [config.origin[].hmac] - HMAC configuration for the origin.
 * @param {string} config.origin[].hmac.region - HMAC region.
 * @param {string} config.origin[].hmac.accessKey - HMAC access key.
 * @param {string} config.origin[].hmac.secretKey - HMAC secret key.
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
 * @param {Object} [config.rules.request[].behavior.setOrigin] - Set origin behavior.
 * @param {string} config.rules.request[].behavior.setOrigin.name - Name of the origin to set.
 * @param {string} config.rules.request[].behavior.setOrigin.type - Type of the origin to set.
 * @param {string} [config.rules.request[].behavior.rewrite] - URL rewrite behavior.
 * @param {string[]} [config.rules.request[].behavior.setHeaders] - Headers to set.
 * @param {boolean|null} [config.rules.request[].behavior.bypassCache] - Whether to bypass cache.
 * @param {boolean|null} [config.rules.request[].behavior.httpToHttps] - Redirect HTTP to HTTPS.
 * @param {string|null} [config.rules.request[].behavior.redirectTo301] - Redirect with 301 status.
 * @param {string|null} [config.rules.request[].behavior.redirectTo302] - Redirect with 302 status.
 * @param {boolean|null} [config.rules.request[].behavior.forwardCookies] - Whether to forward cookies.
 * @param {string|null} [config.rules.request[].behavior.setCookie] - Set cookie behavior.
 * @param {boolean|null} [config.rules.request[].behavior.deliver] - Whether to deliver the response.
 * @param {Object} [config.rules.request[].behavior.capture] - Capture behavior.
 * @param {string} config.rules.request[].behavior.capture.match - Capture match condition.
 * @param {string} config.rules.request[].behavior.capture.captured - Captured content.
 * @param {string} config.rules.request[].behavior.capture.subject - Subject for capture.
 * @param {Object} [config.rules.request[].behavior.runFunction] - Run a custom function.
 * @param {string} config.rules.request[].behavior.runFunction.path - Path to the function.
 * @param {string|null} [config.rules.request[].behavior.runFunction.name] - Name of the function.
 * @param {string|Object} [config.rules.request[].behavior.setCache] - Set cache behavior.
 * @param {string} config.rules.request[].behavior.setCache.name - Cache name.
 * @param {number|null} [config.rules.request[].behavior.setCache.browser_cache_settings_maximum_ttl] - Browser cache maximum TTL.
 * @param {number|null} [config.rules.request[].behavior.setCache.cdn_cache_settings_maximum_ttl] - CDN cache maximum TTL.
 *
 * @param {Object[]} [config.rules.response] - Array of response rules.
 * @param {string} config.rules.response[].name - Name of the response rule.
 * @param {string} [config.rules.response[].description] - Description of the response rule.
 * @param {boolean} [config.rules.response[].active] - Whether the rule is active.
 * @param {string} config.rules.response[].match - Match condition for the rule.
 * @param {string} [config.rules.response[].variable] - Variable to match against.
 * @param {Object} [config.rules.response[].behavior] - Behavior to apply when the rule matches.
 * @param {string|null} [config.rules.response[].behavior.setCookie] - Set cookie behavior.
 * @param {string[]} [config.rules.response[].behavior.setHeaders] - Headers to set.
 * @param {boolean|null} [config.rules.response[].behavior.deliver] - Whether to deliver the response.
 * @param {Object} [config.rules.response[].behavior.capture] - Capture behavior.
 * @param {string} config.rules.response[].behavior.capture.match - Capture match condition.
 * @param {string} config.rules.response[].behavior.capture.captured - Captured content.
 * @param {string} config.rules.response[].behavior.capture.subject - Subject for capture.
 * @param {boolean|null} [config.rules.response[].behavior.enableGZIP] - Enable GZIP compression.
 * @param {string|null} [config.rules.response[].behavior.filterCookie] - Filter cookies.
 * @param {string|null} [config.rules.response[].behavior.filterHeader] - Filter headers.
 * @param {Object} [config.rules.response[].behavior.runFunction] - Run a custom function.
 * @param {string} config.rules.response[].behavior.runFunction.path - Path to the function.
 * @param {string|null} [config.rules.response[].behavior.runFunction.name] - Name of the function.
 * @param {string|null} [config.rules.response[].behavior.redirectTo301] - Redirect with 301 status.
 * @param {string|null} [config.rules.response[].behavior.redirectTo302] - Redirect with 302 status.
 *
 * @param {Object[]} [config.networkList] - Array of network list configurations.
 * @param {number} config.networkList[].id - ID of the network list.
 * @param {string} config.networkList[].listType - Type of the network list.
 * @param {string[]} config.networkList[].listContent - Content of the network list.
 *
 * @param {Object[]} [config.purge] - Array of purge configurations.
 * @param {('url'|'cachekey'|'wildcard')} config.purge[].type - Type of purge operation.
 * @param {string[]} config.purge[].urls - URLs to purge.
 * @param {('delete')} [config.purge[].method] - HTTP method to use for purging.
 * @param {('edge_caching'|'l2_caching')} [config.purge[].layer] - Caching layer to target.
 *
 * @returns {AzionConfig} The validated configuration object.
 *
 * @example
 * const config = AzionConfig({
 *   build: {
 *    builder: 'webpack',
 *    preset: {
 *     name: 'react',
 *    },
 *    polyfills: true,
 *   },
 *   domain: {
 *     name: 'example.com',
 *     cnameAccessOnly: false,
 *     cnames: ['www.example.com', 'cdn.example.com'],
 *     Id: 12345,
 *     edgeFirewallId: 67890,
 *     digitalCertificateId: null,
 *     mtls: {
 *       verification: 'enforce',
 *       trustedCaCertificateId: 98765,
 *     },
 *   },
 *   origin: [
 *     {
 *       name: 'My Origin',
 *       type: 'single_origin',
 *       addresses: [
 *         {
 *           address: 'origin.example.com',
 *           weight: 100,
 *         },
 *       ],
 *       protocolPolicy: 'https',
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
 *   rules: {
 *     request: [
 *       {
 *         name: 'Example Rule',
 *         match: 'path',
 *         behavior: {
 *           setOrigin: {
 *             name: 'My Origin',
 *             type: 'single_origin',
 *           },
 *         },
 *       },
 *     ],
 *   },
 *   purge: [
 *     {
 *       type: 'url',
 *       urls: ['https://example.com/path/to/purge'],
 *       method: 'delete',
 *       layer: 'edge_caching',
 *     },
 *   ],
 *   // ... other configurations
 * });
 */
function defineConfig(config: AzionConfig): AzionConfig {
  validateConfig(config);
  return config;
}

export { convertJsonConfigToObject, defineConfig, processConfig };

export type * from './types';
