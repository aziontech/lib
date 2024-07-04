import { getCookie } from '.';

describe('getCookie', () => {
  let request: Request;

  beforeEach(() => {
    request = new Request('https://example.com');
  });

  it('should return undefined if the request is not a Request instance', () => {
    // @ts-expect-error Testing invalid input
    expect(getCookie(undefined)).toEqual(undefined);
  });

  it('should return cookies with no values', () => {
    request.headers.set('Cookie', 'one_cookie=; two_cookie = ; three_cookie= ; four_cookie=""');
    expect(getCookie(request, 'one_cookie')).toBe('');
    expect(getCookie(request, 'two_cookie')).toBe('');
    expect(getCookie(request, 'three_cookie')).toBe('');
    expect(getCookie(request, 'four_cookie')).toBe('');
  });

  it('should return undefined if the cookie header is not set', () => {
    expect(getCookie(request, 'key')).toBeUndefined();
  });

  it('should return undefined if the cookie is not set', () => {
    request.headers.set('Cookie', 'key=value');
    expect(getCookie(request, 'other')).toBeUndefined();
  });

  it('should return the cookie value', () => {
    request.headers.set('Cookie', 'key=value');
    expect(getCookie(request, 'key')).toBe('value');
  });

  it('should return the cookie value with the __Secure- prefix', () => {
    request.headers.set('Cookie', '__Secure-key=value');
    expect(getCookie(request, 'key', 'secure')).toBe('value');
  });

  it('should return the cookie value with the __Host- prefix', () => {
    request.headers.set('Cookie', '__Host-key=value');
    expect(getCookie(request, 'key', 'host')).toBe('value');
  });

  it('should return the cookie with multiples values', () => {
    request.headers.set('Cookie', 'key=value; key2=value2');
    expect(getCookie(request, 'key')).toBe('value');
  });

  it('should return the all cookies', () => {
    request.headers.set('Cookie', 'key=value; key2=value2');
    expect(getCookie(request)).toEqual({ key: 'value', key2: 'value2' });
  });

  it('should parse quoted cookie values', () => {
    request.headers.set('Cookie', 'one_cookie="one"; two_cookie = " two " ; three_cookie="%20three%20";');
    expect(getCookie(request, 'one_cookie')).toBe('one');
    expect(getCookie(request, 'two_cookie')).toBe(' two ');
    expect(getCookie(request, 'three_cookie')).toBe(' three ');
  });

  it('should return an empty object if the cookie header is not set', () => {
    expect(getCookie(request)).toEqual({});
  });
});
