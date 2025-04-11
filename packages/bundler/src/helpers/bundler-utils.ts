import { BuildConfiguration, BuildContext } from 'azion/config';
import { Plugin as ESBuildPlugin } from 'esbuild';
import webpack, { WebpackPluginInstance } from 'webpack';
import { bannerCli, bannerDevelopment } from '../constants/banners';
import { BundlerPluginFunctions, BundlerProviderConfig, ESBuildPluginClasses, WebpackPluginClasses } from '../types';

/**
 * Creates bundler plugins factory with specific implementations
 */
export const createBundlerPlugins = <
  T extends WebpackPluginClasses | ESBuildPluginClasses,
  C extends BundlerProviderConfig,
>(
  implementations: T,
): BundlerPluginFunctions<C> => {
  const pluginsClasses = implementations;

  /**
   * Common polyfills configuration
   */
  const applyPolyfills =
    (buildEnv: BuildContext) =>
    (config: C) =>
    (buildConfiguration: BuildConfiguration): C => {
      if (!buildConfiguration.polyfills) return config;

      if (isWebpackPlugin(pluginsClasses.NodePolyfillsPlugin)) {
        config.plugins = [
          ...(config.plugins || []),
          new pluginsClasses.NodePolyfillsPlugin(buildEnv.production),
          new (pluginsClasses as WebpackPluginClasses).BabelCustomLoaderPlugin(
            buildConfiguration.preset.metadata.name,
            ['next'],
          ),
        ] as unknown as typeof config.plugins;

        return config;
      }

      config.plugins = [
        ...(config.plugins || []),
        pluginsClasses.NodePolyfillsPlugin(buildEnv.production),
      ] as unknown as typeof config.plugins;
      return config;
    };

  /**
   * Common Azion module configuration
   */
  const applyAzionModule =
    (buildEnv: BuildContext) =>
    (config: C): C => {
      config.plugins = [
        ...(config.plugins || []),
        isWebpackPlugin(pluginsClasses.AzionPolyfillsPlugin)
          ? new pluginsClasses.AzionPolyfillsPlugin(buildEnv.production)
          : pluginsClasses.AzionPolyfillsPlugin(buildEnv.production),
      ] as unknown as typeof config.plugins;
      return config;
    };

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
  <T extends BundlerProviderConfig>(config: T, provider: 'esbuild' | 'webpack') =>
  (defineVars: Record<string, string> = {}): T => {
    if (!defineVars) return config;

    if (provider === 'esbuild') {
      config.define = {
        ...config.define,
        ...defineVars,
      } as unknown as typeof config.define;
      return config as T;
    }

    config.plugins = [
      ...(config.plugins || []),
      new webpack.DefinePlugin(defineVars),
    ] as unknown as typeof config.plugins;

    return config as T;
  };

/**
 * Common banner configuration
 */
export const getBannerContent = (buildEnv: BuildContext): string => {
  return buildEnv.production ? bannerCli : `${bannerCli}${bannerDevelopment}`;
};

export const extendConfig =
  <T extends BundlerProviderConfig>(config: T) =>
  (extendFn: (config: T) => T): T => {
    if (extendFn === undefined) {
      return config;
    }
    return extendFn(config);
  };

export const applyContentInjection =
  <T extends BundlerProviderConfig>(config: T) =>
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
