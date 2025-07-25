import { AzionConfig, EdgeFunctionExecutionEnvironment, EdgeFunctionRuntime } from '../../../types';
import ProcessConfigStrategy from '../processConfigStrategy';

/**
 * FunctionsProcessConfigStrategy V4
 * @class FunctionsProcessConfigStrategy
 * @description This class is implementation of the Edge Functions Process Config Strategy for API V4.
 */
class FunctionsProcessConfigStrategy extends ProcessConfigStrategy {
  /**
   * Transform azion.config Edge Functions to V4 manifest format
   */
  transformToManifest(config: AzionConfig) {
    if (!Array.isArray(config?.edgeFunctions) || config?.edgeFunctions.length === 0) {
      return [];
    }

    return config.edgeFunctions.map((func) => ({
      name: func.name,
      runtime: func.runtime || 'azion_js',
      default_args: func.defaultArgs || {},
      execution_environment: func.executionEnvironment || 'application',
      active: func.active ?? true,
    }));
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
