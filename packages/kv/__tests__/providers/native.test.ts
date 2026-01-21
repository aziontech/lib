import { KVError } from '../../src/errors';
import { NativeKVProvider } from '../../src/providers/native';
import type { AzionKVNamespace } from '../../src/providers/types';

describe('NativeKVProvider', () => {
  let mockKVNamespace: Omit<AzionKVNamespace, 'open'>;
  let mockAzionKV: AzionKVNamespace;

  beforeEach(() => {
    mockKVNamespace = {
      get: jest.fn(),
      getWithMetadata: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    };

    mockAzionKV = {
      open: jest.fn().mockResolvedValue(mockKVNamespace),
      get: jest.fn(),
      getWithMetadata: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).Azion = {
      KV: mockAzionKV,
    };
  });

  afterEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (globalThis as any).Azion;
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create provider with namespace', async () => {
      const provider = await NativeKVProvider.create('test-namespace');

      expect(mockAzionKV.open).toHaveBeenCalledWith('test-namespace');
      expect(provider).toBeInstanceOf(NativeKVProvider);
    });

    it('should throw error when Azion.KV is not available', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (globalThis as any).Azion;

      await expect(NativeKVProvider.create('test-namespace')).rejects.toThrow(KVError);
      await expect(NativeKVProvider.create('test-namespace')).rejects.toThrow(
        'Azion.KV is not available in globalThis',
      );
    });
  });

  describe('isAvailable', () => {
    it('should return true when Azion.KV is available', () => {
      expect(NativeKVProvider.isAvailable()).toBe(true);
    });

    it('should return false when Azion is not defined', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (globalThis as any).Azion;

      expect(NativeKVProvider.isAvailable()).toBe(false);
    });

    it('should return false when Azion.KV is not defined', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (globalThis as any).Azion = {};

      expect(NativeKVProvider.isAvailable()).toBe(false);
    });
  });

  describe('get', () => {
    let provider: NativeKVProvider;

    beforeEach(async () => {
      provider = await NativeKVProvider.create('test-namespace');
    });

    it('should get value with default text type', async () => {
      const mockValue = 'test-value';
      (mockKVNamespace.get as jest.Mock).mockResolvedValue(mockValue);

      const result = await provider.get('test-key');

      expect(mockKVNamespace.get).toHaveBeenCalledWith('test-key', 'text', {
        cacheTtl: undefined,
      });
      expect(result).toBe(mockValue);
    });

    it('should get value with specified type', async () => {
      const mockValue = { data: 'test' };
      (mockKVNamespace.get as jest.Mock).mockResolvedValue(mockValue);

      const result = await provider.get('test-key', { type: 'json' });

      expect(mockKVNamespace.get).toHaveBeenCalledWith('test-key', 'json', {
        cacheTtl: undefined,
      });
      expect(result).toEqual(mockValue);
    });

    it('should get value with cacheTtl option', async () => {
      const mockValue = 'test-value';
      (mockKVNamespace.get as jest.Mock).mockResolvedValue(mockValue);

      const result = await provider.get('test-key', { cacheTtl: 3600 });

      expect(mockKVNamespace.get).toHaveBeenCalledWith('test-key', 'text', {
        cacheTtl: 3600,
      });
      expect(result).toBe(mockValue);
    });

    it('should return null when key does not exist', async () => {
      (mockKVNamespace.get as jest.Mock).mockResolvedValue(null);

      const result = await provider.get('non-existent-key');

      expect(result).toBeNull();
    });

    it('should get ArrayBuffer type', async () => {
      const mockBuffer = new ArrayBuffer(8);
      (mockKVNamespace.get as jest.Mock).mockResolvedValue(mockBuffer);

      const result = await provider.get('test-key', { type: 'arrayBuffer' });

      expect(mockKVNamespace.get).toHaveBeenCalledWith('test-key', 'arrayBuffer', {
        cacheTtl: undefined,
      });
      expect(result).toBe(mockBuffer);
    });
  });

  describe('getWithMetadata', () => {
    let provider: NativeKVProvider;

    beforeEach(async () => {
      provider = await NativeKVProvider.create('test-namespace');
    });

    it('should get value with metadata', async () => {
      const mockResponse = {
        value: 'test-value',
        metadata: { userId: '123', created: 1234567890 },
      };
      (mockKVNamespace.getWithMetadata as jest.Mock).mockResolvedValue(mockResponse);

      const result = await provider.getWithMetadata('test-key');

      expect(mockKVNamespace.getWithMetadata).toHaveBeenCalledWith('test-key', 'text', {
        cacheTtl: undefined,
      });
      expect(result).toEqual({
        value: 'test-value',
        metadata: { userId: '123', created: 1234567890 },
      });
    });

    it('should get value with metadata and custom type', async () => {
      const mockResponse = {
        value: { data: 'test' },
        metadata: { version: 1 },
      };
      (mockKVNamespace.getWithMetadata as jest.Mock).mockResolvedValue(mockResponse);

      const result = await provider.getWithMetadata('test-key', { type: 'json' });

      expect(mockKVNamespace.getWithMetadata).toHaveBeenCalledWith('test-key', 'json', {
        cacheTtl: undefined,
      });
      expect(result).toEqual({
        value: { data: 'test' },
        metadata: { version: 1 },
      });
    });

    it('should handle null metadata', async () => {
      const mockResponse = {
        value: 'test-value',
        metadata: null,
      };
      (mockKVNamespace.getWithMetadata as jest.Mock).mockResolvedValue(mockResponse);

      const result = await provider.getWithMetadata('test-key');

      expect(result).toEqual({
        value: 'test-value',
        metadata: undefined,
      });
    });

    it('should get with cacheTtl option', async () => {
      const mockResponse = {
        value: 'test-value',
        metadata: { test: true },
      };
      (mockKVNamespace.getWithMetadata as jest.Mock).mockResolvedValue(mockResponse);

      await provider.getWithMetadata('test-key', { cacheTtl: 7200 });

      expect(mockKVNamespace.getWithMetadata).toHaveBeenCalledWith('test-key', 'text', {
        cacheTtl: 7200,
      });
    });
  });

  describe('set', () => {
    let provider: NativeKVProvider;

    beforeEach(async () => {
      provider = await NativeKVProvider.create('test-namespace');
    });

    it('should set string value', async () => {
      (mockKVNamespace.put as jest.Mock).mockResolvedValue(undefined);

      await provider.set('test-key', 'test-value');

      expect(mockKVNamespace.put).toHaveBeenCalledWith('test-key', 'test-value', {
        expiration: undefined,
        expirationTtl: undefined,
        metadata: undefined,
      });
    });

    it('should set value with expiration EX (seconds from now)', async () => {
      (mockKVNamespace.put as jest.Mock).mockResolvedValue(undefined);

      await provider.set('test-key', 'test-value', {
        expiration: {
          type: 'EX',
          value: 3600,
        },
      });

      expect(mockKVNamespace.put).toHaveBeenCalledWith('test-key', 'test-value', {
        expiration: undefined,
        expirationTtl: 3600,
        metadata: undefined,
      });
    });

    it('should set value with expiration PX (milliseconds from now)', async () => {
      (mockKVNamespace.put as jest.Mock).mockResolvedValue(undefined);

      await provider.set('test-key', 'test-value', {
        expiration: {
          type: 'PX',
          value: 5000, // 5000ms = 5 seconds
        },
      });

      expect(mockKVNamespace.put).toHaveBeenCalledWith('test-key', 'test-value', {
        expiration: undefined,
        expirationTtl: 5, // converted to seconds
        metadata: undefined,
      });
    });

    it('should set value with expiration EXAT (Unix timestamp in seconds)', async () => {
      (mockKVNamespace.put as jest.Mock).mockResolvedValue(undefined);

      await provider.set('test-key', 'test-value', {
        expiration: {
          type: 'EXAT',
          value: 1234567890,
        },
      });

      expect(mockKVNamespace.put).toHaveBeenCalledWith('test-key', 'test-value', {
        expiration: 1234567890,
        expirationTtl: undefined,
        metadata: undefined,
      });
    });

    it('should set value with expiration PXAT (Unix timestamp in milliseconds)', async () => {
      (mockKVNamespace.put as jest.Mock).mockResolvedValue(undefined);

      await provider.set('test-key', 'test-value', {
        expiration: {
          type: 'PXAT',
          value: 1234567890000, // milliseconds
        },
      });

      expect(mockKVNamespace.put).toHaveBeenCalledWith('test-key', 'test-value', {
        expiration: 1234567890, // converted to seconds
        expirationTtl: undefined,
        metadata: undefined,
      });
    });

    it('should set value with expiration KEEPTTL (no expiration set)', async () => {
      (mockKVNamespace.put as jest.Mock).mockResolvedValue(undefined);

      await provider.set('test-key', 'test-value', {
        expiration: {
          type: 'KEEPTTL',
        },
      });

      expect(mockKVNamespace.put).toHaveBeenCalledWith('test-key', 'test-value', {
        expiration: undefined,
        expirationTtl: undefined,
        metadata: undefined,
      });
    });

    it('should set value with expirationTtl', async () => {
      (mockKVNamespace.put as jest.Mock).mockResolvedValue(undefined);

      await provider.set('test-key', 'test-value', {
        expirationTtl: 3600,
      });

      expect(mockKVNamespace.put).toHaveBeenCalledWith('test-key', 'test-value', {
        expiration: undefined,
        expirationTtl: 3600,
        metadata: undefined,
      });
    });

    it('should set value with metadata', async () => {
      (mockKVNamespace.put as jest.Mock).mockResolvedValue(undefined);

      await provider.set('test-key', 'test-value', {
        metadata: { userId: '123', version: 1 },
      });

      expect(mockKVNamespace.put).toHaveBeenCalledWith('test-key', 'test-value', {
        expiration: undefined,
        expirationTtl: undefined,
        metadata: { userId: '123', version: 1 },
      });
    });

    it('should set value with all options (expirationTtl takes precedence)', async () => {
      (mockKVNamespace.put as jest.Mock).mockResolvedValue(undefined);

      await provider.set('test-key', 'test-value', {
        expiration: {
          type: 'EX',
          value: 1800,
        },
        expirationTtl: 3600,
        metadata: { test: true },
      });

      expect(mockKVNamespace.put).toHaveBeenCalledWith('test-key', 'test-value', {
        expiration: undefined,
        expirationTtl: 3600,
        metadata: { test: true },
      });
    });

    it('should set ArrayBuffer value', async () => {
      const buffer = new ArrayBuffer(8);
      (mockKVNamespace.put as jest.Mock).mockResolvedValue(undefined);

      await provider.set('test-key', buffer);

      expect(mockKVNamespace.put).toHaveBeenCalledWith('test-key', buffer, {
        expiration: undefined,
        expirationTtl: undefined,
        metadata: undefined,
      });
    });

    it('should set ReadableStream value', async () => {
      const stream = new ReadableStream();
      (mockKVNamespace.put as jest.Mock).mockResolvedValue(undefined);

      await provider.set('test-key', stream);

      expect(mockKVNamespace.put).toHaveBeenCalledWith('test-key', stream, {
        expiration: undefined,
        expirationTtl: undefined,
        metadata: undefined,
      });
    });
  });

  describe('delete', () => {
    let provider: NativeKVProvider;

    beforeEach(async () => {
      provider = await NativeKVProvider.create('test-namespace');
    });

    it('should delete key', async () => {
      (mockKVNamespace.delete as jest.Mock).mockResolvedValue(undefined);

      await provider.delete('test-key');

      expect(mockKVNamespace.delete).toHaveBeenCalledWith('test-key');
    });

    it('should handle deleting non-existent key', async () => {
      (mockKVNamespace.delete as jest.Mock).mockResolvedValue(undefined);

      await expect(provider.delete('non-existent-key')).resolves.not.toThrow();

      expect(mockKVNamespace.delete).toHaveBeenCalledWith('non-existent-key');
    });
  });
});
