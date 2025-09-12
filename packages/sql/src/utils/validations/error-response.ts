export function handleUnknownError<T>(error: unknown, operation: string): T {
  console.error('An unexpected error occurred:', error);
  return {
    error: {
      message: 'An unexpected error occurred during the operation',
      operation,
    },
  } as T;
}
