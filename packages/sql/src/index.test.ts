import {
  AzionSQLClient,
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
import { ApiCreateDatabaseResponse } from './services/api/types';
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
    let mockApiDatabaseResponse: ApiCreateDatabaseResponse;
    beforeEach(() => {
      mockApiDatabaseResponse = {
        data: {
          active: true,
          id: 1,
          name: 'test-db',
          last_editor: 'test-user',
          last_modified: '2023-10-01T00:00:00Z',
          product_version: '1.0.0',
          status: 'created',
        },
      };
      (servicesApi.postDatabase as jest.Mock).mockResolvedValue(mockApiDatabaseResponse);
    });

    beforeAll(() => {
      jest.spyOn(console, 'log').mockImplementation();
    });

    it('should successfully create a database', async () => {
      const result = await createDatabase('test-db', { debug: mockDebug });
      expect(result.data).toEqual(expect.objectContaining({ id: 1, name: 'test-db' }));
      expect(servicesApi.postDatabase).toHaveBeenCalledWith(mockToken, 'test-db', true, 'production');
      expect(result.data!.id).toEqual(mockApiDatabaseResponse.data?.id);
    });

    it('should return error on failure', async () => {
      (servicesApi.postDatabase as jest.Mock).mockResolvedValue({
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

  describe('getDatabase', () => {
    const mockApiResponse = {
      count: 1,
      results: [
        {
          id: 0,
          name: 'db-1',
          status: 'created',
          active: true,
          last_modified: '2019-08-24T14:15:22Z',
          last_editor: 'string',
          product_version: 'string',
        },
      ],
    };
    beforeAll(() => {
      jest.spyOn(console, 'log').mockImplementation();
    });

    it('should successfully retrieve a database', async () => {
      (servicesApi.getDatabases as jest.Mock).mockResolvedValue(mockApiResponse);

      const result = await getDatabase('db-1', { debug: mockDebug });
      expect(servicesApi.getDatabases).toHaveBeenCalledWith(
        mockToken,
        { page_size: 1, search: 'db-1' },
        true,
        'production',
      );
      expect(result.data).toEqual(
        expect.objectContaining({
          id: 0,
          name: 'db-1',
          status: 'created',
          active: true,
          lastModified: '2019-08-24T14:15:22Z',
          lastEditor: 'string',
          productVersion: 'string',
        }),
      );
    });

    it('should return error if database not found', async () => {
      (servicesApi.getDatabases as jest.Mock).mockResolvedValue({
        error: { message: 'Not found.', operation: 'retrieve database' },
      });

      const result = await getDatabase('test-db', { debug: mockDebug });
      expect(result).toEqual({
        error: { message: 'Not found.', operation: 'retrieve database' },
      });
    });
  });

  describe('deleteDatabase', () => {
    beforeAll(() => {
      jest.spyOn(console, 'log').mockImplementation();
    });
    it('should successfully delete a database', async () => {
      (servicesApi.deleteDatabase as jest.Mock).mockResolvedValue({ state: 'pending', data: { id: 1 } });
      const result = await deleteDatabase(1, { debug: mockDebug });
      expect(result).toEqual({ data: { state: 'pending' } });
      expect(servicesApi.deleteDatabase).toHaveBeenCalledWith(mockToken, 1, true, 'production');
    });

    it('should return error on failure', async () => {
      (servicesApi.deleteDatabase as jest.Mock).mockResolvedValue({
        error: { message: 'Failed to delete database', operation: 'delete database' },
      });
      const result = await deleteDatabase(1, { debug: mockDebug });
      expect(result).toEqual({
        error: { message: 'Failed to delete database', operation: 'delete database' },
      });
    });
  });

  describe('getDatabases', () => {
    beforeAll(() => {
      jest.spyOn(console, 'log').mockImplementation();
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('should successfully retrieve databases', async () => {
      const mockResponse = {
        count: 2,
        results: [
          {
            id: 0,
            name: 'db-1',
            status: 'created',
            active: true,
            last_modified: '2019-08-24T14:15:22Z',
            last_editor: 'string',
            product_version: 'string',
          },
          {
            id: 1,
            name: 'db-2',
            status: 'creating',
            active: true,
            last_modified: '2019-08-24T14:15:22Z',
            last_editor: 'string',
            product_version: 'string',
          },
        ],
      };
      (servicesApi.getDatabases as jest.Mock).mockResolvedValue(mockResponse);

      const { data } = await getDatabases({ page: 1, page_size: 10 }, { debug: mockDebug });
      expect(data?.databases).toHaveLength(2);
      expect(data!.databases![0]).toEqual(
        expect.objectContaining({
          id: 0,
          name: 'db-1',
          status: 'created',
          active: true,
          lastModified: '2019-08-24T14:15:22Z',
          lastEditor: 'string',
          productVersion: 'string',
        }),
      );
      expect(servicesApi.getDatabases).toHaveBeenCalledWith(mockToken, { page: 1, page_size: 10 }, true, 'production');
    });

    it('should return error if retrieval fails', async () => {
      (servicesApi.getDatabases as jest.Mock).mockResolvedValue({
        error: { message: 'Failed to retrieve databases', operation: 'get databases' },
      });

      const result = await getDatabases({ page: 1, page_size: 10 }, { debug: mockDebug });
      expect(result).toEqual({ error: { message: 'Failed to retrieve databases', operation: 'get databases' } });
    });
  });

  describe('useQuery', () => {
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
      (servicesApi.getDatabases as jest.Mock).mockResolvedValue(mockResponseDatabases);
      const mockResponse = {
        state: 'executed',
        data: [{ results: { columns: ['id', 'name'], rows: [[1, 'test']] } }],
      };
      (servicesApi.postQueryDatabase as jest.Mock).mockResolvedValue(mockResponse);

      const result = await useQuery('test-db', ['SELECT * FROM test'], { debug: mockDebug });
      expect(result.data).toEqual(
        expect.objectContaining({
          results: [{ columns: ['id', 'name'], rows: [[1, 'test']], statement: 'SELECT' }],
        }),
      );
      expect(servicesApi.postQueryDatabase).toHaveBeenCalledWith(
        mockToken,
        1,
        ['SELECT * FROM test'],
        true,
        'production',
      );
    });

    it('should throw an error if useQuery is called with an invalid statement', async () => {
      const mockResponseDatabases = {
        results: [
          { id: 1, name: 'test-db' },
          { id: 2, name: 'test-db-2' },
        ],
      };
      (servicesApi.getDatabases as jest.Mock).mockResolvedValue(mockResponseDatabases);

      await expect(
        useQuery('test-db', ["INSERT INTO users (id, name) VALUES (1, 'John Doe')"], { debug: mockDebug }),
      ).rejects.toThrow('Only read statements are allowed');
    });

    it('should return error if query execution fails', async () => {
      const mockResponseDatabases = {
        results: [
          { id: 1, name: 'test-db' },
          { id: 2, name: 'test-db-2' },
        ],
      };
      (servicesApi.getDatabases as jest.Mock).mockResolvedValue(mockResponseDatabases);
      (servicesApi.postQueryDatabase as jest.Mock).mockResolvedValue({
        error: { message: 'Error executing query', operation: 'executing query' },
      });

      const result = await useQuery('test-db', ['SELECT * FROM test'], { debug: mockDebug });
      expect(result).toEqual({
        error: { message: 'Error executing query', operation: 'apiQuery' },
      });
    });

    it('should successfully execute useQuery with apiQuery called', async () => {
      const spyApiQuery = jest.spyOn(services, 'apiQuery').mockResolvedValue({
        data: { toObject: () => null, state: 'executed' },
      });

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
        .mockResolvedValue({ data: { state: 'executed-runtime', toObject: () => null } });

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
        count: 2,
        results: [
          { id: 1, name: 'test-db' },
          { id: 2, name: 'test-db-2' },
        ],
      };
      (servicesApi.getDatabases as jest.Mock).mockResolvedValue(mockResponseDatabases);

      (fetchWithErrorHandling as jest.Mock).mockResolvedValue({
        state: 'executed',
        data: [
          {
            results: {
              columns: ['id', 'name'],
              rows: [[1, 'john']],
              rows_read: 1,
              rows_written: 0,
              query_duration_ms: 0.161,
            },
          },
          {
            error: 'no such table: main',
          },
        ],
      });

      (servicesApi.postQueryDatabase as jest.Mock).mockImplementation(
        jest.requireActual('../src/services/api/index').postQueryDatabase,
      );
      await expect(
        useQuery('test-db', ['pragma table_list', 'select * from main'], {
          debug: mockDebug,
        }),
      ).resolves.toEqual(
        expect.objectContaining({
          data: expect.objectContaining({
            state: 'executed',
            results: expect.arrayContaining([
              expect.anything(),
              expect.objectContaining({ error: 'no such table: main' }),
            ]),
          }),
          error: expect.objectContaining({
            message: 'no such table: main',
            operation: 'apiQuery',
          }),
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
      (servicesApi.getDatabases as jest.Mock).mockResolvedValue(mockResponseDatabases);

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

      (servicesApi.postQueryDatabase as jest.Mock).mockImplementation(
        jest.requireActual('../src/services/api/index').postQueryDatabase,
      );

      await expect(
        useQuery('test-db', ['pragma table_list', 'select * from sqlite_schema', 'select * from main'], {
          debug: mockDebug,
        }),
      ).resolves.toEqual(
        expect.objectContaining({
          data: expect.objectContaining({
            state: 'executed',
            results: expect.arrayContaining([
              expect.anything(),
              expect.anything(),
              expect.objectContaining({ error: 'no such table: main' }),
            ]),
          }),
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
      (servicesApi.getDatabases as jest.Mock).mockResolvedValue(mockResponseDatabases);

      (servicesApi.postQueryDatabase as jest.Mock).mockImplementation(
        jest.requireActual('../src/services/api/index').postQueryDatabase,
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

  describe('useExecute', () => {
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
    it('should successfully execution by useExecute', async () => {
      const mockResponseDatabases = {
        results: [
          { id: 1, name: 'test-db' },
          { id: 2, name: 'test-db-2' },
        ],
      };
      (servicesApi.getDatabases as jest.Mock).mockResolvedValue(mockResponseDatabases);
      const mockResponse = {
        data: [{ results: { columns: [], rows: [] } }],
      };
      (servicesApi.postQueryDatabase as jest.Mock).mockResolvedValue(mockResponse);
      const result = await useExecute('test-db', ["INSERT INTO users (id, name) VALUES (1, 'John Doe')"], {
        debug: mockDebug,
      });

      expect(result.data).toEqual(
        expect.objectContaining({
          results: [{ statement: 'INSERT' }],
        }),
      );

      expect(servicesApi.postQueryDatabase).toHaveBeenCalledWith(
        mockToken,
        1,
        ["INSERT INTO users (id, name) VALUES (1, 'John Doe')"],
        true,
        'production',
      );
    });

    it('should throw an error if useExecute is called with an invalid statement', async () => {
      const mockResponseDatabases = {
        results: [
          { id: 1, name: 'test-db' },
          { id: 2, name: 'test-db-2' },
        ],
      };
      (servicesApi.getDatabases as jest.Mock).mockResolvedValue(mockResponseDatabases);

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
      (servicesApi.getDatabases as jest.Mock).mockResolvedValue(mockResponseDatabases);

      await expect(
        useExecute('test-db', ['INSERT INTO users (id, name) VALUES (1, "John Doe")'], { debug: mockDebug }),
      ).resolves.toEqual({
        error: { message: 'Invalid token header. No credentials provided.', operation: 'get databases' },
      });
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
      (servicesApi.getDatabases as jest.Mock).mockResolvedValue(mockResponseDatabases);
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
      (servicesApi.postQueryDatabase as jest.Mock).mockResolvedValue(mockResponse);

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
      expect(servicesApi.postQueryDatabase).toHaveBeenCalledWith(
        mockToken,
        1,
        ['PRAGMA table_list'],
        true,
        'production',
      );
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

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should call createDatabase method', async () => {
      const mockResponse = { data: { id: 1, name: 'test-db' } };
      (servicesApi.postDatabase as jest.Mock).mockResolvedValue(mockResponse);

      await client.createDatabase('test-db');
      expect(servicesApi.postDatabase).toHaveBeenCalledWith('custom-token', 'test-db', false, 'production');
    });

    it('should call deleteDatabase method', async () => {
      const mockResponse = { data: { message: 'Database deleted' }, state: 'success' };
      (servicesApi.deleteDatabase as jest.Mock).mockResolvedValue(mockResponse);

      await client.deleteDatabase(1);
      expect(servicesApi.deleteDatabase).toHaveBeenCalledWith('custom-token', 1, false, 'production');
    });

    it('should call getDatabase method', async () => {
      const mockResponse = { results: [{ id: 1, name: 'test-db' }] };
      (servicesApi.getDatabases as jest.Mock).mockResolvedValue(mockResponse);
      if (client.getDatabase) {
        await client.getDatabase('test-db');
      }
      expect(servicesApi.getDatabases).toHaveBeenCalledWith(
        'custom-token',
        { search: 'test-db', page_size: 1 },
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
      (servicesApi.getDatabases as jest.Mock).mockResolvedValue(mockResponse);

      await client.getDatabases({ page: 1, page_size: 10 });
      expect(servicesApi.getDatabases).toHaveBeenCalledWith(
        'custom-token',
        { page: 1, page_size: 10 },
        false,
        'production',
      );
    });
  });

  describe('toJson method', () => {
    beforeAll(() => {
      jest.spyOn(console, 'log').mockImplementation();
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('should convert query execution response to JSON object', async () => {
      const mockResponse = {
        state: 'executed',
        data: [
          {
            results: {
              columns: ['id', 'name'],
              rows: [
                [1, 'test'],
                [2, 'example'],
              ],
            },
          },
        ],
      };
      const mockDBResponse = {
        count: 1,
        results: [
          {
            id: 0,
            name: 'db-1',
            status: 'created',
            active: true,
            last_modified: '2019-08-24T14:15:22Z',
            last_editor: 'string',
            product_version: 'string',
          },
        ],
      };
      (servicesApi.getDatabases as jest.Mock).mockResolvedValue(mockDBResponse);

      const resultDatabase = await getDatabase('db-1', { debug: mockDebug });
      (servicesApi.getDatabases as jest.Mock).mockResolvedValue(mockDBResponse);
      (servicesApi.postQueryDatabase as jest.Mock).mockResolvedValue(mockResponse);
      const result = await resultDatabase.data?.query(['SELECT * FROM test'], { debug: mockDebug });
      const toObjectResponse = result?.data?.toObject();
      expect(toObjectResponse).toEqual(
        expect.objectContaining({
          results: [
            {
              rows: [
                {
                  id: 1,
                  name: 'test',
                },
                {
                  id: 2,
                  name: 'example',
                },
              ],
              statement: 'SELECT',
            },
          ],
        }),
      );
    });
  });
});
