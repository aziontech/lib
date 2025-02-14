import { defineConfig } from 'azion/config';
import webpack from 'webpack';

const config = defineConfig({
  build: {
    builder: 'webpack',
    polyfills: false,
    custom: {
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
    },
  },
  rules: {
    request: [
      {
        name: 'Execute Edge Function',
        match: '^\\/',
        behavior: {
          runFunction: {
            path: '.edge/worker.js',
          },
        },
      },
    ],
  },
});

export default config;
