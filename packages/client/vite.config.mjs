import { createViteConfig } from '@lib/vite-config';
import { resolve } from 'path';

export default createViteConfig({
  dirname: __dirname,
  ssr: true,
  alias: {
    'azion/ai': resolve(__dirname, '../ai/src/'),
    'azion/sql': resolve(__dirname, '../sql/src/'),
    'azion/storage': resolve(__dirname, '../storage/src/'),
    'azion/purge': resolve(__dirname, '../purge/src/'),
    'azion/config': resolve(__dirname, '../config/src/'),
    'azion/domains': resolve(__dirname, '../domains/src/'),
    'azion/applications': resolve(__dirname, '../applications/src/'),
    'azion/types': resolve(__dirname, '../types/src/'),
    azion: resolve(__dirname, './src/'),
  },
  dts: {
    aliasesExclude: [/^azion\//],
  },
});
