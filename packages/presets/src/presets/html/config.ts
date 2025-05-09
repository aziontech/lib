import type { AzionConfig } from 'azion/config';

const config: AzionConfig = {
  build: {
    bundler: 'esbuild',
    preset: 'html',
    polyfills: false,
  },
  edgeApplication: [
    {
      name: 'html-app',
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
      name: 'html-workload',
      edgeApplication: 'html-app',
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
      name: 'html-storage',
      modules: {
        loadBalancerEnabled: false,
        originShieldEnabled: false,
      },
      type: 'edge_storage',
    },
  ],
};

export default config;
