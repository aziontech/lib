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
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => {
        const ext = format === 'es' ? 'mjs' : 'cjs';
        return `${entryName}.${ext}`;
      },
    },
    rollupOptions: {
      external: ['ajv', 'ajv-errors', 'ajv-keywords', 'mathjs'],
      output: {
        exports: 'named',
      },
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
