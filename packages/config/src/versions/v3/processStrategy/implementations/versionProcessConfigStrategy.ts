import { AzionConfig } from '../../types';
import ProcessConfigStrategy from '../processConfigStrategy';

/**
 * VersionProcessConfigStrategy
 * @class VersionProcessConfigStrategy
 * @description Writes the API version to the manifest and reads it back into the config.
 */
class VersionProcessConfigStrategy extends ProcessConfigStrategy {
  transformToManifest(config: AzionConfig) {
    return config?.version ?? 3;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformToConfig(payload: any, transformedPayload: AzionConfig) {
    const version = payload?.version;
    if (version !== undefined) {
      transformedPayload.version = version;
    }
    return transformedPayload.version;
  }
}

export default VersionProcessConfigStrategy;
