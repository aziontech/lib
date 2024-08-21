import { getBuckets } from '../services/api/index';
import { ApiBucket } from '../services/api/types';
import { AzionClientOptions } from '../types';

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
    } catch (error) {
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
 * @returns {Promise<ApiBucket | null>} The bucket if found, or null if not found.
 */
export const findBucketByName = async (
  token: string,
  name: string,
  options?: AzionClientOptions,
): Promise<ApiBucket | null> => {
  const PAGE_SIZE_TEMP = 100000;
  const apiResponse = await getBuckets(token, { page_size: PAGE_SIZE_TEMP }, options?.debug ?? false);
  const buckets = apiResponse.results;
  if (!buckets) return null;

  const bucket = buckets.find((b) => b.name === name);
  return bucket ?? null;
};