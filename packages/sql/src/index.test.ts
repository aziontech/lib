import {
  createClient,
  createDatabase,
  deleteDatabase,
  getDatabase,
  getDatabases,
  useExecute,
  useQuery,
} from '../src/index';
import * as services from '../src/services/api/index';
import { SQLClient } from './types';

jest.mock('../src/services/api/index');

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
      expect(client).toHaveProperty('getDatabase');
      expect(client).toHaveProperty('getDatabases');
    });

    it('should create a client with custom configuration', () => {
      const client = createClient({ token: 'custom-token', debug: false });
      expect(client).toHaveProperty('createDatabase');
      expect(client).toHaveProperty('deleteDatabase');
      expect(client).toHaveProperty('getDatabase');
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

  describe('getDatabase', () => {
    it('should successfully retrieve a database', async () => {
      const mockResponse = { results: [{ id: 1, name: 'test-db' }] };
      (services.getEdgeDatabases as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getDatabase('test-db', mockDebug);
      expect(result).toEqual(expect.objectContaining({ id: 1, name: 'test-db' }));
      expect(services.getEdgeDatabases).toHaveBeenCalledWith(mockToken, { search: 'test-db' }, mockDebug);
    });

    it('should return null if database not found', async () => {
      (services.getEdgeDatabases as jest.Mock).mockResolvedValue(null);

      const result = await getDatabase('test-db', mockDebug);
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
      const mockResponseDatabases = {
        results: [
          { id: 1, name: 'test-db' },
          { id: 2, name: 'test-db-2' },
        ],
      };
      (services.getEdgeDatabases as jest.Mock).mockResolvedValue(mockResponseDatabases);
      const mockResponse = {
        state: 'success',
        data: [{ results: { columns: ['id', 'name'], rows: [[1, 'test']] } }],
      };
      (services.postQueryEdgeDatabase as jest.Mock).mockResolvedValue(mockResponse);

      const result = await useQuery('test-db', ['SELECT * FROM test'], undefined, mockDebug);
      expect(result).toEqual(
        expect.objectContaining({
          state: 'success',
          data: [{ columns: ['id', 'name'], rows: [[1, 'test']], info: undefined, statement: 'SELECT' }],
        }),
      );
      expect(services.postQueryEdgeDatabase).toHaveBeenCalledWith(mockToken, 1, ['SELECT * FROM test'], mockDebug);
    });

    it('should successfully execution by useExecute', async () => {
      const mockResponseDatabases = {
        results: [
          { id: 1, name: 'test-db' },
          { id: 2, name: 'test-db-2' },
        ],
      };
      (services.getEdgeDatabases as jest.Mock).mockResolvedValue(mockResponseDatabases);
      const mockResponse = {
        state: 'success',
        data: [{ results: { columns: ['id', 'name'], rows: [[1, 'test']] } }],
      };
      (services.postQueryEdgeDatabase as jest.Mock).mockResolvedValue(mockResponse);

      expect(await useExecute('test-db', ['SELECT * FROM test'], undefined, mockDebug)).toBeNull();
      expect(services.postQueryEdgeDatabase).toHaveBeenCalledWith(mockToken, 1, ['SELECT * FROM test'], mockDebug);
    });

    it('should return null if query execution fails', async () => {
      (services.postQueryEdgeDatabase as jest.Mock).mockResolvedValue(null);

      const result = await useQuery('test-db', ['SELECT * FROM test'], undefined, mockDebug);
      expect(result).toBeNull();
    });
  });

  describe('Client methods', () => {
    let client: SQLClient;

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

    it('should call getDatabase method', async () => {
      const mockResponse = { results: [{ id: 1, name: 'test-db' }] };
      (services.getEdgeDatabases as jest.Mock).mockResolvedValue(mockResponse);
      if (client.getDatabase) {
        await client.getDatabase('test-db');
      }
      expect(services.getEdgeDatabases).toHaveBeenCalledWith('custom-token', { search: 'test-db' }, false);
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
