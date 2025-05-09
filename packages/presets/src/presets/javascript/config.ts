import type { AzionConfig } from 'azion/config';

const config: AzionConfig = {
  build: {
    entry: 'handler.ts',
    preset: 'javascript',
    polyfills: true,
  },
  functions: [
    {
      name: 'my-javascript-function',
      path: '.edge/functions/handler.js',
    },
  ],
  edgeApplication: [
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
  workload: [
    {
      name: 'javascript-workload',
      edgeApplication: 'javascript-app',
      domains: [
        {
          domain: null,
          allowAccess: true,
        },
      ],
    },
  ],
};

export default config;
