import type { AzionBuild, AzionConfigV6 } from '@aziontech/config';

const config: AzionConfigV6 = {
  version: 6,
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
  environments: [
    {
      name: '$ENVIRONMENT_NAME',
      deploymentPolicy: 'single_version',
    },
  ],
  // the application a deployment serves is set by the Azion CLI when it creates the release
  deployments: [
    {
      name: '$DEPLOYMENT_NAME',
      bindingPolicy: 'FLEXIBLE',
    },
  ],
  workloads: [
    {
      name: '$WORKLOAD_NAME',
      infrastructure: 1,
      bindings: [
        {
          environment: '$ENVIRONMENT_NAME',
          deployment: '$DEPLOYMENT_NAME',
        },
      ],
    },
  ],
};

export default config;
