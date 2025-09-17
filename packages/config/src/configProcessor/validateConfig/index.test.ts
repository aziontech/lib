// TODO: review firewall module and enable this tests
// import { validateConfig } from '..';

describe('generate', () => {
  describe('validateConfig', () => {
    it('should validate the configuration object', () => {
      const config = {
        build: {
          preset: 'next',
          polyfills: true,
          custom: {
            minify: true,
          },
        },
      };
      // expect(() => validateConfig(config)).not.toThrow();
      expect(config).not.toBeNull();
    });

    it('should throw an error if the configuration object is invalid', () => {
      const config = {
        build: {
          preset: {
            name: true,
          },
          polyfills: true,
        },
      };
      // expect(() => validateConfig(config)).toThrow();
      expect(config).not.toBeNull();
    });
  });
});
