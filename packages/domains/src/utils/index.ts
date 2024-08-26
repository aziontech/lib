/**
 * Resolve the token from the environment variable or the parameter
 * @param token Token to resolve
 * @returns Resolved token
 *
 */
export const resolveToken = (token?: string) => token ?? process.env.AZION_TOKEN ?? '';

/**
 * Resolve the debug flag from the environment variable or the parameter
 * @param debug Debug flag to resolve
 * @returns Resolved debug flag
 */
export const resolveDebug = (debug?: boolean) => {
  const envDebugFlag = process.env.AZION_DEBUG && process.env.AZION_DEBUG === 'true';
  if (typeof debug === 'undefined' || debug === null) {
    return !!envDebugFlag;
  }
  return !!debug;
};

/**
 * Limit the size of an array
 * @param array Array to limit
 * @param limit Limit of the array
 * @returns Array with limited size
 */
export const limitArraySize = <T>(array: T[], limit: number): T[] => {
  if (array?.length > limit) {
    return array.slice(0, limit);
  }
  return array;
};

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
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  debug: boolean = false,
  delay: number = 1000,
  maxTime: number = 120000,
): Promise<T> => {
  let attempt = 0;
  const startTime = Date.now();

  while (Date.now() - startTime < maxTime) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === 0) {
        if (debug) {
          console.warn('Attempting to synchronize. The content may not be synchronized on the edge yet.');
        }
      }
      if (debug) {
        console.log(`Retry attempt ${attempt + 1} failed. Retrying in ${delay * Math.pow(2, attempt)} ms...`);
      }
      await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, attempt)));
      attempt++;
    }
  }
  throw new Error('Max retry time reached!');
};
