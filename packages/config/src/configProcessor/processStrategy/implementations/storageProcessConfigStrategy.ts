import { AzionConfig } from '../../../types';
import ProcessConfigStrategy from '../processConfigStrategy';

/**
 * StorageProcessConfigStrategy
 * @class StorageProcessConfigStrategy
 * @description This class is implementation of the Storage ProcessConfig Strategy.
 */
class StorageProcessConfigStrategy extends ProcessConfigStrategy {
  transformToManifest(config: AzionConfig) {
    if (!Array.isArray(config?.edgeStorage) || config?.edgeStorage.length === 0) {
      return;
    }

    return config.edgeStorage.map((item) => ({
      name: item.name,
      edge_access: item.edgeAccess || 'read_only',
      dir: item.dir,
    }));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformToConfig(payload: any, transformedPayload: AzionConfig) {
    const storageConfig = payload.edgeStorage;
    if (!Array.isArray(storageConfig) || storageConfig.length === 0) {
      return;
    }

    transformedPayload.edgeStorage = storageConfig.map((item) => ({
      name: item.name,
      edgeAccess: item.edge_access || 'read_only',
      dir: item.dir,
    }));

    return transformedPayload.edgeStorage;
  }
}

export default StorageProcessConfigStrategy;
