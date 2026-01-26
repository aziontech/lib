import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    ssr: true,
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        edge: resolve(__dirname, 'src/edge/index.ts'),
        node: resolve(__dirname, 'src/node/index.ts'),
      },
    },
    rollupOptions: {
      external: ['signale'],
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
    }),
  ],
});
