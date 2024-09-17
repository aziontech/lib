/**
 * ProcessConfigStrategy
 * @class ProcessConfigStrategy
 * @description This class is the base class for all process config strategies.
 */

import { AzionConfig } from '../../types';

class ProcessConfigStrategy {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  generate(config: AzionConfig, context: any) {
    return context;
  }
}

export default ProcessConfigStrategy;
