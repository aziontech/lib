import type { AzionConfig } from 'azion/config';

const config: AzionConfig = {
  build: {
    entry: 'handler.ts',
    preset: 'javascript',
    polyfills: true,
  },
  edgeFunctions: [
    {
      name: 'my-javascript-function',
      path: '.edge/functions/handler.js',
    },
  ],
  edgeApplications: [
    {
      name: 'javascript-app',
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
    },
  ],
};

export default config;
