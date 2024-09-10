import { limitArraySize, resolveDebug, resolveToken } from './index';

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
});
