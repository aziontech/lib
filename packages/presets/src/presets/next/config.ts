import type { AzionConfig } from 'azion/config';

const config: AzionConfig = {
  build: {
    bundler: 'esbuild',
    preset: 'next',
    polyfills: true,
  },
  functions: [
    {
      name: 'next-function',
      path: '.edge/functions/next-function.js',
    },
  ],
  edgeApplication: [
    {
      name: 'next-app',
      rules: {
        request: [
          {
            name: 'Next.js Static Assets',
            match: '^\\/_next\\/static\\/',
            behavior: {
              deliver: true,
            },
          },
          {
            name: 'Deliver Static Assets',
            match: '.(css|js|ttf|woff|woff2|pdf|svg|jpg|jpeg|gif|bmp|png|ico|mp4|json|xml|html)$',
            behavior: {
              deliver: true,
            },
          },
          {
            name: 'Execute Next.js Function',
            match: '^\\/',
            behavior: {
              runFunction: 'next-function',
              forwardCookies: true,
            },
          },
        ],
      },
    },
  ],
  workload: [
    {
      name: 'next-workload',
      edgeApplication: 'next-app',
      domains: [
        {
          domain: null,
          allowAccess: true,
        },
      ],
    },
  ],
  edgeConnectors: [
    {
      name: 'next-storage',
      modules: {
        loadBalancerEnabled: false,
        originShieldEnabled: false,
      },
      type: 'edge_storage',
    },
  ],
};

export default config;
