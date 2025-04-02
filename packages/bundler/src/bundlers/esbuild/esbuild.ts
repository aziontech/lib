import { BuildConfiguration, BuildContext } from 'azion/config';
import * as esbuild from 'esbuild';
import { Plugin as ESBuildPlugin } from 'esbuild';
import { flow } from 'lodash-es';
import { applyDefineVars, createBundlerPlugins, extendConfig, getBannerContent } from '../../helpers/bundler-utils';
import { ESBuildConfiguration } from '../../types';
import AzionEsbuildConfig from './esbuild.config';
import AzionPolyfillPlugin from './plugins/azion-polyfills';
import NodePolyfillPlugin from './plugins/node-polyfills';

interface ESBuildConfig extends esbuild.BuildOptions {}

interface ESBuildBundler {
  baseConfig: ESBuildConfiguration;
  mergeConfig: (config: ESBuildConfiguration) => ESBuildConfiguration;
  applyConfig: (config: ESBuildConfiguration) => ESBuildConfiguration;
  executeBuild: (config: ESBuildBundler) => Promise<void>;
}

interface ESBuildPluginClasses {
  NodePolyfillsPlugin: (isProduction: boolean) => ESBuildPlugin;
  AzionPolyfillsPlugin: (isProduction: boolean) => ESBuildPlugin;
}

// Create esbuild-specific plugins
const bundlerPlugins = createBundlerPlugins<ESBuildPluginClasses, ESBuildConfiguration>({
  NodePolyfillsPlugin: NodePolyfillPlugin,
  AzionPolyfillsPlugin: AzionPolyfillPlugin,
});

/**
 * ESBuild-specific content injection
 */
const applyContentInjection =
  (config: ESBuildConfig) =>
  (content: string | undefined): ESBuildConfig => {
    if (!content) return config;

    config.banner = config.banner || {};
    config.banner.js = config.banner.js ? `${config.banner.js} ${content}` : content;

    return config;
  };

/**
 * Creates ESBuild bundler instance
 */
export const createAzionESBuildConfig = (buildConfig: BuildConfiguration, ctx: BuildContext): ESBuildBundler => {
  const outputDirectory = buildConfig.baseOutputDir || process.cwd();

  const baseConfig: ESBuildConfiguration = {
    ...AzionEsbuildConfig,
    entryPoints: typeof buildConfig.entry === 'string' ? [buildConfig.entry] : buildConfig.entry,
    outdir: outputDirectory,
    entryNames: '[dir]/[name]',
    minify: ctx.production,
    plugins: [],
    banner: {
      js: getBannerContent(ctx),
    },
  };

  return {
    baseConfig,
    mergeConfig: (config: ESBuildConfiguration) =>
      flow([
        () => bundlerPlugins.applyPolyfills(ctx)(config)(buildConfig),
        () => bundlerPlugins.applyAzionModule(ctx)(config),
        () => applyContentInjection(config)(buildConfig?.setup?.contentToInject),
        () => applyDefineVars<ESBuildConfiguration>(config, 'esbuild')(buildConfig?.setup?.defineVars),
        () => extendConfig(config)(buildConfig.extend as (config: ESBuildConfiguration) => ESBuildConfiguration),
      ])(config),
    applyConfig: (config: ESBuildConfiguration) => config,
    executeBuild: executeESBuildBuild,
  };
};

/**
 * Executes the esbuild build process
 */
export const executeESBuildBuild = async (bundler: ESBuildBundler): Promise<void> => {
  const configBuild: ESBuildConfig = flow([
    () => bundler.mergeConfig(bundler.baseConfig),
    () => bundler.applyConfig(bundler.baseConfig),
  ])(bundler.baseConfig);
  await esbuild.build(configBuild);
};

export default createAzionESBuildConfig;
