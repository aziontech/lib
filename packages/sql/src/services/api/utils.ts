/**
 * Check if the result has an error
 */
export const hasDataError = (result: Record<string, unknown>[]): { message: string } => {
  return result
    .map((data: Record<string, unknown>) => {
      if (data?.error) {
        return {
          message: data.error as string,
        };
      }
      return null;
    })
    .find((data) => data !== null) as { message: string };
};
