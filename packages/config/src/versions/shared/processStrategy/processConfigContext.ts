import ProcessConfigStrategy from './processConfigStrategy';

/**
 * ProcessConfigContext
 * @class
 * @description This class is responsible for generating the context of the process config.
 * `TConfig` is the config shape of the API version.
 */
class ProcessConfigContext<TConfig> {
  strategies: { [key: string]: ProcessConfigStrategy<TConfig> };
  constructor() {
    this.strategies = {};
  }

  setStrategy(type: string, strategy: ProcessConfigStrategy<TConfig>): void {
    this.strategies[type] = strategy;
  }
  /**
   * Transform to manifest is responsible for transforming the config to the manifest.
   * @param config Config of the API version
   * @param context manifest object
   * @returns
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformToManifest(config: TConfig, context: any) {
    Object.keys(this.strategies).forEach((key) => {
      context[key] = this.strategies[key].transformToManifest(config, context);
    });
    return context;
  }

  /**
   * Transform to config is responsible for transforming the payload to the config.
   * @param payload Manifest object
   * @param transformedPayload Config object of the API version
   * @returns
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformToConfig(payload: any, transformedPayload: TConfig): TConfig {
    Object.keys(this.strategies).forEach((key) => {
      payload[key] = this.strategies[key].transformToConfig(payload, transformedPayload);
    });
    return payload;
  }
}

export default ProcessConfigContext;
