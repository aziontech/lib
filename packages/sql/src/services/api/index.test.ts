import { deleteEdgeDatabase, getEdgeDatabases, postEdgeDatabase, postQueryEdgeDatabase, retrieveEdgeDatabase } from '.';
import * as fetchWithErrorHandling from '../../utils/fetch/index';

jest.mock('../../utils/fetch/index', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('SQL API Service', () => {
  describe('postEdgeDatabase', () => {
    beforeAll(() => {
      jest.spyOn(console, 'log').mockImplementation();
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('should create a database successfully', async () => {
      const dbName = 'test_db';
      (fetchWithErrorHandling.default as jest.Mock).mockResolvedValue({
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
      const result = await postEdgeDatabase('valid_token', dbName, true, 'production');
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
      (fetchWithErrorHandling.default as jest.Mock).mockResolvedValue({
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
      const result = await postEdgeDatabase('valid_token', dbName, true, 'production');
      expect(result).toEqual({
        error: expect.objectContaining({
          message: 'error message',
          operation: 'post database',
        }),
      });
    });
  });

  describe('retrieveEdgeDatabase', () => {
    beforeAll(() => {
      jest.spyOn(console, 'log').mockImplementation();
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('should retrieve a database successfully', async () => {
      (fetchWithErrorHandling.default as jest.Mock).mockResolvedValue({
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
      const result = await retrieveEdgeDatabase('valid_token', 1, true, 'production');
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
      (fetchWithErrorHandling.default as jest.Mock).mockResolvedValue({
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
      const result = await retrieveEdgeDatabase('valid_token', 1, true, 'production');
      expect(result).toEqual({
        error: expect.objectContaining({
          message: 'error message',
          operation: 'retrieve database',
        }),
      });
    });
  });

  describe('deleteEdgeDatabase', () => {
    beforeAll(() => {
      jest.spyOn(console, 'log').mockImplementation();
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('should delete a database successfully with state executed', async () => {
      (fetchWithErrorHandling.default as jest.Mock).mockResolvedValue({
        state: 'executed',
      });
      const result = await deleteEdgeDatabase('valid_token', 1, true, 'production');
      expect(result).toEqual({
        state: 'executed',
      });
    });

    it('should delete a database successfully with state pending', async () => {
      (fetchWithErrorHandling.default as jest.Mock).mockResolvedValue({
        state: 'pending',
      });
      const result = await deleteEdgeDatabase('valid_token', 1, true, 'production');
      expect(result).toEqual({
        state: 'pending',
      });
    });

    it('should handle errors when deleting a database', async () => {
      (fetchWithErrorHandling.default as jest.Mock).mockResolvedValue({
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
      const result = await deleteEdgeDatabase('valid_token', 1, true, 'production');
      expect(result).toEqual({
        error: expect.objectContaining({
          message: 'error message',
          operation: 'delete database',
        }),
      });
    });
  });

  describe('postQueryEdgeDatabase', () => {
    beforeAll(() => {
      jest.spyOn(console, 'log').mockImplementation();
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('should execute a query successfully with state executed', async () => {
      (fetchWithErrorHandling.default as jest.Mock).mockResolvedValue({
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
      const result = await postQueryEdgeDatabase('valid_token', 1, ['SELECT * FROM test'], true, 'production');
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
      (fetchWithErrorHandling.default as jest.Mock).mockResolvedValue({
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
      const result = await postQueryEdgeDatabase('valid_token', 1, ['SELECT * FROM test'], true, 'production');
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
      (fetchWithErrorHandling.default as jest.Mock).mockResolvedValue({
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
      const result = await postQueryEdgeDatabase('valid_token', 1, ['SELECT * FROM test'], true, 'production');
      expect(result).toEqual({
        error: expect.objectContaining({
          message: 'error message',
          operation: 'post query',
        }),
      });
    });
  });

  describe('getEdgeDatabases', () => {
    beforeAll(() => {
      jest.spyOn(console, 'log').mockImplementation();
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('should get all EdgeDBs successfully', async () => {
      (fetchWithErrorHandling.default as jest.Mock).mockResolvedValue({
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
      const result = await getEdgeDatabases('valid_token', { search: 'test-db' }, true, 'production');
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
      (fetchWithErrorHandling.default as jest.Mock).mockResolvedValue({
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
      const result = await getEdgeDatabases('valid_token', { page: 2 }, true, 'production');
      expect(result).toEqual({
        error: expect.objectContaining({
          message: 'error message',
          operation: 'get databases',
        }),
      });
    });
  });
});
