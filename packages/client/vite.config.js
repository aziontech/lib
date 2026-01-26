import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  resolve: {
    alias: {
      'azion/ai': resolve(__dirname, '../ai/src/'),
      'azion/sql': resolve(__dirname, '../sql/src/'),
      'azion/storage': resolve(__dirname, '../storage/src/'),
      'azion/purge': resolve(__dirname, '../purge/src/'),
      'azion/config': resolve(__dirname, '../config/src/'),
      'azion/domains': resolve(__dirname, '../domains/src/'),
      'azion/applications': resolve(__dirname, '../applications/src/'),
      'azion/types': resolve(__dirname, '../types/src/'),
      azion: resolve(__dirname, './src/'),
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
      external: [],
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
