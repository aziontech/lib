import { setCookie } from '.';

describe('setCookie', () => {
  let response: Response;

  beforeEach(() => {
    response = new Response();
  });

  it('should return the response if it is not an instance of Response', () => {
    // @ts-expect-error testing purposes
    expect(() => setCookie(null, 'key', 'value')).toThrow('response is not an instance of Response');
  });

  it('should set the cookie with the key and value', () => {
    setCookie(response, 'key', 'value');
    expect(response.headers.get('Set-Cookie')).toBe('key=value');
  });

  it('should set the cookie with the path /login', () => {
    setCookie(response, 'key', 'value', { path: '/login' });
    expect(response.headers.get('Set-Cookie')).toBe('key=value; Path=/login');
  });

  it('should set the cookie with the key and value and domain', () => {
    setCookie(response, 'key', 'value', { domain: 'example.com' });
    expect(response.headers.get('Set-Cookie')).toBe('key=value; Domain=example.com');
  });

  it('should set the cookie with the key and value and expires', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    setCookie(response, 'key', 'value', { expires: futureDate });
    expect(response.headers.get('Set-Cookie')).toBe(`key=value; Expires=${futureDate.toUTCString()}`);
  });

  it('should set the cookie with the key and value and httpOnly', () => {
    setCookie(response, 'key', 'value', { httpOnly: true });
    expect(response.headers.get('Set-Cookie')).toBe('key=value; HttpOnly');
  });

  it('should set the cookie with the key and value and maxAge', () => {
    setCookie(response, 'key', 'value', { maxAge: 60 });
    expect(response.headers.get('Set-Cookie')).toBe('key=value; Max-Age=60');
  });

  it('should set the cookie with the key and value and path', () => {
    setCookie(response, 'key', 'value', { path: '/' });
    expect(response.headers.get('Set-Cookie')).toBe('key=value; Path=/');
  });

  it('should set the cookie with the key and value and sameSite', () => {
    setCookie(response, 'key', 'value', { sameSite: 'Strict' });
    expect(response.headers.get('Set-Cookie')).toBe('key=value; SameSite=Strict');
  });

  it('should set the cookie with the key and value and secure', () => {
    setCookie(response, 'key', 'value', { secure: true });
    expect(response.headers.get('Set-Cookie')).toBe('key=value; Secure');
  });

  it('should set the cookie with the key and value and partitioned', () => {
    setCookie(response, 'key', 'value', { partitioned: true });
    expect(response.headers.get('Set-Cookie')).toBe('key=value; Partitioned');
  });

  it('should set the cookie with the key and value and prefix host', () => {
    setCookie(response, 'key', 'value', { prefix: 'host', path: '/' });
    expect(response.headers.get('Set-Cookie')).toBe('__Host-key=value; Path=/; Secure');
  });

  it('should set the cookie with the key and value and prefix secure', () => {
    setCookie(response, 'key', 'value', { prefix: 'secure' });
    expect(response.headers.get('Set-Cookie')).toBe('__Secure-key=value; Secure');
  });

  it('should throw an error if the expires option is not a future date', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    expect(() => setCookie(response, 'key', 'value', { expires: pastDate })).toThrow(
      'expires option must be a future date',
    );
  });

  it('should throw an error if the expires option is more than 400 days', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 401);
    expect(() => setCookie(response, 'key', 'value', { expires: futureDate })).toThrow(
      'expires option must be less than or equal to (400 days) 34560000',
    );
  });

  it('should throw an error if the maxAge option is less than 0', () => {
    expect(() => setCookie(response, 'key', 'value', { maxAge: -1 })).toThrow('maxAge must be a positive number');
  });

  it('should throw an error if the maxAge option is more than 400 days', () => {
    expect(() => setCookie(response, 'key', 'value', { maxAge: 34560001 })).toThrow(
      'maxAge must be less than or equal to (400 days) 34560000',
    );
  });

  it('should throw an error if the secure option is false when using secure prefix', () => {
    expect(() => setCookie(response, 'key', 'value', { prefix: 'secure', secure: false })).toThrow(
      'secure option must be true when using secure prefix',
    );
  });

  it('should throw an error if the SameSite=None and secure is false', () => {
    expect(() => setCookie(response, 'key', 'value', { sameSite: 'None', secure: false })).toThrow(
      'secure option must be true when using SameSite=None',
    );
  });

  it('should throw an error if the SameSite=None and secure is true and partitioned is true', () => {
    expect(() => setCookie(response, 'key', 'value', { sameSite: 'None', secure: true, partitioned: true })).toThrow(
      'Partitioned cookies cannot be used with SameSite=None and Secure',
    );
  });

  it('should throw an error if the secure option is false when using host prefix', () => {
    expect(() => setCookie(response, 'key', 'value', { prefix: 'host', secure: false })).toThrow(
      'secure option must be true when using host prefix',
    );
  });

  it('should throw an error if the domain option is set when using host prefix', () => {
    expect(() => setCookie(response, 'key', 'value', { prefix: 'host', domain: 'example.com' })).toThrow(
      'domain option must not be set when using host prefix',
    );
  });

  it('should throw an error if the path option is not set to / when using host prefix', () => {
    expect(() => setCookie(response, 'key', 'value', { prefix: 'host', path: '/login' })).toThrow(
      'path option must be set to / when using host prefix',
    );
  });
});
