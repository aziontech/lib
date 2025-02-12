import { defineConfig } from 'azion/config';

const config = defineConfig({
  build: {
    bundler: 'webpack',
    preset: 'emscripten',
    polyfills: false,
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

export default config;
