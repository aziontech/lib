import lodash from 'lodash';
import { pipe } from 'lodash/fp';
import { BuilderConfig, Bundler, BundlerConfig, ConfigObject, Plugin } from '../types/bundler';

/**
 * Creates a bundler configuration object
 * @param config - Initial configuration
 */
export const createBundlerConfig = (config: BuilderConfig): BundlerConfig => ({
  builderConfig: config,
  customConfigPreset: config.custom || {},
  customConfigLocal: config.localCustom || {},
});

/**
 * Merges configurations together
 * @param baseConfig - Base configuration
 * @param customPreset - Custom preset configuration
 * @param customLocal - Custom local configuration
 */
export const mergeConfigs =
  (baseConfig: ConfigObject) =>
  (customPreset: ConfigObject) =>
  (customLocal: ConfigObject): ConfigObject => {
    const hasCustomConfig = Object.keys(customPreset).length > 0;
    const hasCustomConfigLocal = Object.keys(customLocal).length > 0;

    if (!hasCustomConfig && !hasCustomConfigLocal) {
      return baseConfig;
    }

    return lodash.merge({}, baseConfig, customPreset, customLocal);
  };

/**
 * Creates a bundler with the given configuration and plugins
 * @param config - Initial configuration
 * @param plugins - Array of plugin functions to apply
 */
export const createBundler =
  (config: BuilderConfig) =>
  (plugins: Plugin[] = []): Omit<Bundler, 'baseConfig'> => {
    const bundlerConfig = createBundlerConfig(config);

    return {
      ...bundlerConfig,

      // Apply configuration with plugins
      applyConfig: (baseConfig: ConfigObject) => pipe(...plugins)(baseConfig),

      // Merge configurations
      mergeConfig: (baseConfig: ConfigObject = {} as ConfigObject) =>
        mergeConfigs(baseConfig)(bundlerConfig.customConfigPreset)(bundlerConfig.customConfigLocal),
    };
  };

export default createBundler;
