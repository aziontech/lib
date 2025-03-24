import { BuildConfiguration, BuildContext } from 'azion/config';
import { flow } from 'lodash-es';
import webpack, { Configuration } from 'webpack';
import {
  applyDefineVars,
  createBundlerPlugins,
  extendConfig,
  getBannerContent,
  getOutputFilename,
} from '../../helpers/bundler-utils';
import { WebpackConfiguration, WebpackPluginClasses } from '../../types';
import AzionPolyfillPlugin from './plugins/azion-polyfills';
import BabelCustomLoaderPlugin from './plugins/babel-custom';
import NodePolyfillPlugin from './plugins/node-polyfills';
import AzionWebpackConfig from './webpack.config';

// Create webpack-specific plugins
const bundlerPlugins = createBundlerPlugins<WebpackPluginClasses, WebpackConfiguration>({
  NodePolyfillsPlugin: NodePolyfillPlugin,
  AzionPolyfillsPlugin: AzionPolyfillPlugin,
  BabelCustomLoaderPlugin: BabelCustomLoaderPlugin,
});

/**
 * Webpack-specific content injection
 */
const applyContentInjection =
  (config: Configuration) =>
  (content: string | undefined): Configuration => {
    if (!content) return config;

    const bannerPluginIndex =
      config.plugins?.findIndex((plugin): plugin is webpack.BannerPlugin => plugin instanceof webpack.BannerPlugin) ??
      -1;

    if (bannerPluginIndex !== -1 && config.plugins) {
      const oldContent = (config.plugins[bannerPluginIndex] as webpack.BannerPlugin).options.banner;
      config.plugins = config.plugins.filter((_, index) => index !== bannerPluginIndex);
      config.plugins.push(
        new webpack.BannerPlugin({
          banner: `${oldContent} ${content}`,
          raw: true,
        }),
      );
    } else {
      config.plugins = [
        ...(config.plugins || []),
        new webpack.BannerPlugin({
          banner: content,
          raw: true,
        }),
      ];
    }

    return config;
  };

export interface WebpackBundler {
  baseConfig: WebpackConfiguration;
  mergeConfig: (config: WebpackConfiguration) => WebpackConfiguration;
  applyConfig: (config: WebpackConfiguration) => WebpackConfiguration;
  executeBuild: (config: WebpackBundler) => Promise<void>;
}

/**
 * Creates Webpack bundler instance
 */
export const createAzionWebpackConfig = (buildConfig: BuildConfiguration, ctx: BuildContext): WebpackBundler => {
  const outputPath = ctx.output.split('/').slice(0, -1).join('/');
  const filename = getOutputFilename(ctx.output, ctx).split('/').pop() as string;

  const plugins = AzionWebpackConfig.plugins || [];

  const baseConfig: WebpackConfiguration = {
    ...AzionWebpackConfig,
    entry: buildConfig.entry,
    output: {
      ...AzionWebpackConfig.output,
      path: outputPath,
      filename,
      globalObject: 'globalThis',
    },
    plugins: [
      ...plugins.filter((plugin): plugin is webpack.WebpackPluginInstance => !!plugin),
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
  };

  return {
    baseConfig,
    mergeConfig: (config: WebpackConfiguration) =>
      flow([
        () => bundlerPlugins.applyPolyfills(ctx)(config)(buildConfig),
        () => bundlerPlugins.applyAzionModule(ctx)(config),
        () => applyContentInjection(config)(buildConfig?.setup?.contentToInject),
        () => applyDefineVars(config, 'webpack')(buildConfig?.setup?.defineVars),
        () => extendConfig(config)(buildConfig.extend as (config: WebpackConfiguration) => WebpackConfiguration),
      ])(config),
    applyConfig: (config: WebpackConfiguration) => config,
    executeBuild: executeWebpackBuild,
  };
};

/**
 * Executes the webpack build process
 */
export const executeWebpackBuild = async (bundler: WebpackBundler): Promise<void> => {
  await new Promise<void>((resolve, reject) => {
    const config: Configuration = flow([
      () => bundler.mergeConfig(bundler.baseConfig),
      () => bundler.applyConfig(bundler.baseConfig),
    ])(bundler.baseConfig);

    webpack(config, (err, stats) => {
      if (err || stats?.hasErrors()) {
        const info = stats?.toJson();
        const errors = info?.errors?.map((error) => error.message).join('\n');
        console.log(err);

        reject(new Error(errors));
        return;
      }
      resolve();
    });
  });
};

export default createAzionWebpackConfig;
