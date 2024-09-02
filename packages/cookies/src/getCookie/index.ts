import { type CookiePrefix } from '../common/types';
import { parseCookie } from '../utils/parse';

export interface GetCookie {
  /**
   * Retrieves a cookie value from the request headers.
   *
   * @param {Request} req - The HTTP request object.
   * @param {string} [key] - The key of the cookie to retrieve.
   * @returns {string | undefined | Record<string, string>} The cookie value or an object of all cookies if no key is provided.
   */
  (req: Request, key?: string): string | undefined | Record<string, string>;

  /**
   * Retrieves a cookie value from the request headers with a prefix.
   *
   * @param {Request} req - The HTTP request object.
   * @param {string} key - The key of the cookie to retrieve.
   * @param {CookiePrefix} prefixOptions - The prefix options for the cookie key.
   * @returns {string | undefined | Record<string, string>} The cookie value or an object of all cookies if no key is provided.
   */
  (req: Request, key: string, prefixOptions: CookiePrefix): string | undefined | Record<string, string>;
}

/**
 * Retrieves a cookie value from the request headers.
 *
 * @param {Request} request - The HTTP request object.
 * @param {string} [key] - The key of the cookie to retrieve.
 * @param {CookiePrefix} [prefix] - The prefix options for the cookie key.
 * @returns {string | undefined | Record<string, string>} The cookie value or an object of all cookies if no key is provided.
 *
 * @example
 * // Retrieve a specific cookie
 * const cookieValue = getCookie(request, 'session_id');
 *
 * @example
 * // Retrieve a specific cookie with a prefix
 * const cookieValue = getCookie(request, 'session_id', 'user');
 *
 * @example
 * // Retrieve all cookies
 * const allCookies = getCookie(request);
 */
export const getCookie: GetCookie = (
  request: Request,
  key?: string,
  prefix?: CookiePrefix,
): string | undefined | Record<string, string> => {
  if (!(request instanceof Request)) {
    return undefined;
  }
  const cookie = request.headers.get('Cookie');
  if (!cookie) {
    return typeof key === 'string' ? undefined : {};
  }

  const finalKey = prefix ? `__${prefix.charAt(0).toUpperCase() + prefix.slice(1)}-${key}` : key;
  return parseCookie(cookie, finalKey) as string | undefined | Record<string, string>;
};
