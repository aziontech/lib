import type { AzionBuild, AzionConfig } from 'azion/config';

const config: AzionConfig = {
  build: {
    entry: '.open-next/worker.js',
    polyfills: true,
    bundler: 'esbuild',
    preset: 'opennextjs',
  } as AzionBuild,
  edgeStorage: [
    {
      name: '$BUCKET_NAME',
      prefix: '$BUCKET_PREFIX',
      dir: './.edge/assets',
      edgeAccess: 'read_write',
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
      path: './functions/worker.js',
      bindings: {
        storage: {
          bucket: '$BUCKET_NAME',
          prefix: '$BUCKET_PREFIX',
        },
      },
    },
  ],
  edgeApplications: [
    {
      name: '$EDGE_APPLICATION_NAME',
      rules: {
        request: [
          {
            name: 'Set storage origin for all requests _next_static',
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
                  argument: '.(css|js|ttf|woff|woff2|pdf|svg|jpg|jpeg|gif|bmp|png|ico|mp4|json)$',
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
            name: 'Execute Edge Function',
            description: 'Execute edge function for all requests',
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
      functionsInstances: [
        {
          name: '$EDGE_FUNCTION_INSTANCE_NAME',
          ref: '$EDGE_FUNCTION_NAME',
          args: {
            environment: 'production',
          },
        },
      ],
    },
  ],
  workloads: [
    {
      name: '$WORKLOAD_NAME',
      active: true,
      infrastructure: 1,
      protocols: {
        http: {
          versions: ['http1', 'http2'],
          httpPorts: [80],
          httpsPorts: [443],
          quicPorts: null,
        },
      },
      deployments: [
        {
          name: '$DEPLOYMENT_NAME',
          current: true,
          active: true,
          strategy: {
            type: 'default',
            attributes: {
              edgeApplication: '$EDGE_APPLICATION_NAME',
            },
          },
        },
      ],
    },
  ],
};

export default config;
