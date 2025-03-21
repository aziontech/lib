import fs from 'fs';
import { createRequire } from 'module';
import { join } from 'path';
import webpack, { Configuration } from 'webpack';

const require = createRequire(import.meta.url);

/**
 * Define the loader typescript rules if the tsconfig.json file exists
 * @returns {import('webpack').Configuration} - Module rules
 */
const defineLoaderTypescriptRules = () => {
  const tsConfigPath = join(process.cwd(), 'tsconfig.json');
  const tsConfigExist = fs.existsSync(tsConfigPath);

  if (tsConfigExist) {
    return {
      module: {
        rules: [
          {
            test: /\.ts?$/,
            use: [
              {
                loader: require.resolve('ts-loader'),
                options: {
                  transpileOnly: true,
                },
              },
            ],
            exclude: /node_modules/,
          },
        ],
      },
    };
  }
  return { module: {} };
};

const config: Configuration = {
  experiments: {
    outputModule: true,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    mainFields: ['browser', 'module', 'main'],
  },
  ...defineLoaderTypescriptRules(),
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
