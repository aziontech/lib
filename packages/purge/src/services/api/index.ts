import { ApiPurgeResponse } from './types';

const BASE_URL =
  process.env.AZION_ENV === 'stage'
    ? 'https://stage-api.azion.com/v4/edge/purge'
    : 'https://api.azion.com/v4/edge/purge';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleApiError = (fields: string[], data: any, operation: string) => {
  let error = { message: 'Error unknown', operation: operation };
  fields.forEach((field: string) => {
    if (data[field]) {
      const message = Array.isArray(data[field]) ? data[field].join(', ') : data[field];
      error = {
        message: message,
        operation: operation,
      };
    }
  });
  return error;
};

async function fetchWithErrorHandling(
  url: string,
  options?: RequestInit,
  debug?: boolean,
  jsonResponse: boolean = true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  const response = await fetch(url, options);

  if (!response.ok) {
    const msg = `HTTP error! Status: ${response.status} - ${response.statusText}`;

    if (debug) console.log(`Error in fetch: ${msg}`);

    throw new Error(msg);
  }

  if (jsonResponse) {
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      const msg = `Expected JSON response, but got: ${textResponse}`;

      if (debug) console.log(`Error in fetch: ${msg}`);

      throw new Error(msg);
    }

    const data = await response.json();
    return data;
  } else {
    const data = await response.text();
    return data;
  }
}

/**
 * Purge URLs from the Azion Edge cache.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {string[]} urls - URLs to purge.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @returns {Promise<ApiPurgeResponse>} The purge response or error message
 */
const postPurgeURL = async (token: string, urls: string[], debug?: boolean): Promise<ApiPurgeResponse> => {
  return postPurge(`${BASE_URL}/url`, token, urls, debug);
};

/**
 * Purge cache keys from the Azion Edge cache.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {string[]} urls - Cache keys to purge.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @returns {Promise<ApiPurgeResponse>} The purge response or error message
 */
const postPurgeCacheKey = async (token: string, urls: string[], debug?: boolean): Promise<ApiPurgeResponse> => {
  return postPurge(`${BASE_URL}/cachekey`, token, urls, debug);
};

/**
 * Purge using wildcard expressions from the Azion Edge cache.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {string[]} urls - Wildcard expressions to purge.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @returns {Promise<ApiPurgeResponse>} The purge response or error message
 */
const postPurgeWildcard = async (token: string, urls: string[], debug?: boolean): Promise<ApiPurgeResponse> => {
  return postPurge(`${BASE_URL}/wildcard`, token, urls, debug);
};

/**
 * Helper function to send a purge request to the Azion Edge cache.
 *
 * @param {string} url - The API endpoint for the purge request.
 * @param {string} token - Authentication token for Azion API.
 * @param {string[]} urls - Items to purge.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @returns {Promise<ApiPurgeResponse>} The purge response or error if the purge failed.
 */
const postPurge = async (url: string, token: string, urls: string[], debug?: boolean): Promise<ApiPurgeResponse> => {
  try {
    const result = await fetchWithErrorHandling(
      url,
      {
        method: 'POST',
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json; version=3',
        },
        credentials: 'include',
        body: JSON.stringify({ items: urls, layer: 'edge_cache' }),
      },
      debug,
    );
    if (!result.data) {
      if (debug) console.log('Response Error:', result);
      result.error = handleApiError(['detail', 'error', 'items'], result, 'post purge');
      return {
        error: result.error ?? JSON.stringify(result),
      };
    }
    if (debug) console.log('Response:', result);
    return result;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (debug) console.error('Error purging:', error);
    return {
      error: { message: error.toString(), operation: 'post purge' },
    };
  }
};

export { postPurgeCacheKey, postPurgeURL, postPurgeWildcard };
