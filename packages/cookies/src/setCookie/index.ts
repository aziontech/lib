export type CookieOptions = {
  domain?: string;
  expires?: Date;
  httpOnly?: boolean;
  maxAge?: number;
  path?: string;
  sameSite?: 'Lax' | 'None' | 'Strict';
  secure?: boolean;
  prefix?: 'host' | 'secure';
  partitioned?: boolean;
};

export interface SetCookie {
  /**
   * Sets a cookie in the response headers.
   *
   * @param {Response} res - The HTTP response object.
   * @param {string} key - The key of the cookie to set.
   * @param {string} value - The value of the cookie to set.
   * @param {CookieOptions} [options] - Optional settings for the cookie.
   * @returns {Response} The modified response object with the Set-Cookie header.
   */
  (res: Response, key: string, value: string, options?: CookieOptions): Response;
}

/**
 * Sets a cookie in the response headers.
 *
 * @param {Response} response - The HTTP response object.
 * @param {string} key - The key of the cookie to set.
 * @param {string} value - The value of the cookie to set.
 * @param {CookieOptions} [options] - Optional settings for the cookie.
 * @returns {Response} The modified response object with the Set-Cookie header.
 *
 * @example
 * // Set a simple cookie
 * setCookie(response, 'session_id', 'abc123');
 *
 * @example
 * // Set a cookie with options
 * setCookie(response, 'session_id', 'abc123', { httpOnly: true, secure: true });
 */
export const setCookie: SetCookie = (response, key, value, options) => {
  if (!(response instanceof Response)) {
    throw new Error('response is not an instance of Response');
  }
  const cookieKey = changeKeyOnPrefix(key, options);
  if (options?.prefix === 'host' || options?.prefix === 'secure') {
    options = { ...options, secure: true };
  }

  let cookie = `${cookieKey}=${value}`;
  if (options?.domain) {
    cookie += `; Domain=${options.domain}`;
  }
  if (options?.expires) {
    if (options?.expires < new Date()) {
      throw new Error('expires option must be a future date');
    }
    if (options.expires.getTime() - Date.now() > 34560000_000) {
      throw new Error('expires option must be less than or equal to (400 days) 34560000');
    }
    cookie += `; Expires=${options.expires.toUTCString()}`;
  }
  if (options?.httpOnly) {
    cookie += '; HttpOnly';
  }
  if (options?.maxAge) {
    if (options?.maxAge < 0) throw new Error('maxAge must be a positive number');
    if (options?.maxAge > 34560000) {
      throw new Error('maxAge must be less than or equal to (400 days) 34560000');
    }
    cookie += `; Max-Age=${options.maxAge}`;
  }
  if (options?.path) {
    cookie += `; Path=${options.path}`;
  }
  if (options?.sameSite) {
    if (options.sameSite === 'None' && !options.secure) {
      throw new Error('secure option must be true when using SameSite=None');
    }
    if (options.sameSite === 'None' && options.secure && options.partitioned) {
      throw new Error('Partitioned cookies cannot be used with SameSite=None and Secure');
    }
    cookie += `; SameSite=${options.sameSite}`;
  }
  if (options?.secure) {
    cookie += '; Secure';
  }
  if (options?.partitioned) {
    cookie += '; Partitioned';
  }
  response.headers.append('Set-Cookie', cookie);
  return response;
};

/**
 * Modifies the cookie key based on the prefix options.
 *
 * @param {string} key - The original cookie key.
 * @param {CookieOptions} [options] - Optional settings for the cookie.
 * @returns {string} The modified cookie key with the appropriate prefix.
 */
const changeKeyOnPrefix = (key: string, options?: CookieOptions) => {
  let cookieKey = key;
  if (options?.prefix === 'secure') {
    if (options?.secure === false) {
      throw new Error('secure option must be true when using secure prefix');
    }
    cookieKey = `__Secure-${cookieKey}`;
  }
  if (options?.prefix === 'host') {
    if (options?.secure === false) {
      throw new Error('secure option must be true when using host prefix');
    }
    if (options?.domain) {
      throw new Error('domain option must not be set when using host prefix');
    }
    if (options?.path !== '/') {
      throw new Error('path option must be set to / when using host prefix');
    }
    cookieKey = `__Host-${cookieKey}`;
  }
  return cookieKey;
};
