import * as esbuild from 'esbuild';
import { pipe } from 'lodash/fp';
import { createBundler } from '../base.bundlers.js';
import AzionEsbuildConfig from './esbuild.config.js';
import createAzionPolyfillsPlugin from './plugins/azion-polyfills/index.js';
import createNodePolyfillsPlugin from './plugins/node-polyfills/index.js';

/**
 * Applies polyfills configuration
 */
const applyPolyfills = (config) => (builderConfig) => {
  const polyfills =
    builderConfig.polyfills ||
    builderConfig.customConfigPreset?.polyfills ||
    builderConfig.customConfigLocal?.polyfills;

  if (!polyfills) return config;

  return {
    ...config,
    plugins: [...(config.plugins || []), createNodePolyfillsPlugin(globalThis.vulcan.buildProd)],
  };
};

/**
 * Applies Azion module configuration
 */
const applyAzionModule = (config) => ({
  ...config,
  plugins: [...(config.plugins || []), createAzionPolyfillsPlugin(globalThis.vulcan.buildProd)],
});

/**
 * Applies content injection configuration
 */
const applyContentInjection = (config) => (content) => {
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
 * Applies define variables configuration
 */
const applyDefineVars = (config) => (defineVars) => {
  if (!defineVars) return config;

  return {
    ...config,
    define: {
      ...config.define,
      ...defineVars,
    },
  };
};

/**
 * Creates ESBuild bundler instance
 */
export const createESBuildBundler = (builderConfig) => {
  const bundler = createBundler(builderConfig)([
    (config) => applyPolyfills(config)(builderConfig),
    applyAzionModule,
    (config) => applyContentInjection(config)(builderConfig.contentToInject),
    (config) => applyDefineVars(config)(builderConfig.defineVars),
  ]);

  return {
    ...bundler,
    baseConfig: {
      ...AzionEsbuildConfig,
      entryPoints: [builderConfig.entry],
      plugins: [],
    },
  };
};

/**
 * Executes the build process for the given bundler
 * @param {Object} bundler - The configured ESBuild bundler
 * @returns {Promise<void>}
 */
export const executeBuild = async (bundler) => {
  const config = pipe(bundler.mergeConfig, bundler.applyConfig)(bundler.baseConfig);
  await esbuild.build(config);
};

export default createESBuildBundler;
