import { AzionBuild, AzionConfig } from '../../../types';
import ProcessConfigStrategy from '../processConfigStrategy';

/**
 * BuildProcessConfigStrategy
 * @class BuildProcessConfigStrategy
 * @description This class is implementation of the Build Process Config Strategy.
 */
class BuildProcessConfigStrategy extends ProcessConfigStrategy {
  transformToManifest(config: AzionConfig) {
    const build = config?.build;
    if (!build) {
      return;
    }
    const payload: AzionBuild = build;
    return payload;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformToConfig(payload: any, transformedPayload: AzionConfig) {
    const build = payload?.build;
    transformedPayload.build = build;
    return transformedPayload.build;
  }
}

export default BuildProcessConfigStrategy;
