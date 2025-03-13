import { FetchEvent, Metadata } from 'azion/types';
import parseRequest from './parseRequest';

describe('parseRequest', () => {
  let mockFetchEvent: FetchEvent;
  let mockMetadata: Metadata;

  beforeEach(() => {
    mockMetadata = {
      geoip_asn: '12345',
      geoip_city: 'Sao Paulo',
      geoip_city_continent_code: 'SA',
      geoip_city_country_code: 'BR',
      geoip_city_country_name: 'Brazil',
      geoip_continent_code: 'SA',
      geoip_country_code: 'BR',
      geoip_country_name: 'Brazil',
      geoip_region: 'SP',
      geoip_region_name: 'Sao Paulo',
      remote_addr: '192.168.1.1',
      remote_port: '12345',
      remote_user: '',
      server_protocol: 'HTTP/1.1',
      ssl_cipher: 'TLS_AES_256_GCM_SHA384',
      ssl_protocol: 'TLSv1.3',
    };

    mockFetchEvent = {
      request: Object.assign(
        new Request('https://example.com/path?query=value', {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0',
            'X-Forwarded-For': '192.168.1.1',
            Cookie: 'session=123; user=john',
          },
        }),
        { metadata: mockMetadata },
      ),
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
      metadata: mockMetadata,
    });
  });

  it('should handle POST requests with body', async () => {
    mockFetchEvent.request = Object.assign(
      new Request('https://example.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'value' }),
      }),
      { metadata: mockMetadata },
    );

    const result = await parseRequest(mockFetchEvent);

    expect(result.method).toBe('POST');
    expect(result.body).toBe('{"key":"value"}');
    expect(result.contentType).toBe('application/json');
  });

  it('should handle requests without cookies', async () => {
    mockFetchEvent.request = Object.assign(new Request('https://example.com'), { metadata: mockMetadata });

    const result = await parseRequest(mockFetchEvent);

    expect(result.cookies).toEqual({});
  });

  it('should handle requests with authorization header', async () => {
    mockFetchEvent.request = Object.assign(
      new Request('https://example.com', {
        headers: { Authorization: 'Bearer token' },
      }),
      { metadata: mockMetadata },
    );

    const result = await parseRequest(mockFetchEvent);

    expect(result.authorization).toBe('Present');
  });

  it('should handle requests without optional headers', async () => {
    mockFetchEvent.request = Object.assign(new Request('https://example.com'), { metadata: mockMetadata });

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
    mockFetchEvent.request = Object.assign(
      new Request('https://example.com', {
        method: 'POST',
        body: 'test',
      }),
      { metadata: mockMetadata },
    );

    // Mock the clone method to throw an error
    mockFetchEvent.request.clone = jest.fn().mockImplementation(() => {
      throw new Error('Clone failed');
    });

    const result = await parseRequest(mockFetchEvent);

    expect(result.body).toBe('Unable to read body');
  });

  it('should include metadata in the parsed request', async () => {
    const result = await parseRequest(mockFetchEvent);

    expect(result.metadata).toEqual(mockMetadata);
  });

  it('should correctly parse geoip information from metadata', async () => {
    const result = await parseRequest(mockFetchEvent);

    expect(result.metadata.geoip_city).toBe('Sao Paulo');
    expect(result.metadata.geoip_country_name).toBe('Brazil');
    expect(result.metadata.geoip_continent_code).toBe('SA');
  });

  it('should correctly parse connection information from metadata', async () => {
    const result = await parseRequest(mockFetchEvent);

    expect(result.metadata.remote_addr).toBe('192.168.1.1');
    expect(result.metadata.remote_port).toBe('12345');
    expect(result.metadata.server_protocol).toBe('HTTP/1.1');
  });

  it('should correctly parse SSL information from metadata', async () => {
    const result = await parseRequest(mockFetchEvent);

    expect(result.metadata.ssl_cipher).toBe('TLS_AES_256_GCM_SHA384');
    expect(result.metadata.ssl_protocol).toBe('TLSv1.3');
  });
});
