import { AzionConfig } from '../../../types';
import ProcessConfigStrategy from '../processConfigStrategy';

/**
 * FunctionsProcessConfigStrategy
 * @class FunctionsProcessConfigStrategy
 * @description This class is implementation of the Functions ProcessConfig Strategy.
 */
class FunctionsProcessConfigStrategy extends ProcessConfigStrategy {
  private validateStorageBinding(config: AzionConfig, bucketName: string, functionName: string) {
    if (!Array.isArray(config?.storage) || !config.storage.find((storage) => storage.name === bucketName)) {
      throw new Error(
        `Function "${functionName}" references storage bucket "${bucketName}" which is not defined in the storage configuration.`,
      );
    }
  }

  transformToManifest(config: AzionConfig) {
    if (!Array.isArray(config?.functions) || config?.functions.length === 0) {
      return;
    }

    return config.functions.map((func) => {
      // Validar se o bucket referenciado existe
      if (func.bindings?.storage?.bucket) {
        this.validateStorageBinding(config, func.bindings.storage.bucket, func.name);
      }

      return {
        name: func.name,
        target: func.path,
        args: func.args || {},
        bindings: func.bindings
          ? {
              edge_storage: func.bindings.storage
                ? {
                    bucket: func.bindings.storage.bucket,
                    prefix: func.bindings.storage.prefix,
                  }
                : undefined,
            }
          : undefined,
      };
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformToConfig(payload: any, transformedPayload: AzionConfig) {
    if (!Array.isArray(payload?.functions) || payload?.functions.length === 0) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transformedPayload.functions = payload.functions.map((func: any) => {
      const config = {
        name: func.name,
        path: func.target,
        args: func.args || {},
        bindings: func.bindings
          ? {
              storage: func.bindings.edge_storage
                ? {
                    bucket: func.bindings.edge_storage.bucket,
                    prefix: func.bindings.edge_storage.prefix,
                  }
                : undefined,
            }
          : undefined,
      };

      // Validar se o bucket referenciado existe
      if (config.bindings?.storage?.bucket) {
        this.validateStorageBinding(transformedPayload, config.bindings.storage.bucket, config.name);
      }

      return config;
    });

    return transformedPayload.functions;
  }
}

export default FunctionsProcessConfigStrategy;
