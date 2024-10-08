export default async function fetchWithErrorHandling(
  url: string,
  options?: RequestInit,
  debug?: boolean,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
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
