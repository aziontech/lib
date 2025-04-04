import type { BuildOptions } from 'esbuild';

export default {
  bundle: true,
  format: 'esm',
  platform: 'browser',
  mainFields: ['browser', 'module', 'main'],
  target: 'es2022',
  loader: {
    '.js': 'js',
  },
  outdir: '.',
} as BuildOptions;
