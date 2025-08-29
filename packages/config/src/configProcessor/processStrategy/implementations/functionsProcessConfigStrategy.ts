import { AzionConfig, FunctionExecutionEnvironment, FunctionRuntime } from '../../../types';
import ProcessConfigStrategy from '../processConfigStrategy';

/**
 * FunctionsProcessConfigStrategy V4
 * @class FunctionsProcessConfigStrategy
 * @description This class is implementation of the Functions Process Config Strategy for API V4.
 */
class FunctionsProcessConfigStrategy extends ProcessConfigStrategy {
  /**
   * Validate storage binding reference
   */
  private validateStorageBinding(config: AzionConfig, bucketNameOrId: string | number, functionName: string) {
    if (typeof bucketNameOrId === 'string') {
      if (!Array.isArray(config?.storage) || !config.storage.find((storage) => storage.name === bucketNameOrId)) {
        throw new Error(
          `Function "${functionName}" references storage bucket "${bucketNameOrId}" which is not defined in the storage configuration.`,
        );
      }
    }
  }
  /**
   * Transform azion.config Functions to V4 manifest format
   */
  transformToManifest(config: AzionConfig) {
    if (!Array.isArray(config?.functions) || config?.functions.length === 0) {
      return [];
    }

    return config.functions.map((func) => {
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
        path: func.path,
        bindings: func.bindings,
      };
    });
  }

  /**
   * Transform V4 manifest format back to azion.config Functions
   */
  transformToConfig(
    payload: {
      functions?: Array<{
        name: string;
        runtime?: string;
        default_args?: Record<string, unknown>;
        execution_environment?: string;
        active?: boolean;
      }>;
    },
    transformedPayload: AzionConfig,
  ) {
    if (!Array.isArray(payload?.functions) || payload?.functions.length === 0) {
      return;
    }

    transformedPayload.functions = payload.functions.map((func) => ({
      name: func.name,
      path: `./functions/${func.name}.js`, // Default path since it's not in V4 API
      runtime: func.runtime as FunctionRuntime,
      defaultArgs: func.default_args,
      executionEnvironment: func.execution_environment as FunctionExecutionEnvironment,
      active: func.active,
    }));
  }
}

export default FunctionsProcessConfigStrategy;
