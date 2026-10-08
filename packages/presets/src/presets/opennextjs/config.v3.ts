import type { AzionConfigV3, V3 } from '@aziontech/config';

const config: AzionConfigV3 = {
  version: 3,
  build: {
    entry: '.open-next/worker.js',
    polyfills: true,
    bundler: 'esbuild',
    preset: 'opennextjs',
  } as V3.AzionBuild,
  origin: [
    {
      name: 'origin-storage-default',
      type: 'object_storage',
    },
  ],
  functions: [
    {
      name: 'handler',
      path: './functions/worker.js',
    },
  ],
  rules: {
    request: [
      {
        name: 'Set storage origin for all requests _next_static',
        match: '^\\/_next\\/static\\/', // starts with '/_next/static/'
        behavior: {
          setOrigin: {
            name: 'origin-storage-default',
            type: 'object_storage',
          },
          deliver: true,
        },
      },
      {
        name: 'Deliver Static Assets',
        match: '.(css|js|ttf|woff|woff2|pdf|svg|jpg|jpeg|gif|bmp|png|ico|mp4|json)$',
        behavior: {
          setOrigin: {
            name: 'origin-storage-default',
            type: 'object_storage',
          },
          deliver: true,
        },
      },
      {
        name: 'Execute Edge Function',
        match: '^/',
        behavior: {
          runFunction: 'handler',
          forwardCookies: true,
        },
      },
    ],
  },
};

export default config;
