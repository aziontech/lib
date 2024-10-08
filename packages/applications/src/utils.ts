const envDebugFlag = process.env.AZION_DEBUG && process.env.AZION_DEBUG === 'true';

export const resolveToken = (token?: string) => token ?? process.env.AZION_TOKEN ?? '';
export const resolveDebug = (debug?: boolean) => debug ?? !!envDebugFlag;

/**
 * Maps API error response to a standardized error object.
 * @param error - The full API error response object or string.
 * @param operation - The name of the operation that failed.
 * @param defaultMessage - The default error message to use if no specific message is found.
 * @returns A standardized error object with operation and message.
 */
export const mapApiError = (
  error: unknown,
  operation: string,
  defaultMessage: string,
): { message: string; operation: string } => {
  let errorMessage: string | undefined;

  if (error && typeof error === 'object') {
    // Caso 1: { name_already_in_use: 'message' }
    const errorKey = Object.keys(error)[0];
    if (errorKey && typeof error[errorKey as keyof typeof error] === 'string') {
      errorMessage = error[errorKey as keyof typeof error] as string;
    }
    // Case 2: { detail: 'message' }
    else if ('detail' in error && typeof error.detail === 'string') {
      errorMessage = error.detail;
    }
    // Case 2: { message: 'message' }
    else if ('message' in error && typeof error.message === 'string') {
      errorMessage = error.message;
    }
    // Case 4: { error: 'message' } or { error: { message: 'message' } }
    else if ('error' in error) {
      if (typeof error.error === 'string') {
        errorMessage = error.error;
      } else if (typeof error.error === 'object' && error.error !== null) {
        const innerErrorKey = Object.keys(error.error)[0];
        if (innerErrorKey && typeof (error.error as Record<string, unknown>)[innerErrorKey] === 'string') {
          errorMessage = (error.error as Record<string, string>)[innerErrorKey];
        } else if ('message' in error.error && typeof (error.error as { message: unknown }).message === 'string') {
          errorMessage = (error.error as { message: string }).message;
        }
      }
    }
  } else if (typeof error === 'string') {
    errorMessage = error;
  }

  // Use default Message as final fallback if no error message is found
  return {
    message: errorMessage || defaultMessage,
    operation,
  };
};

/**
 * Fetches data from the given URL and handles errors based on the HTTP status code.
 * It also ensures the response is in JSON format, throwing an error if it is not.
 *
 * @param {string} url - The URL to send the fetch request to.
 * @param {RequestInit} [options] - Optional configuration for the fetch request (headers, method, body, ...).
 * @returns {Promise<any>} - A promise that resolves to the fetched data if the request is successful.
 * @throws {Error} - Throws an error if the response status is not in the 2xx range or if the response is not in JSON format.
 *
 * @example
 * async function fetchData() {
 *  try {
 *    const data = await fetchWithErrorHandling('https://example.com/x')
 *    console.log('response data:', data)
 *  } catch (err) {
 *    console.log('error:', err)
 *  }
 * }
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchWithErrorHandling(url: string, options?: RequestInit, debug?: boolean): Promise<any> {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const msg = `HTTP error! Status: ${response.status} - ${response.statusText}`;

      if (debug) console.log(`Error in fetch: ${msg}`);

      throw new Error(msg);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      const msg = `Expected JSON response, but got: ${textResponse}`;

      if (debug) console.log(`Error in fetch: ${msg}`);

      throw new Error(msg);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    if (debug) console.log(`Error in fetch: ${err}`);

    throw err;
  }
}
