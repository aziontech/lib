import { createClient, purgeCacheKey, purgeURL, purgeWildCard } from '../src/index';
import { AzionPurgeClient } from '../src/types';

import * as services from '../src/services';

jest.mock('../src/services');

describe('Purge Module', () => {
  const mockToken = 'mock-token';
  const mockDebug = true;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.AZION_TOKEN = mockToken;
    process.env.AZION_DEBUG = 'true';
  });

  describe('createClient', () => {
    it('should create a client with default configuration', () => {
      const client = createClient();
      expect(client).toHaveProperty('purgeURL');
      expect(client).toHaveProperty('purgeCacheKey');
      expect(client).toHaveProperty('purgeWildCard');
    });

    it('should create a client with custom configuration', () => {
      const client = createClient({ token: 'custom-token', debug: false });
      expect(client).toHaveProperty('purgeURL');
      expect(client).toHaveProperty('purgeCacheKey');
      expect(client).toHaveProperty('purgeWildCard');
    });
  });

  describe('purgeURL', () => {
    it('should successfully purge a URL', async () => {
      const mockResponse = { state: 'executed', data: { items: ['http://example.com'] } };
      (services.postPurgeURL as jest.Mock).mockResolvedValue(mockResponse);

      const result = await purgeURL(['http://example.com'], mockDebug);
      expect(result).toEqual({ state: 'executed', items: ['http://example.com'] });
      expect(services.postPurgeURL).toHaveBeenCalledWith(mockToken, ['http://example.com'], mockDebug);
    });

    it('should return null on failure', async () => {
      (services.postPurgeURL as jest.Mock).mockResolvedValue(null);

      const result = await purgeURL(['http://example.com'], mockDebug);
      expect(result).toBeNull();
    });
  });

  describe('purgeCacheKey', () => {
    it('should successfully purge a cache key', async () => {
      const mockResponse = { state: 'executed', data: { items: ['cache-key-1'] } };
      (services.postPurgeCacheKey as jest.Mock).mockResolvedValue(mockResponse);

      const result = await purgeCacheKey(['cache-key-1'], mockDebug);
      expect(result).toEqual({ state: 'executed', items: ['cache-key-1'] });
      expect(services.postPurgeCacheKey).toHaveBeenCalledWith(mockToken, ['cache-key-1'], mockDebug);
    });

    it('should return null on failure', async () => {
      (services.postPurgeCacheKey as jest.Mock).mockResolvedValue(null);

      const result = await purgeCacheKey(['cache-key-1'], mockDebug);
      expect(result).toBeNull();
    });
  });

  describe('purgeWildCard', () => {
    it('should successfully purge using a wildcard', async () => {
      const mockResponse = { state: 'executed', data: { items: ['http://example.com/*'] } };
      (services.postPurgeWildcard as jest.Mock).mockResolvedValue(mockResponse);

      const result = await purgeWildCard(['http://example.com/*'], mockDebug);
      expect(result).toEqual({ state: 'executed', items: ['http://example.com/*'] });
      expect(services.postPurgeWildcard).toHaveBeenCalledWith(mockToken, ['http://example.com/*'], mockDebug);
    });

    it('should return null on failure', async () => {
      (services.postPurgeWildcard as jest.Mock).mockResolvedValue(null);

      const result = await purgeWildCard(['http://example.com/*'], mockDebug);
      expect(result).toBeNull();
    });
  });

  describe('Client methods', () => {
    let client: AzionPurgeClient;

    beforeEach(() => {
      client = createClient({ token: 'custom-token', debug: false });
    });

    it('should call purgeURL method', async () => {
      const mockResponse = { state: 'executed', data: { items: ['http://example.com'] } };
      (services.postPurgeURL as jest.Mock).mockResolvedValue(mockResponse);

      await client.purgeURL(['http://example.com']);
      expect(services.postPurgeURL).toHaveBeenCalledWith('custom-token', ['http://example.com'], false);
    });

    it('should call purgeCacheKey method', async () => {
      const mockResponse = { state: 'executed', data: { items: ['cache-key-1'] } };
      (services.postPurgeCacheKey as jest.Mock).mockResolvedValue(mockResponse);

      await client.purgeCacheKey(['cache-key-1']);
      expect(services.postPurgeCacheKey).toHaveBeenCalledWith('custom-token', ['cache-key-1'], false);
    });

    it('should call purgeWildCard method', async () => {
      const mockResponse = { state: 'executed', data: { items: ['http://example.com/*'] } };
      (services.postPurgeWildcard as jest.Mock).mockResolvedValue(mockResponse);

      await client.purgeWildCard(['http://example.com/*']);
      expect(services.postPurgeWildcard).toHaveBeenCalledWith('custom-token', ['http://example.com/*'], false);
    });
  });
});
