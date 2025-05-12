import type { AzionConfig } from 'azion/config';

const config: AzionConfig = {
  build: {
    bundler: 'esbuild',
    preset: 'qwik',
    polyfills: false,
  },
  edgeApplications: [
    {
      name: 'qwik-app',
      rules: {
        request: [
          {
            name: 'Deliver Static Assets',
            match: '^\\/',
            behavior: {
              setEdgeConnector: 'qwik-storage',
              deliver: true,
            },
          },
        ],
      },
    },
  ],
  edgeConnectors: [
    {
      name: 'qwik-storage',
      modules: {
        loadBalancerEnabled: false,
        originShieldEnabled: false,
      },
      type: 'edge_storage',
    },
  ],
};

export default config;
