import { defineConfig, type V3 } from '@aziontech/config';
import webpack, { Configuration } from 'webpack';

const config = defineConfig({
  version: 3,
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
  } as V3.AzionBuild,
  functions: [
    {
      name: 'my-emscripten-function',
      path: './functions/index.js',
    },
  ],
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
});

export default config;
