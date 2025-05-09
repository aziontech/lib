import type { AzionConfig } from 'azion/config';

const config: AzionConfig = {
  build: {
    bundler: 'esbuild',
    preset: 'jekyll',
    polyfills: false,
  },
  edgeApplication: [
    {
      name: 'jekyll-app',
      rules: {
        request: [
          {
            name: 'Deliver Static Assets',
            match: '^\\/',
            behavior: {
              deliver: true,
            },
          },
        ],
      },
    },
  ],
  workload: [
    {
      name: 'jekyll-workload',
      edgeApplication: 'jekyll-app',
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
      name: 'jekyll-storage',
      modules: {
        loadBalancerEnabled: false,
        originShieldEnabled: false,
      },
      type: 'edge_storage',
    },
  ],
};

export default config;
