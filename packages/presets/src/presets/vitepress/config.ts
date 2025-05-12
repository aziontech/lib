import type { AzionConfig } from 'azion/config';

const config: AzionConfig = {
  build: {
    bundler: 'esbuild',
    preset: 'vitepress',
    polyfills: false,
  },
  edgeApplications: [
    {
      name: 'vitepress-app',
      rules: {
        request: [
          {
            name: 'Set Storage Origin for All Requests',
            match: '^\\/',
            behavior: {
              setEdgeConnector: 'vitepress-storage',
            },
          },
          {
            name: 'Deliver Static Assets',
            match: '.(css|js|ttf|woff|woff2|pdf|svg|jpg|jpeg|gif|bmp|png|ico|mp4|json|xml|html)$',
            behavior: {
              setEdgeConnector: 'vitepress-storage',
              deliver: true,
            },
          },
          {
            name: 'Redirect to index.html',
            match: '.*/$',
            behavior: {
              // eslint-disable-next-line no-template-curly-in-string
              rewrite: '${uri}index.html',
            },
          },
          {
            name: 'Redirect to index.html for Subpaths',
            match: '^(?!.*\\/$)(?![\\s\\S]*\\.[a-zA-Z0-9]+$).*',
            behavior: {
              // eslint-disable-next-line no-template-curly-in-string
              rewrite: '${uri}/index.html',
            },
          },
        ],
      },
    },
  ],

  edgeConnectors: [
    {
      name: 'vitepress-storage',
      modules: {
        loadBalancerEnabled: false,
        originShieldEnabled: false,
      },
      type: 'edge_storage',
    },
  ],
};

export default config;
