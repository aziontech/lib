import * as esbuild from 'esbuild';
import { Plugin as ESBuildPlugin } from 'esbuild';
import { flow } from 'lodash-es';
import {
  applyDefineVars,
  createBundlerPlugins,
  extendConfig,
  getBannerContent,
  getOutputFilename,
} from '../../helpers/bundler-utils';
import { BuildConfiguration, BuildEnv, ESBuildConfiguration } from '../../types';
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
export const createAzionESBuildConfig = (buildConfig: BuildConfiguration, ctx: BuildEnv): ESBuildBundler => {
  const baseConfig: ESBuildConfiguration = {
    ...AzionEsbuildConfig,
    entryPoints: [buildConfig.config.entry ?? ''],
    outfile: getOutputFilename(ctx.output, ctx),
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
        () => bundlerPlugins.applyPolyfills(ctx)(config)({ config: buildConfig.config, extras: buildConfig.extras }),
        () => bundlerPlugins.applyAzionModule(ctx)(config),
        () => applyContentInjection(config)(buildConfig?.extras?.contentToInject),
        () => applyDefineVars<ESBuildConfiguration>(config, 'esbuild')(buildConfig?.extras?.defineVars),
        () => extendConfig(config)(buildConfig.config.extend as (config: ESBuildConfiguration) => ESBuildConfiguration),
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
