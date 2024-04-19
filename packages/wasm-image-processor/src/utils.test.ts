import { NO_EXTENSION_MSG } from './constants';
import { getFileExtension, isUrl, validateImageExtension } from './utils';

describe('WasmImageProcessor - Utils', () => {
  describe('isUrl function', () => {
    it('should return true for a valid URL', () => {
      expect(isUrl('https://www.example.com')).toBe(true);
      expect(isUrl('http://www.example.com')).toBe(true);
      expect(isUrl('ftp://example.com/file.txt')).toBe(true);
      expect(isUrl('file:///path/to/file.txt')).toBe(true);
    });

    it('should return false for an invalid URL', () => {
      expect(isUrl('not-a-url')).toBe(false);
      expect(isUrl('www.example.com')).toBe(false);
      expect(isUrl('/path/to/file.txt')).toBe(false);
      expect(isUrl('')).toBe(false);
      expect(isUrl(null)).toBe(false);
      expect(isUrl(undefined)).toBe(false);
    });
  });

  describe('getFileExtension function', () => {
    it('should return the correct file extension', () => {
      expect(getFileExtension('file.txt')).toBe('txt');
      expect(getFileExtension('path/to/file.txt')).toBe('txt');
      expect(getFileExtension('image.png')).toBe('png');
      expect(getFileExtension('file.tar.gz')).toBe('gz');
      expect(getFileExtension('archive.tar.gz')).toBe('gz');
    });

    it('should throw an error for paths without extensions', () => {
      expect(() => getFileExtension('file')).toThrowError(NO_EXTENSION_MSG);
      expect(() => getFileExtension('path/to/file')).toThrowError(NO_EXTENSION_MSG);
      expect(() => getFileExtension('/path/to/file')).toThrowError(NO_EXTENSION_MSG);
      expect(() => getFileExtension('')).toThrowError(NO_EXTENSION_MSG);
      expect(() => getFileExtension(null)).toThrowError(NO_EXTENSION_MSG);
      expect(() => getFileExtension(undefined)).toThrowError(NO_EXTENSION_MSG);
    });
  });

  describe('validateImageExtension function', () => {
    it('should not throw an error for valid image extensions', () => {
      expect(() => validateImageExtension('image.jpg')).not.toThrow();
      expect(() => validateImageExtension('path/to/image.png')).not.toThrow();
      expect(() => validateImageExtension('file.gif')).not.toThrow();
    });

    it('should throw an error for invalid image extensions', () => {
      expect(() => validateImageExtension('image.txt')).toThrowError(
        'Invalid image extension. Supported: jpg,jpeg,png,gif',
      );
      expect(() => validateImageExtension('path/to/image.mp4')).toThrowError(
        'Invalid image extension. Supported: jpg,jpeg,png,gif',
      );
    });
  });
});
