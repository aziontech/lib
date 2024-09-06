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
