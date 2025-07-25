import { AzionConfig } from '../../../types';
import ProcessConfigStrategy from '../processConfigStrategy';

/**
 * FunctionsProcessConfigStrategy V4
 * @class FunctionsProcessConfigStrategy
 * @description This class is implementation of the Edge Functions Process Config Strategy for API V4.
 */
class FunctionsProcessConfigStrategy extends ProcessConfigStrategy {
  private validateStorageBinding(config: AzionConfig, bucketName: string, functionName: string) {
    if (!Array.isArray(config?.edgeStorage) || !config.edgeStorage.find((storage) => storage.name === bucketName)) {
      throw new Error(
        `Function "${functionName}" references storage bucket "${bucketName}" which is not defined in the storage configuration.`,
      );
    }
  }

  /**
   * Transform azion.config Edge Functions to V4 manifest format
   */
  transformToManifest(config: AzionConfig) {
    if (!Array.isArray(config?.edgeFunctions) || config?.edgeFunctions.length === 0) {
      return [];
    }

    return config.edgeFunctions.map((func) => {
      // Validar se o bucket referenciado existe
      if (func.bindings?.storage?.bucket) {
        this.validateStorageBinding(config, func.bindings.storage.bucket, func.name);
      }

      return {
        name: func.name,
        path: func.path,
        runtime: func.runtime || 'azion_js',
        default_args: func.args || {},
        execution_environment: func.executionEnvironment || 'application',
        bindings: func.bindings,
        active: func.active ?? true,
      };
    });
  }

  /**
   * Transform V4 manifest format back to azion.config Edge Functions
   */
  transformToConfig(
    payload: {
      edgeFunction?: Array<{
        name: string;
        runtime?: string;
        default_args?: Record<string, unknown>;
        execution_environment?: string;
        active?: boolean;
      }>;
    },
    transformedPayload: AzionConfig,
  ) {
    if (!Array.isArray(payload?.edgeFunction) || payload?.edgeFunction.length === 0) {
      return;
    }

    transformedPayload.edgeFunctions = payload.edgeFunction.map((func) => ({
      name: func.name,
      path: `./functions/${func.name}.js`, // Default - API V4 não retorna path
      runtime: func.runtime as 'azion_js' | undefined,
      args: func.default_args,
      executionEnvironment: func.execution_environment as 'application' | 'firewall' | undefined,
      bindings: {},
      active: func.active,
    }));

    return transformedPayload.edgeFunctions;
  }
}

export default FunctionsProcessConfigStrategy;
