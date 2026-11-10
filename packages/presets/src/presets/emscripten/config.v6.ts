import type { AzionBuild, AzionConfigV6 } from '@aziontech/config';
import webpack, { Configuration } from 'webpack';

const config: AzionConfigV6 = {
  version: 6,
  build: {
    entry: 'index.js',
    bundler: 'webpack',
    polyfills: false,
    extend: (context: Configuration) => {
      context = {
        ...context,
        optimization: {
          minimize: false,
        },
        performance: {
          maxEntrypointSize: 2097152,
          maxAssetSize: 2097152,
        },
        module: {
          rules: [
            {
              test: /\.wasm$/,
              type: 'asset/inline',
            },
          ],
        },
        plugins: [
          new webpack.optimize.LimitChunkCountPlugin({
            maxChunks: 1,
          }),
        ],
      };
      return context;
    },
  } as AzionBuild,
  functions: [
    {
      name: '$FUNCTION_NAME',
      path: './functions/index.js',
    },
  ],
  applications: [
    {
      name: '$APPLICATION_NAME',
      rules: {
        request: [
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
