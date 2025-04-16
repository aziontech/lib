import { defineConfig } from 'azion/config';

export default defineConfig({
  build: {
    entry: 'handler.ts',
    preset: 'typescript',
    polyfills: true,
  },
  functions: [
    {
      name: 'my-typescript-function',
      path: '.edge/functions/handler.js',
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
