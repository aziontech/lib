/* eslint-disable @typescript-eslint/no-explicit-any */
import { validateConfig } from '..';

describe('generate', () => {
  describe('validateConfig', () => {
    it('should validate the configuration object', () => {
      const config: any = {
        build: {
          bundler: 'esbuild',
          preset: 'next',
          polyfills: true,
        },
      };
      expect(() => validateConfig(config)).not.toThrow();
    });
    it('should throw an error if the configuration object is invalid', () => {
      const config: any = {
        build: {
          preset: {
            name: true,
          },
          polyfills: true,
        },
      };
      expect(() => validateConfig(config)).toThrow();
    });
  });
});
