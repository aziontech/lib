import type { AzionConfig } from 'azion/config';

const config: AzionConfig = {
  build: {
    bundler: 'esbuild',
    preset: 'html',
    polyfills: false,
  },
  edgeApplications: [
    {
      name: 'html-app',
      rules: {
        request: [
          {
            name: 'Deliver Static Assets',
            match: '^\\/',
            behavior: {
              setEdgeConnector: 'html-storage',
              deliver: true,
            },
          },
        ],
      },
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
