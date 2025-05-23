import type { AzionConfig } from 'azion/config';

const config: AzionConfig = {
  build: {
    bundler: 'esbuild',
    preset: 'react',
    polyfills: false,
  },
  edgeApplications: [
    {
      name: 'react-app',
      rules: {
        request: [
          {
            name: 'Deliver Static Assets',
            match: '.(css|js|ttf|woff|woff2|pdf|svg|jpg|jpeg|gif|bmp|png|ico|mp4|json|xml|html)$',
            behavior: {
              setEdgeConnector: 'react-storage',
              deliver: true,
            },
          },
          {
            name: 'Redirect to index.html',
            match: '^\\/',
            behavior: {
              setEdgeConnector: 'react-storage',
              rewrite: '/index.html',
            },
          },
        ],
      },
    },
  ],

  edgeConnectors: [
    {
      name: 'react-storage',
      modules: {
        loadBalancerEnabled: false,
        originShieldEnabled: false,
      },
      type: 'edge_storage',
    },
  ],
};

export default config;
