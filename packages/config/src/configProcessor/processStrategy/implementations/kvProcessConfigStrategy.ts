import { AzionConfig } from '../../../types';
import ProcessConfigStrategy from '../processConfigStrategy';

/**
 * KvProcessConfigStrategy
 * @class KvProcessConfigStrategy
 * @description This class is implementation of the KV ProcessConfig Strategy.
 */
class KvProcessConfigStrategy extends ProcessConfigStrategy {
  transformToManifest(config: AzionConfig) {
    if (!Array.isArray(config?.kv) || config?.kv.length === 0) {
      return;
    }

    return config.kv.map((item) => ({
      name: item.name,
    }));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformToConfig(payload: any, transformedPayload: AzionConfig) {
    const kvConfig = payload.kv;
    if (!Array.isArray(kvConfig) || kvConfig.length === 0) {
      return;
    }

    transformedPayload.kv = kvConfig.map((item) => ({
      name: item.name,
    }));

    return transformedPayload.kv;
  }
}

export default KvProcessConfigStrategy;
