import { pipe } from 'lodash/fp';
import webpack, { Configuration } from 'webpack';
import {
  applyDefineVars,
  createBaseBundler,
  createBundlerPlugins,
  getBannerContent,
  getOutputFilename,
} from '../../helpers/bundler-utils';
import { BuildEnv, bundlerConfig, WebpackConfiguration, WebpackPluginClasses } from '../../types/bundler';
import AzionPolyfillPlugin from './plugins/azion-polyfills';
import BabelCustomLoaderPlugin from './plugins/babel-custom/babel-custom-loader';
import NodePolyfillPlugin from './plugins/node-polyfills';
import AzionWebpackConfig from './webpack.config';

// Create webpack-specific plugins
const bundlerPlugins = createBundlerPlugins<WebpackPluginClasses, WebpackConfiguration>({
  NodePolyfillsPlugin: NodePolyfillPlugin,
  AzionPolyfillsPlugin: AzionPolyfillPlugin,
});

/**
 * Webpack-specific content injection
 */
const applyContentInjection =
  (config: Configuration) =>
  (content: string | undefined): Configuration => {
    if (!content) return config;

    const updatedConfig = { ...config };
    const bannerPluginIndex =
      updatedConfig.plugins?.findIndex(
        (plugin): plugin is webpack.BannerPlugin => plugin instanceof webpack.BannerPlugin,
      ) ?? -1;

    if (bannerPluginIndex !== -1 && updatedConfig.plugins) {
      const oldContent = (updatedConfig.plugins[bannerPluginIndex] as webpack.BannerPlugin).options.banner;
      updatedConfig.plugins = updatedConfig.plugins.filter((_, index) => index !== bannerPluginIndex);
      updatedConfig.plugins.push(
        new webpack.BannerPlugin({
          banner: `${oldContent} ${content}`,
          raw: true,
        }),
      );
    } else {
      updatedConfig.plugins = [
        ...(updatedConfig.plugins || []),
        new webpack.BannerPlugin({
          banner: content,
          raw: true,
        }),
      ];
    }

    return updatedConfig;
  };

interface WebpackBundler {
  baseConfig: WebpackConfiguration;
  mergeConfig: (config: WebpackConfiguration) => WebpackConfiguration;
  applyConfig: (config: WebpackConfiguration) => WebpackConfiguration;
}

/**
 * Creates Webpack bundler instance
 */
export const createAzionWebpackConfig = (builderConfig: bundlerConfig, ctx: BuildEnv): WebpackBundler => {
  const bundler = createBaseBundler<WebpackConfiguration>(builderConfig, ctx, [
    (config: WebpackConfiguration) => bundlerPlugins.applyPolyfills(ctx)(config)(builderConfig),
    (config: WebpackConfiguration) => bundlerPlugins.applyAzionModule(ctx)(config) as WebpackConfiguration,
    (config: WebpackConfiguration) =>
      applyContentInjection(config)(builderConfig.contentToInject) as WebpackConfiguration,
    (config: WebpackConfiguration) => applyDefineVars(config)(builderConfig.defineVars) as WebpackConfiguration,
    (config: WebpackConfiguration) =>
      ({
        ...config,
        plugins: [...(config.plugins || []), new BabelCustomLoaderPlugin(builderConfig.preset.name, ['next'])],
      }) satisfies WebpackConfiguration,
  ]);

  const outputPath = ctx.output.split('/').slice(0, -1).join('/');
  const filename = getOutputFilename(ctx.output, ctx).split('/').pop() as string;

  return {
    ...bundler,
    baseConfig: {
      ...AzionWebpackConfig,
      entry: builderConfig.entry,
      output: {
        ...AzionWebpackConfig.output,
        path: outputPath,
        filename,
        globalObject: 'globalThis',
      },
      plugins: [
        new webpack.BannerPlugin({
          banner: getBannerContent(ctx),
          raw: true,
          entryOnly: true,
        }),
      ],
      optimization: {
        ...AzionWebpackConfig.optimization,
        minimize: ctx.production,
      },
    },
  };
};

/**
 * Executes the webpack build process
 */
export const executeWebpackBuild = async (bundler: WebpackBundler): Promise<void> => {
  await new Promise<void>((resolve, reject) => {
    const config: Configuration = pipe(bundler.mergeConfig, bundler.applyConfig)(bundler.baseConfig);

    webpack(config, (err, stats) => {
      if (err || stats?.hasErrors()) {
        const info = stats?.toJson();
        const errors = info?.errors?.map((error) => error.message).join('\n');
        reject(new Error(errors));
        return;
      }
      resolve();
    });
  });
};

export default createAzionWebpackConfig;
