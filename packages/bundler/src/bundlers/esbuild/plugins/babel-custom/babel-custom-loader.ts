import { Plugin, PluginBuild } from 'esbuild';
import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

/**
 * ESBuild Babel Custom Loader Plugin - mirrors webpack babel-custom-loader
 * Handles optional chaining assignment transformation for .func files
 */
const BabelCustomLoaderPlugin = (): Plugin => {
  const NAME = 'babel-custom-loader';

  return {
    name: NAME,
    setup(build: PluginBuild) {
      // Process .func.js files (same as webpack)
      build.onLoad({ filter: /\.func\.m?js$/ }, async (args) => {
        const contents = await fs.promises.readFile(args.path, 'utf8');

        // Quick check if contains optional chaining assignment
        if (!contents.includes('?.') || !/\?\.\s*\w+\s*=/.test(contents)) {
          return null;
        }

        try {
          // Use same babel plugin as webpack
          const babel = require('@babel/core');
          const result = babel.transformSync(contents, {
            filename: args.path,
            plugins: [[require('@babel/plugin-proposal-optional-chaining-assign'), { version: '2023-07' }]],
            compact: false,
            sourceMaps: false,
          });

          if (result?.code && result.code !== contents) {
            return {
              contents: result.code,
              loader: 'js',
            };
          }
        } catch (error) {
          console.warn(`Babel custom loader failed for ${args.path}:`, error);
        }

        return null;
      });

      // Process .ts files (same as webpack)
      build.onLoad({ filter: /\.ts$/, namespace: 'babel-custom' }, async (args) => {
        const contents = await fs.promises.readFile(args.path, 'utf8');

        try {
          const babel = require('@babel/core');
          const result = babel.transformSync(contents, {
            filename: args.path,
            compact: false,
            presets: [
              [
                require('@babel/preset-env'),
                {
                  targets: {
                    node: 'current',
                  },
                },
              ],
              require('@babel/preset-typescript'),
            ],
          });

          if (result?.code) {
            return {
              contents: result.code,
              loader: 'js',
            };
          }
        } catch (error) {
          console.warn(`Babel TypeScript transform failed for ${args.path}:`, error);
        }

        return null;
      });
    },
  };
};

export default BabelCustomLoaderPlugin;
