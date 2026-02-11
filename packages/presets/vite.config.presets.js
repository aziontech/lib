import fs from 'fs';
import { resolve } from 'path';
import { defineConfig } from 'vite';

const presetDir = resolve(__dirname, 'src/presets');

const getPresetsEntries = () => {
  return fs
    .readdirSync(presetDir, { withFileTypes: true })
    .filter((dirent) => {
      // ckeck if is a directory and has a handler file inside
      return dirent.isDirectory() && fs.existsSync(resolve(presetDir, dirent.name, 'handler.ts'));
    })
    .reduce((entries, dirent) => {
      const presetName = dirent.name;
      entries[`presets/${presetName}/handler`] = resolve(__dirname, `src/presets/${presetName}/handler.ts`);
      return entries;
    }, {});
};

export default defineConfig({
  resolve: {
    alias: {
      'azion/unenv-preset': resolve(__dirname, '../unenv-preset/src/'),
      'azion/utils/edge': resolve(__dirname, '../utils/src/edge/'),
      'azion/utils/node': resolve(__dirname, '../utils/src/node/'),
      'azion/utils': resolve(__dirname, '../utils/src/'),
      'azion/config/rules': resolve(__dirname, '../config/src/rules/'),
      'azion/config': resolve(__dirname, '../config/src/'),
      'azion/presets': resolve(__dirname, '../presets/src/'),
      'azion/bundler': resolve(__dirname, '../bundler/src/'),
      'azion/types': resolve(__dirname, '../types/src/'),
    },
  },
  build: {
    ssr: true,
    emptyOutDir: false,
    lib: {
      entry: {
        ...getPresetsEntries(),
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
        ];

        return deps.some((dep) => id === dep || id.startsWith(`${dep}/`));
      },
      output: [
        {
          format: 'es',
          entryFileNames: '[name].js',
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
});
