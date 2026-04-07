import { Compiler, WebpackPluginInstance } from 'webpack';
import AzionLocalPolyfills from '../../../../helpers/azion-local-polyfills';
import { generateWebpackBanner } from './../../helpers';

type ExternalsType = { [key: string]: string };

class AzionPolyfillPlugin implements WebpackPluginInstance {
  private buildProd: boolean;
  private prefix: string;

  constructor(buildProd: boolean) {
    this.buildProd = buildProd;
    this.prefix = 'azion:';
  }

  apply(compiler: Compiler): void {
    if (!compiler.options.plugins?.length) {
      compiler.options.plugins = [];
    }

    // additional plugin to handle "node:" URIs
    compiler.options.plugins.push(
      new compiler.webpack.NormalModuleReplacementPlugin(new RegExp(`^${this.prefix}`), (resource) => {
        const mod = resource.request.replace(new RegExp(`^${this.prefix}`), '');
        resource.request = mod;
      }),
    );

    const filteredExternal = new Map<string, string>(
      [...AzionLocalPolyfills.external].filter(([key]) => {
        const hasPrefix = new RegExp(`^${this.prefix}`).test(key);
        return hasPrefix;
      }),
    );

    // build inject prefix (azion:) is not present and the polyfill is Azion
    if (!this.buildProd) {
      [...AzionLocalPolyfills.external].forEach(([key]) => {
        const hasPrefix = /^[^:]+:/.test(key);
        if (!hasPrefix && key?.toLowerCase()?.includes(this.prefix.replace(':', ''))) {
          const bannerContent = AzionLocalPolyfills.external.get(key);
          if (!bannerContent) {
            throw new Error(`Banner content not found for key: ${key}`);
          }
          compiler.options.plugins?.push(
            new compiler.webpack.BannerPlugin({
              banner: generateWebpackBanner([bannerContent]),
              raw: true,
            }),
          );
        }
      });
    }

    if (this.buildProd) {
      compiler.options.externals = {
        ...Object.fromEntries(
          [...filteredExternal].flatMap(([key]) => {
            return [
              [key, key],
              [`${this.prefix}${key}`, `${this.prefix}${key}`],
            ];
          }),
        ),
        ...((typeof compiler.options.externals === 'object' ? compiler.options.externals : {}) as ExternalsType),
      };
    } else {
      compiler.options.plugins?.push(
        new compiler.webpack.NormalModuleReplacementPlugin(new RegExp(`^${this.prefix}`), (resource) => {
          const mod = resource.request.replace(new RegExp(`^${this.prefix}`), '');
          resource.request = mod;
        }),
      );

      compiler.options.resolve = compiler.options.resolve || {};
      compiler.options.resolve.fallback = {
        ...Object.fromEntries(
          [...filteredExternal].map(([key, value]: [string, string]) => [
            key.replace(new RegExp(`^${this.prefix}`), ''),
            value,
          ]),
        ),
        ...compiler.options.resolve.fallback,
      };
    }
  }
}

export default AzionPolyfillPlugin;
