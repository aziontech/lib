import {
  createClient,
  createDatabase,
  deleteDatabase,
  getDatabaseById,
  getDatabases,
  useExecute,
  useQuery,
} from '../src/index';
import * as services from '../src/services';
import { SQLInternalClient } from '../src/types';

jest.mock('../src/services');

describe('SQL Module', () => {
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
      expect(client).toHaveProperty('createDatabase');
      expect(client).toHaveProperty('deleteDatabase');
      expect(client).toHaveProperty('getDatabaseById');
      expect(client).toHaveProperty('getDatabases');
    });

    it('should create a client with custom configuration', () => {
      const client = createClient({ token: 'custom-token', debug: false });
      expect(client).toHaveProperty('createDatabase');
      expect(client).toHaveProperty('deleteDatabase');
      expect(client).toHaveProperty('getDatabaseById');
      expect(client).toHaveProperty('getDatabases');
    });
  });

  describe('createDatabase', () => {
    it('should successfully create a database', async () => {
      const mockResponse = { data: { id: 1, name: 'test-db' } };
      (services.postEdgeDatabase as jest.Mock).mockResolvedValue(mockResponse);

      const result = await createDatabase('test-db', mockDebug);
      expect(result).toEqual(expect.objectContaining({ id: 1, name: 'test-db' }));
      expect(services.postEdgeDatabase).toHaveBeenCalledWith(mockToken, 'test-db', mockDebug);
    });

    it('should return null on failure', async () => {
      (services.postEdgeDatabase as jest.Mock).mockResolvedValue(null);

      const result = await createDatabase('test-db', mockDebug);
      expect(result).toBeNull();
    });
  });

  describe('deleteDatabase', () => {
    it('should successfully delete a database', async () => {
      const mockResponse = { data: { message: 'Database deleted' }, state: 'success' };
      (services.deleteEdgeDatabase as jest.Mock).mockResolvedValue(mockResponse);

      const result = await deleteDatabase(1, mockDebug);
      expect(result).toEqual({ id: 1, data: { message: 'Database deleted' }, state: 'success' });
      expect(services.deleteEdgeDatabase).toHaveBeenCalledWith(mockToken, 1, mockDebug);
    });

    it('should return null on failure', async () => {
      (services.deleteEdgeDatabase as jest.Mock).mockResolvedValue(null);

      const result = await deleteDatabase(1, mockDebug);
      expect(result).toBeNull();
    });
  });

  describe('getDatabaseById', () => {
    it('should successfully retrieve a database', async () => {
      const mockResponse = { data: { id: 1, name: 'test-db' } };
      (services.getEdgeDatabaseById as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getDatabaseById(1, mockDebug);
      expect(result).toEqual(expect.objectContaining({ id: 1, name: 'test-db' }));
      expect(services.getEdgeDatabaseById).toHaveBeenCalledWith(mockToken, 1, mockDebug);
    });

    it('should return null if database not found', async () => {
      (services.getEdgeDatabaseById as jest.Mock).mockResolvedValue(null);

      const result = await getDatabaseById(1, mockDebug);
      expect(result).toBeNull();
    });
  });

  describe('getDatabases', () => {
    it('should successfully retrieve databases', async () => {
      const mockResponse = {
        results: [
          { id: 1, name: 'test-db-1' },
          { id: 2, name: 'test-db-2' },
        ],
      };
      (services.getEdgeDatabases as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getDatabases({ page: 1, page_size: 10 }, mockDebug);
      expect(result).toHaveLength(2);
      expect(result![0]).toEqual(expect.objectContaining({ id: 1, name: 'test-db-1' }));
      expect(services.getEdgeDatabases).toHaveBeenCalledWith(mockToken, { page: 1, page_size: 10 }, mockDebug);
    });

    it('should return null if retrieval fails', async () => {
      (services.getEdgeDatabases as jest.Mock).mockResolvedValue(null);

      const result = await getDatabases({ page: 1, page_size: 10 }, mockDebug);
      expect(result).toBeNull();
    });
  });

  describe('useExecute and useQuery', () => {
    it('should successfully execute a query', async () => {
      const mockResponse = {
        state: 'success',
        data: [{ results: { columns: ['id', 'name'], rows: [[1, 'test']] } }],
      };
      (services.postQueryEdgeDatabase as jest.Mock).mockResolvedValue(mockResponse);

      const result = await useExecute(1, ['SELECT * FROM test'], mockDebug);
      expect(result).toEqual({
        state: 'success',
        columns: ['id', 'name'],
        rows: [[1, 'test']],
      });
      expect(services.postQueryEdgeDatabase).toHaveBeenCalledWith(mockToken, 1, ['SELECT * FROM test'], mockDebug);
    });

    it('should return null if query execution fails', async () => {
      (services.postQueryEdgeDatabase as jest.Mock).mockResolvedValue(null);

      const result = await useQuery(1, ['SELECT * FROM test'], mockDebug);
      expect(result).toBeNull();
    });
  });

  describe('Client methods', () => {
    let client: SQLInternalClient;

    beforeEach(() => {
      client = createClient({ token: 'custom-token', debug: false });
    });

    it('should call createDatabase method', async () => {
      const mockResponse = { data: { id: 1, name: 'test-db' } };
      (services.postEdgeDatabase as jest.Mock).mockResolvedValue(mockResponse);

      await client.createDatabase('test-db');
      expect(services.postEdgeDatabase).toHaveBeenCalledWith('custom-token', 'test-db', false);
    });

    it('should call deleteDatabase method', async () => {
      const mockResponse = { data: { message: 'Database deleted' }, state: 'success' };
      (services.deleteEdgeDatabase as jest.Mock).mockResolvedValue(mockResponse);

      await client.deleteDatabase(1);
      expect(services.deleteEdgeDatabase).toHaveBeenCalledWith('custom-token', 1, false);
    });

    it('should call getDatabaseById method', async () => {
      const mockResponse = { data: { id: 1, name: 'test-db' } };
      (services.getEdgeDatabaseById as jest.Mock).mockResolvedValue(mockResponse);

      await client.getDatabaseById(1);
      expect(services.getEdgeDatabaseById).toHaveBeenCalledWith('custom-token', 1, false);
    });

    it('should call getDatabases method', async () => {
      const mockResponse = {
        results: [
          { id: 1, name: 'test-db-1' },
          { id: 2, name: 'test-db-2' },
        ],
      };
      (services.getEdgeDatabases as jest.Mock).mockResolvedValue(mockResponse);

      await client.getDatabases({ page: 1, page_size: 10 });
      expect(services.getEdgeDatabases).toHaveBeenCalledWith('custom-token', { page: 1, page_size: 10 }, false);
    });
  });
});
