import { defineConfig, type V3 } from '@aziontech/config';
import webpack, { Configuration } from 'webpack';

export default defineConfig({
  version: 3,
  build: {
    entry: 'index.js',
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
  } as V3.AzionBuild,
  origin: [
    {
      name: 'origin-storage-default',
      type: 'object_storage',
    },
  ],
  functions: [
    {
      name: 'my-rustwasm-function',
      path: './functions/index.js',
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
