import { AzionConfig } from '../../config/types';
import ProcessConfigStrategy from './processConfigStrategy';

/**
 * ProcessConfigContext
 * @class
 * @description This class is responsible for generating the context of the process config.
 */
class ProcessConfigContext {
  strategies: { [key: string]: ProcessConfigStrategy };
  constructor() {
    this.strategies = {};
  }

  setStrategy(type: string, strategy: ProcessConfigStrategy): void {
    this.strategies[type] = strategy;
  }
  /**
   * Transform to manifest is responsible for transforming the config to the manifest.
   * @param config AzionConfig
   * @param context manifest object
   * @returns
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformToManifest(config: AzionConfig, context: any) {
    Object.keys(this.strategies).forEach((key) => {
      context[key] = this.strategies[key].transformToManifest(config, context);
    });
    return context;
  }

  /**
   * Transform to config is responsible for transforming the payload to the config.
   * @param payload Manifest object
   * @param transformedPayload AzionConfig object
   * @returns
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformToConfig(payload: any, transformedPayload: AzionConfig): AzionConfig {
    Object.keys(this.strategies).forEach((key) => {
      transformedPayload[key as keyof AzionConfig] = this.strategies[key].transformToConfig(
        payload,
        transformedPayload,
      );
    });
    return transformedPayload;
  }
}

export default ProcessConfigContext;
