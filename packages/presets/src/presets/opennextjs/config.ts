import type { AzionBuild, AzionConfig } from 'azion/config';

const config: AzionConfig = {
  build: {
    entry: '.open-next/worker.js',
    polyfills: true,
    bundler: 'esbuild',
    preset: 'opennextjs',
  } as AzionBuild,
  storage: [
    {
      name: '$BUCKET_NAME',
      prefix: '$BUCKET_PREFIX',
      dir: './.edge/assets',
      workloadsAccess: 'read_write',
    },
  ],
  connectors: [
    {
      name: '$CONNECTOR_NAME',
      active: true,
      type: 'storage',
      attributes: {
        bucket: '$BUCKET_NAME',
        prefix: '$BUCKET_PREFIX',
      },
    },
  ],
  functions: [
    {
      name: '$FUNCTION_NAME',
      path: './functions/worker.js',
      bindings: {
        storage: {
          bucket: '$BUCKET_NAME',
          prefix: '$BUCKET_PREFIX',
        },
      },
    },
  ],
  applications: [
    {
      name: '$APPLICATION_NAME',
      cache: [
        {
          name: '$APPLICATION_NAME',
          browser: {
            maxAgeSeconds: 7200,
          },
          edge: {
            maxAgeSeconds: 7200,
          },
        },
      ],
      rules: {
        request: [
          {
            name: 'Set storage origin for all requests _next_static and set cache policy',
            description: 'Serve Next.js static assets through edge connector and set cache policy',
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
                type: 'set_connector',
                attributes: {
                  value: '$CONNECTOR_NAME',
                },
              },
              {
                type: 'set_cache_policy',
                attributes: {
                  value: '$APPLICATION_NAME',
                },
              },
              {
                type: 'deliver',
              },
            ],
          },
          {
            name: 'Deliver Static Assets and set cache policy',
            description: 'Serve static assets through edge connector and set cache policy',
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
                type: 'set_connector',
                attributes: {
                  value: '$CONNECTOR_NAME',
                },
              },
              {
                type: 'set_cache_policy',
                attributes: {
                  value: '$APPLICATION_NAME',
                },
              },
              {
                type: 'deliver',
              },
            ],
          },
          {
            name: 'Execute Function',
            description: 'Execute function for all requests',
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
                  value: '$FUNCTION_NAME',
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
          name: '$FUNCTION_INSTANCE_NAME',
          ref: '$FUNCTION_NAME',
        },
      ],
    },
  ],
  workloads: [
    {
      name: '$WORKLOAD_NAME',
      active: true,
      infrastructure: 1,
      deployments: [
        {
          name: '$DEPLOYMENT_NAME',
          current: true,
          active: true,
          strategy: {
            type: 'default',
            attributes: {
              application: '$APPLICATION_NAME',
            },
          },
        },
      ],
    },
  ],
};

export default config;
