import type { BuildOptions } from 'esbuild';

export default {
  bundle: true,
  format: 'esm',
  platform: 'browser',
  mainFields: ['browser', 'module', 'main'],
  target: 'es2022',
  keepNames: true,
  allowOverwrite: true,
  loader: {
    '.js': 'js',
  },
  outdir: '.',
} as BuildOptions;
