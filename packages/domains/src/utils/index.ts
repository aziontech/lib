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
