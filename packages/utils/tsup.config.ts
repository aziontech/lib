import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/edge/index.ts', 'src/node/index.ts'],
  format: ['cjs', 'esm'],
  splitting: true,
  sourcemap: false,
  clean: true,
  bundle: true,
  dts: true,
  minify: true,
  minifyWhitespace: true,
  external: [
    './build/module',
    './.wasm-bindgen/azion_rust_edge_function',
    './.wasm-bindgen/azion_rust_edge_function_bg.wasm',
    'signale',
    'fs',
    'fs/promises',
    'path',
  ],
});
