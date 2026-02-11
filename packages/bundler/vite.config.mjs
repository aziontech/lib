import { createViteConfig } from '@lib/vite-config';
import { resolve } from 'path';

export default createViteConfig({
  dirname: __dirname,
  ssr: true,
  alias: {
    'azion/unenv-preset': resolve(__dirname, '../unenv-preset/src/'),
    'azion/utils/node': resolve(__dirname, '../utils/src/node/'),
  },
  external: [
    '@edge-runtime/primitives',
    '@fastly/http-compute-js',
    '@lib/unenv-preset',
    'accepts',
    'browserify-zlib',
    'dotenv',
    'esbuild',
    'events',
    'inherits',
    'ip-cidr',
    'lodash-es',
    'mime',
    'mime-types',
    'stream-browserify',
    'stream-http',
    'string_decoder',
    'timers-browserify',
    'ts-loader',
    'unenv',
    'url',
    'util',
    'vm-browserify',
    'webpack',
  ],
  dts: {
    exclude: ['src/**/*.test.ts', 'src/polyfills/**/*'],
    aliasesExclude: [/^azion\//],
  },
});
