import { type CookiePrefix } from '../common/types';
import { parseCookie } from '../utils/parse';

export interface GetCookie {
  (req: Request, key?: string): string | undefined | Record<string, string>;
  (req: Request, key: string, prefixOptions: CookiePrefix): string | undefined | Record<string, string>;
}

export const getCookie: GetCookie = (request, key?, prefix?: CookiePrefix) => {
  if (!(request instanceof Request) || request.headers === undefined) {
    return typeof key === 'string' ? undefined : {};
  }
  const cookie = request.headers.get('Cookie');
  if (!cookie) {
    return typeof key === 'string' ? undefined : {};
  }

  const finalKey = prefix ? `__${prefix.charAt(0).toUpperCase() + prefix.slice(1)}-${key}` : key;
  return parseCookie(cookie, finalKey) as string | undefined | Record<string, string>;
};
