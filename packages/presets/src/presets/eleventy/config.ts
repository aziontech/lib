import { defineConfig } from 'azion/config';

const config = defineConfig({
  build: {
    bundler: 'esbuild',
    preset: 'eleventy',
    polyfills: false,
  },
  origin: [
    {
      name: 'origin-storage-default',
      type: 'object_storage',
    },
  ],
  rules: {
    request: [
      {
        name: 'Set Storage Origin for All Requests',
        match: '^\\/',
        behavior: {
          setOrigin: {
            name: 'origin-storage-default',
            type: 'object_storage',
          },
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
        name: 'Redirect to index.html',
        match: '.*/$',
        behavior: {
          rewrite: '${uri}index.html',
        },
      },
      {
        name: 'Redirect to index.html for Subpaths',
        match: '^(?!.*\\/$)(?![\\s\\S]*\\.[a-zA-Z0-9]+$).*',
        behavior: {
          rewrite: '${uri}/index.html',
        },
      },
    ],
  },
});

export default config;
