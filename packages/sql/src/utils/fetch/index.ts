export default async function fetchWithErrorHandling(
  url: string,
  options?: RequestInit,
  debug?: boolean,
  jsonResponse: boolean = true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  const response = await fetch(url, options);

  if (!response.ok) {
    try {
      const errorBody = await response.json();

      if (debug) {
        console.log('Error response body:', errorBody);
      }

      if (errorBody.errors && Array.isArray(errorBody.errors) && errorBody.errors.length > 0) {
        return errorBody;
      }

      if (errorBody.detail || errorBody.message) {
        return errorBody;
      }

      const errorMessage = `HTTP error! Status: ${response.status} - ${response.statusText}`;
      if (debug) console.log(`Error in fetch: ${errorMessage}`);
      throw new Error(errorMessage);
    } catch {
      const msg = `HTTP error! Status: ${response.status} - ${response.statusText}`;
      if (debug) console.log(`Error in fetch: ${msg}`);
      throw new Error(msg);
    }
  }

  if (jsonResponse) {
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      const msg = `Expected JSON response, but got: ${textResponse}`;

      if (debug) console.log(`Error in fetch: ${msg}`);

      throw new Error(msg);
    }

    const data = await response.json();
    return data;
  } else {
    const data = await response.text();
    return data;
  }
}
