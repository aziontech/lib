import { AzionBuild, defineConfig } from 'azion/config';
import webpack, { Configuration } from 'webpack';

const config = defineConfig({
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
