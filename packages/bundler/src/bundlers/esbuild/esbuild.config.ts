import { Format, Loader, Platform } from 'esbuild';

export default {
  bundle: true,
  format: 'esm' as Format,
  platform: 'browser' as Platform,
  mainFields: ['browser', 'module', 'main'],
  target: 'es2022',
  loader: {
    '.js': 'js' as Loader,
  },
};
