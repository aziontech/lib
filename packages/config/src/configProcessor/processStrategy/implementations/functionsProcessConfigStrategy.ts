import { FUNCTION_INITIATOR_TYPES } from '../../../constants';
import { AzionConfig } from '../../../types';
import ProcessConfigStrategy from '../processConfigStrategy';

/**
 * FunctionsProcessConfigStrategy
 * @class FunctionsProcessConfigStrategy
 * @description This class is implementation of the Functions ProcessConfig Strategy.
 */
class FunctionsProcessConfigStrategy extends ProcessConfigStrategy {
  transformToManifest(config: AzionConfig) {
    if (!Array.isArray(config?.functions) || config?.functions.length === 0) {
      return;
    }

    return config.functions.map((func) => ({
      name: func.name,
      target: func.path,
      args: func.args || {},
      initiator_type: func.initiatorType || FUNCTION_INITIATOR_TYPES[0],
    }));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformToConfig(payload: any, transformedPayload: AzionConfig) {
    if (!Array.isArray(payload?.functions) || payload?.functions.length === 0) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transformedPayload.functions = payload.functions.map((func: any) => ({
      name: func.name,
      path: func.target,
      args: func.args || {},
      initiatorType: func.initiator_type || FUNCTION_INITIATOR_TYPES[0],
    }));

    return transformedPayload.functions;
  }
}

export default FunctionsProcessConfigStrategy;
