import type { AzionConfig } from 'azion/config';

const config: AzionConfig = {
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
  edgeApplication: [
    {
      name: 'typescript-app',
      rules: {
        request: [
          {
            name: 'Execute Edge Function',
            match: '^\\/',
            behavior: {
              runFunction: 'my-typescript-function',
              forwardCookies: true,
            },
          },
        ],
      },
    },
  ],
  workload: [
    {
      name: 'typescript-workload',
      edgeApplication: 'typescript-app',
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
