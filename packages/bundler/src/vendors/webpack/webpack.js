/* eslint-disable no-param-reassign */
import { debug } from '#utils';
import { pipe } from 'lodash/fp';
import webpack from 'webpack';
import { createBundler } from '../base.bundlers';
import { azionCliBanner, devBannerComment } from './banners';
import createAzionPolyfillsPlugin from './plugins/azion-polyfills/index';
import BabelCustomLoaderPlugin from './plugins/babel-custom/babel-custom-loader.plugins';
import createNodePolyfillsPlugin from './plugins/node-polyfills/index';
import AzionWebpackConfig from './webpack.config';

/**
 * Applies polyfills configuration
 */
const applyPolyfills = (buildEnv) => (config) => (builderConfig) => {
  const polyfills =
    builderConfig.polyfills ||
    builderConfig.customConfigPreset?.polyfills ||
    builderConfig.customConfigLocal?.polyfills;

  if (!polyfills) return config;

  return {
    ...config,
    plugins: [...(config.plugins || []), createNodePolyfillsPlugin(buildEnv.production)],
  };
};

/**
 * Applies Azion module configuration
 */
const applyAzionModule = (buildEnv) => (config) => ({
  ...config,
  plugins: [...(config.plugins || []), createAzionPolyfillsPlugin(buildEnv.production)],
});

/**
 * Applies content injection configuration
 */
const applyContentInjection = (config) => (content) => {
  if (!content) return config;

  const updatedConfig = { ...config };
  const bannerPluginIndex = updatedConfig.plugins.findIndex((plugin) => plugin instanceof webpack.BannerPlugin);

  if (bannerPluginIndex !== -1) {
    const oldContent = updatedConfig.plugins[bannerPluginIndex].options.banner;
    updatedConfig.plugins = updatedConfig.plugins.filter((_, index) => index !== bannerPluginIndex);
    updatedConfig.plugins.push(
      new webpack.BannerPlugin({
        banner: `${oldContent} ${content}`,
        raw: true,
      }),
    );
  } else {
    updatedConfig.plugins.push(
      new webpack.BannerPlugin({
        banner: content,
        raw: true,
      }),
    );
  }

  return updatedConfig;
};

/**
 * Applies define variables configuration
 */
const applyDefineVars = (config) => (defineVars) => {
  if (!defineVars) return config;

  return {
    ...config,
    plugins: [...(config.plugins || []), new webpack.DefinePlugin(defineVars)],
  };
};

/**
 * Applies babel custom loader configuration
 */
const applyBabelCustomLoader = (config) => (presetName) => ({
  ...config,
  plugins: [...(config.plugins || []), new BabelCustomLoaderPlugin(presetName, ['next'])],
});

/**
 * Creates Webpack bundler instance
 */
export const createWebpackBundler = (builderConfig, buildEnv) => {
  const getOutputFilename = (path) => {
    if (buildEnv.production) return path;
    const [dir, filename] = path.split(/\/([^/]+)$/);
    const [name, ext] = filename.split('.');
    return `${dir}/${name}.dev.${ext}`;
  };

  const outputPath = buildEnv.output.split('/').slice(0, -1).join('/');
  const filename = getOutputFilename(buildEnv.output).split('/').pop();

  const bundler = createBundler(builderConfig)([
    (config) => applyPolyfills(buildEnv)(config)(builderConfig),
    (config) => applyAzionModule(buildEnv)(config),
    (config) => applyContentInjection(config)(builderConfig.contentToInject),
    (config) => applyDefineVars(config)(builderConfig.defineVars),
    (config) => applyBabelCustomLoader(config)(builderConfig.preset.name),
  ]);

  const baseConfig = {
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
        banner: azionCliBanner,
        raw: true,
        entryOnly: true,
      }),
      ...(buildEnv.production
        ? []
        : [
            new webpack.BannerPlugin({
              banner: devBannerComment,
              raw: true,
              entryOnly: true,
            }),
          ]),
    ],
    optimization: {
      ...AzionWebpackConfig.optimization,
      minimize: buildEnv.production,
    },
  };

  return {
    ...bundler,
    baseConfig,
  };
};

/**
 * Executes the build process for the given bundler
 */
export const executeBuild = async (bundler) => {
  try {
    const config = pipe(bundler.mergeConfig, bundler.applyConfig)(bundler.baseConfig);

    await new Promise((resolve, reject) => {
      webpack(config, (err, stats) => {
        if (err || stats.hasErrors()) {
          const info = stats?.toJson();
          const errors = info?.errors?.map((error) => error.message).join('\n');
          debug.error(stats?.toString({ colors: true }));
          reject(new Error(errors));
          return;
        }
        resolve();
      });
    });
  } catch (error) {
    debug.error(error);
    throw error;
  }
};

export default createWebpackBundler;
