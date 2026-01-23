import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  resolve: {
    alias: {
      'azion/unenv-preset': resolve(__dirname, '../unenv-preset/src/'),
      'azion/utils/edge': resolve(__dirname, '../utils/src/edge/'),
      'azion/utils/node': resolve(__dirname, '../utils/src/node/'),
      'azion/utils': resolve(__dirname, '../utils/src/'),
      'azion/config': resolve(__dirname, '../config/src/'),
      'azion/config/rules': resolve(__dirname, '../config/src/rules/'),
      'azion/presets': resolve(__dirname, '../presets/src/'),
      'azion/bundler': resolve(__dirname, '../bundler/src/'),
      'azion/types': resolve(__dirname, '../types/src/'),
    },
  },
  build: {
    ssr: true,
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => {
        if (format === 'cjs') return `${entryName}.cjs`;
        return `${entryName}.js`;
      },
    },
    rollupOptions: {
      external: (id) => {
        if (id.includes('node_modules')) return true;

        const deps = [
          './build/module',
          './.wasm-bindgen/azion_rust_edge_function.js',
          './.wasm-bindgen/azion_rust_edge_function_bg.wasm',
          'signale',
          'fast-glob',
          'mime-types',
          'fs',
          'fs/promises',
          'path',
          'cookie',
        ];

        return deps.some((dep) => id === dep || id.startsWith(`${dep}/`));
      },
      output: {
        exports: 'named',
      },
    },
    minify: true,
    sourcemap: false,
  },
  plugins: [
    dts({
      include: ['src/**/*', 'src/types.ts'],
      exclude: ['src/**/*.test.ts'],
      rollupTypes: true,
      aliasesExclude: [/^azion\//],
    }),
  ],
});
