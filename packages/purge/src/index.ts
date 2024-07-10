import { postPurgeCacheKey, postPurgeURL, postPurgeWildcard } from './services';
import { ClientConfig, CreatePurgeInternalClient, CreatedPurge, PurgeInternalClient } from './types';

const resolveToken = (token?: string) => token ?? process.env.AZION_TOKEN ?? '';
const resolveDebug = (debug: boolean = false) => debug || !!process.env.AZION_DEBUG;

const purgeURLMethod = async (token: string, url: string[], debug: boolean): Promise<CreatedPurge | null> => {
  const apiResponse = await postPurgeURL(resolveToken(token), url, resolveDebug(debug));
  if (apiResponse) {
    return { items: apiResponse.data.items, state: apiResponse.state };
  }
  return null;
};

const purgeCacheKeyMethod = async (token: string, cacheKey: string[], debug: boolean): Promise<CreatedPurge | null> => {
  const apiResponse = await postPurgeCacheKey(resolveToken(token), cacheKey, resolveDebug(debug));
  if (apiResponse) {
    return { items: apiResponse.data.items, state: apiResponse.state };
  }
  return null;
};

const purgeWildCardMethod = async (token: string, wildcard: string[], debug: boolean): Promise<CreatedPurge | null> => {
  const apiResponse = await postPurgeWildcard(resolveToken(token), wildcard, resolveDebug(debug));
  if (apiResponse) {
    return { items: apiResponse.data.items, state: apiResponse.state };
  }
  return null;
};

/**
 * Purge a URL from the Azion Edge cache.
 *
 * @param {string} url - URL to purge.
 * @param {boolean} [debug=false] - Enable debug mode for detailed logging.
 * @returns {Promise<CreatedPurge | null>} The purge response or null if the purge failed.
 *
 * @example
 * const response = await purgeURL('http://www.domain.com/path/image.jpg', true);
 * if (response) {
 *   console.log('Purge successful:', response);
 * } else {
 *   console.error('Purge failed');
 * }
 */
const purgeURLWrapper = (url: string[], debug: boolean = false): Promise<CreatedPurge | null> =>
  purgeURLMethod(resolveToken(), url, resolveDebug(debug));

/**
 * Purge a Cache Key from the Azion Edge cache.
 *
 * @param {string} cacheKey - Cache Key to purge.
 * @param {boolean} [debug=false] - Enable debug mode for detailed logging.
 * @returns {Promise<CreatedPurge | null>} The purge response or null if the purge failed.
 *
 * @example
 * const response = await purgeCacheKey('http://www.domain.com/path/image.jpg', true);
 * if (response) {
 *   console.log('Purge successful:', response);
 * } else {
 *   console.error('Purge failed');
 * }
 */
const purgeCacheKeyWrapper = (cacheKey: string[], debug: boolean = false): Promise<CreatedPurge | null> =>
  purgeCacheKeyMethod(resolveToken(), cacheKey, resolveDebug(debug));

/**
 * Purge using a wildcard expression from the Azion Edge cache.
 *
 * @param {string} wildcard - Wildcard expression to purge.
 * @param {boolean} [debug=false] - Enable debug mode for detailed logging.
 * @returns {Promise<CreatedPurge | null>} The purge response or null if the purge failed.
 *
 * @example
 * const response = await purgeWildCard('http://www.domain.com/path/image.jpg*', true);
 * if (response) {
 *   console.log('Purge successful:', response);
 * } else {
 *   console.error('Purge failed');
 * }
 */
const purgeWildCardWrapper = (wildcard: string[], debug: boolean = false): Promise<CreatedPurge | null> =>
  purgeWildCardMethod(resolveToken(), wildcard, resolveDebug(debug));

/**
 * Creates a Purge client with methods to interact with Azion Edge Purge.
 *
 * @param {Partial<{ token: string; debug: boolean }>} [config] - Configuration options for the Purge client.
 * @returns {PurgeInternalClient} An object with methods to interact with Purge.
 *
 * @example
 * const purgeClient = createClient({ token: 'your-api-token', debug: true });
 *
 * // Purge a URL
 * const purgeResult = await purgeClient.purgeURL('http://www.domain.com/path/image.jpg');
 *
 * // Purge a Cache Key
 * const cacheKeyResult = await purgeClient.purgeCacheKey('http://www.domain.com/path/image.jpg');
 *
 * // Purge using a wildcard
 * const wildcardResult = await purgeClient.purgeWildCard('http://www.domain.com/path/image.jpg*');
 */
const client: CreatePurgeInternalClient = (config?: ClientConfig): PurgeInternalClient => {
  const tokenValue = resolveToken(config?.token);
  const debugValue = resolveDebug(config?.debug);

  const client: PurgeInternalClient = {
    /**
     * Purge a URL from the Azion Edge cache.
     *
     * @param {string} url - URL to purge.
     * @returns {Promise<CreatedPurge | null>} The purge response or null if the purge failed.
     *
     * @example
     * const response = await purgeClient.purgeURL('http://www.domain.com/path/image.jpg');
     * if (response) {
     *   console.log('Purge successful:', response);
     * } else {
     *   console.error('Purge failed');
     * }
     */
    purgeURL: (url: string[]): Promise<CreatedPurge | null> => purgeURLMethod(tokenValue, url, debugValue),

    /**
     * Purge a Cache Key from the Azion Edge cache.
     *
     * @param {string} cacheKey - Cache Key to purge.
     * @returns {Promise<CreatedPurge | null>} The purge response or null if the purge failed.
     *
     * @example
     * const response = await purgeClient.purgeCacheKey('http://www.domain.com/path/image.jpg');
     * if (response) {
     *   console.log('Purge successful:', response);
     * } else {
     *   console.error('Purge failed');
     * }
     */
    purgeCacheKey: (cacheKey: string[]): Promise<CreatedPurge | null> =>
      purgeCacheKeyMethod(tokenValue, cacheKey, debugValue),

    /**
     * Purge using a wildcard expression from the Azion Edge cache.
     *
     * @param {string} wildcard - Wildcard expression to purge.
     * @returns {Promise<CreatedPurge | null>} The purge response or null if the purge failed.
     *
     * @example
     * const response = await purgeClient.purgeWildCard('http://www.domain.com/path/image.jpg*');
     * if (response) {
     *   console.log('Purge successful:', response);
     * } else {
     *   console.error('Purge failed');
     * }
     */
    purgeWildCard: (wildcard: string[]): Promise<CreatedPurge | null> =>
      purgeWildCardMethod(tokenValue, wildcard, debugValue),
  };

  return client;
};

export {
  client as createClient,
  purgeCacheKeyWrapper as purgeCacheKey,
  purgeURLWrapper as purgeURL,
  purgeWildCardWrapper as purgeWildCard,
};
export default client;
