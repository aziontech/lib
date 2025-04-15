import { defineConfig } from 'azion/config';

export default defineConfig({
  build: {
    preset: 'javascript',
    polyfills: true,
  },
  functions: [
    {
      name: 'handler',
      path: '.edge/functions/handler.js',
    },
  ],
  rules: {
    request: [
      {
        name: 'Execute Edge Function',
        match: '^\\/',
        behavior: {
          runFunction: 'handler',
        },
      },
    ],
  },
});
