import { ApiPurgeResponse } from './types';

const BASE_URL = 'https://api.azion.com/v4/edge/purge';

const postPurgeURL = async (token: string, urls: string[], debug?: boolean): Promise<ApiPurgeResponse | null> => {
  return postPurge(`${BASE_URL}/url`, token, urls, debug);
};

const postPurgeCacheKey = async (token: string, urls: string[], debug?: boolean): Promise<ApiPurgeResponse | null> => {
  return postPurge(`${BASE_URL}/cachekey`, token, urls, debug);
};

const postPurgeWildcard = async (token: string, urls: string[], debug?: boolean): Promise<ApiPurgeResponse | null> => {
  return postPurge(`${BASE_URL}/wildcard`, token, urls, debug);
};

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
