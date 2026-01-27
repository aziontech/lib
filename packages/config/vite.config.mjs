import { createViteConfig } from '@lib/vite-config';
import { resolve } from 'path';

export default createViteConfig({
  dirname: __dirname,
  ssr: true,
  entry: {
    index: 'src/index.ts',
    rules: 'src/rules/index.ts',
  },
  alias: {
    'azion/unenv-preset': resolve(__dirname, '../unenv-preset/src/'),
    'azion/utils/node': resolve(__dirname, '../utils/src/node/'),
    'azion/bundler': resolve(__dirname, '../bundler/src/'),
  },
  external: ['ajv', 'ajv-errors', 'ajv-keywords', 'mathjs'],
  dts: {
    aliasesExclude: [/^azion\//],
  },
});
