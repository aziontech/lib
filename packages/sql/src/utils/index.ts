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
