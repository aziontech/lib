import { defineConfig } from '@aziontech/config';

export default defineConfig({
  version: 3,
  build: {
    entry: 'handler.ts',
    preset: 'typescript',
    polyfills: true,
  },
  functions: [
    {
      name: 'my-typescript-function',
      path: './functions/handler.js',
    },
  ],
  rules: {
    request: [
      {
        name: 'Execute Edge Function',
        match: '^\\/',
        behavior: {
          runFunction: 'my-typescript-function',
        },
      },
    ],
  },
});
