import type { AzionBuild, AzionConfig } from 'azion/config';
import webpack, { Configuration } from 'webpack';

const config: AzionConfig = {
  build: {
    entry: 'handler.js',
    polyfills: false,
    bundler: 'webpack',
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
            name: 'Execute Edge Function',
            description: 'Execute edge function for all requests',
            active: true,
            criteria: [
              [
                {
                  variable: 'uri',
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
            ],
          },
        ],
      },
    },
  ],
};

export default config;
