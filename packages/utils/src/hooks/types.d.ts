import { Metadata } from 'azion/types';

/**
 * Represents the request URL for the SSG or SPA.
 */
export type RequestURL = string;

/**
 * Represents the asset path in the file system.
 */
export type AssetPath = URL;

/**
 * Function that mounts the SSG for a specific request.
 * @param requestURL - The original URL from the event request.
 * @returns A promise that resolves to the response from the SSG.
 */
export type MountSSGFunction = (requestURL: RequestURL) => Promise<Response>;

/**
 * Function that mounts the SPA for a specific request.
 * @param requestURL - The original URL from the event request.
 * @returns A promise that resolves to the response from the SPA.
 */
export type MountSPAFunction = (requestURL: RequestURL) => Promise<Response>;

/**
 * Function that parses and logs the details of an incoming request.
 * @param event - The incoming FetchEvent object.
 * @returns A promise that resolves to the ParsedRequest object.
 */
export type ParseRequestFunction = (event: FetchEvent) => Promise<ParsedRequest>;

/**
 * Function that parses and logs the details of an incoming request.
 * @param event - The incoming FetchEvent object.
 * @returns A promise that resolves to the request details object.
 */
export type ParsedRequest = {
  timestamp: string;
  method: string;
  url: {
    full: string;
    protocol: string;
    hostname: string;
    path: string;
    query: Record<string, string>;
  };
  headers: Record<string, string>;
  cookies: Record<string, string>;
  body: string | null;
  client: {
    ip: string;
    userAgent: string;
  };
  referer: string;
  origin: string;
  cacheControl: string;
  pragma: string;
  contentType: string;
  contentLength: string;
  acceptLanguage: string;
  acceptEncoding: string;
  priority: string;
  host: string;
  authorization: string;
  metadata: Metadata;
};
