import { createViteConfig } from '@aziontech/vite-config';
import { resolve } from 'path';

export default createViteConfig({
  dirname: __dirname,
  ssr: true,
  alias: {
    '@aziontech/ai': resolve(__dirname, '../ai/src/'),
    '@aziontech/sql': resolve(__dirname, '../sql/src/'),
    '@aziontech/storage': resolve(__dirname, '../storage/src/'),
    '@aziontech/purge': resolve(__dirname, '../purge/src/'),
    '@aziontech/config': resolve(__dirname, '../config/src/'),
    '@aziontech/domains': resolve(__dirname, '../domains/src/'),
    '@aziontech/applications': resolve(__dirname, '../applications/src/'),
    '@aziontech/types': resolve(__dirname, '../types/src/'),
    azion: resolve(__dirname, './src/'),
  },
  dts: {
    aliasesExclude: [/^azion\//],
  },
});
