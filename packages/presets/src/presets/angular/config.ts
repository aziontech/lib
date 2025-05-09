import type { AzionConfig } from 'azion/config';

const config: AzionConfig = {
  build: {
    bundler: 'esbuild',
    preset: 'angular',
    polyfills: false,
  },
  edgeApplication: [
    {
      name: 'angular-app',
      edgeFunctionsEnabled: false,
      rules: {
        request: [
          {
            name: 'Deliver Static Assets',
            match: '.(css|js|ttf|woff|woff2|pdf|svg|jpg|jpeg|gif|bmp|png|ico|mp4|json|xml|html)$',
            behavior: {
              deliver: true,
            },
          },
          {
            name: 'Redirect to index.html',
            match: '^\\/',
            behavior: {
              rewrite: `/index.html`,
            },
          },
        ],
      },
    },
  ],
  workload: [
    {
      name: 'angular-workload',
      edgeApplication: 'angular-app',
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
      name: 'angular-storage',
      modules: {
        loadBalancerEnabled: false,
        originShieldEnabled: false,
      },
      type: 'edge_storage',
    },
  ],
};

export default config;
