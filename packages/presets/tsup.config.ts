import fs from 'fs';
import path from 'path';
import { defineConfig } from 'tsup';

const presetDir = path.resolve(__dirname, 'src/presets');

const getPresetsEntries = () => {
  return fs
    .readdirSync(presetDir, { withFileTypes: true })
    .filter((dirent) => {
      // ckeck if is a directory and has a handler file inside
      return dirent.isDirectory() && fs.existsSync(path.join(presetDir, dirent.name, 'handler.ts'));
    })
    .reduce(
      (entries, dirent) => {
        const presetName = dirent.name;
        entries[`presets/${presetName}/handler`] = `src/presets/${presetName}/handler.ts`;
        return entries;
      },
      {} as Record<string, string>,
    );
};

export default defineConfig({
  entry: {
    ...getPresetsEntries(),
  },
  format: ['cjs', 'esm'],
  splitting: true,
  sourcemap: false,
  clean: false,
  bundle: true,
  dts: false,
  minifyWhitespace: true,
  external: [
    './build/module',
    './.wasm-bindgen/azion_rust_edge_function',
    './.wasm-bindgen/azion_rust_edge_function_bg.wasm',
    'signale',
    'fast-glob',
    'mime-types',
    'fs',
    'fs/promises',
    'path',
  ],
});
