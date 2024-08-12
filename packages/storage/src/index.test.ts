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
import * as services from '../src/services';
import { StorageClient } from '../src/types';

jest.mock('../src/services');

describe('Storage Module', () => {
  const mockToken = 'mock-token';
  const mockDebug = true;

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
      const client = createClient({ token: 'custom-token', debug: false });
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

      const result = await createBucket('test-bucket', 'public', mockDebug);
      expect(result).toEqual(expect.objectContaining({ name: 'test-bucket', edge_access: 'public' }));
      expect(services.postBucket).toHaveBeenCalledWith(mockToken, 'test-bucket', 'public', mockDebug);
    });

    it('should return null on failure', async () => {
      (services.postBucket as jest.Mock).mockResolvedValue(null);

      const result = await createBucket('test-bucket', 'public', mockDebug);
      expect(result).toBeNull();
    });
  });

  describe('deleteBucket', () => {
    it('should successfully delete a bucket', async () => {
      const mockResponse = { data: { name: 'test-bucket' }, state: 'success' };
      (services.deleteBucket as jest.Mock).mockResolvedValue(mockResponse);

      const result = await deleteBucket('test-bucket', mockDebug);
      expect(result).toEqual({ name: 'test-bucket', state: 'success' });
      expect(services.deleteBucket).toHaveBeenCalledWith(mockToken, 'test-bucket', mockDebug);
    });

    it('should return null on failure', async () => {
      (services.deleteBucket as jest.Mock).mockResolvedValue(null);

      const result = await deleteBucket('test-bucket', mockDebug);
      expect(result).toBeNull();
    });
  });

  describe('getBuckets', () => {
    it('should successfully get buckets', async () => {
      const mockResponse = { results: [{ name: 'bucket1' }, { name: 'bucket2' }] };
      (services.getBuckets as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getBuckets({ page: 1, page_size: 10 }, mockDebug);
      expect(result).toHaveLength(2);
      expect(result![0]).toHaveProperty('name', 'bucket1');
      expect(services.getBuckets).toHaveBeenCalledWith(mockToken, { page: 1, page_size: 10 }, mockDebug);
    });

    it('should return null on failure', async () => {
      (services.getBuckets as jest.Mock).mockResolvedValue(null);

      const result = await getBuckets({ page: 1, page_size: 10 }, mockDebug);
      expect(result).toBeNull();
    });
  });

  describe('getBucket', () => {
    it('should successfully get a bucket by name', async () => {
      const mockResponse = { results: [{ name: 'test-bucket', edge_access: 'public' }] };
      (services.getBuckets as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getBucket('test-bucket', mockDebug);
      expect(result).toEqual(expect.objectContaining({ name: 'test-bucket', edge_access: 'public' }));
      expect(services.getBuckets).toHaveBeenCalledWith(mockToken, { page_size: 100000 }, mockDebug);
    });

    it('should return null if bucket is not found', async () => {
      const mockResponse = { results: [] };
      (services.getBuckets as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getBucket('non-existent-bucket', mockDebug);
      expect(result).toBeNull();
    });
  });

  describe('updateBucket', () => {
    it('should successfully update a bucket', async () => {
      const mockResponse = { data: { name: 'test-bucket', edge_access: 'private' } };
      (services.patchBucket as jest.Mock).mockResolvedValue(mockResponse);

      const result = await updateBucket('test-bucket', 'private', mockDebug);
      expect(result).toEqual(expect.objectContaining({ name: 'test-bucket', edge_access: 'private' }));
      expect(services.patchBucket).toHaveBeenCalledWith(mockToken, 'test-bucket', 'private', mockDebug);
    });

    it('should return null on failure', async () => {
      (services.patchBucket as jest.Mock).mockResolvedValue(null);

      const result = await updateBucket('test-bucket', 'private', mockDebug);
      expect(result).toBeNull();
    });
  });

  describe('createObject', () => {
    it('should successfully create an object', async () => {
      const mockResponse = { data: { object_key: 'test-object' }, state: 'success' };
      (services.postObject as jest.Mock).mockResolvedValue(mockResponse);

      const result = await createObject('test-bucket', 'test-object', 'file-content', mockDebug);
      expect(result).toEqual({ key: 'test-object', content: 'file-content', state: 'success' });
      expect(services.postObject).toHaveBeenCalledWith(
        mockToken,
        'test-bucket',
        'test-object',
        'file-content',
        mockDebug,
      );
    });

    it('should return null on failure', async () => {
      (services.postObject as jest.Mock).mockResolvedValue(null);

      const result = await createObject('test-bucket', 'test-object', 'file-content', mockDebug);
      expect(result).toBeNull();
    });
  });

  describe('deleteObject', () => {
    it('should successfully delete an object', async () => {
      const mockResponse = { state: 'success' };
      (services.deleteObject as jest.Mock).mockResolvedValue(mockResponse);

      const result = await deleteObject('test-bucket', 'test-object', mockDebug);
      expect(result).toEqual({ key: 'test-object', state: 'success' });
      expect(services.deleteObject).toHaveBeenCalledWith(mockToken, 'test-bucket', 'test-object', mockDebug);
    });

    it('should return null on failure', async () => {
      (services.deleteObject as jest.Mock).mockResolvedValue(null);

      const result = await deleteObject('test-bucket', 'test-object', mockDebug);
      expect(result).toBeNull();
    });
  });

  describe('getObjectByKey', () => {
    it('should successfully get an object by key', async () => {
      const mockResponse = 'file-content';
      (services.getObjectByKey as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getObjectByKey('test-bucket', 'test-object', mockDebug);
      expect(result).toEqual({ key: 'test-object', content: 'file-content' });
      expect(services.getObjectByKey).toHaveBeenCalledWith(mockToken, 'test-bucket', 'test-object', mockDebug);
    });

    it('should return null on failure', async () => {
      (services.getObjectByKey as jest.Mock).mockResolvedValue(null);

      const result = await getObjectByKey('test-bucket', 'test-object', mockDebug);
      expect(result).toBeNull();
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

      const result = await getObjects('test-bucket', mockDebug);
      expect(result).toHaveLength(2);
      expect(result![0]).toEqual(expect.objectContaining({ key: 'object1' }));
      expect(services.getObjects).toHaveBeenCalledWith(mockToken, 'test-bucket', mockDebug);
    });

    it('should return null on failure', async () => {
      (services.getObjects as jest.Mock).mockResolvedValue(null);

      const result = await getObjects('test-bucket', mockDebug);
      expect(result).toBeNull();
    });
  });

  describe('updateObject', () => {
    it('should successfully update an object', async () => {
      const mockResponse = { data: { object_key: 'test-object' }, state: 'success' };
      (services.putObject as jest.Mock).mockResolvedValue(mockResponse);

      const result = await updateObject('test-bucket', 'test-object', 'updated-content', mockDebug);
      expect(result).toEqual({ key: 'test-object', content: 'updated-content', state: 'success' });
      expect(services.putObject).toHaveBeenCalledWith(
        mockToken,
        'test-bucket',
        'test-object',
        'updated-content',
        mockDebug,
      );
    });

    it('should return null on failure', async () => {
      (services.putObject as jest.Mock).mockResolvedValue(null);

      const result = await updateObject('test-bucket', 'test-object', 'updated-content', mockDebug);
      expect(result).toBeNull();
    });
  });

  describe('Client methods', () => {
    let client: StorageClient;

    beforeEach(() => {
      delete process.env.AZION_TOKEN;
      client = createClient({ token: 'custom-token', debug: false });
    });

    it('should call getBuckets method', async () => {
      const mockResponse = { results: [{ name: 'bucket1' }, { name: 'bucket2' }] };
      (services.getBuckets as jest.Mock).mockResolvedValue(mockResponse);

      await client.getBuckets({ page: 1, page_size: 10 });
      expect(services.getBuckets).toHaveBeenCalledWith('custom-token', { page: 1, page_size: 10 }, false);
    });

    it('should call createBucket method', async () => {
      const mockResponse = { data: { name: 'test-bucket', edge_access: 'public' } };
      (services.postBucket as jest.Mock).mockResolvedValue(mockResponse);

      await client.createBucket('test-bucket', 'public');
      expect(services.postBucket).toHaveBeenCalledWith('custom-token', 'test-bucket', 'public', false);
    });

    it('should call updateBucket method', async () => {
      const mockResponse = { data: { name: 'test-bucket', edge_access: 'private' } };
      (services.patchBucket as jest.Mock).mockResolvedValue(mockResponse);

      await client.updateBucket('test-bucket', 'private');
      expect(services.patchBucket).toHaveBeenCalledWith('custom-token', 'test-bucket', 'private', false);
    });

    it('should call deleteBucket method', async () => {
      const mockResponse = { data: { name: 'test-bucket' }, state: 'success' };
      (services.deleteBucket as jest.Mock).mockResolvedValue(mockResponse);

      await client.deleteBucket('test-bucket');
      expect(services.deleteBucket).toHaveBeenCalledWith('custom-token', 'test-bucket', false);
    });

    it('should call getBucket method', async () => {
      const mockResponse = { results: [{ name: 'test-bucket', edge_access: 'public' }] };
      (services.getBuckets as jest.Mock).mockResolvedValue(mockResponse);

      await client.getBucket('test-bucket');
      expect(services.getBuckets).toHaveBeenCalledWith('custom-token', { page_size: 100000 }, false);
    });
  });
});
