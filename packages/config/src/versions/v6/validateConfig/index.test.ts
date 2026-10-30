import { validateConfig } from '.';

describe('validateConfig (v6)', () => {
  describe('build', () => {
    it('accepts a complete build config', () => {
      expect(() =>
        validateConfig({
          version: 6,
          build: {
            bundler: 'esbuild',
            entry: { main: './src/index.js' },
            preset: 'next',
            polyfills: true,
            worker: false,
            memoryFS: { injectionDirs: ['./src/injected'], removePathPrefix: './src' },
          },
        }),
      ).not.toThrow();
    });

    it('accepts a preset declared as an object', () => {
      expect(() =>
        validateConfig({
          version: 6,
          build: {
            preset: { metadata: { name: 'custom' }, config: { version: 6, build: { bundler: 'esbuild' } } },
          },
        }),
      ).not.toThrow();
    });

    it('rejects an invalid bundler', () => {
      expect(() => validateConfig({ version: 6, build: { bundler: 'rollup' } })).toThrow(
        "The 'build.bundler' must be either 'webpack' or 'esbuild'",
      );
    });

    it('rejects unknown properties in build', () => {
      expect(() => validateConfig({ version: 6, build: { unknown: true } })).toThrow(
        "No additional properties are allowed in the 'build' object",
      );
    });

    it('rejects an invalid entry', () => {
      expect(() => validateConfig({ version: 6, build: { entry: 1 } })).toThrow(
        "The 'build.entry' must be a string, array of strings, or object with string values",
      );
    });
  });

  it('rejects properties the v6 schema does not know yet', () => {
    expect(() => validateConfig({ version: 6, applications: [] })).toThrow(
      'Config can only contain the following properties: version, build',
    );
  });

  it('rejects another version', () => {
    expect(() => validateConfig({ version: 4, build: {} })).toThrow();
  });
});
