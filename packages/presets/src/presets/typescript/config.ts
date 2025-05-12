import type { AzionConfig } from 'azion/config';

const config: AzionConfig = {
  build: {
    entry: 'handler.ts',
    preset: 'typescript',
    polyfills: true,
  },
  edgeFunctions: [
    {
      name: 'my-typescript-function',
      path: '.edge/functions/handler.js',
    },
  ],
  edgeApplications: [
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
};

export default config;
