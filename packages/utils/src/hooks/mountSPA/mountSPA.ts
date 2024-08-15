import { AssetPath, MountSPAFunction, RequestURL } from '../types';

/**
 * @function
 * @description The `mountSPA` function is designed to process requests to a Single Page Application (SPA)
 * that's being computed at the edge of a Content Delivery Network (CDN).
 *
 * This function determines if the incoming request is for a static
 * asset or a route within the application,
 * and mounts the appropriate request URL for fetching the required resource from the origin server.
 * @param {RequestURL} requestURL - The original URL from the incoming request.
 * @returns {Promise<Response>} A promise that resolves to the response from the fetched resource.
 * @example
 * // Handle a request for a homepage
 * // Input: mountSPA('https://example.com/');
 * // Output: fetch('file:///index.html');
 * @example
 * // Handle a request for an asset (CSS file)
 * // Input: mountSPA('https://example.com/styles/main.css');
 * // Output: fetch('file:///styles/main.css');
 * @example
 * // Handle a request for a specific route
 * // Input: mountSPA('https://example.com/about');
 * // Output: fetch('file:///index.html');
 */
const mountSPA: MountSPAFunction = (requestURL: RequestURL): Promise<Response> => {
  const requestPath = new URL(requestURL).pathname;

  let assetPath: AssetPath;

  /**
   * Regular expression to match any file extension.
   * It looks for a dot followed by one or more non-dot characters at the end of the string.
   * This helps identify if the request is for a file (like .css, .js, .png) or a route.
   */
  const fileExtensionRegex = /\.[^.]+$/;

  if (fileExtensionRegex.test(requestPath)) {
    // If the requestPath has a file extension, it is considered an asset.
    assetPath = new URL(requestPath.slice(1), 'file:///');
  } else {
    // If the requestPath does not have a file extension, it is treated as a route.
    assetPath = new URL('index.html', 'file:///');
  }

  return fetch(assetPath);
};

export default mountSPA;
