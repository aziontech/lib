import { fetchWithErrorHandling, limitArraySize, resolveDebug, resolveToken } from './index';

global.fetch = jest.fn();

describe('Utils', () => {
  describe('resolveToken', () => {
    const mockToken = 'mockToken';
    beforeEach(() => {
      process.env.AZION_TOKEN = mockToken;
    });
    it('should successfully resolveToken by env', () => {
      const result = resolveToken();
      expect(result).toEqual(mockToken);
    });

    it('should successfully resolveToken by parameter', () => {
      const token = 'token-param';
      const result = resolveToken(token);
      expect(result).toEqual(token);
    });

    it('should successfully resolveToken with parameter empty', () => {
      process.env.AZION_TOKEN = '';
      const result = resolveToken('');
      expect(result).toEqual('');
    });

    it('should if no token is provided and AZION_TOKEN is not set', () => {
      delete process.env.AZION_TOKEN;
      const result = resolveToken();
      expect(result).toBe('');
    });
  });

  describe('resolveDebug', () => {
    afterEach(() => {
      delete process.env.AZION_DEBUG;
    });

    it('should return true when debug is not provided and AZION_DEBUG is true', () => {
      process.env.AZION_DEBUG = 'true';
      const result = resolveDebug();
      expect(result).toBe(true);
    });

    it('should return false when debug is not provided and AZION_DEBUG is false', () => {
      process.env.AZION_DEBUG = 'false';
      const result = resolveDebug();
      expect(result).toBe(false);
    });

    it('should return true when debug is true', () => {
      const result = resolveDebug(true);
      expect(result).toBe(true);
    });

    it('should return false when debug is false', () => {
      const result = resolveDebug(false);
      expect(result).toBe(false);
    });

    it('should return false when debug is not provided and AZION_DEBUG is not set', () => {
      const result = resolveDebug();
      expect(result).toBe(false);
    });

    it('should return true when debug is true and AZION_DEBUG is false', () => {
      process.env.AZION_DEBUG = 'false';
      const result = resolveDebug(true);
      expect(result).toBe(true);
    });

    it('should return false when debug is false and AZION_DEBUG is true', () => {
      process.env.AZION_DEBUG = 'true';
      const result = resolveDebug(false);
      expect(result).toBe(false);
    });

    it('should return true when debug is true and AZION_DEBUG is true', () => {
      process.env.AZION_DEBUG = 'true';
      const result = resolveDebug(true);
      expect(result).toBe(true);
    });
  });

  describe('LimitArraySize', () => {
    it('should return the same array if it is smaller than the limit', () => {
      const mockArray = [1, 2, 3];
      const result = limitArraySize(mockArray, 4);
      expect(result).toEqual(mockArray);
    });

    it('should return a limited array if it is bigger than the limit', () => {
      const mockArray = [1, 2, 3];
      const result = limitArraySize(mockArray, 2);
      expect(result).toEqual([1, 2]);
    });

    it('should return an empty array if the input is empty', () => {
      const mockArray: number[] = [];
      const result = limitArraySize(mockArray, 2);
      expect(result).toEqual([]);
    });
  });

  describe('fetchWithErrorHandling', () => {
    const URL = 'https://example.com';

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return JSON data when jsonResponse is true, the fetch is successful and the response is JSON', async () => {
      const mockResponseData = { message: 'Success' };
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockResponseData),
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await fetchWithErrorHandling(URL);

      expect(result).toEqual(mockResponseData);
      expect(fetch).toHaveBeenCalledWith(URL, undefined);
    });

    it('should throw an error if the fetch response is NOT ok', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(fetchWithErrorHandling(URL)).rejects.toThrow('HTTP error! Status: 404 - Not Found');

      expect(fetch).toHaveBeenCalledWith(URL, undefined);
    });

    it('should throw an error if jsonResponse is true but response is NOT JSON', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        text: jest.fn().mockResolvedValue('Not JSON'),
        headers: {
          get: jest.fn().mockReturnValue('text/html'),
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(fetchWithErrorHandling(URL)).rejects.toThrow('Expected JSON response, but got: Not JSON');

      expect(fetch).toHaveBeenCalledWith(URL, undefined);
    });

    it('should return text data when jsonResponse is false, the fetch is successful and the response is NOT JSON', async () => {
      const mockResponseData = 'Some plain text.';
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        text: jest.fn().mockResolvedValue(mockResponseData),
        headers: {
          get: jest.fn().mockReturnValue('text/plain'),
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await fetchWithErrorHandling(URL, undefined, false, false);

      expect(result).toEqual(mockResponseData);
      expect(fetch).toHaveBeenCalledWith(URL, undefined);
    });

    it('should throw an error if fetch response is not ok and jsonResponse is false', async () => {});

    it('should log an error if debug is enabled and fetch response is not ok', async () => {
      const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();

      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(fetchWithErrorHandling(URL, undefined, true)).rejects.toThrow(
        'HTTP error! Status: 500 - Internal Server Error',
      );

      expect(mockConsoleLog).toHaveBeenCalledWith('Error in fetch: HTTP error! Status: 500 - Internal Server Error');

      mockConsoleLog.mockRestore();
    });

    it('should log an error if debug is enabled and response is not JSON', async () => {
      const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();

      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        text: jest.fn().mockReturnValue('Not JSON'),
        headers: {
          get: jest.fn().mockReturnValue('text/html'),
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(fetchWithErrorHandling(URL, undefined, true)).rejects.toThrow(
        'Expected JSON response, but got: Not JSON',
      );

      expect(mockConsoleLog).toHaveBeenCalledWith('Error in fetch: Expected JSON response, but got: Not JSON');

      mockConsoleLog.mockRestore();
    });
  });
});
