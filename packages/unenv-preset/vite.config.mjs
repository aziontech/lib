import { createViteConfig } from '@aziontech/vite-config';

export default createViteConfig({
  dirname: __dirname,
  ssr: true,
  external: [
    'crypto-browserify',
    'assert-browserify',
    'browserify-zlib',
    'string_decoder',
    'unenv',
    'url',
    'accepts',
    'timers-browserify',
  ],
});
