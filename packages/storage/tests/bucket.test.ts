import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { createBucket, deleteBucket, getBucket, getBuckets, setupStorage, updateBucket } from '../src/index';
import * as services from '../src/services/api/index';

jest.mock('../src/services/api/index');

const mockedServices = services as jest.Mocked<typeof services>;

describe('Storage Module - Bucket operations', () => {
  const mockToken = 'mock-token';
  const debug = false;
  const env = 'production' as const;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.AZION_TOKEN = 'mock-token';
    delete process.env.AZION_DEBUG;
  });

  afterEach(() => {
    delete process.env.AZION_TOKEN;
  });

  describe('createBucket', () => {
    it('should successfully create a bucket', async () => {
      const mockResponse = {
        state: 'executed' as const,
        data: { name: 'test-bucket', workloads_access: 'read_write' },
      };
      mockedServices.postBucket.mockResolvedValue(mockResponse);

      const result = await createBucket({
        name: 'test-bucket',
        workloads_access: 'read_write',
        options: { debug, env },
      });

      expect(result.data).toEqual(expect.objectContaining({ name: 'test-bucket', workloads_access: 'read_write' }));
      expect(mockedServices.postBucket).toHaveBeenCalledWith(mockToken, 'test-bucket', 'read_write', debug, env);
    });

    it('should return error on failure', async () => {
      mockedServices.postBucket.mockResolvedValue({
        error: { message: 'token invalid', operation: 'create bucket' },
      });

      const result = await createBucket({
        name: 'test-bucket',
        workloads_access: 'read_write',
        options: { debug, env },
      });

      expect(result).toEqual({ error: { message: 'token invalid', operation: 'create bucket' } });
    });
  });

  describe('deleteBucket', () => {
    it('should successfully delete a bucket', async () => {
      const mockResponse = { state: 'executed' as const };
      mockedServices.deleteBucket.mockResolvedValue(mockResponse);

      const result = await deleteBucket({ name: 'test-bucket', options: { debug, env } });

      expect(result.data).toEqual(undefined);
      expect(mockedServices.deleteBucket).toHaveBeenCalledWith(mockToken, 'test-bucket', debug, env);
    });

    it('should return error on failure', async () => {
      mockedServices.deleteBucket.mockResolvedValue({
        error: { message: 'token invalid', operation: 'delete bucket' },
      });

      const result = await deleteBucket({ name: 'test-bucket', options: { debug, env } });

      expect(result.error).toEqual({ message: 'token invalid', operation: 'delete bucket' });
    });
  });

  describe('getBuckets', () => {
    it('should successfully get buckets', async () => {
      const mockResponse = {
        results: [
          { name: 'bucket1', workloads_access: 'read_write' },
          { name: 'bucket2', workloads_access: 'read_write' },
        ],
      };
      mockedServices.getBuckets.mockResolvedValue(mockResponse);

      const result = await getBuckets({ params: { page: 1, page_size: 10 }, options: { debug, env } });

      expect(result.data?.buckets).toHaveLength(2);
      expect(result.data?.buckets[0]).toHaveProperty('name', 'bucket1');
      expect(mockedServices.getBuckets).toHaveBeenCalledWith(mockToken, { page: 1, page_size: 10 }, debug, env);
    });

    it('should return error on failure', async () => {
      mockedServices.getBuckets.mockResolvedValue({
        error: { message: 'token invalid', operation: 'get buckets' },
      });

      const result = await getBuckets({ params: { page: 1, page_size: 10 }, options: { debug, env } });

      expect(result.error).toEqual({ message: 'token invalid', operation: 'get buckets' });
    });
  });

  describe('getBucket', () => {
    it('should successfully get a bucket by name', async () => {
      const mockResponse = { data: { name: 'test-bucket', workloads_access: 'read_write' } };
      mockedServices.getBucketByName.mockResolvedValue(mockResponse);

      const result = await getBucket({ name: 'test-bucket', options: { debug, env } });

      expect(result.data).toEqual(expect.objectContaining({ name: 'test-bucket', workloads_access: 'read_write' }));
      expect(mockedServices.getBucketByName).toHaveBeenCalledWith(mockToken, 'test-bucket', undefined, debug, env);
    });

    it('should return error if bucket is not found', async () => {
      const mockResponse = { error: { message: 'The specified bucket does not exist.', operation: 'get bucket' } };
      mockedServices.getBucketByName.mockResolvedValue(mockResponse);

      const result = await getBucket({ name: 'non-existent-bucket', options: { debug, env } });

      expect(result.error).toEqual({ message: 'The specified bucket does not exist.', operation: 'get bucket' });
    });
  });

  describe('updateBucket', () => {
    it('should successfully update a bucket', async () => {
      const mockResponse = { data: { name: 'test-bucket', workloads_access: 'restricted' } };
      mockedServices.patchBucket.mockResolvedValue(mockResponse);

      const result = await updateBucket({
        name: 'test-bucket',
        workloads_access: 'restricted',
        options: { debug, env },
      });

      expect(result.data).toEqual(expect.objectContaining({ name: 'test-bucket', workloads_access: 'restricted' }));
      expect(mockedServices.patchBucket).toHaveBeenCalledWith(mockToken, 'test-bucket', 'restricted', debug, env);
    });

    it('should return error on failure', async () => {
      mockedServices.patchBucket.mockResolvedValue({
        error: { message: 'token invalid', operation: 'update bucket' },
      });

      const result = await updateBucket({
        name: 'test-bucket',
        workloads_access: 'restricted',
        options: { debug, env },
      });

      expect(result.error).toEqual({ message: 'token invalid', operation: 'update bucket' });
    });
  });

  describe('setupStorage', () => {
    it('should return existing bucket if it already exists', async () => {
      const mockBucketResponse = { data: { name: 'test-bucket', workloads_access: 'read_write' } };
      mockedServices.getBucketByName.mockResolvedValue(mockBucketResponse);

      const result = await setupStorage({
        name: 'test-bucket',
        workloads_access: 'read_write',
        options: { debug, env },
      });
      expect(result.data).toEqual(expect.objectContaining({ name: 'test-bucket', workloads_access: 'read_write' }));
      expect(mockedServices.getBucketByName).toHaveBeenCalledWith(mockToken, 'test-bucket', undefined, debug, env);
      expect(mockedServices.postBucket).not.toHaveBeenCalled();
    });

    it('should create bucket if it does not exist', async () => {
      mockedServices.getBucketByName.mockResolvedValue({
        error: { message: 'Bucket not found', operation: 'get bucket' },
      });
      const mockCreateResponse = { data: { name: 'test-bucket', workloads_access: 'read_write' } };
      mockedServices.postBucket.mockResolvedValue(mockCreateResponse);

      const result = await setupStorage({
        name: 'test-bucket',
        workloads_access: 'read_write',
        options: { debug, env },
      });
      expect(result.data).toEqual(expect.objectContaining({ name: 'test-bucket', workloads_access: 'read_write' }));
      expect(mockedServices.getBucketByName).toHaveBeenCalledWith(mockToken, 'test-bucket', undefined, debug, env);
      expect(mockedServices.postBucket).toHaveBeenCalledWith(mockToken, 'test-bucket', 'read_write', debug, env);
    });

    it('should return error if both get and create fail', async () => {
      mockedServices.getBucketByName.mockResolvedValue({
        error: { message: 'Bucket not found', operation: 'get bucket' },
      });
      mockedServices.postBucket.mockResolvedValue({
        error: { message: 'Creation failed', operation: 'create bucket' },
      });

      const result = await setupStorage({
        name: 'test-bucket',
        workloads_access: 'read_write',
        options: { debug, env },
      });
      expect(result.error).toEqual({ message: 'Creation failed', operation: 'setup storage' });
    });
  });
});
