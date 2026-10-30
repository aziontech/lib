import type { AzionBuild } from '../../../../types';
import ProcessConfigStrategy from '../../../shared/processStrategy/processConfigStrategy';
import type { AzionConfigV6 } from '../../types';

/**
 * BuildProcessConfigStrategy
 * @class BuildProcessConfigStrategy
 * @description This class is implementation of the v6 Build Process Config Strategy.
 */
class BuildProcessConfigStrategy extends ProcessConfigStrategy<AzionConfigV6> {
  transformToManifest(config: AzionConfigV6) {
    const build = config?.build;
    if (!build) {
      return;
    }
    const payload: AzionBuild = build;
    return payload;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformToConfig(payload: any, transformedPayload: AzionConfigV6) {
    const build = payload?.build;
    transformedPayload.build = build;
    return transformedPayload.build;
  }
}

export default BuildProcessConfigStrategy;
