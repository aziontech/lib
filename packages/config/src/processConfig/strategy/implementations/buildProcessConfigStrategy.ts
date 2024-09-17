import { AzionBuild, AzionConfig } from '../../../types';
import ProcessConfigStrategy from '../processConfigStrategy';

/**
 * BuildProcessConfigStrategy
 * @class BuildProcessConfigStrategy
 * @description This class is implementation of the Build Process Config Strategy.
 */
class BuildProcessConfigStrategy extends ProcessConfigStrategy {
  generate(config: AzionConfig) {
    const build = config?.build;
    if (!build) {
      return {};
    }
    const payload: AzionBuild = build;
    return payload;
  }
}

export default BuildProcessConfigStrategy;
