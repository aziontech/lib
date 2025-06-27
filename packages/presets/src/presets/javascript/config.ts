import { defineConfig } from 'azion/config';

export default defineConfig({
  build: {
    entry: 'handler.js',
    preset: 'javascript',
    polyfills: true,
  },
  functions: [
    {
      name: 'my-javascript-function',
      path: '.edge/functions/handler.js',
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
