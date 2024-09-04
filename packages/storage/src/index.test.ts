import {
  createBucket,
  createClient,
  createObject,
  deleteBucket,
  deleteObject,
  getBucket,
  getBuckets,
  getObjectByKey,
  getObjects,
  updateBucket,
  updateObject,
} from '../src/index';
import * as services from './services/api/index';
import { AzionStorageClient } from './types';

jest.mock('./services/api/index');

describe('Storage Module', () => {
  const mockToken = 'mock-token';
  const debug = false;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.AZION_TOKEN = 'mock-token';
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
    });

    it('should create a client with custom configuration', () => {
      const client = createClient({ token: 'custom-token', options: { debug: false } });
      expect(client).toHaveProperty('getBuckets');
      expect(client).toHaveProperty('createBucket');
      expect(client).toHaveProperty('updateBucket');
      expect(client).toHaveProperty('deleteBucket');
      expect(client).toHaveProperty('getBucket');
    });
  });

  describe('createBucket', () => {
    it('should successfully create a bucket', async () => {
      const mockResponse = { data: { name: 'test-bucket', edge_access: 'public' } };
      (services.postBucket as jest.Mock).mockResolvedValue(mockResponse);

      const result = await createBucket({ name: 'test-bucket', edge_access: 'public', options: { debug } });
      expect(result.data).toEqual(expect.objectContaining({ name: 'test-bucket', edge_access: 'public' }));
      expect(services.postBucket).toHaveBeenCalledWith(mockToken, 'test-bucket', 'public', debug);
    });

    it('should return error on failure', async () => {
      (services.postBucket as jest.Mock).mockResolvedValue({
        error: { message: 'token invalid', operation: 'create bucket' },
      });

      const result = await createBucket({ name: 'test-bucket', edge_access: 'public', options: { debug } });
      expect(result).toEqual({ error: { message: 'token invalid', operation: 'create bucket' } });
    });
  });

  describe('deleteBucket', () => {
    it('should successfully delete a bucket', async () => {
      const mockResponse = { data: { name: 'test-bucket' }, state: 'success' };
      (services.deleteBucket as jest.Mock).mockResolvedValue(mockResponse);

      const result = await deleteBucket({ name: 'test-bucket', options: { debug } });
      expect(result.data).toEqual({ name: 'test-bucket', state: 'success' });
      expect(services.deleteBucket).toHaveBeenCalledWith(mockToken, 'test-bucket', debug);
    });

    it('should return error on failure', async () => {
      (services.deleteBucket as jest.Mock).mockResolvedValue({
        error: { message: 'token invalid', operation: 'delete bucket' },
      });

      const result = await deleteBucket({ name: 'test-bucket', options: { debug } });
      expect(result.error).toEqual({ message: 'token invalid', operation: 'delete bucket' });
    });
  });

  describe('getBuckets', () => {
    it('should successfully get buckets', async () => {
      const mockResponse = { results: [{ name: 'bucket1' }, { name: 'bucket2' }] };
      (services.getBuckets as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getBuckets({ params: { page: 1, page_size: 10 }, options: { debug } });
      expect(result.data?.buckets).toHaveLength(2);
      expect(result.data?.buckets[0]).toHaveProperty('name', 'bucket1');
      expect(services.getBuckets).toHaveBeenCalledWith(mockToken, { page: 1, page_size: 10 }, debug);
    });

    it('should return error on failure', async () => {
      (services.getBuckets as jest.Mock).mockResolvedValue({
        error: { message: 'token invalid', operation: 'get buckets' },
      });

      const result = await getBuckets({ params: { page: 1, page_size: 10 }, options: { debug } });
      expect(result.error).toEqual({ message: 'token invalid', operation: 'get buckets' });
    });
  });

  describe('getBucket', () => {
    it('should successfully get a bucket by name', async () => {
      const mockResponse = { results: [{ name: 'test-bucket', edge_access: 'public' }] };
      (services.getBuckets as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getBucket({ name: 'test-bucket', options: { debug } });
      expect(result.data).toEqual(expect.objectContaining({ name: 'test-bucket', edge_access: 'public' }));
      expect(services.getBuckets).toHaveBeenCalledWith(mockToken, { page_size: 1000000 }, debug);
    });

    it('should return error if bucket is not found', async () => {
      const mockResponse = { results: [] };
      (services.getBuckets as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getBucket({ name: 'non-existent-bucket', options: { debug } });
      expect(result.error).toEqual({ message: 'Bucket not found', operation: 'get bucket' });
    });
  });

  describe('updateBucket', () => {
    it('should successfully update a bucket', async () => {
      const mockResponse = { data: { name: 'test-bucket', edge_access: 'private' } };
      (services.patchBucket as jest.Mock).mockResolvedValue(mockResponse);

      const result = await updateBucket({ name: 'test-bucket', edge_access: 'private', options: { debug } });
      expect(result.data).toEqual(expect.objectContaining({ name: 'test-bucket', edge_access: 'private' }));
      expect(services.patchBucket).toHaveBeenCalledWith(mockToken, 'test-bucket', 'private', debug);
    });

    it('should return error on failure', async () => {
      (services.patchBucket as jest.Mock).mockResolvedValue({
        error: { message: 'token invalid', operation: 'update bucket' },
      });

      const result = await updateBucket({ name: 'test-bucket', edge_access: 'private', options: { debug } });
      expect(result.error).toEqual({ message: 'token invalid', operation: 'update bucket' });
    });
  });

  describe('createObject', () => {
    it('should successfully create an object', async () => {
      const mockResponse = { data: { object_key: 'test-object' }, state: 'success' };
      (services.postObject as jest.Mock).mockResolvedValue(mockResponse);

      const result = await createObject({
        bucket: 'test-bucket',
        key: 'test-object',
        content: 'file-content',
        options: { debug },
      });
      expect(result.data).toEqual({ key: 'test-object', content: 'file-content', state: 'success' });
      expect(services.postObject).toHaveBeenCalledWith(mockToken, 'test-bucket', 'test-object', 'file-content', debug);
    });

    it('should return error on failure', async () => {
      (services.postObject as jest.Mock).mockResolvedValue({
        error: { message: 'token invalid', operation: 'create object' },
      });

      const result = await createObject({
        bucket: 'test-bucket',
        key: 'test-object',
        content: 'file-content',
        options: { debug },
      });
      expect(result).toEqual({ error: { message: 'token invalid', operation: 'create object' } });
    });
  });

  describe('deleteObject', () => {
    it('should successfully delete an object', async () => {
      const mockResponse = { data: { state: 'success' } };
      (services.deleteObject as jest.Mock).mockResolvedValue(mockResponse);

      const result = await deleteObject({ bucket: 'test-bucket', key: 'test-object', options: { debug } });
      expect(result.data).toEqual({ key: 'test-object' });
      expect(services.deleteObject).toHaveBeenCalledWith(mockToken, 'test-bucket', 'test-object', debug);
    });

    it('should return error on failure', async () => {
      (services.deleteObject as jest.Mock).mockResolvedValue({
        error: { message: 'token invalid', operation: 'delete object' },
      });

      const result = await deleteObject({ bucket: 'test-bucket', key: 'test-object', options: { debug } });
      expect(result).toEqual({ error: { message: 'token invalid', operation: 'delete object' } });
    });
  });

  describe('getObjectByKey', () => {
    it('should successfully get an object by key', async () => {
      const mockResponse = { data: 'file-content' };
      (services.getObjectByKey as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getObjectByKey({ bucket: 'test-bucket', key: 'test-object', options: { debug } });
      expect(result.data).toEqual({ key: 'test-object', content: 'file-content' });
      expect(services.getObjectByKey).toHaveBeenCalledWith(mockToken, 'test-bucket', 'test-object', debug);
    });

    it('should return error on failure', async () => {
      (services.getObjectByKey as jest.Mock).mockResolvedValue({
        error: { message: 'token invalid', operation: 'get object by key' },
      });

      const result = await getObjectByKey({ bucket: 'test-bucket', key: 'test-object', options: { debug } });
      expect(result.error).toEqual({ message: 'token invalid', operation: 'get object by key' });
    });
  });

  describe('getObjects', () => {
    it('should successfully get objects from a bucket', async () => {
      const mockResponse = {
        results: [
          { key: 'object1', size: 100, last_modified: '2023-01-01', content_type: 'text/plain' },
          { key: 'object2', size: 200, last_modified: '2023-01-02', content_type: 'image/jpeg' },
        ],
      };
      (services.getObjects as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getObjects({ bucket: 'test-bucket', params: { max_object_count: 50 }, options: { debug } });
      expect(result.data).toHaveLength(2);
      expect(result.data![0]).toEqual(expect.objectContaining({ key: 'object1' }));
      expect(services.getObjects).toHaveBeenCalledWith(mockToken, 'test-bucket', { max_object_count: 50 }, debug);
    });

    it('should return error on failure', async () => {
      (services.getObjects as jest.Mock).mockResolvedValue({
        error: { message: 'token invalid', operation: 'get objects' },
      });

      const result = await getObjects({ bucket: 'test-bucket', params: { max_object_count: 50 }, options: { debug } });
      expect(result.error).toEqual({ message: 'token invalid', operation: 'get objects' });
    });
  });

  describe('updateObject', () => {
    it('should successfully update an object', async () => {
      const mockResponse = { data: { object_key: 'test-object' }, state: 'success' };
      (services.putObject as jest.Mock).mockResolvedValue(mockResponse);

      const result = await updateObject({
        bucket: 'test-bucket',
        key: 'test-object',
        content: 'updated-content',
        options: { debug },
      });
      expect(result.data).toEqual({ key: 'test-object', content: 'updated-content', state: 'success' });
      expect(services.putObject).toHaveBeenCalledWith(
        mockToken,
        'test-bucket',
        'test-object',
        'updated-content',
        debug,
      );
    });

    it('should return error on failure', async () => {
      (services.putObject as jest.Mock).mockResolvedValue({
        error: { message: 'invalid token', operation: 'update object' },
      });

      const result = await updateObject({
        bucket: 'test-bucket',
        key: 'test-object',
        content: 'updated-content',
        options: { debug },
      });
      expect(result).toEqual({ error: { message: 'invalid token', operation: 'update object' } });
    });
  });

  describe('Client methods', () => {
    let client: AzionStorageClient;

    beforeEach(() => {
      delete process.env.AZION_TOKEN;
      client = createClient({ token: 'custom-token', options: { debug } });
    });

    it('should call getBuckets method', async () => {
      const mockResponse = { results: [{ name: 'bucket1' }, { name: 'bucket2' }] };
      (services.getBuckets as jest.Mock).mockResolvedValue(mockResponse);

      await client.getBuckets({ params: { page: 1, page_size: 10 } });
      expect(services.getBuckets).toHaveBeenCalledWith('custom-token', { page: 1, page_size: 10 }, debug);
    });

    it('should call createBucket method', async () => {
      const mockResponse = { data: { name: 'test-bucket', edge_access: 'public' } };
      (services.postBucket as jest.Mock).mockResolvedValue(mockResponse);

      await client.createBucket({ name: 'test-bucket', edge_access: 'public' });
      expect(services.postBucket).toHaveBeenCalledWith('custom-token', 'test-bucket', 'public', debug);
    });

    it('should call updateBucket method', async () => {
      const mockResponse = { data: { name: 'test-bucket', edge_access: 'private' } };
      (services.patchBucket as jest.Mock).mockResolvedValue(mockResponse);

      await client.updateBucket({ name: 'test-bucket', edge_access: 'private' });
      expect(services.patchBucket).toHaveBeenCalledWith('custom-token', 'test-bucket', 'private', debug);
    });

    it('should call deleteBucket method', async () => {
      const mockResponse = { data: { name: 'test-bucket' }, state: 'success' };
      (services.deleteBucket as jest.Mock).mockResolvedValue(mockResponse);

      await client.deleteBucket({ name: 'test-bucket' });
      expect(services.deleteBucket).toHaveBeenCalledWith('custom-token', 'test-bucket', debug);
    });

    it('should call getBucket method', async () => {
      const mockResponse = { results: [{ name: 'test-bucket', edge_access: 'public' }] };
      (services.getBuckets as jest.Mock).mockResolvedValue(mockResponse);

      await client.getBucket({ name: 'test-bucket' });
      expect(services.getBuckets).toHaveBeenCalledWith('custom-token', { page_size: 1000000 }, debug);
    });
  });
});
