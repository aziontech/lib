import { defineConfig } from 'azion/config';

export default defineConfig({
  build: {
    entry: './index.ts',
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
