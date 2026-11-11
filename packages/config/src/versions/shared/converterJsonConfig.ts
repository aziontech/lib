import type ProcessConfigContext from './processStrategy/processConfigContext';

type JsonConfigConverterOptions<TConfig> = {
  /** Validates the parsed manifest. Throws on failure. */
  validate: (manifest: Record<string, unknown>) => void;
  /** Builds the strategy context of the API version. */
  factoryProcessContext: () => ProcessConfigContext<TConfig>;
  /** Builds the config object the strategies fill. */
  createConfig: () => TConfig;
};

/**
 * Creates the function that converts a JSON manifest string into a config object of an API version.
 * @throws {Error} The returned function throws if the provided JSON string is invalid.
 */
function createJsonConfigConverter<TConfig>({
  validate,
  factoryProcessContext,
  createConfig,
}: JsonConfigConverterOptions<TConfig>) {
  return function convertJsonConfigToObject(config: string): TConfig {
    let configObject: Record<string, unknown>;
    try {
      configObject = JSON.parse(config);
    } catch {
      throw new Error('Invalid JSON configuration.');
    }
    validate(configObject);
    const payloadConfig = createConfig();
    const processConfigContext = factoryProcessContext();

    processConfigContext.transformToConfig(configObject, payloadConfig);

    return payloadConfig;
  };
}

export { createJsonConfigConverter };
