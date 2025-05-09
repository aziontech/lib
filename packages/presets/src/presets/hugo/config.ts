import type { AzionConfig } from 'azion/config';

const config: AzionConfig = {
  build: {
    bundler: 'esbuild',
    preset: 'hugo',
    polyfills: false,
  },
  edgeApplication: [
    {
      name: 'hugo-app',
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
      name: 'hugo-workload',
      edgeApplication: 'hugo-app',
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
      name: 'hugo-storage',
      modules: {
        loadBalancerEnabled: false,
        originShieldEnabled: false,
      },
      type: 'edge_storage',
    },
  ],
};

export default config;
