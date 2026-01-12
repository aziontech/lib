import { AzionConfig } from '../../../types';
import ProcessConfigStrategy from '../processConfigStrategy';

/**
 * StorageProcessConfigStrategy
 * @class StorageProcessConfigStrategy
 * @description This class is implementation of the Storage ProcessConfig Strategy.
 */
class StorageProcessConfigStrategy extends ProcessConfigStrategy {
  transformToManifest(config: AzionConfig) {
    if (!Array.isArray(config?.storage) || config?.storage.length === 0) {
      return;
    }

    return config.storage.map((item) => ({
      name: item.name,
      workloads_access: item.workloadsAccess || 'read_only',
      dir: item.dir,
      prefix: item.prefix,
    }));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformToConfig(payload: any, transformedPayload: AzionConfig) {
    const storageConfig = payload.storage;
    if (!Array.isArray(storageConfig) || storageConfig.length === 0) {
      return;
    }

    transformedPayload.storage = storageConfig.map((item) => ({
      name: item.name,
      workloadsAccess: item.workloads_access || 'read_only',
      dir: item.dir,
      prefix: item.prefix,
    }));

    return transformedPayload.storage;
  }
}

export default StorageProcessConfigStrategy;
