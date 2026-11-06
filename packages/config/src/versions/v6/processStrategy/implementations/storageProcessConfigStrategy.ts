import ProcessConfigStrategy from '../../../shared/processStrategy/processConfigStrategy';
import type { AzionConfigV6 } from '../../types';

/**
 * StorageProcessConfigStrategy V6
 * @class StorageProcessConfigStrategy
 * @description Converts the v6 storage between the config and the manifest.
 */
class StorageProcessConfigStrategy extends ProcessConfigStrategy<AzionConfigV6> {
  transformToManifest(config: AzionConfigV6) {
    if (!Array.isArray(config?.storage) || config?.storage.length === 0) {
      return;
    }

    return config.storage.map((item) => ({
      name: item.name,
      workloads_access: item.workloadsAccess || 'read_only',
      dir: item.dir,
      ...(item.prefix !== undefined && { prefix: item.prefix }),
    }));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformToConfig(payload: any, transformedPayload: AzionConfigV6) {
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
