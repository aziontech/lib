import { createClient } from '../src/index';
import * as services from '../src/services/api/index';
import { AzionStorageClient } from '../src/types';

jest.mock('../src/services/api/index');

describe('Storage Package - Client', () => {
  const debug = false;
  const env = 'production' as const;

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.AZION_TOKEN;
    delete process.env.AZION_DEBUG;
  });

  afterEach(() => {
    delete process.env.AZION_TOKEN;
  });

  describe('createClient', () => {
    it('should create a client with default configuration', () => {
      const client = createClient();

      expect(client).toHaveProperty('getBuckets');
      expect(client).toHaveProperty('createBucket');
      expect(client).toHaveProperty('updateBucket');
      expect(client).toHaveProperty('deleteBucket');
      expect(client).toHaveProperty('getBucket');
      expect(client).toHaveProperty('setupStorage');
    });

    it('should create a client with custom configuration', () => {
      const client = createClient({ token: 'custom-token', options: { debug, env } });

      expect(client).toHaveProperty('getBuckets');
      expect(client).toHaveProperty('createBucket');
      expect(client).toHaveProperty('updateBucket');
      expect(client).toHaveProperty('deleteBucket');
      expect(client).toHaveProperty('getBucket');
      expect(client).toHaveProperty('setupStorage');
    });
  });

  describe('Client methods', () => {
    let client: AzionStorageClient;

    beforeEach(() => {
      delete process.env.AZION_TOKEN;
      client = createClient({ token: 'custom-token', options: { debug, env } });
    });

    it('should call getBuckets method', async () => {
      const mockResponse = { results: [{ name: 'bucket1' }, { name: 'bucket2' }] };
      (services.getBuckets as jest.Mock).mockResolvedValue(mockResponse);

      await client.getBuckets({ params: { page: 1, page_size: 10 } });

      expect(services.getBuckets).toHaveBeenCalledWith('custom-token', { page: 1, page_size: 10 }, debug, env);
    });

    it('should call createBucket method', async () => {
      const mockResponse = { data: { name: 'test-bucket', workloads_access: 'read_write' } };
      (services.postBucket as jest.Mock).mockResolvedValue(mockResponse);

      await client.createBucket({ name: 'test-bucket', workloads_access: 'read_write' });

      expect(services.postBucket).toHaveBeenCalledWith('custom-token', 'test-bucket', 'read_write', debug, env);
    });

    it('should call updateBucket method', async () => {
      const mockResponse = { data: { name: 'test-bucket', workloads_access: 'restricted' } };
      (services.patchBucket as jest.Mock).mockResolvedValue(mockResponse);

      await client.updateBucket({ name: 'test-bucket', workloads_access: 'restricted' });

      expect(services.patchBucket).toHaveBeenCalledWith('custom-token', 'test-bucket', 'restricted', debug, env);
    });

    it('should call deleteBucket method', async () => {
      const mockResponse = { data: { name: 'test-bucket' }, state: 'success' };
      (services.deleteBucket as jest.Mock).mockResolvedValue(mockResponse);

      await client.deleteBucket({ name: 'test-bucket' });

      expect(services.deleteBucket).toHaveBeenCalledWith('custom-token', 'test-bucket', debug, env);
    });

    it('should call getBucket method', async () => {
      const mockResponse = { results: [{ name: 'test-bucket', workloads_access: 'read_write' }] };
      (services.getBucketByName as jest.Mock).mockResolvedValue(mockResponse);

      await client.getBucket({ name: 'test-bucket' });

      expect(services.getBucketByName).toHaveBeenCalledWith('custom-token', 'test-bucket', undefined, debug, env);
    });

    it('should call setupStorage method', async () => {
      const mockBucketResponse = { data: { name: 'test-bucket', workloads_access: 'read_write' } };
      (services.getBucketByName as jest.Mock).mockResolvedValue(mockBucketResponse);

      await client.setupStorage({ name: 'test-bucket', workloads_access: 'read_write' });

      expect(services.getBucketByName).toHaveBeenCalledWith('custom-token', 'test-bucket', undefined, debug, env);
    });
  });
});
