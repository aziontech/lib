import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';
import { deleteDatabase, getDatabases, postDatabase, postQueryDatabase, retrieveDatabase } from '.';
import * as fetchWithErrorHandling from '../../utils/fetch/index';

jest.mock('../../utils/fetch/index', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockedFetch = fetchWithErrorHandling.default as jest.MockedFunction<typeof fetchWithErrorHandling.default>;

describe('SQL API Service', () => {
  let originalConsoleLog: typeof console.log;

  beforeAll(() => {
    originalConsoleLog = console.log;
    console.log = jest.fn();
  });

  afterAll(() => {
    console.log = originalConsoleLog;
    jest.clearAllMocks();
  });

  describe('postDatabase', () => {
    it('should create a database successfully', async () => {
      const dbName = 'test_db';
      mockedFetch.mockResolvedValue({
        state: 'executed',
        data: {
          id: 0,
          name: dbName,
          status: 'creating',
          active: true,
          last_modified: '2019-08-24T14:15:22Z',
          last_editor: 'string',
          product_version: 'string',
        },
      });
      const result = await postDatabase('valid_token', dbName, true, 'production');
      expect(result).toEqual({
        state: 'executed',
        data: expect.objectContaining({
          id: 0,
          name: dbName,
          status: 'creating',
          active: true,
          last_editor: 'string',
          product_version: 'string',
        }),
      });
    });

    it('should create a database with error handling', async () => {
      const dbName = 'test_db';
      mockedFetch.mockResolvedValue({
        errors: [
          {
            status: 'str',
            code: 'strin',
            title: 'string',
            detail: 'error message',
            source: {
              pointer: 'string',
              parameter: 'string',
              header: 'string',
            },
            meta: null,
          },
        ],
      });
      const result = await postDatabase('valid_token', dbName, true, 'production');
      expect(result).toEqual({
        error: expect.objectContaining({
          message: 'error message',
          operation: 'post database',
        }),
      });
    });
  });

  describe('retrieveDatabase', () => {
    it('should retrieve a database successfully', async () => {
      mockedFetch.mockResolvedValue({
        data: {
          id: 0,
          name: 'test_db',
          status: 'creating',
          active: true,
          last_modified: '2019-08-24T14:15:22Z',
          last_editor: 'string',
          product_version: 'string',
        },
      });
      const result = await retrieveDatabase('valid_token', 1, true, 'production');
      expect(result).toEqual({
        data: {
          id: 0,
          name: 'test_db',
          status: 'creating',
          last_modified: '2019-08-24T14:15:22Z',
          active: true,
          last_editor: 'string',
          product_version: 'string',
        },
      });
    });

    it('should handle errors when retrieving a database', async () => {
      mockedFetch.mockResolvedValue({
        errors: [
          {
            status: 'str',
            code: 'strin',
            title: 'string',
            detail: 'error message',
            source: {
              pointer: 'string',
              parameter: 'string',
              header: 'string',
            },
            meta: null,
          },
        ],
      });
      const result = await retrieveDatabase('valid_token', 1, true, 'production');
      expect(result).toEqual({
        error: expect.objectContaining({
          message: 'error message',
          operation: 'retrieve database',
        }),
      });
    });
  });

  describe('deleteDatabase', () => {
    it('should delete a database successfully with state executed', async () => {
      mockedFetch.mockResolvedValue({
        state: 'executed',
      });
      const result = await deleteDatabase('valid_token', 1, true, 'production');
      expect(result).toEqual({
        state: 'executed',
      });
    });

    it('should delete a database successfully with state pending', async () => {
      mockedFetch.mockResolvedValue({
        state: 'pending',
      });
      const result = await deleteDatabase('valid_token', 1, true, 'production');
      expect(result).toEqual({
        state: 'pending',
      });
    });

    it('should handle errors when deleting a database', async () => {
      mockedFetch.mockResolvedValue({
        errors: [
          {
            status: 'str',
            code: 'strin',
            title: 'string',
            detail: 'error message',
            source: {
              pointer: 'string',
              parameter: 'string',
              header: 'string',
            },
            meta: null,
          },
        ],
      });
      const result = await deleteDatabase('valid_token', 1, true, 'production');
      expect(result).toEqual({
        error: expect.objectContaining({
          message: 'error message',
          operation: 'delete database',
        }),
      });
    });
  });

  describe('postQueryDatabase', () => {
    it('should execute a query successfully with state executed', async () => {
      mockedFetch.mockResolvedValue({
        state: 'executed',
        data: [
          {
            results: {
              columns: [null],
              rows: [null],
            },
          },
        ],
      });
      const result = await postQueryDatabase('valid_token', 1, ['SELECT * FROM test'], true, 'production');
      expect(result).toEqual({
        state: 'executed',
        data: [
          {
            results: {
              columns: [null],
              rows: [null],
            },
          },
        ],
      });
    });

    it('should execute a query successfully with state pending', async () => {
      mockedFetch.mockResolvedValue({
        state: 'pending',
        data: [
          {
            results: {
              columns: [null],
              rows: [null],
            },
          },
        ],
      });
      const result = await postQueryDatabase('valid_token', 1, ['SELECT * FROM test'], true, 'production');
      expect(result).toEqual({
        state: 'pending',
        data: [
          {
            results: {
              columns: [null],
              rows: [null],
            },
          },
        ],
      });
    });

    it('should handle errors when executing a query', async () => {
      mockedFetch.mockResolvedValue({
        errors: [
          {
            status: 'str',
            code: 'strin',
            title: 'string',
            detail: 'error message',
            source: {
              pointer: 'string',
              parameter: 'string',
              header: 'string',
            },
            meta: null,
          },
        ],
      });
      const result = await postQueryDatabase('valid_token', 1, ['SELECT * FROM test'], true, 'production');
      expect(result).toEqual({
        error: expect.objectContaining({
          message: 'error message',
          operation: 'post query',
        }),
      });
    });
  });

  describe('getDatabases', () => {
    it('should get all EdgeDBs successfully', async () => {
      mockedFetch.mockResolvedValue({
        count: 10,
        results: [
          {
            id: 0,
            name: 'string',
            status: 'created',
            active: true,
            last_modified: '2019-08-24T14:15:22Z',
            last_editor: 'string',
            product_version: 'string',
          },
        ],
      });
      const result = await getDatabases('valid_token', { search: 'test-db' }, true, 'production');
      expect(result).toEqual({
        count: 10,
        results: [
          {
            id: 0,
            name: 'string',
            status: 'created',
            active: true,
            last_modified: '2019-08-24T14:15:22Z',
            last_editor: 'string',
            product_version: 'string',
          },
        ],
      });
    });

    it('should handle errors when get EdgeDBs', async () => {
      mockedFetch.mockResolvedValue({
        errors: [
          {
            status: 'str',
            code: 'strin',
            title: 'string',
            detail: 'error message',
            source: {
              pointer: 'string',
              parameter: 'string',
              header: 'string',
            },
            meta: null,
          },
        ],
      });
      const result = await getDatabases('valid_token', { page: 2 }, true, 'production');
      expect(result).toEqual({
        error: expect.objectContaining({
          message: 'error message',
          operation: 'get databases',
        }),
      });
    });
  });
});
