import type { AzionConfig } from 'azion/config';

const config: AzionConfig = {
  build: {
    bundler: 'esbuild',
    preset: 'eleventy',
    polyfills: false,
  },
  edgeApplications: [
    {
      name: 'eleventy-app',
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
            match: '.*/$',
            behavior: {
              rewrite: '${uri}index.html',
            },
          },
          {
            name: 'Redirect to index.html for Subpaths',
            match: '^(?!.*\\/$)(?![\\s\\S]*\\.[a-zA-Z0-9]+$).*',
            behavior: {
              rewrite: '${uri}/index.html',
            },
          },
        ],
      },
    },
  ],
  edgeConnectors: [
    {
      name: 'eleventy-storage',
      modules: {
        loadBalancerEnabled: false,
        originShieldEnabled: false,
      },
      type: 'edge_storage',
    },
  ],
};

export default config;
