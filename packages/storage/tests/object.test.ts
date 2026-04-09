import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { createObject, deleteObject, getObjectByKey, getObjects, updateObject } from '../src/index';
import * as services from '../src/services/api/index';

jest.mock('../src/services/api/index');

const mockedServices = services as jest.Mocked<typeof services>;

describe('Storage Module - Object operations', () => {
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

  describe('createObject', () => {
    it('should successfully create an object', async () => {
      const mockResponse = { data: { object_key: 'test-object' }, state: 'executed' as const };
      mockedServices.postObject.mockResolvedValue(mockResponse);

      const result = await createObject({
        bucket: 'test-bucket',
        key: 'test-object',
        content: 'file-content',
        options: { debug, env },
      });

      expect(result.data).toEqual({ key: 'test-object', state: 'executed' });
      expect(mockedServices.postObject).toHaveBeenCalledWith(
        mockToken,
        'test-bucket',
        'test-object',
        'file-content',
        'application/octet-stream',
        debug,
        env,
      );
    });

    it('should return error on failure', async () => {
      mockedServices.postObject.mockResolvedValue({
        error: { message: 'token invalid', operation: 'create object' },
      });

      const result = await createObject({
        bucket: 'test-bucket',
        key: 'test-object',
        content: 'file-content',
        options: { debug, env },
      });

      expect(result).toEqual({ error: { message: 'token invalid', operation: 'create object' } });
    });
  });

  describe('deleteObject', () => {
    it('should successfully delete an object', async () => {
      const mockResponse = { data: { object_key: 'test-object' }, state: 'executed' as const };
      mockedServices.deleteObject.mockResolvedValue(mockResponse);

      const result = await deleteObject({ bucket: 'test-bucket', key: 'test-object', options: { debug, env } });

      expect(result.data).toEqual({ key: 'test-object', state: 'executed' });
      expect(mockedServices.deleteObject).toHaveBeenCalledWith(mockToken, 'test-bucket', 'test-object', debug, env);
    });

    it('should return error on failure', async () => {
      mockedServices.deleteObject.mockResolvedValue({
        error: { message: 'token invalid', operation: 'delete object' },
      });

      const result = await deleteObject({ bucket: 'test-bucket', key: 'test-object', options: { debug, env } });

      expect(result).toEqual({ error: { message: 'token invalid', operation: 'delete object' } });
    });
  });

  describe('getObjectByKey', () => {
    it('should successfully get an object by key', async () => {
      const mockResponse = { data: 'file-content' };
      mockedServices.getObjectByKey.mockResolvedValue(mockResponse);

      const result = await getObjectByKey({ bucket: 'test-bucket', key: 'test-object', options: { debug, env } });

      expect(result.data).toEqual({ key: 'test-object', content: 'file-content' });
      expect(mockedServices.getObjectByKey).toHaveBeenCalledWith(mockToken, 'test-bucket', 'test-object', debug, env);
    });

    it('should return error on failure', async () => {
      mockedServices.getObjectByKey.mockResolvedValue({
        error: { message: 'token invalid', operation: 'get object by key' },
      });

      const result = await getObjectByKey({ bucket: 'test-bucket', key: 'test-object', options: { debug, env } });
      expect(result.error).toEqual({ message: 'token invalid', operation: 'get object by key' });
    });
  });

  describe('getObjects', () => {
    it('should successfully get objects from a bucket', async () => {
      const mockResponse = {
        results: [
          { key: 'object1', size: 100, last_modified: '2023-01-01' },
          { key: 'object2', size: 200, last_modified: '2023-01-02' },
        ],
      };
      mockedServices.getObjects.mockResolvedValue(mockResponse);

      const result = await getObjects({
        bucket: 'test-bucket',
        params: { max_object_count: 50 },
        options: { debug, env },
      });
      expect(result.data?.objects).toHaveLength(2);
      expect(result.data?.objects![0]).toEqual(expect.objectContaining({ key: 'object1' }));
      expect(mockedServices.getObjects).toHaveBeenCalledWith(
        mockToken,
        'test-bucket',
        { max_object_count: 50 },
        debug,
        env,
      );
    });

    it('should return error on failure', async () => {
      mockedServices.getObjects.mockResolvedValue({
        error: { message: 'token invalid', operation: 'get objects' },
      });

      const result = await getObjects({
        bucket: 'test-bucket',
        params: { max_object_count: 50 },
        options: { debug, env },
      });
      expect(result.error).toEqual({ message: 'token invalid', operation: 'get objects' });
    });
  });

  describe('updateObject', () => {
    it('should successfully update an object', async () => {
      const mockResponse = { data: { object_key: 'test-object' }, state: 'executed' as const };
      mockedServices.putObject.mockResolvedValue(mockResponse);

      const result = await updateObject({
        bucket: 'test-bucket',
        key: 'test-object',
        content: 'updated-content',
        options: { debug, env },
      });
      expect(result.data).toEqual({ key: 'test-object', content: 'updated-content', state: 'executed' });
      expect(mockedServices.putObject).toHaveBeenCalledWith(
        mockToken,
        'test-bucket',
        'test-object',
        'updated-content',
        'application/octet-stream',
        debug,
        env,
      );
    });

    it('should return error on failure', async () => {
      mockedServices.putObject.mockResolvedValue({
        error: { message: 'invalid token', operation: 'update object' },
      });

      const result = await updateObject({
        bucket: 'test-bucket',
        key: 'test-object',
        content: 'updated-content',
        options: { debug, env },
      });
      expect(result).toEqual({ error: { message: 'invalid token', operation: 'update object' } });
    });
  });
});
