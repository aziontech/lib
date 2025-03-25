/* eslint-disable no-param-reassign,class-methods-use-this */
import { createRequire } from 'module';
import { Compiler, WebpackPluginInstance } from 'webpack';

const require = createRequire(import.meta.url);

class BabelCustomLoaderPlugin implements WebpackPluginInstance {
  private preset: string;
  private presetsAllowed: string[];

  constructor(preset?: string, presetsAllowed?: string[]) {
    this.preset = preset || '';
    this.presetsAllowed = presetsAllowed || [];
  }

  apply(compiler: Compiler): void {
    const rules = compiler.options.module.rules || [];

    if (this.presetsAllowed.includes(this.preset)) {
      rules.push({
        test: /\.func.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: require.resolve('babel-loader'),
          options: {
            compact: false,
            plugins: [[require.resolve('@babel/plugin-proposal-optional-chaining-assign'), { version: '2023-07' }]],
          },
        },
      });
    }
    rules.push({
      test: /\.ts$/,
      exclude: /node_modules/,
      use: {
        loader: require.resolve('babel-loader'),
        options: {
          compact: false,
          presets: [
            [
              require.resolve('@babel/preset-env'),
              {
                targets: {
                  node: 'current',
                },
              },
            ],
            require.resolve('@babel/preset-typescript'),
          ],
        },
      },
    });
    compiler.options.module.rules = rules;
  }
}

export default BabelCustomLoaderPlugin;
