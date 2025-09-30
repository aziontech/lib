/**
 * Create a method that can be used internally or externally
 * @param internal Internal method
 * @param external External method
 * @param validation Validation flag
 * @returns Method that can be used internally or externally
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createInternalOrExternalMethod = <T extends (...args: any[]) => any>({
  internal,
  external,
  validation,
}: {
  internal: T;
  external: T;
  validation: boolean;
}): T => {
  return ((...args: Parameters<T>): ReturnType<T> => {
    if (validation) {
      return internal(...args);
    }
    return external(...args);
  }) as T;
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
