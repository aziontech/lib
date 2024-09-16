/**
 * ManifestStrategy
 * @class ManifestStrategy
 * @description This class is the base class for all manifest strategies.
 */

import { AzionConfig } from '../../types';

class ManifestStrategy {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  generate(config: AzionConfig, context: any) {
    return context;
  }
}

export default ManifestStrategy;
