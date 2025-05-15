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
      bindings: func.bindings
        ? {
            edge_storage: func.bindings.storage?.map((storage) => ({
              bucket: storage.bucket,
              prefix: storage.prefix,
            })),
          }
        : undefined,
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
      bindings: func.bindings
        ? {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            storage: func.bindings.edge_storage?.map((storage: any) => ({
              bucket: storage.bucket,
              prefix: storage.prefix,
            })),
          }
        : undefined,
    }));

    return transformedPayload.functions;
  }
}

export default FunctionsProcessConfigStrategy;
