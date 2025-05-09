import type { AzionBuild, AzionConfig } from 'azion/config';
import webpack, { Configuration } from 'webpack';

const config: AzionConfig = {
  build: {
    entry: 'handler.ts',
    bundler: 'esbuild',
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
      name: 'my-emscripten-function',
      path: '.edge/functions/handler.js',
    },
  ],
  edgeApplication: [
    {
      name: 'emscripten-app',
      edgeFunctionsEnabled: true,
      rules: {
        request: [
          {
            name: 'Execute Edge Function',
            match: '^\\/',
            behavior: {
              runFunction: 'my-emscripten-function',
            },
          },
        ],
      },
    },
  ],
  workload: [
    {
      name: 'emscripten-workload',
      edgeApplication: 'emscripten-app',
      domains: [
        {
          domain: null,
          allowAccess: true,
        },
      ],
    },
  ],
};

export default config;
