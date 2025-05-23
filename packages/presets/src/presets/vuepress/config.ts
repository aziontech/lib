import type { AzionConfig } from 'azion/config';

const config: AzionConfig = {
  build: {
    bundler: 'esbuild',
    preset: 'vuepress',
    polyfills: false,
  },
  edgeApplications: [
    {
      name: 'vuepress-app',
      rules: {
        request: [
          {
            name: 'Set Storage Origin for All Requests',
            match: '^\\/',
            behavior: {
              setEdgeConnector: 'vuepress-storage',
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
            name: 'Redirect to index.html',
            match: '^\\/',
            behavior: {
              rewrite: '/index.html',
            },
          },
        ],
      },
    },
  ],
  edgeConnectors: [
    {
      name: 'vuepress-storage',
      modules: {
        loadBalancerEnabled: false,
        originShieldEnabled: false,
      },
      type: 'edge_storage',
    },
  ],
};

export default config;
