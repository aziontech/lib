import { Plugin as ESBuildPlugin } from 'esbuild';
import { pipe } from 'lodash/fp';
import webpack, { WebpackPluginInstance } from 'webpack';
import { bannerCli, bannerDevelopment } from '../constants/banners';
import {
  BuildEnv,
  bundlerConfig as BuilderConfig,
  BundlerConfiguration,
  BundlerPluginFunctions,
  ESBuildPluginClasses,
  WebpackPluginClasses,
} from '../types/bundler';

/**
 * Creates bundler plugins factory with specific implementations
 */
export const createBundlerPlugins = <
  T extends WebpackPluginClasses | ESBuildPluginClasses,
  C extends BundlerConfiguration,
>(
  implementations: T,
): BundlerPluginFunctions<C> => {
  const { NodePolyfillsPlugin, AzionPolyfillsPlugin } = implementations;

  /**
   * Common polyfills configuration
   */
  const applyPolyfills =
    (buildEnv: BuildEnv) =>
    (config: C) =>
    (builderConfig: BuilderConfig): C => {
      const polyfills =
        builderConfig.polyfills || builderConfig.custom?.polyfills || builderConfig.localCustom?.polyfills;

      if (!polyfills) return config;

      return {
        ...config,
        plugins: [
          ...(config.plugins || []),
          isWebpackPlugin(NodePolyfillsPlugin)
            ? new NodePolyfillsPlugin(buildEnv.production)
            : NodePolyfillsPlugin(buildEnv.production),
        ],
      };
    };

  /**
   * Common Azion module configuration
   */
  const applyAzionModule =
    (buildEnv: BuildEnv) =>
    (config: C): C => ({
      ...config,
      plugins: [
        ...(config.plugins || []),
        isWebpackPlugin(AzionPolyfillsPlugin)
          ? new AzionPolyfillsPlugin(buildEnv.production)
          : AzionPolyfillsPlugin(buildEnv.production),
      ],
    });

  return {
    applyPolyfills,
    applyAzionModule,
  };
};

function isWebpackPlugin(
  plugin: ((isProduction: boolean) => ESBuildPlugin) | (new (isProduction: boolean) => WebpackPluginInstance),
): plugin is new (isProduction: boolean) => WebpackPluginInstance {
  return 'prototype' in plugin;
}

/**
 * Common define variables configuration
 */
export const applyDefineVars =
  <T extends BundlerConfiguration>(config: T) =>
  (defineVars: Record<string, string> = {}): T => {
    if (!defineVars) return config;

    return {
      ...config,
      plugins: [...(config.plugins || []), new webpack.DefinePlugin(defineVars)],
    } as T;
  };

/**
 * Common filename handling
 */
export const getOutputFilename = (path: string, buildEnv: BuildEnv): string => {
  if (buildEnv.production) return path;
  const [dir, filename] = path.split(/\/([^/]+)$/);
  const [name, ext] = filename.split('.');
  return `${dir}/${name}.dev.${ext}`;
};

/**
 * Common banner configuration
 */
export const getBannerContent = (buildEnv: BuildEnv): string => {
  return buildEnv.production ? bannerCli : `${bannerCli}${bannerDevelopment}`;
};

/**
 * Creates base bundler configuration with merged config and plugin support
 */
export const createBaseBundler = <T extends BundlerConfiguration>(
  builderConfig: BuilderConfig,
  buildEnv: BuildEnv,
  plugins: ((config: T) => T)[] = [],
) => {
  const mergeConfig = (baseConfig: T): T => {
    const customConfig = builderConfig.custom || builderConfig.localCustom;
    if (!customConfig) return baseConfig;

    return {
      ...baseConfig,
      ...customConfig,
    };
  };

  const applyConfig = (baseConfig: T): T => {
    if (!plugins.length) return baseConfig;
    return pipe(...plugins)(baseConfig);
  };

  return {
    mergeConfig,
    applyConfig,
  };
};

export const applyContentInjection =
  <T extends BundlerConfiguration>(config: T) =>
  (content: string | undefined): T => {
    if (!content) return config;
    return {
      ...config,
      banner: {
        ...config.banner,
        js: config.banner?.js ? `${config.banner.js} ${content}` : content,
      },
    } as T;
  };
