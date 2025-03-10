import {
  createClient,
  createDatabase,
  deleteDatabase,
  getDatabase,
  getDatabases,
  getTables,
  useExecute,
  useQuery,
} from '../src/index';
import * as servicesApi from '../src/services/api/index';
import * as services from '../src/services/index';
import { AzionSQLClient } from './types';
import fetchWithErrorHandling from './utils/fetch';

jest.mock('../src/services/api/index');
jest.mock('../src/utils/fetch/index', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('SQL Module', () => {
  const mockToken = 'mock-token';
  const mockDebug = true;

  beforeEach(() => {
    jest.resetAllMocks();
    process.env.AZION_TOKEN = mockToken;
    process.env.AZION_DEBUG = 'true';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).Azion = {};
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
    beforeAll(() => {
      jest.spyOn(console, 'log').mockImplementation();
    });
    it('should successfully create a database', async () => {
      const mockResponse = { data: { id: 1, name: 'test-db' } };
      (servicesApi.postEdgeDatabase as jest.Mock).mockResolvedValue(mockResponse);
      const result = await createDatabase('test-db', { debug: mockDebug });
      expect(result.data).toEqual(expect.objectContaining({ id: 1, name: 'test-db' }));
      expect(servicesApi.postEdgeDatabase).toHaveBeenCalledWith(mockToken, 'test-db', true, 'production');
    });

    it('should return error on failure', async () => {
      (servicesApi.postEdgeDatabase as jest.Mock).mockResolvedValue({
        error: {
          message: 'Database already exists',
          operation: 'create database',
        },
      });
      const result = await createDatabase('test-db', { debug: mockDebug });
      expect(result).toEqual({
        error: { message: 'Database already exists', operation: 'create database' },
      });
    });
  });

  describe('deleteDatabase', () => {
    beforeAll(() => {
      jest.spyOn(console, 'log').mockImplementation();
    });
    it('should successfully delete a database', async () => {
      (servicesApi.deleteEdgeDatabase as jest.Mock).mockResolvedValue({ state: 'pending', data: { id: 1 } });
      const result = await deleteDatabase(1, { debug: mockDebug });
      expect(result).toEqual({ data: { id: 1, state: 'pending' } });
      expect(servicesApi.deleteEdgeDatabase).toHaveBeenCalledWith(mockToken, 1, true, 'production');
    });

    it('should return error on failure', async () => {
      (servicesApi.deleteEdgeDatabase as jest.Mock).mockResolvedValue({
        error: { message: 'Failed to delete database', operation: 'delete database' },
      });
      const result = await deleteDatabase(1, { debug: mockDebug });
      expect(result).toEqual({
        error: { message: 'Failed to delete database', operation: 'delete database' },
      });
    });
  });

  describe('getDatabase', () => {
    beforeAll(() => {
      jest.spyOn(console, 'log').mockImplementation();
    });
    it('should successfully retrieve a database', async () => {
      const mockResponse = { results: [{ id: 1, name: 'test-db' }] };
      (servicesApi.getEdgeDatabases as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getDatabase('test-db', { debug: mockDebug });
      expect(result.data).toEqual(expect.objectContaining({ id: 1, name: 'test-db' }));
      expect(servicesApi.getEdgeDatabases).toHaveBeenCalledWith(mockToken, { search: 'test-db' }, true, 'production');
    });

    it('should throw an error if database is not found', async () => {
      (servicesApi.getEdgeDatabases as jest.Mock).mockResolvedValue({ results: [] });

      await expect(getDatabase('test-db', { debug: mockDebug })).resolves.toEqual({
        error: { message: "Database with name 'test-db' not found", operation: 'get database' },
      });
    });
  });

  describe('getDatabases', () => {
    beforeAll(() => {
      jest.spyOn(console, 'log').mockImplementation();
    });
    it('should successfully retrieve databases', async () => {
      const mockResponse = {
        results: [
          { id: 1, name: 'test-db-1' },
          { id: 2, name: 'test-db-2' },
        ],
      };
      (servicesApi.getEdgeDatabases as jest.Mock).mockResolvedValue(mockResponse);

      const { data } = await getDatabases({ page: 1, page_size: 10 }, { debug: mockDebug });
      expect(data?.databases).toHaveLength(2);
      expect(data!.databases![0]).toEqual(expect.objectContaining({ id: 1, name: 'test-db-1' }));
      expect(servicesApi.getEdgeDatabases).toHaveBeenCalledWith(
        mockToken,
        { page: 1, page_size: 10 },
        true,
        'production',
      );
    });

    it('should return error if retrieval fails', async () => {
      (servicesApi.getEdgeDatabases as jest.Mock).mockResolvedValue({
        error: { message: 'Failed to retrieve databases', operation: 'get databases' },
      });

      const result = await getDatabases({ page: 1, page_size: 10 }, { debug: mockDebug });
      expect(result).toEqual({ error: { message: 'Failed to retrieve databases', operation: 'get databases' } });
    });
  });

  describe('useExecute and useQuery', () => {
    beforeAll(() => {
      jest.spyOn(console, 'log').mockImplementation();
    });

    afterAll(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (globalThis as any).Azion = {};
    });

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully execute a query', async () => {
      const mockResponseDatabases = {
        results: [
          { id: 1, name: 'test-db' },
          { id: 2, name: 'test-db-2' },
        ],
      };
      (servicesApi.getEdgeDatabases as jest.Mock).mockResolvedValue(mockResponseDatabases);
      const mockResponse = {
        state: 'executed',
        data: [{ results: { columns: ['id', 'name'], rows: [[1, 'test']] } }],
      };
      (servicesApi.postQueryEdgeDatabase as jest.Mock).mockResolvedValue(mockResponse);

      const result = await useQuery('test-db', ['SELECT * FROM test'], { debug: mockDebug });
      expect(result.data).toEqual(
        expect.objectContaining({
          results: [{ columns: ['id', 'name'], rows: [[1, 'test']], statement: 'SELECT' }],
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
        data: [{ results: { columns: [], rows: [] } }],
      };
      (servicesApi.postQueryEdgeDatabase as jest.Mock).mockResolvedValue(mockResponse);
      const result = await useExecute('test-db', ["INSERT INTO users (id, name) VALUES (1, 'John Doe')"], {
        debug: mockDebug,
      });

      expect(result.data).toEqual(
        expect.objectContaining({
          results: [{ statement: 'INSERT' }],
        }),
      );

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

      await expect(useExecute('test-db', ['SELECT * FROM test'], { debug: mockDebug })).resolves.toEqual({
        error: { message: 'Only write statements are allowed', operation: 'execute database' },
      });
    });

    it('should return error if useExecute when token invalid', async () => {
      const mockResponseDatabases = {
        error: {
          message: 'Invalid token header. No credentials provided.',
          operation: 'get databases',
        },
      };
      (servicesApi.getEdgeDatabases as jest.Mock).mockResolvedValue(mockResponseDatabases);

      await expect(
        useExecute('test-db', ['INSERT INTO users (id, name) VALUES (1, "John Doe")'], { debug: mockDebug }),
      ).resolves.toEqual({
        error: { message: 'Invalid token header. No credentials provided.', operation: 'get databases' },
      });
    });

    it('should return error if query execution fails', async () => {
      const mockResponseDatabases = {
        results: [
          { id: 1, name: 'test-db' },
          { id: 2, name: 'test-db-2' },
        ],
      };
      (servicesApi.getEdgeDatabases as jest.Mock).mockResolvedValue(mockResponseDatabases);
      (servicesApi.postQueryEdgeDatabase as jest.Mock).mockResolvedValue({
        error: { message: 'Error executing query', operation: 'executing query' },
      });

      const result = await useQuery('test-db', ['SELECT * FROM test'], { debug: mockDebug });
      expect(result).toEqual({
        error: { message: 'Error executing query', operation: 'executing query' },
      });
    });

    it('should successfully execute useQuery with apiQuery called', async () => {
      const spyApiQuery = jest.spyOn(services, 'apiQuery').mockResolvedValue({ data: { toObject: () => null } });

      await useQuery('test-db', ['SELECT * FROM test'], { debug: mockDebug, env: 'production' });

      expect(spyApiQuery).toHaveBeenCalled();
      expect(spyApiQuery).toHaveBeenCalledWith(mockToken, 'test-db', ['SELECT * FROM test'], {
        debug: mockDebug,
        env: 'production',
      });

      spyApiQuery.mockRestore();
    });

    it('should successfully execute useQuery with runtimeQuery called', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (globalThis as any).Azion = { Sql: {} };
      const spyRuntimeQuery = jest
        .spyOn(services, 'runtimeQuery')
        .mockResolvedValue({ data: { toObject: () => null } });

      await useQuery('test-db', ['SELECT * FROM test'], { debug: mockDebug });

      expect(spyRuntimeQuery).toHaveBeenCalled();
      expect(spyRuntimeQuery).toHaveBeenCalledWith(mockToken, 'test-db', ['SELECT * FROM test'], {
        debug: mockDebug,
        env: 'production',
      });

      spyRuntimeQuery.mockRestore();
    });

    it('should return error if useQuery when statement some invalid', async () => {
      const mockResponseDatabases = {
        results: [
          { id: 1, name: 'test-db' },
          { id: 2, name: 'test-db-2' },
        ],
      };
      (servicesApi.getEdgeDatabases as jest.Mock).mockResolvedValue(mockResponseDatabases);

      (servicesApi.postQueryEdgeDatabase as jest.Mock).mockImplementation(
        jest.requireActual('../src/services/api/index').postQueryEdgeDatabase,
      );

      (fetchWithErrorHandling as jest.Mock).mockResolvedValue({
        state: 'executed',
        data: [
          {
            results: {
              columns: ['schema', 'name', 'type', 'ncol', 'wr', 'strict'],
              rows: [
                ['main', 'sqlite_schema', 'table', 5, 0, 0],
                ['temp', 'sqlite_temp_schema', 'table', 5, 0, 0],
              ],
              rows_read: 0,
              rows_written: 0,
              query_duration_ms: 0.058,
            },
          },
          {
            error: 'no such table: main',
          },
          null,
        ],
      });

      await expect(
        useQuery('test-db', ['pragma table_list', 'select * from main', 'select * from sqlite_schema'], {
          debug: mockDebug,
        }),
      ).resolves.toEqual(
        expect.objectContaining({
          error: {
            message: 'no such table: main',
            operation: 'post query',
          },
        }),
      );
    });

    it('should return error if useQuery when last statement is invalid', async () => {
      const mockResponseDatabases = {
        results: [
          { id: 1, name: 'test-db' },
          { id: 2, name: 'test-db-2' },
        ],
      };
      (servicesApi.getEdgeDatabases as jest.Mock).mockResolvedValue(mockResponseDatabases);

      (servicesApi.postQueryEdgeDatabase as jest.Mock).mockImplementation(
        jest.requireActual('../src/services/api/index').postQueryEdgeDatabase,
      );

      (fetchWithErrorHandling as jest.Mock).mockResolvedValue({
        state: 'executed',
        data: [
          {
            results: {
              columns: ['schema', 'name', 'type', 'ncol', 'wr', 'strict'],
              rows: [
                ['main', 'sqlite_schema', 'table', 5, 0, 0],
                ['temp', 'sqlite_temp_schema', 'table', 5, 0, 0],
              ],
              rows_read: 0,
              rows_written: 0,
              query_duration_ms: 0.058,
            },
          },
          {
            results: { columns: ['id', 'name'], rows: [[1, 'test']] },
          },
          {
            error: 'no such table: main',
          },
        ],
      });

      await expect(
        useQuery('test-db', ['pragma table_list', 'select * from main', 'select * from sqlite_schema'], {
          debug: mockDebug,
        }),
      ).resolves.toEqual(
        expect.objectContaining({
          data: expect.objectContaining({
            state: 'executed',
            results: [
              {
                columns: ['schema', 'name', 'type', 'ncol', 'wr', 'strict'],
                rows: [
                  ['main', 'sqlite_schema', 'table', 5, 0, 0],
                  ['temp', 'sqlite_temp_schema', 'table', 5, 0, 0],
                ],
                statement: 'pragma',
              },
              { columns: ['id', 'name'], rows: [[1, 'test']], statement: 'select' },
            ],
          }),
          error: {
            message: 'no such table: main',
            operation: 'post query',
          },
        }),
      );
    });

    it('should return error if useQuery when data rows is empty', async () => {
      const mockResponseDatabases = {
        results: [
          { id: 1, name: 'test-db' },
          { id: 2, name: 'test-db-2' },
        ],
      };
      (servicesApi.getEdgeDatabases as jest.Mock).mockResolvedValue(mockResponseDatabases);

      (servicesApi.postQueryEdgeDatabase as jest.Mock).mockImplementation(
        jest.requireActual('../src/services/api/index').postQueryEdgeDatabase,
      );

      (fetchWithErrorHandling as jest.Mock).mockResolvedValue({
        state: 'executed',
        data: [{ results: { columns: ['id', 'name'], rows: [] } }],
      });

      await expect(
        useQuery('test-db', ['select * from users'], {
          debug: mockDebug,
        }),
      ).resolves.toEqual(
        expect.objectContaining({
          data: expect.objectContaining({
            state: 'executed',
            results: [{ columns: ['id', 'name'], rows: undefined, statement: 'select' }],
          }),
        }),
      );
    });
  });

  describe('getTables', () => {
    it('should successfully list tables', async () => {
      const mockResponseDatabases = {
        results: [
          { id: 1, name: 'test-db' },
          { id: 2, name: 'test-db-2' },
        ],
      };
      (servicesApi.getEdgeDatabases as jest.Mock).mockResolvedValue(mockResponseDatabases);
      const mockResponse = {
        data: [
          {
            results: {
              columns: ['schema', 'name', 'type', 'ncol', 'wr', 'strict'],
              rows: [['main', 'users', 'table', 2, 0, 0]],
            },
          },
        ],
      };
      (servicesApi.postQueryEdgeDatabase as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getTables('test-db', { debug: mockDebug });
      expect(result.data).toEqual(
        expect.objectContaining({
          results: [
            {
              statement: 'PRAGMA',
              columns: ['schema', 'name', 'type', 'ncol', 'wr', 'strict'],
              rows: [['main', 'users', 'table', 2, 0, 0]],
            },
          ],
        }),
      );
      expect(servicesApi.postQueryEdgeDatabase).toHaveBeenCalledWith(mockToken, 1, ['PRAGMA table_list'], true);
    });
  });

  describe('Client methods', () => {
    let client: AzionSQLClient;

    beforeAll(() => {
      jest.spyOn(console, 'log').mockImplementation();
    });

    beforeEach(() => {
      client = createClient({ token: 'custom-token', options: { debug: false } });
    });

    it('should call createDatabase method', async () => {
      const mockResponse = { data: { id: 1, name: 'test-db' } };
      (servicesApi.postEdgeDatabase as jest.Mock).mockResolvedValue(mockResponse);

      await client.createDatabase('test-db');
      expect(servicesApi.postEdgeDatabase).toHaveBeenCalledWith('custom-token', 'test-db', false, 'production');
    });

    it('should call deleteDatabase method', async () => {
      const mockResponse = { data: { message: 'Database deleted' }, state: 'success' };
      (servicesApi.deleteEdgeDatabase as jest.Mock).mockResolvedValue(mockResponse);

      await client.deleteDatabase(1);
      expect(servicesApi.deleteEdgeDatabase).toHaveBeenCalledWith('custom-token', 1, false, 'production');
    });

    it('should call getDatabase method', async () => {
      const mockResponse = { results: [{ id: 1, name: 'test-db' }] };
      (servicesApi.getEdgeDatabases as jest.Mock).mockResolvedValue(mockResponse);
      if (client.getDatabase) {
        await client.getDatabase('test-db');
      }
      expect(servicesApi.getEdgeDatabases).toHaveBeenCalledWith(
        'custom-token',
        { search: 'test-db' },
        false,
        'production',
      );
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
      expect(servicesApi.getEdgeDatabases).toHaveBeenCalledWith(
        'custom-token',
        { page: 1, page_size: 10 },
        false,
        'production',
      );
    });
  });
});
