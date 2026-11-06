import ProcessConfigStrategy from '../../../shared/processStrategy/processConfigStrategy';
import type { AzionConfigV6 } from '../../types';

/**
 * VersionProcessConfigStrategy
 * @class VersionProcessConfigStrategy
 * @description Writes the API version to the manifest and reads it back into the config.
 */
class VersionProcessConfigStrategy extends ProcessConfigStrategy<AzionConfigV6> {
  transformToManifest(config: AzionConfigV6) {
    return config?.version;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformToConfig(payload: any, transformedPayload: AzionConfigV6) {
    const version = payload?.version;
    if (version !== undefined) {
      transformedPayload.version = version;
    }
    return transformedPayload.version;
  }
}

export default VersionProcessConfigStrategy;
