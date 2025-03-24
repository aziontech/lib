import webpack, { Configuration } from 'webpack';

const config: Configuration = {
  experiments: {
    outputModule: true,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    mainFields: ['browser', 'module', 'main'],
  },
  mode: 'production',
  target: ['webworker', 'es2022'],
  plugins: [
    new webpack.ProgressPlugin(),
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
  ],
};

export default config;
