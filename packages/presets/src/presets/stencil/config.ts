import type { AzionConfig } from 'azion/config';

const config: AzionConfig = {
  build: {
    bundler: 'esbuild',
    preset: 'stencil',
    polyfills: false,
  },
  edgeApplications: [
    {
      name: 'stencil-app',
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
      name: 'stencil-workload',
      edgeApplication: 'stencil-app',
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
      name: 'stencil-storage',
      modules: {
        loadBalancerEnabled: false,
        originShieldEnabled: false,
      },
      type: 'edge_storage',
    },
  ],
};

export default config;
