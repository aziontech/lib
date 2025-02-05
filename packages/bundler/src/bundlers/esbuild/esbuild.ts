import * as esbuild from 'esbuild';
import { Plugin as ESBuildPlugin } from 'esbuild';
import { pipe } from 'lodash/fp';
import {
  applyDefineVars,
  createBundlerPlugins,
  getBannerContent,
  getOutputFilename,
} from '../../helpers/bundler-utils';
import { BuildEnv, bundlerConfig, ESBuildConfiguration } from '../../types/bundler';
import AzionEsbuildConfig from './esbuild.config';
import AzionPolyfillPlugin from './plugins/azion-polyfills';
import NodePolyfillPlugin from './plugins/node-polyfills';

interface ESBuildConfig extends esbuild.BuildOptions {
  banner?: {
    js?: string;
  };
  loader?: {
    [ext: string]: esbuild.Loader;
  };
}

interface ESBuildBundler {
  baseConfig: ESBuildConfiguration;
  mergeConfig: (config: ESBuildConfiguration) => ESBuildConfiguration;
  applyConfig: (config: ESBuildConfiguration) => ESBuildConfiguration;
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

    return {
      ...config,
      banner: {
        ...config.banner,
        js: config.banner?.js ? `${config.banner.js} ${content}` : content,
      },
    };
  };

/**
 * Creates ESBuild bundler instance
 */
export const createAzionESBuildConfig = (bundlerConfig: bundlerConfig, ctx: BuildEnv): ESBuildBundler => {
  const baseConfig: ESBuildConfiguration = {
    ...AzionEsbuildConfig,
    entryPoints: [bundlerConfig.entry],
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
      pipe([
        () => bundlerPlugins.applyPolyfills(ctx)(config)(bundlerConfig),
        () => bundlerPlugins.applyAzionModule(ctx)(config),
        () => applyContentInjection(config)(bundlerConfig.contentToInject),
        () => applyDefineVars(config)(bundlerConfig.defineVars),
      ])(config),
    applyConfig: (config: ESBuildConfiguration) => config,
  };
};

/**
 * Executes the esbuild build process
 */
export const executeESBuildBuild = async (config: ESBuildConfig): Promise<void> => {
  await esbuild.build(config);
};

export default createAzionESBuildConfig;
