import { defineConfig } from 'azion/config';

export default defineConfig({
  build: {
    bundler: 'esbuild',
    preset: 'next',
    polyfills: true,
  },
  origin: [
    {
      name: 'origin-storage-default',
      type: 'object_storage',
    },
  ],
  functions: [
    {
      name: 'handler',
      path: '.edge/functions/handler.js',
    },
  ],
  rules: {
    request: [
      {
        name: 'Set Storage Origin for All Requests',
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
        match: '.(css|js|ttf|woff|woff2|pdf|svg|jpg|jpeg|gif|bmp|png|ico|mp4|json|xml|html)$',
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
});
