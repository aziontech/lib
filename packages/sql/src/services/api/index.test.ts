import { postEdgeDatabase, retrieveEdgeDatabase } from '.';
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
      const result = await retrieveEdgeDatabase('valid_token', 'test_db', true, 'production');
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
      const result = await retrieveEdgeDatabase('valid_token', 'test_db', true, 'production');
      expect(result).toEqual({
        error: expect.objectContaining({
          message: 'error message',
          operation: 'retrieve database',
        }),
      });
    });
  });
});
