import { AzionBuild, AzionConfig } from '../../../types';
import ManifestStrategy from '../manifestStrategy';

/**
 * BuildManifestStrategy
 * @class BuildManifestStrategy
 * @description This class is implementation of the Build Manifest Strategy.
 */
class BuildManifestStrategy extends ManifestStrategy {
  generate(config: AzionConfig) {
    const build = config?.build;
    if (!build) {
      return {};
    }
    const payload: AzionBuild = build;
    return payload;
  }
}

export default BuildManifestStrategy;
