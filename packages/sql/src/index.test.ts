import {
  createClient,
  createDatabase,
  deleteDatabase,
  getDatabase,
  getDatabases,
  useExecute,
  useQuery,
} from '../src/index';
import * as servicesApi from '../src/services/api/index';
import { AzionSQLClient } from './types';

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
      const client = createClient({ token: 'custom-token', options: { debug: false } });
      expect(client).toHaveProperty('createDatabase');
      expect(client).toHaveProperty('deleteDatabase');
      expect(client).toHaveProperty('getDatabase');
      expect(client).toHaveProperty('getDatabases');
    });
  });

  describe('createDatabase', () => {
    it('should successfully create a database', async () => {
      const mockResponse = { data: { id: 1, name: 'test-db' } };
      (servicesApi.postEdgeDatabase as jest.Mock).mockResolvedValue(mockResponse);

      const result = await createDatabase('test-db', { debug: mockDebug });
      expect(result).toEqual(expect.objectContaining({ id: 1, name: 'test-db' }));
      expect(servicesApi.postEdgeDatabase).toHaveBeenCalledWith(mockToken, 'test-db', true);
    });

    it('should return null on failure', async () => {
      (servicesApi.postEdgeDatabase as jest.Mock).mockResolvedValue(null);

      const result = await createDatabase('test-db', { debug: mockDebug });
      expect(result).toBeNull();
    });
  });

  describe('deleteDatabase', () => {
    it('should successfully delete a database', async () => {
      const mockResponse = { data: { message: 'Database deleted' }, state: 'success' };
      (servicesApi.deleteEdgeDatabase as jest.Mock).mockResolvedValue(mockResponse);

      const result = await deleteDatabase(1, { debug: mockDebug });
      expect(result).toEqual({ id: 1, data: { message: 'Database deleted' }, state: 'success' });
      expect(servicesApi.deleteEdgeDatabase).toHaveBeenCalledWith(mockToken, 1, true);
    });

    it('should return null on failure', async () => {
      (servicesApi.deleteEdgeDatabase as jest.Mock).mockResolvedValue(null);

      const result = await deleteDatabase(1, { debug: mockDebug });
      expect(result).toBeNull();
    });
  });

  describe('getDatabase', () => {
    it('should successfully retrieve a database', async () => {
      const mockResponse = { results: [{ id: 1, name: 'test-db' }] };
      (servicesApi.getEdgeDatabases as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getDatabase('test-db', { debug: mockDebug });
      expect(result).toEqual(expect.objectContaining({ id: 1, name: 'test-db' }));
      expect(servicesApi.getEdgeDatabases).toHaveBeenCalledWith(mockToken, { search: 'test-db' }, true);
    });

    it('should return null if database not found', async () => {
      (servicesApi.getEdgeDatabases as jest.Mock).mockResolvedValue(null);

      const result = await getDatabase('test-db', { debug: mockDebug });
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
      (servicesApi.getEdgeDatabases as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getDatabases({ page: 1, page_size: 10 }, { debug: mockDebug });
      expect(result).toHaveLength(2);
      expect(result![0]).toEqual(expect.objectContaining({ id: 1, name: 'test-db-1' }));
      expect(servicesApi.getEdgeDatabases).toHaveBeenCalledWith(mockToken, { page: 1, page_size: 10 }, true);
    });

    it('should return null if retrieval fails', async () => {
      (servicesApi.getEdgeDatabases as jest.Mock).mockResolvedValue(null);

      const result = await getDatabases({ page: 1, page_size: 10 }, { debug: mockDebug });
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
      (servicesApi.getEdgeDatabases as jest.Mock).mockResolvedValue(mockResponseDatabases);
      const mockResponse = {
        state: 'success',
        data: [{ results: { columns: ['id', 'name'], rows: [[1, 'test']] } }],
      };
      (servicesApi.postQueryEdgeDatabase as jest.Mock).mockResolvedValue(mockResponse);

      const result = await useQuery('test-db', ['SELECT * FROM test'], { debug: mockDebug });
      expect(result).toEqual(
        expect.objectContaining({
          state: 'executed',
          data: [{ columns: ['id', 'name'], rows: [[1, 'test']], info: undefined, statement: 'SELECT' }],
        }),
      );
      expect(servicesApi.postQueryEdgeDatabase).toHaveBeenCalledWith(mockToken, 1, ['SELECT * FROM test'], true);
    });

    it('should throw an error if useQuery is called with an invalid statement', async () => {
      const mockResponseDatabases = {
        results: [
          { id: 1, name: 'test-db' },
          { id: 2, name: 'test-db-2' },
        ],
      };
      (servicesApi.getEdgeDatabases as jest.Mock).mockResolvedValue(mockResponseDatabases);

      await expect(
        useQuery('test-db', ["INSERT INTO users (id, name) VALUES (1, 'John Doe')"], { debug: mockDebug }),
      ).rejects.toThrow('Only read statements are allowed');
    });

    it('should successfully execution by useExecute', async () => {
      const mockResponseDatabases = {
        results: [
          { id: 1, name: 'test-db' },
          { id: 2, name: 'test-db-2' },
        ],
      };
      (servicesApi.getEdgeDatabases as jest.Mock).mockResolvedValue(mockResponseDatabases);
      const mockResponse = {
        state: 'executed',
        data: [{ results: { columns: [], rows: [] } }],
      };
      (servicesApi.postQueryEdgeDatabase as jest.Mock).mockResolvedValue(mockResponse);

      expect(
        await useExecute('test-db', ["INSERT INTO users (id, name) VALUES (1, 'John Doe')"], { debug: mockDebug }),
      ).toEqual(expect.objectContaining({ state: 'executed' }));
      expect(servicesApi.postQueryEdgeDatabase).toHaveBeenCalledWith(
        mockToken,
        1,
        ["INSERT INTO users (id, name) VALUES (1, 'John Doe')"],
        true,
      );
    });

    it('should throw an error if useExecute is called with an invalid statement', async () => {
      const mockResponseDatabases = {
        results: [
          { id: 1, name: 'test-db' },
          { id: 2, name: 'test-db-2' },
        ],
      };
      (servicesApi.getEdgeDatabases as jest.Mock).mockResolvedValue(mockResponseDatabases);

      await expect(useExecute('test-db', ['SELECT * FROM test'], { debug: mockDebug })).rejects.toThrowError(
        'Only write statements are allowed',
      );
    });

    it('should return if query execution fails', async () => {
      (servicesApi.postQueryEdgeDatabase as jest.Mock).mockResolvedValue(null);

      const result = await useQuery('test-db', ['SELECT * FROM test'], { debug: mockDebug });
      expect(result).toEqual({ state: 'executed', data: [] });
    });

    it.todo('should successfully execute useQuery with apiQuery called');
    it.todo('should successfully execute useQuery with runtimeQuery called');
  });

  describe('Client methods', () => {
    let client: AzionSQLClient;

    beforeEach(() => {
      client = createClient({ token: 'custom-token', options: { debug: false } });
    });

    it('should call createDatabase method', async () => {
      const mockResponse = { data: { id: 1, name: 'test-db' } };
      (servicesApi.postEdgeDatabase as jest.Mock).mockResolvedValue(mockResponse);

      await client.createDatabase('test-db');
      expect(servicesApi.postEdgeDatabase).toHaveBeenCalledWith('custom-token', 'test-db', false);
    });

    it('should call deleteDatabase method', async () => {
      const mockResponse = { data: { message: 'Database deleted' }, state: 'success' };
      (servicesApi.deleteEdgeDatabase as jest.Mock).mockResolvedValue(mockResponse);

      await client.deleteDatabase(1);
      expect(servicesApi.deleteEdgeDatabase).toHaveBeenCalledWith('custom-token', 1, false);
    });

    it('should call getDatabase method', async () => {
      const mockResponse = { results: [{ id: 1, name: 'test-db' }] };
      (servicesApi.getEdgeDatabases as jest.Mock).mockResolvedValue(mockResponse);
      if (client.getDatabase) {
        await client.getDatabase('test-db');
      }
      expect(servicesApi.getEdgeDatabases).toHaveBeenCalledWith('custom-token', { search: 'test-db' }, false);
    });

    it('should call getDatabases method', async () => {
      const mockResponse = {
        results: [
          { id: 1, name: 'test-db-1' },
          { id: 2, name: 'test-db-2' },
        ],
      };
      (servicesApi.getEdgeDatabases as jest.Mock).mockResolvedValue(mockResponse);

      await client.getDatabases({ page: 1, page_size: 10 });
      expect(servicesApi.getEdgeDatabases).toHaveBeenCalledWith('custom-token', { page: 1, page_size: 10 }, false);
    });
  });
});
