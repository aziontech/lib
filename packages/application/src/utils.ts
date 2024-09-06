const envDebugFlag = process.env.AZION_DEBUG && process.env.AZION_DEBUG === 'true';

export const resolveToken = (token?: string) => token ?? process.env.AZION_TOKEN ?? '';
export const resolveDebug = (debug?: boolean) => debug ?? !!envDebugFlag;

/**
 * Maps API error response to a standardized error object.
 * @param response - The full API response object.
 * @param operation - The name of the operation that failed.
 * @param defaultMessage - The default error message to use if no specific message is found.
 * @returns A standardized error object.
 */
export const mapApiError = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  response: any,
  operation: string,
  defaultMessage: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): { error: { message: string; operation: string; [key: string]: any } } => {
  let errorMessage = defaultMessage;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let errorDetails: { [key: string]: any } = {};

  if (response) {
    if (typeof response === 'object') {
      // Check if the response is in the format { name_already_in_use: 'message' }
      const errorKey = Object.keys(response)[0];
      if (errorKey && typeof response[errorKey] === 'string') {
        errorMessage = response[errorKey];
        errorDetails = { [errorKey]: errorMessage };
      } else if (response.error) {
        // Check if there's an error object inside the response
        if (typeof response.error === 'object') {
          const innerErrorKey = Object.keys(response.error)[0];
          if (innerErrorKey && typeof response.error[innerErrorKey] === 'string') {
            errorMessage = response.error[innerErrorKey];
            errorDetails = { [innerErrorKey]: errorMessage };
          } else if (response.error.message) {
            errorMessage = response.error.message;
            errorDetails = response.error;
          }
        } else if (typeof response.error === 'string') {
          errorMessage = response.error;
        }
      } else if (response.message) {
        errorMessage = response.message;
        errorDetails = response;
      }
    } else if (typeof response === 'string') {
      errorMessage = response;
    }
  }

  return {
    error: {
      message: errorMessage,
      operation,
      ...errorDetails,
    },
  };
};
