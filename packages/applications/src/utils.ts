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
