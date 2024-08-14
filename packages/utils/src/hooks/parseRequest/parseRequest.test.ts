import { FetchEvent } from 'azion/types';
import parseRequest from './parseRequest';

describe('parseRequest', () => {
  let mockFetchEvent: FetchEvent;

  beforeEach(() => {
    mockFetchEvent = {
      request: new Request('https://example.com/path?query=value', {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'X-Forwarded-For': '192.168.1.1',
          Cookie: 'session=123; user=john',
        },
      }),
    } as FetchEvent;
  });

  it('should parse a GET request correctly', async () => {
    const result = await parseRequest(mockFetchEvent);

    expect(result).toMatchObject({
      method: 'GET',
      url: {
        full: 'https://example.com/path?query=value',
        protocol: 'https:',
        hostname: 'example.com',
        path: '/path',
        query: { query: 'value' },
      },
      headers: expect.any(Object),
      cookies: { session: '123', user: 'john' },
      body: null,
      client: {
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      },
    });
  });

  it('should handle POST requests with body', async () => {
    mockFetchEvent.request = new Request('https://example.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'value' }),
    });

    const result = await parseRequest(mockFetchEvent);

    expect(result.method).toBe('POST');
    expect(result.body).toBe('{"key":"value"}');
    expect(result.contentType).toBe('application/json');
  });

  it('should handle requests without cookies', async () => {
    mockFetchEvent.request = new Request('https://example.com');

    const result = await parseRequest(mockFetchEvent);

    expect(result.cookies).toEqual({});
  });

  it('should handle requests with authorization header', async () => {
    mockFetchEvent.request = new Request('https://example.com', {
      headers: { Authorization: 'Bearer token' },
    });

    const result = await parseRequest(mockFetchEvent);

    expect(result.authorization).toBe('Present');
  });

  it('should handle requests without optional headers', async () => {
    mockFetchEvent.request = new Request('https://example.com');

    const result = await parseRequest(mockFetchEvent);

    expect(result.referer).toBe('Unknown');
    expect(result.origin).toBe('Unknown');
    expect(result.cacheControl).toBe('Unknown');
    expect(result.pragma).toBe('Unknown');
    expect(result.contentType).toBe('Unknown');
    expect(result.contentLength).toBe('Unknown');
    expect(result.acceptLanguage).toBe('Unknown');
    expect(result.acceptEncoding).toBe('Unknown');
    expect(result.priority).toBe('Unknown');
    expect(result.host).toBe('Unknown');
  });

  it('should handle error when reading body', async () => {
    mockFetchEvent.request = new Request('https://example.com', {
      method: 'POST',
      body: 'test',
    });

    // Mock the clone method to throw an error
    mockFetchEvent.request.clone = jest.fn().mockImplementation(() => {
      throw new Error('Clone failed');
    });

    const result = await parseRequest(mockFetchEvent);

    expect(result.body).toBe('Unable to read body');
  });
});
