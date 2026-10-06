import { defineConfig } from '@aziontech/config';

export default defineConfig({
  version: 3,
  build: {
    entry: 'index.js',
    preset: 'javascript',
    polyfills: true,
  },
  functions: [
    {
      name: 'my-javascript-function',
      path: './functions/index.js',
    },
  ],
  rules: {
    request: [
      {
        name: 'Execute Edge Function',
        match: '^\\/',
        behavior: {
          runFunction: 'my-javascript-function',
        },
      },
    ],
  },
});
