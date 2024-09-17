import { postPurgeCacheKey, postPurgeURL, postPurgeWildcard } from './services/api/index';
import { AzionClientOptions, AzionPurge, AzionPurgeClient, AzionPurgeResponse, CreateAzionPurgeClient } from './types';

const envDebugFlag = process.env.AZION_DEBUG && process.env.AZION_DEBUG === 'true';
const resolveToken = (token?: string) => token ?? process.env.AZION_TOKEN ?? '';
const resolveDebug = (debug?: boolean) => debug ?? !!envDebugFlag;

const purgeURLMethod = async (
  token: string,
  url: string[],
  options?: AzionClientOptions,
): Promise<AzionPurgeResponse<AzionPurge>> => {
  const apiResponse = await postPurgeURL(resolveToken(token), url, resolveDebug(options?.debug));
  if (apiResponse?.data && apiResponse.state) {
    return { data: { items: apiResponse.data.items, state: apiResponse.state } };
  }
  return {
    error: apiResponse.error,
  };
};

const purgeCacheKeyMethod = async (
  token: string,
  cacheKey: string[],
  options?: AzionClientOptions,
): Promise<AzionPurgeResponse<AzionPurge>> => {
  const apiResponse = await postPurgeCacheKey(resolveToken(token), cacheKey, resolveDebug(options?.debug));
  if (apiResponse?.data && apiResponse.state) {
    return {
      data: {
        items: apiResponse.data.items,
        state: apiResponse.state,
      },
    };
  }
  return {
    error: apiResponse.error,
  };
};

const purgeWildCardMethod = async (
  token: string,
  wildcard: string[],
  options?: AzionClientOptions,
): Promise<AzionPurgeResponse<AzionPurge>> => {
  const apiResponse = await postPurgeWildcard(resolveToken(token), wildcard, resolveDebug(options?.debug));
  if (apiResponse?.data && apiResponse.state) {
    return { data: { items: apiResponse.data.items, state: apiResponse.state } };
  }
  return {
    error: apiResponse.error,
  };
};

/**
 * Purge a URL from the Azion Edge cache.
 *
 * @param {string[]} url - URLs to purge.
 * @param {AzionClientOptions} [options] - Client options including debug mode.
 * @returns {Promise<AzionPurgeResponse<AzionPurge>>} The purge response or null if the purge failed.
 *
 * @example
 * const response = await purgeURL(['http://www.domain.com/path/image.jpg'], { debug: true });
 * if (response) {
 *   console.log('Purge successful:', response);
 * } else {
 *   console.error('Purge failed');
 * }
 */
const purgeURLWrapper = (url: string[], options?: AzionClientOptions): Promise<AzionPurgeResponse<AzionPurge>> =>
  purgeURLMethod(resolveToken(), url, options);

/**
 * Purge a Cache Key from the Azion Edge cache.
 *
 * @param {string[]} cacheKey - Cache Keys to purge.
 * @param {AzionClientOptions} [options] - Client options including debug mode.
 * @returns {Promise<AzionPurgeResponse<AzionPurge>>} The purge response or null if the purge failed.
 *
 * @example
 * const response = await purgeCacheKey(['http://www.domain.com/path/image.jpg'], { debug: true });
 * if (response) {
 *   console.log('Purge successful:', response);
 * } else {
 *   console.error('Purge failed');
 * }
 */
const purgeCacheKeyWrapper = (
  cacheKey: string[],
  options?: AzionClientOptions,
): Promise<AzionPurgeResponse<AzionPurge>> => purgeCacheKeyMethod(resolveToken(), cacheKey, options);

/**
 * Purge using a wildcard expression from the Azion Edge cache.
 *
 * @param {string[]} wildcard - Wildcard expressions to purge.
 * @param {AzionClientOptions} [options] - Client options including debug mode.
 * @returns {Promise<AzionPurgeResponse<AzionPurge>>} The purge response or null if the purge failed.
 *
 * @example
 * const response = await purgeWildCard(['http://www.domain.com/path/image.jpg*'], { debug: true });
 * if (response) {
 *   console.log('Purge successful:', response);
 * } else {
 *   console.error('Purge failed');
 * }
 */
const purgeWildCardWrapper = (
  wildcard: string[],
  options?: AzionClientOptions,
): Promise<AzionPurgeResponse<AzionPurge>> => purgeWildCardMethod(resolveToken(), wildcard, options);

/**
 * Creates a Purge client with methods to interact with Azion Edge Purge.
 *
 * @param {Partial<{ token: string; options?: AzionClientOptions }>} [config] - Configuration options for the Purge client.
 * @returns {AzionPurgeClient} An object with methods to interact with Purge.
 *
 * @example
 * const purgeClient = createClient({ token: 'your-api-token', options: { debug: true } });
 *
 * // Purge a URL
 * const purgeResult = await purgeClient.purgeURL(['http://www.domain.com/path/image.jpg'], { debug: true });
 *
 * // Purge a Cache Key
 * const cacheKeyResult = await purgeClient.purgeCacheKey(['http://www.domain.com/path/image.jpg'], { debug: true });
 *
 * // Purge using a wildcard
 * const wildcardResult = await purgeClient.purgeWildCard(['http://www.domain.com/path/image.jpg*'], { debug: true });
 */
const client: CreateAzionPurgeClient = (
  config?: Partial<{ token: string; options?: AzionClientOptions }>,
): AzionPurgeClient => {
  const tokenValue = resolveToken(config?.token);

  const client: AzionPurgeClient = {
    purgeURL: (url: string[], options?: AzionClientOptions): Promise<AzionPurgeResponse<AzionPurge>> =>
      purgeURLMethod(tokenValue, url, options),
    purgeCacheKey: (cacheKey: string[], options?: AzionClientOptions): Promise<AzionPurgeResponse<AzionPurge>> =>
      purgeCacheKeyMethod(tokenValue, cacheKey, options),
    purgeWildCard: (wildcard: string[], options?: AzionClientOptions): Promise<AzionPurgeResponse<AzionPurge>> =>
      purgeWildCardMethod(tokenValue, wildcard, options),
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

export type * from './types';
