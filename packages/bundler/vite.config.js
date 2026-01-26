import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  resolve: {
    alias: {
      'azion/unenv-preset': resolve(__dirname, '../unenv-preset/src/'),
      'azion/utils/node': resolve(__dirname, '../utils/src/node/'),
    },
  },
  build: {
    ssr: true,
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
      },
    },
    rollupOptions: {
      external: [
        '@edge-runtime/primitives',
        '@fastly/http-compute-js',
        '@lib/unenv-preset',
        'accepts',
        'browserify-zlib',
        'dotenv',
        'esbuild',
        'events',
        'inherits',
        'ip-cidr',
        'lodash-es',
        'mime',
        'mime-types',
        'stream-browserify',
        'stream-http',
        'string_decoder',
        'timers-browserify',
        'ts-loader',
        'unenv',
        'url',
        'util',
        'vm-browserify',
        'webpack',
      ],
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
  },
  plugins: [
    dts({
      include: ['src/**/*'],
      exclude: ['src/**/*.test.ts', 'src/polyfills/**/*'],
      rollupTypes: true,
      aliasesExclude: [/^azion\//],
    }),
  ],
});
