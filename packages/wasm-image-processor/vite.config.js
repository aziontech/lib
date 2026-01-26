import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import wasmPlugin from './src/vite/wasmPlugin';

export default defineConfig({
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
    wasmPlugin(),
    dts({
      include: ['src/**/*'],
      exclude: ['src/**/*.test.ts'],
      rollupTypes: true,
    }),
  ],
});
