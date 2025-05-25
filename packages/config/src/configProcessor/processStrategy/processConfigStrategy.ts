/**
 * ProcessConfigStrategy
 * @class ProcessConfigStrategy
 * @description This class is the base class for all process config strategies.
 */

import { AzionConfig } from '../../config/types';

class ProcessConfigStrategy {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformToManifest(config: any, context: any) {
    return context;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  transformToConfig(payload: any, transformedPayload: AzionConfig): AzionConfig | any {
    return payload;
  }
}

export default ProcessConfigStrategy;
