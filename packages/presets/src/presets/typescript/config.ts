import { defineConfig } from 'azion/config';

export default defineConfig({
  build: {
    preset: 'typescript',
    polyfills: true,
  },
  functions: [
    {
      name: 'worker',
      path: '.edge/functions/handler.js',
    },
  ],
  rules: {
    request: [
      {
        name: 'Execute Edge Function',
        match: '^\\/',
        behavior: {
          runFunction: 'worker',
        },
      },
    ],
  },
});
