import { AssetPath, MountSSGFunction, RequestURL } from '../types';

/**
 * @function
 * @description The `mountSSG` function handles requests for Static Site Generation (SSG)
 * at the edge, directly within a serverless worker.
 * It processes the incoming request URL, constructs the appropriate asset path,
 * and fetches the corresponding response from the SSG.
 * @param {RequestURL} requestURL - The original URL from the event request.
 * @returns {Promise<Response>} A promise that resolves to the response from the SSG.
 * @example
 * // Handle a request for a homepage
 * // Input: mountSSG('https://example.com/');
 * // Output: fetch('file:///index.html');
 * @example
 * // Handle a request for an asset (CSS file)
 * // Input: mountSSG('https://example.com/styles/main.css');
 * // Output: fetch('file:///styles/main.css');
 * @example
 * // Handle a request for a specific route
 * // Input: mountSSG('https://example.com/about');
 * // Output: fetch('file:///about/index.html');
 */
const mountSSG: MountSSGFunction = (requestURL: RequestURL): Promise<Response> => {
  const requestPath = new URL(requestURL).pathname;
  const cleanRequestPath = requestPath.endsWith('/') ? requestPath.slice(0, -1) : requestPath;

  /**
   * Regular expression to match any file extension.
   * It looks for a dot followed by one or more non-dot characters at the end of the string.
   * This helps identify if the request is for a file (like .css, .js, .png) or a route.
   */
  const fileExtensionRegex = /\.[^.]+$/;

  let assetPath: AssetPath;

  if (cleanRequestPath === '') {
    assetPath = new URL('index.html', 'file:///');
  } else if (fileExtensionRegex.test(cleanRequestPath)) {
    assetPath = new URL(cleanRequestPath.slice(1), 'file:///');
  } else {
    assetPath = new URL(`${cleanRequestPath.slice(1)}/index.html`, 'file:///');
  }

  return fetch(assetPath);
};

export default mountSSG;
