import { ApiPurgeResponse } from './types';

const BASE_URL = 'https://api.azion.com/v4/edge/purge';

/**
 * Purge URLs from the Azion Edge cache.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {string[]} urls - URLs to purge.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @returns {Promise<ApiPurgeResponse | null>} The purge response or null if the purge failed.
 */
const postPurgeURL = async (token: string, urls: string[], debug?: boolean): Promise<ApiPurgeResponse | null> => {
  return postPurge(`${BASE_URL}/url`, token, urls, debug);
};

/**
 * Purge cache keys from the Azion Edge cache.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {string[]} urls - Cache keys to purge.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @returns {Promise<ApiPurgeResponse | null>} The purge response or null if the purge failed.
 */
const postPurgeCacheKey = async (token: string, urls: string[], debug?: boolean): Promise<ApiPurgeResponse | null> => {
  return postPurge(`${BASE_URL}/cachekey`, token, urls, debug);
};

/**
 * Purge using wildcard expressions from the Azion Edge cache.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {string[]} urls - Wildcard expressions to purge.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @returns {Promise<ApiPurgeResponse | null>} The purge response or null if the purge failed.
 */
const postPurgeWildcard = async (token: string, urls: string[], debug?: boolean): Promise<ApiPurgeResponse | null> => {
  return postPurge(`${BASE_URL}/wildcard`, token, urls, debug);
};

/**
 * Helper function to send a purge request to the Azion Edge cache.
 *
 * @param {string} url - The API endpoint for the purge request.
 * @param {string} token - Authentication token for Azion API.
 * @param {string[]} urls - Items to purge.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @returns {Promise<ApiPurgeResponse | null>} The purge response or null if the purge failed.
 */
const postPurge = async (
  url: string,
  token: string,
  urls: string[],
  debug?: boolean,
): Promise<ApiPurgeResponse | null> => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Token ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json; version=3',
      },
      credentials: 'include',
      body: JSON.stringify({ items: urls, layer: 'edge_cache' }),
    });
    const data = await response.json();
    if (debug) console.log('Response:', data);
    return data;
  } catch (error) {
    if (debug) console.error('Error purging:', error);
    return null;
  }
};

export { postPurgeCacheKey, postPurgeURL, postPurgeWildcard };
