import { AzionConfig, EdgeFunctionExecutionEnvironment, EdgeFunctionRuntime } from '../../../types';
import ProcessConfigStrategy from '../processConfigStrategy';

/**
 * FunctionsProcessConfigStrategy V4
 * @class FunctionsProcessConfigStrategy
 * @description This class is implementation of the Edge Functions Process Config Strategy for API V4.
 */
class FunctionsProcessConfigStrategy extends ProcessConfigStrategy {
  /**
   * Validate storage binding reference
   */
  private validateStorageBinding(config: AzionConfig, bucketNameOrId: string | number, functionName: string) {
    if (typeof bucketNameOrId === 'string') {
      if (
        !Array.isArray(config?.edgeStorage) ||
        !config.edgeStorage.find((storage) => storage.name === bucketNameOrId)
      ) {
        throw new Error(
          `Edge Function "${functionName}" references storage bucket "${bucketNameOrId}" which is not defined in the edgeStorage configuration.`,
        );
      }
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
      // Validate storage binding if exists
      if (func.bindings?.storage?.bucket) {
        this.validateStorageBinding(config, func.bindings.storage.bucket, func.name);
      }

      return {
        name: func.name,
        runtime: func.runtime || 'azion_js',
        default_args: func.defaultArgs || {},
        execution_environment: func.executionEnvironment || 'application',
        active: func.active ?? true,
        bindings: func.bindings,
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
      path: `./functions/${func.name}.js`, // Default path since it's not in V4 API
      runtime: func.runtime as EdgeFunctionRuntime,
      defaultArgs: func.default_args,
      executionEnvironment: func.execution_environment as EdgeFunctionExecutionEnvironment,
      active: func.active,
    }));

    return transformedPayload.edgeFunctions;
  }
}

export default FunctionsProcessConfigStrategy;
