import type { AzionConfig } from 'azion/config';
const config: AzionConfig = {
  build: {
    bundler: 'esbuild',
    polyfills: true,
  },
  edgeStorage: [
    {
      name: '$BUCKET_NAME',
      dir: '$LOCAL_BUCKET_DIR',
      edgeAccess: 'read_only',
    },
  ],
  edgeConnectors: [
    {
      name: '$EDGE_CONNECTOR_NAME',
      active: true,
      type: 'edge_storage',
      attributes: {
        bucket: '$BUCKET_NAME',
        prefix: '$BUCKET_PREFIX',
      },
    },
  ],
  edgeFunctions: [
    {
      name: '$EDGE_FUNCTION_NAME',
      path: '$LOCAL_FUNCTION_PATH',
    },
  ],
  edgeApplications: [
    {
      name: '$EDGE_APPLICATION_NAME',
      rules: {
        request: [
          {
            name: 'Next.js Static Assets',
            description: 'Serve Next.js static assets through edge connector',
            active: true,
            criteria: [
              [
                {
                  variable: '${uri}',
                  conditional: 'if',
                  operator: 'matches',
                  argument: '^/_next/static/',
                },
              ],
            ],
            behaviors: [
              {
                type: 'set_edge_connector',
                attributes: {
                  value: '$EDGE_CONNECTOR_NAME',
                },
              },
              {
                type: 'deliver',
              },
            ],
          },
          {
            name: 'Deliver Static Assets',
            description: 'Serve static assets through edge connector',
            active: true,
            criteria: [
              [
                {
                  variable: '${uri}',
                  conditional: 'if',
                  operator: 'matches',
                  argument: '.(css|js|ttf|woff|woff2|pdf|svg|jpg|jpeg|gif|bmp|png|ico|mp4|json|xml|html)$',
                },
              ],
            ],
            behaviors: [
              {
                type: 'set_edge_connector',
                attributes: {
                  value: '$EDGE_CONNECTOR_NAME',
                },
              },
              {
                type: 'deliver',
              },
            ],
          },
          {
            name: 'Execute Next.js Function',
            description: 'Execute Next.js edge function for all requests',
            active: true,
            criteria: [
              [
                {
                  variable: '${uri}',
                  conditional: 'if',
                  operator: 'matches',
                  argument: '^/',
                },
              ],
            ],
            behaviors: [
              {
                type: 'run_function',
                attributes: {
                  value: '$EDGE_FUNCTION_NAME',
                },
              },
              {
                type: 'forward_cookies',
              },
            ],
          },
        ],
      },
    },
  ],
};

export default config;
