import { defineConfig } from 'azion/config';

export default defineConfig({
  build: {
    bundler: 'esbuild',
    preset: 'svelte',
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
        name: 'Execute SvelteKit Function when starts with /_app/immutable',
        description: 'Handle SvelteKit immutable assets requests',
        criteria: [
          {
            variable: '${uri}',
            operator: 'starts_with',
            conditional: 'if',
            inputValue: '/_app/immutable',
          },
        ],
        behavior: {
          setOrigin: {
            name: 'origin-storage-default',
            type: 'object_storage',
          },
          deliver: true,
        },
      },
      {
        name: 'Redirect to index.html for Subpaths',
        match: '^(?!.*/$)(?![sS]*.[a-zA-Z0-9]+$).*',
        behavior: {
          // eslint-disable-next-line no-template-curly-in-string
          rewrite: '${uri}/index.html',
        },
      },
      {
        name: 'Redirect to index.html',
        match: '.*/$',
        behavior: {
          // eslint-disable-next-line no-template-curly-in-string
          rewrite: '${uri}index.html',
        },
      },
      {
        name: 'Deliver Static Assets',
        match: '.(css|js|ttf|woff|woff2|pdf|svg|jpg|jpeg|gif|bmp|png|ico|mp4|xml|html)$',
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
