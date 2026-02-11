import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

/**
 * Creates a Vite config for library packages
 * @param {Object} options - Configuration options
 * @param {string} options.dirname - __dirname of the package
 * @param {Object|string} [options.entry] - Entry points (default: { index: 'src/index.ts' })
 * @param {Object} [options.alias] - Resolve aliases
 * @param {Array|Function} [options.external] - External dependencies
 * @param {boolean} [options.ssr] - Enable SSR mode (default: false)
 * @param {Object} [options.dts] - DTS plugin options override
 * @param {boolean} [options.sourcemap] - Enable sourcemap (default: false)
 * @param {Object} [options.buildOptions] - Additional build options
 * @returns {import('vite').UserConfig}
 */
export function createViteConfig(options) {
  const {
    dirname,
    entry = { index: resolve(dirname, 'src/index.ts') },
    alias = {},
    external = [],
    ssr = false,
    dts: dtsOptions = {},
    sourcemap = false,
    buildOptions = {},
  } = options;

  const normalizedEntry = typeof entry === 'string' 
    ? { index: resolve(dirname, entry) }
    : Object.entries(entry).reduce((acc, [key, value]) => {
        acc[key] = resolve(dirname, value);
        return acc;
      }, {});

  const defaultDtsOptions = {
    include: ['src/**/*'],
    exclude: ['src/**/*.test.ts'],
    rollupTypes: true,
    ...dtsOptions,
  };

  return defineConfig({
    resolve: Object.keys(alias).length > 0 ? { alias } : undefined,
    build: {
      ...(ssr && { ssr: true }),
      lib: {
        entry: normalizedEntry,
      },
      rollupOptions: {
        external,
        output: [
          {
            format: 'es',
            entryFileNames: '[name].mjs',
          },
          {
            format: 'cjs',
            entryFileNames: '[name].cjs',
            exports: 'named',
          },
        ],
      },
      minify: true,
      sourcemap,
      ...buildOptions,
    },
    plugins: [dts(defaultDtsOptions)],
  });
}
