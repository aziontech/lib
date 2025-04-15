import { AzionBuild, defineConfig } from 'azion/config';
import webpack, { Configuration } from 'webpack';

export default defineConfig({
  build: {
    preset: 'rustwasm',
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
      name: 'worker',
      path: '.edge/functions/handler.js',
    },
  ],
  rules: {
    request: [
      {
        name: 'Execute Edge F nction',
        match: '^\\/',
        behavior: {
          runFunction: 'worker',
        },
      },
    ],
  },
});
