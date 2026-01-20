import { KVClient, createClient } from '../src/client';
import { APIKVProvider } from '../src/providers/api';
import { NativeKVProvider } from '../src/providers/native';

jest.mock('../src/providers/native');
jest.mock('../src/providers/api');

describe('KVClient', () => {
  const mockNativeProvider = {
    get: jest.fn(),
    getWithMetadata: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  };

  const mockAPIProvider = {
    get: jest.fn(),
    getWithMetadata: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.AZION_KV_NAMESPACE;

    // Mock NativeKVProvider.create static method
    (NativeKVProvider.create as jest.Mock) = jest
      .fn()
      .mockResolvedValue(Object.assign(Object.create(NativeKVProvider.prototype), mockNativeProvider));

    // Mock APIKVProvider constructor
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (APIKVProvider as jest.MockedClass<typeof APIKVProvider>).mockImplementation(function (this: any) {
      Object.setPrototypeOf(this, APIKVProvider.prototype);
      return Object.assign(this, mockAPIProvider);
    });
  });

  describe('constructor and createProvider', () => {
    it('should create client with default options', async () => {
      (NativeKVProvider.isAvailable as jest.Mock).mockReturnValue(false);
      process.env.AZION_KV_NAMESPACE = 'test-ns';

      const client = await createClient().connect();

      expect(client).toBeInstanceOf(KVClient);
      expect(APIKVProvider).toHaveBeenCalledWith({
        apiToken: undefined,
        namespace: 'test-ns',
        environment: undefined,
      });
    });

    it('should use native provider when available and provider is auto', async () => {
      (NativeKVProvider.isAvailable as jest.Mock).mockReturnValue(true);
      (NativeKVProvider.create as jest.Mock).mockResolvedValue(
        Object.assign(Object.create(NativeKVProvider.prototype), mockNativeProvider),
      );

      const client = await createClient({ namespace: 'test-ns' }).connect();

      expect(NativeKVProvider.create).toHaveBeenCalledWith('test-ns');
      expect(client.getProviderType()).toBe('native');
    });

    it('should use API provider when native is not available', async () => {
      (NativeKVProvider.isAvailable as jest.Mock).mockReturnValue(false);

      const client = await createClient({
        namespace: 'test-ns',
        apiToken: 'token-123',
        environment: 'production',
      }).connect();

      expect(APIKVProvider).toHaveBeenCalledWith({
        apiToken: 'token-123',
        namespace: 'test-ns',
        environment: 'production',
      });
      expect(client.getProviderType()).toBe('api');
    });

    it('should force native provider when specified', async () => {
      (NativeKVProvider.isAvailable as jest.Mock).mockReturnValue(true);
      (NativeKVProvider.create as jest.Mock).mockResolvedValue(
        Object.assign(Object.create(NativeKVProvider.prototype), mockNativeProvider),
      );

      const client = await createClient({
        provider: 'native',
        namespace: 'test-ns',
      }).connect();

      expect(NativeKVProvider.create).toHaveBeenCalledWith('test-ns');
      expect(client.getProviderType()).toBe('native');
    });

    it('should force API provider when specified', async () => {
      (NativeKVProvider.isAvailable as jest.Mock).mockReturnValue(true);

      const client = await createClient({
        provider: 'api',
        namespace: 'test-ns',
        apiToken: 'token-123',
      }).connect();

      expect(APIKVProvider).toHaveBeenCalledWith({
        apiToken: 'token-123',
        namespace: 'test-ns',
        environment: undefined,
      });
      expect(client.getProviderType()).toBe('api');
    });

    it('should use namespace from environment variable if not provided', async () => {
      process.env.AZION_KV_NAMESPACE = 'env-namespace';
      (NativeKVProvider.isAvailable as jest.Mock).mockReturnValue(true);
      (NativeKVProvider.create as jest.Mock).mockResolvedValue(mockNativeProvider);

      await createClient().connect();

      expect(NativeKVProvider.create).toHaveBeenCalledWith('env-namespace');
    });

    it('should prefer options namespace over environment variable', async () => {
      process.env.AZION_KV_NAMESPACE = 'env-namespace';
      (NativeKVProvider.isAvailable as jest.Mock).mockReturnValue(true);
      (NativeKVProvider.create as jest.Mock).mockResolvedValue(mockNativeProvider);

      await createClient({ namespace: 'options-namespace' }).connect();

      expect(NativeKVProvider.create).toHaveBeenCalledWith('options-namespace');
    });

    it('should throw error when namespace undefined', async () => {
      await expect(createClient().connect()).rejects.toThrow('namespace is required');
    });
  });

  describe('get', () => {
    it('should delegate get to provider', async () => {
      (NativeKVProvider.isAvailable as jest.Mock).mockReturnValue(false);
      mockAPIProvider.get.mockResolvedValue('test-value');

      const client = await createClient({ namespace: 'test' }).connect();
      const result = await client.get('test-key');

      expect(mockAPIProvider.get).toHaveBeenCalledWith('test-key', undefined);
      expect(result).toBe('test-value');
    });

    it('should delegate get with options to provider', async () => {
      (NativeKVProvider.isAvailable as jest.Mock).mockReturnValue(false);
      mockAPIProvider.get.mockResolvedValue({ data: 'test' });

      const client = await createClient({ namespace: 'test' }).connect();
      const result = await client.get('test-key', { type: 'json', cacheTtl: 3600 });

      expect(mockAPIProvider.get).toHaveBeenCalledWith('test-key', {
        type: 'json',
        cacheTtl: 3600,
      });
      expect(result).toEqual({ data: 'test' });
    });

    it('should return null when key does not exist', async () => {
      (NativeKVProvider.isAvailable as jest.Mock).mockReturnValue(false);
      mockAPIProvider.get.mockResolvedValue(null);

      const client = await createClient({ namespace: 'test' }).connect();
      const result = await client.get('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('getWithMetadata', () => {
    it('should delegate getWithMetadata to provider', async () => {
      (NativeKVProvider.isAvailable as jest.Mock).mockReturnValue(false);
      const mockResult = {
        value: 'test-value',
        metadata: { userId: '123' },
      };
      mockAPIProvider.getWithMetadata.mockResolvedValue(mockResult);

      const client = await createClient({ namespace: 'test' }).connect();
      const result = await client.getWithMetadata('test-key');

      expect(mockAPIProvider.getWithMetadata).toHaveBeenCalledWith('test-key', undefined);
      expect(result).toEqual(mockResult);
    });

    it('should delegate getWithMetadata with options to provider', async () => {
      (NativeKVProvider.isAvailable as jest.Mock).mockReturnValue(false);
      const mockResult = {
        value: { data: 'test' },
        metadata: { version: 1 },
      };
      mockAPIProvider.getWithMetadata.mockResolvedValue(mockResult);

      const client = await createClient({ namespace: 'test' }).connect();
      const result = await client.getWithMetadata('test-key', {
        type: 'json',
        cacheTtl: 7200,
      });

      expect(mockAPIProvider.getWithMetadata).toHaveBeenCalledWith('test-key', {
        type: 'json',
        cacheTtl: 7200,
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('set', () => {
    it('should delegate set to provider', async () => {
      (NativeKVProvider.isAvailable as jest.Mock).mockReturnValue(false);
      mockAPIProvider.set.mockResolvedValue(undefined);

      const client = await createClient({ namespace: 'test' }).connect();
      await client.set('test-key', 'test-value');

      expect(mockAPIProvider.set).toHaveBeenCalledWith('test-key', 'test-value', undefined);
    });

    it('should delegate set with options to provider', async () => {
      (NativeKVProvider.isAvailable as jest.Mock).mockReturnValue(false);
      mockAPIProvider.set.mockResolvedValue(undefined);

      const client = await createClient({ namespace: 'test' }).connect();
      await client.set('test-key', 'test-value', {
        expirationTtl: 3600,
        metadata: { userId: '123' },
      });

      expect(mockAPIProvider.set).toHaveBeenCalledWith('test-key', 'test-value', {
        expirationTtl: 3600,
        metadata: { userId: '123' },
      });
    });

    it('should set ArrayBuffer value', async () => {
      (NativeKVProvider.isAvailable as jest.Mock).mockReturnValue(false);
      mockAPIProvider.set.mockResolvedValue(undefined);
      const buffer = new ArrayBuffer(8);

      const client = await createClient({ namespace: 'test' }).connect();
      await client.set('test-key', buffer);

      expect(mockAPIProvider.set).toHaveBeenCalledWith('test-key', buffer, undefined);
    });

    it('should set with expiration timestamp', async () => {
      (NativeKVProvider.isAvailable as jest.Mock).mockReturnValue(false);
      mockAPIProvider.set.mockResolvedValue(undefined);

      const client = await createClient({ namespace: 'test' }).connect();
      await client.set('test-key', 'test-value', {
        expiration: {
          type: 'EX',
          value: 1234567890,
        },
      });

      expect(mockAPIProvider.set).toHaveBeenCalledWith('test-key', 'test-value', {
        expiration: {
          type: 'EX',
          value: 1234567890,
        },
      });
    });
  });

  describe('delete', () => {
    it('should delegate delete to provider', async () => {
      (NativeKVProvider.isAvailable as jest.Mock).mockReturnValue(false);
      mockAPIProvider.delete.mockResolvedValue(undefined);

      const client = await createClient({ namespace: 'test' }).connect();
      await client.delete('test-key');

      expect(mockAPIProvider.delete).toHaveBeenCalledWith('test-key');
    });

    it('should handle deleting non-existent key', async () => {
      (NativeKVProvider.isAvailable as jest.Mock).mockReturnValue(false);
      mockAPIProvider.delete.mockResolvedValue(undefined);

      const client = await createClient({ namespace: 'test' }).connect();
      await expect(client.delete('non-existent')).resolves.not.toThrow();
    });
  });

  describe('hSet and HSET', () => {
    beforeEach(() => {
      (NativeKVProvider.isAvailable as jest.Mock).mockReturnValue(false);
    });

    it('should create new hash with single field', async () => {
      mockAPIProvider.get.mockResolvedValue(null);
      mockAPIProvider.set.mockResolvedValue(undefined);

      const client = await createClient({ namespace: 'test' }).connect();
      await client.hSet('user:123', 'name', 'John Doe');
      await client.HSET('user:123', 'email', 'john@example.com');

      expect(mockAPIProvider.get).toHaveBeenCalledWith('user:123');
      expect(mockAPIProvider.set).toHaveBeenCalledWith('user:123', JSON.stringify({ name: 'John Doe' }));
      expect(mockAPIProvider.set).toHaveBeenCalledWith('user:123', JSON.stringify({ name: 'John Doe' }));
    });

    it('should add field to existing hash', async () => {
      mockAPIProvider.get.mockResolvedValue(JSON.stringify({ name: 'John Doe' }));
      mockAPIProvider.set.mockResolvedValue(undefined);

      const client = await createClient({ namespace: 'test' }).connect();
      await client.hSet('user:123', 'email', 'john@example.com');
      await client.HSET('user:123', 'email2', 'john@example.com');

      expect(mockAPIProvider.get).toHaveBeenCalledWith('user:123');
      expect(mockAPIProvider.set).toHaveBeenCalledWith(
        'user:123',
        JSON.stringify({ name: 'John Doe', email: 'john@example.com' }),
      );
      expect(mockAPIProvider.set).toHaveBeenCalledWith(
        'user:123',
        JSON.stringify({ name: 'John Doe', email2: 'john@example.com' }),
      );
    });

    it('should update existing field in hash', async () => {
      mockAPIProvider.get.mockResolvedValueOnce(JSON.stringify({ name: 'John Doe', email: 'old@example.com' }));
      mockAPIProvider.get.mockResolvedValueOnce(JSON.stringify({ name: 'John Doe', email: 'new@example.com' }));
      mockAPIProvider.set.mockResolvedValue(undefined);

      const client = await createClient({ namespace: 'test' }).connect();
      await client.hSet('user:123', 'email', 'new@example.com');
      await client.HSET('user:123', 'email2', 'new2@example.com');

      expect(mockAPIProvider.set).toHaveBeenCalledWith(
        'user:123',
        JSON.stringify({ name: 'John Doe', email: 'new@example.com' }),
      );
      expect(mockAPIProvider.set).toHaveBeenCalledWith(
        'user:123',
        JSON.stringify({ name: 'John Doe', email: 'new@example.com', email2: 'new2@example.com' }),
      );
    });

    it('should handle invalid JSON in existing value', async () => {
      mockAPIProvider.get.mockResolvedValue('invalid-json');
      mockAPIProvider.set.mockResolvedValue(undefined);

      const client = await createClient({ namespace: 'test' }).connect();
      await client.hSet('user:123', 'name', 'John Doe');
      await client.HSET('user:123', 'name2', 'John Doe2');

      expect(mockAPIProvider.set).toHaveBeenCalledWith('user:123', JSON.stringify({ name: 'John Doe' }));
      expect(mockAPIProvider.set).toHaveBeenCalledWith('user:123', JSON.stringify({ name2: 'John Doe2' }));
    });

    it('should handle multiple sequential hSet calls', async () => {
      const client = await createClient({ namespace: 'test' }).connect();

      // First hSet: get returns null
      mockAPIProvider.get.mockResolvedValueOnce(null);
      // Second HSET: get returns result from first hSet
      mockAPIProvider.get.mockResolvedValueOnce(JSON.stringify({ name: 'John Doe' }));
      // Third hSet: get returns result from first two calls
      mockAPIProvider.get.mockResolvedValueOnce(JSON.stringify({ name: 'John Doe', name2: 'John Doe2' }));
      // Fourth HSET: get returns result from first three calls
      mockAPIProvider.get.mockResolvedValueOnce(
        JSON.stringify({ name: 'John Doe', name2: 'John Doe2', email: 'john@example.com' }),
      );
      // Fifth hSet: get returns result from first four calls
      mockAPIProvider.get.mockResolvedValueOnce(
        JSON.stringify({
          name: 'John Doe',
          name2: 'John Doe2',
          email: 'john@example.com',
          email2: 'john@example.com2',
        }),
      );
      // Sixth HSET: get returns result from first five calls
      mockAPIProvider.get.mockResolvedValueOnce(
        JSON.stringify({
          name: 'John Doe',
          name2: 'John Doe2',
          email: 'john@example.com',
          email2: 'john@example.com2',
          age: '30',
        }),
      );

      mockAPIProvider.set.mockResolvedValue(undefined);

      await client.hSet('user:123', 'name', 'John Doe');
      await client.HSET('user:123', 'name2', 'John Doe2');
      await client.hSet('user:123', 'email', 'john@example.com');
      await client.HSET('user:123', 'email2', 'john@example.com2');
      await client.hSet('user:123', 'age', '30');
      await client.HSET('user:123', 'age2', '302');

      expect(mockAPIProvider.set).toHaveBeenNthCalledWith(
        3,
        'user:123',
        JSON.stringify({ name: 'John Doe', name2: 'John Doe2', email: 'john@example.com' }),
      );
      expect(mockAPIProvider.set).toHaveBeenNthCalledWith(
        6,
        'user:123',
        JSON.stringify({
          name: 'John Doe',
          name2: 'John Doe2',
          email: 'john@example.com',
          email2: 'john@example.com2',
          age: '30',
          age2: '302',
        }),
      );
    });

    it('should handle different value types', async () => {
      mockAPIProvider.get.mockResolvedValue(null);
      mockAPIProvider.set.mockResolvedValue(undefined);

      const client = await createClient({ namespace: 'test' }).connect();
      await client.hSet('data:123', 'buffer', new ArrayBuffer(8));

      const callArgs = mockAPIProvider.set.mock.calls[0];
      const savedValue = JSON.parse(callArgs[1]);
      expect(savedValue).toHaveProperty('buffer');
    });
  });

  describe('hGetAll and HGETALL', () => {
    beforeEach(() => {
      (NativeKVProvider.isAvailable as jest.Mock).mockReturnValue(false);
    });

    it('should return all fields from hash using hGetAll', async () => {
      const hashData = {
        name: 'John Doe',
        email: 'john@example.com',
        age: '30',
      };
      mockAPIProvider.get.mockResolvedValue(JSON.stringify(hashData));

      const client = await createClient({ namespace: 'test' }).connect();
      const result = await client.hGetAll('user:123');

      expect(mockAPIProvider.get).toHaveBeenCalledWith('user:123');
      expect(result).toEqual(hashData);
    });

    it('should return all fields from hash using HGETALL', async () => {
      const hashData = {
        name: 'John Doe',
        email: 'john@example.com',
        age: '30',
      };
      mockAPIProvider.get.mockResolvedValue(JSON.stringify(hashData));

      const client = await createClient({ namespace: 'test' }).connect();
      const result = await client.HGETALL('user:123');

      expect(mockAPIProvider.get).toHaveBeenCalledWith('user:123');
      expect(result).toEqual(hashData);
    });

    it('should return null when key does not exist', async () => {
      mockAPIProvider.get.mockResolvedValue(null);

      const client = await createClient({ namespace: 'test' }).connect();
      const result = await client.hGetAll('non-existent');

      expect(result).toBeNull();
    });

    it('should return null when value is not valid JSON', async () => {
      mockAPIProvider.get.mockResolvedValue('invalid-json');

      const client = await createClient({ namespace: 'test' }).connect();
      const result = await client.hGetAll('user:123');

      expect(result).toBeNull();
    });

    it('should return empty hash', async () => {
      mockAPIProvider.get.mockResolvedValue(JSON.stringify({}));

      const client = await createClient({ namespace: 'test' }).connect();
      const result = await client.hGetAll('user:123');

      expect(result).toEqual({});
    });

    it('should handle complex nested values', async () => {
      const hashData = {
        user: JSON.stringify({ name: 'John', age: 30 }),
        metadata: JSON.stringify({ created: 1234567890 }),
        tags: JSON.stringify(['tag1', 'tag2']),
      };
      mockAPIProvider.get.mockResolvedValue(JSON.stringify(hashData));

      const client = await createClient({ namespace: 'test' }).connect();
      const result = await client.hGetAll('data:123');

      expect(result).toEqual(hashData);
    });
  });

  describe('hVals and HVALS', () => {
    beforeEach(() => {
      (NativeKVProvider.isAvailable as jest.Mock).mockReturnValue(false);
    });

    it('should return all values from hash using hVals', async () => {
      const hashData = {
        name: 'John Doe',
        email: 'john@example.com',
        age: '30',
      };
      mockAPIProvider.get.mockResolvedValue(JSON.stringify(hashData));

      const client = await createClient({ namespace: 'test' }).connect();
      const result = await client.hVals('user:123');

      expect(mockAPIProvider.get).toHaveBeenCalledWith('user:123');
      expect(result).toEqual(['John Doe', 'john@example.com', '30']);
    });

    it('should return all values from hash using HVALS', async () => {
      const hashData = {
        name: 'John Doe',
        email: 'john@example.com',
        age: '30',
      };
      mockAPIProvider.get.mockResolvedValue(JSON.stringify(hashData));

      const client = await createClient({ namespace: 'test' }).connect();
      const result = await client.HVALS('user:123');

      expect(mockAPIProvider.get).toHaveBeenCalledWith('user:123');
      expect(result).toEqual(['John Doe', 'john@example.com', '30']);
    });

    it('should return null when key does not exist', async () => {
      mockAPIProvider.get.mockResolvedValue(null);

      const client = await createClient({ namespace: 'test' }).connect();
      const result = await client.hVals('non-existent');

      expect(result).toBeNull();
    });

    it('should return null when value is not valid JSON', async () => {
      mockAPIProvider.get.mockResolvedValue('invalid-json');

      const client = await createClient({ namespace: 'test' }).connect();
      const result = await client.hVals('user:123');

      expect(result).toBeNull();
    });

    it('should return empty array for empty hash', async () => {
      mockAPIProvider.get.mockResolvedValue(JSON.stringify({}));

      const client = await createClient({ namespace: 'test' }).connect();
      const result = await client.hVals('user:123');

      expect(result).toEqual([]);
    });

    it('should handle single value', async () => {
      const hashData = {
        name: 'John Doe',
      };
      mockAPIProvider.get.mockResolvedValue(JSON.stringify(hashData));

      const client = await createClient({ namespace: 'test' }).connect();
      const result = await client.hVals('user:123');

      expect(result).toEqual(['John Doe']);
    });

    it('should preserve value types', async () => {
      mockAPIProvider.get.mockReset();
      const hashData = {
        name: 'John Doe',
        age: 30,
        active: true,
        metadata: { created: 1234567890 },
      };
      mockAPIProvider.get.mockResolvedValue(JSON.stringify(hashData));

      const client = await createClient({ namespace: 'test' }).connect();
      const result = await client.hVals('user:123');

      expect(result).toEqual(['John Doe', 30, true, { created: 1234567890 }]);
    });
  });

  describe('getProviderType', () => {
    it('should return native when using NativeKVProvider', async () => {
      (NativeKVProvider.isAvailable as jest.Mock).mockReturnValue(true);
      (NativeKVProvider.create as jest.Mock).mockResolvedValue(
        Object.assign(Object.create(NativeKVProvider.prototype), mockNativeProvider),
      );

      const client = await createClient({ namespace: 'test' }).connect();

      expect(client.getProviderType()).toBe('native');
    });

    it('should return api when using APIKVProvider', async () => {
      (NativeKVProvider.isAvailable as jest.Mock).mockReturnValue(false);

      const client = await createClient({ namespace: 'test' }).connect();

      expect(client.getProviderType()).toBe('api');
    });
  });

  describe('disconnect and quit', () => {
    it('should disconnect successfully', async () => {
      (NativeKVProvider.isAvailable as jest.Mock).mockReturnValue(false);

      const client = await createClient({ namespace: 'test' }).connect();
      await expect(client.disconnect()).resolves.toBeUndefined();
    });

    it('should quit successfully', async () => {
      (NativeKVProvider.isAvailable as jest.Mock).mockReturnValue(false);

      const client = await createClient({ namespace: 'test' }).connect();
      await expect(client.quit()).resolves.toBeUndefined();
    });

    it('quit should call disconnect', async () => {
      (NativeKVProvider.isAvailable as jest.Mock).mockReturnValue(false);

      const client = await createClient({ namespace: 'test' }).connect();
      const disconnectSpy = jest.spyOn(client, 'disconnect');

      await client.quit();

      expect(disconnectSpy).toHaveBeenCalled();
    });
  });

  describe('createClient factory function', () => {
    it('should create client instance', async () => {
      (NativeKVProvider.isAvailable as jest.Mock).mockReturnValue(false);

      const client = await createClient({ namespace: 'test-ns' }).connect();

      expect(client).toBeInstanceOf(KVClient);
    });

    it('should create client with options', async () => {
      (NativeKVProvider.isAvailable as jest.Mock).mockReturnValue(false);

      const client = await createClient({
        namespace: 'test-ns',
        apiToken: 'token-123',
        environment: 'production',
      }).connect();

      expect(client).toBeInstanceOf(KVClient);
      expect(APIKVProvider).toHaveBeenCalledWith({
        apiToken: 'token-123',
        namespace: 'test-ns',
        environment: 'production',
      });
    });
  });

  describe('integration scenarios', () => {
    it('should work with native provider in edge runtime', async () => {
      (NativeKVProvider.isAvailable as jest.Mock).mockReturnValue(true);
      (NativeKVProvider.create as jest.Mock).mockResolvedValue(mockNativeProvider);
      mockNativeProvider.get.mockResolvedValue('edge-value');

      const client = await createClient({ namespace: 'edge-ns' }).connect();
      const result = await client.get('edge-key');

      expect(NativeKVProvider.create).toHaveBeenCalledWith('edge-ns');
      expect(mockNativeProvider.get).toHaveBeenCalledWith('edge-key', undefined);
      expect(result).toBe('edge-value');
    });

    it('should fallback to API provider when native is unavailable', async () => {
      (NativeKVProvider.isAvailable as jest.Mock).mockReturnValue(false);
      mockAPIProvider.get.mockReset();
      mockAPIProvider.get.mockResolvedValue('api-value');

      const client = await createClient({
        namespace: 'api-ns',
        apiToken: 'token-123',
      }).connect();
      const result = await client.get('api-key');

      expect(APIKVProvider).toHaveBeenCalledWith({
        apiToken: 'token-123',
        namespace: 'api-ns',
        environment: undefined,
      });
      expect(mockAPIProvider.get).toHaveBeenCalledWith('api-key', undefined);
      expect(result).toBe('api-value');
    });

    it('should handle complete CRUD operations', async () => {
      (NativeKVProvider.isAvailable as jest.Mock).mockReturnValue(false);
      mockAPIProvider.set.mockReset();
      mockAPIProvider.get.mockReset();
      mockAPIProvider.delete.mockReset();

      mockAPIProvider.set.mockResolvedValue(undefined);
      mockAPIProvider.get.mockResolvedValue('stored-value');
      mockAPIProvider.delete.mockResolvedValue(undefined);

      const client = await createClient({ namespace: 'test' }).connect();

      await client.set('key1', 'stored-value');
      expect(mockAPIProvider.set).toHaveBeenCalledWith('key1', 'stored-value', undefined);

      const value = await client.get('key1');
      expect(value).toBe('stored-value');

      await client.delete('key1');
      expect(mockAPIProvider.delete).toHaveBeenCalledWith('key1');
    });
  });
});
