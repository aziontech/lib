/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineConfig } from 'tsup';
import WasmPlugin from './src/esbuild/wasmPlugin';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  splitting: true,
  sourcemap: false,
  clean: true,
  bundle: true,
  dts: true,
  minify: true,
  minifyWhitespace: true,
  esbuildPlugins: [WasmPlugin],
  esbuildOptions(options: any, _context: any) {
    options.platform = 'browser';
  },
});
