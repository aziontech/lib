import { getBuckets } from '../services/api/index';
import { ApiGetBucket } from '../services/api/types';
import { AzionClientOptions } from '../types';

type ErrorBody = {
  detail?: string;
  message?: string;
  errors?: string[];
};

/**
 * Removes the leading slash from a key if it exists.
 *
 * @param {string} key The key that may contain a leading slash.
 * @returns {string} The key without the leading slash.
 */
export function removeLeadingSlash(key: string): string {
  return key.replace(/^\//, '');
}

/**
 * Retries a function with exponential backoff.
 *
 * This function attempts to execute the provided function multiple times with an increasing delay between attempts.
 * It is useful for handling temporary issues such as network instability or eventual consistency delays.
 *
 * @template T The type of the function's return value.
 * @param {() => Promise<T>} fn The function to retry.
 * @param {number} [delay=1000] The initial delay between attempts in milliseconds.
 * @returns {Promise<T>} The result of the function if it succeeds within the allowed attempts.
 * @throws {Error} If the function fails after the specified number of attempts.
 */
export const retryWithBackoff = async <T>(fn: () => Promise<T>, delay: number = 1000): Promise<T> => {
  let attempt = 0;
  const maxTime = 120000; // 2 minutes in milliseconds
  const startTime = Date.now();

  while (Date.now() - startTime < maxTime) {
    try {
      return await fn();
    } catch {
      if (attempt === 0) {
        console.warn('Attempting to synchronize. The content may not be synchronized on the edge yet.');
      }
      if (Date.now() - startTime >= maxTime) {
        throw new Error('Max retry time reached');
      }
      console.log(`Retry attempt ${attempt + 1} failed. Retrying in ${delay * Math.pow(2, attempt)} ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, attempt)));
      attempt++;
    }
  }
  throw new Error('Max retry time reached');
};

/**
 * Finds a bucket by name.
 *
 * This is a temporary solution because the API does not provide an endpoint
 * to search for a single bucket by name. When available, it must be replaced
 * by a direct API call.
 *
 * @param {string} token The authentication token.
 * @param {string} name The name of the bucket to find.
 * @param {AzionClientOptions} [options] Optional client options.
 * @returns {Promise<ApiGetBucket>} The bucket if found, or error message.
 */
export const findBucketByName = async (
  token: string,
  name: string,
  options?: AzionClientOptions,
): Promise<ApiGetBucket> => {
  const PAGE_SIZE_TEMP = 1000000;
  const apiResponse = await getBuckets(token, { page_size: PAGE_SIZE_TEMP }, options?.debug ?? false, options?.env);
  const buckets = apiResponse.results;
  if (apiResponse.error)
    return {
      error: apiResponse.error,
    };
  if (!buckets) {
    return {
      error: {
        message: 'Failed to retrieve buckets.',
        operation: 'getBuckets',
      },
    };
  }
  const bucket = buckets.find((b) => b.name === name);
  return {
    data: bucket,
  };
};

// handle possible storage api returns
async function handleResponseData(
  response: Response,
  expectAJsonResponse: boolean,
  debug?: boolean,
): Promise<unknown | string | ArrayBuffer> {
  const contentType = response.headers.get('Content-Type');
  const isAJsonReturn = contentType?.includes('application/json');

  if (!isAJsonReturn && expectAJsonResponse) {
    const textResponse = await response.text();
    const msg = `Expected JSON response, but got: ${textResponse}`;

    if (debug) console.log(`Error in fetch: ${msg}`);

    throw new Error(msg);
  }

  if (isAJsonReturn) {
    return response.json();
  }

  if (contentType?.includes('application/octet-stream')) {
    // TODO: improve the return based on content type
    // this wil generate a breaking change!
    // `return response.arrayBuffer()`
    return response.text();
  }

  return response.text();
}

export async function fetchWithErrorHandling(
  url: string,
  options?: RequestInit,
  debug?: boolean,
  jsonResponse: boolean = true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  const response = await fetch(url, options);

  if (!response.ok) {
    try {
      const errorBody = (await handleResponseData(response, true, debug)) as ErrorBody;

      if (debug) {
        console.log('Error response body:', errorBody);
      }

      if (errorBody.errors && Array.isArray(errorBody.errors) && errorBody.errors.length > 0) {
        return errorBody;
      }

      // Handle other error formats
      if (errorBody.detail || errorBody.message) {
        return errorBody;
      }
      const errorMessage = `HTTP error! Status: ${response.status} - ${response.statusText}`;
      if (debug) console.log(`Error in fetch: ${errorMessage}`);
      throw new Error(errorMessage);
    } catch {
      const msg = `HTTP error! Status: ${response.status} - ${response.statusText}`;
      if (debug) console.log(`Error in fetch: ${msg}`);
      throw new Error(msg);
    }
  }

  const data = await handleResponseData(response, jsonResponse, debug);

  return data;
}
