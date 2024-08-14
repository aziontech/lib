import { FetchEvent } from 'azion/types';
import { ParsedRequest, ParseRequestFunction } from '../types';

/**
 * @function
 * @description The `parseRequest` function is designed to parse and log the details of an incoming request.
 * This function extracts key information such as headers, cookies, body, and client data from the incoming FetchEvent,
 * providing a structured object with all these details for further processing or logging purposes.
 * @param {FetchEvent} event - The incoming FetchEvent object representing the request.
 * @returns {Promise<object>} A promise that resolves to an object containing detailed information about the request.
 * @example
 * // Parse a GET request
 * // Input: parseRequest(event);
 * // Output: {
 * //   timestamp: "2024-08-14T12:34:56.789Z",
 * //   metadata: {
 * //     geoip_asn: "12345",
 * //     geoip_city: "Sao Paulo",
 * //     geoip_city_continent_code: "SA",
 * //     geoip_city_country_code: "BR",
 * //     geoip_city_country_name: "Brazil",
 * //     // ... other metadata fields
 * //   },
 * //   method: "GET",
 * //   url: {
 * //     full: "https://example.com/",
 * //     protocol: "https:",
 * //     hostname: "example.com",
 * //     path: "/",
 * //     query: {}
 * //   },
 * //   headers: { ... },
 * //   cookies: { ... },
 * //   body: null,
 * //   client: {
 * //     ip: "123.45.67.89",
 * //     userAgent: "Mozilla/5.0 ..."
 * //   },
 * //   referer: "Unknown",
 * //   origin: "Unknown",
 * //   cacheControl: "Unknown",
 * //   pragma: "Unknown",
 * //   contentType: "Unknown",
 * //   contentLength: "Unknown",
 * //   acceptLanguage: "Unknown",
 * //   acceptEncoding: "Unknown",
 * //   priority: "Unknown",
 * //   host: "Unknown",
 * //   authorization: "Not Present"
 * // }
 */
const parseRequest: ParseRequestFunction = async (event: FetchEvent): Promise<ParsedRequest> => {
  const { request } = event;
  const headers = new Headers(request.headers);
  const url = new URL(request.url);

  let body = null;
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    try {
      body = await request.clone().text();
    } catch (error) {
      body = 'Unable to read body';
    }
  }

  const cookies = headers.get('cookie')
    ? Object.fromEntries(
        headers
          .get('cookie')!
          .split(';')
          .map((cookie) => cookie.trim().split('=')),
      )
    : {};

  const requestData = {
    timestamp: new Date().toISOString(),
    metadata: request.metadata,
    method: request.method,
    url: {
      full: request.url,
      protocol: url.protocol,
      hostname: url.hostname,
      path: url.pathname,
      query: Object.fromEntries(url.searchParams),
    },
    headers: Object.fromEntries(headers.entries()),
    cookies,
    body,
    client: {
      ip: headers.get('x-forwarded-for') || 'Unknown',
      userAgent: headers.get('user-agent') || 'Unknown',
    },
    referer: headers.get('referer') || 'Unknown',
    origin: headers.get('origin') || 'Unknown',
    cacheControl: headers.get('cache-control') || 'Unknown',
    pragma: headers.get('pragma') || 'Unknown',
    contentType: headers.get('content-type') || 'Unknown',
    contentLength: headers.get('content-length') || 'Unknown',
    acceptLanguage: headers.get('accept-language') || 'Unknown',
    acceptEncoding: headers.get('accept-encoding') || 'Unknown',
    priority: headers.get('priority') || 'Unknown',
    host: headers.get('host') || 'Unknown',
    authorization: headers.has('authorization') ? 'Present' : 'Not Present',
  };

  return requestData;
};

export default parseRequest;
