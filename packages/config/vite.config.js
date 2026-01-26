import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  resolve: {
    alias: {
      'azion/unenv-preset': resolve(__dirname, '../unenv-preset/src/'),
      'azion/utils/node': resolve(__dirname, '../utils/src/node/'),
      'azion/bundler': resolve(__dirname, '../bundler/src/'),
    },
  },
  build: {
    ssr: true,
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        rules: resolve(__dirname, 'src/rules/index.ts'),
      },
    },
    rollupOptions: {
      external: ['ajv', 'ajv-errors', 'ajv-keywords', 'mathjs'],
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
      exclude: ['src/**/*.test.ts'],
      rollupTypes: true,
      aliasesExclude: [/^azion\//],
    }),
  ],
});
