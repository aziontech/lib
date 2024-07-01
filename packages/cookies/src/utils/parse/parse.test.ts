import { parseCookie } from './';

describe('parse', () => {
  it('should parse cookies with no values', () => {
    expect(parseCookie('one_cookie=; two_cookie = ; three_cookie= ; four_cookie=""')).toEqual({
      one_cookie: '',
      two_cookie: '',
      three_cookie: '',
      four_cookie: '',
    });
  });

  it('should parse cookies with value', () => {
    expect(parseCookie('key=value')).toEqual({ key: 'value' });
  });

  it('should parse cookies with multiples values', () => {
    expect(parseCookie('key=value; key2=value2')).toEqual({ key: 'value', key2: 'value2' });
  });

  it('should parse quoted cookie values', () => {
    expect(parseCookie('one_cookie="one"; two_cookie = " two " ; three_cookie="%20three%20";')).toEqual({
      one_cookie: 'one',
      two_cookie: ' two ',
      three_cookie: ' three ',
    });
  });

  it('should parse cookies with the __Secure- prefix', () => {
    expect(parseCookie('__Secure-key=value')).toEqual({ '__Secure-key': 'value' });
  });

  it('should parse cookies with the __Host- prefix', () => {
    expect(parseCookie('__Host-key=value')).toEqual({ '__Host-key': 'value' });
  });

  it('should return the value of the key', () => {
    expect(parseCookie('key=value', 'key')).toBe('value');
  });
});
