import { AzionBuild, defineConfig } from 'azion/config';
import webpack, { Configuration } from 'webpack';

export default defineConfig({
  build: {
    entry: 'handler.ts',
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
        plugins: [
          new webpack.optimize.LimitChunkCountPlugin({
            maxChunks: 1,
          }),
        ],
      };
      return context;
    },
  } as AzionBuild,
  origin: [
    {
      name: 'origin-storage-default',
      type: 'object_storage',
    },
  ],
  functions: [
    {
      name: 'my-rustwasm-function',
      path: '.edge/functions/handler.js',
    },
  ],
  rules: {
    request: [
      {
        name: 'Execute Edge F nction',
        match: '^\\/',
        behavior: {
          runFunction: 'my-rustwasm-function',
        },
      },
    ],
  },
});
