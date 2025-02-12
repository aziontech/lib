import { defineConfig } from 'azion/config';

export default defineConfig({
  build: {
    preset: 'typescript',
    polyfills: true,
  },
  rules: {
    request: [
      {
        name: 'Execute Edge Function',
        match: '^\\/',
        behavior: {
          runFunction: {
            path: '.edge/worker.js',
          },
        },
      },
    ],
  },
});
