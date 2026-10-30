import type { FunctionExecutionEnvironment, FunctionRuntime } from '../../../../types';
import ProcessConfigStrategy from '../../../shared/processStrategy/processConfigStrategy';
import type { AzionConfigV6 } from '../../types';

/**
 * FunctionsProcessConfigStrategy V6
 * @class FunctionsProcessConfigStrategy
 * @description This class is implementation of the Functions Process Config Strategy for API V6.
 * TODO: validate and convert `bindings` (storage) once the v6 config has storage.
 */
class FunctionsProcessConfigStrategy extends ProcessConfigStrategy<AzionConfigV6> {
  /**
   * Transform azion.config Functions to V6 manifest format
   */
  transformToManifest(config: AzionConfigV6) {
    if (!Array.isArray(config?.functions) || config?.functions.length === 0) {
      return [];
    }

    return config.functions.map((func) => ({
      name: func.name,
      runtime: func.runtime || 'azion_js',
      default_args: func.defaultArgs || {},
      execution_environment: func.executionEnvironment || 'application',
      active: func.active ?? true,
      path: func.path,
    }));
  }

  /**
   * Transform V6 manifest format back to azion.config Functions
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
    transformedPayload: AzionConfigV6,
  ) {
    if (!Array.isArray(payload?.functions) || payload?.functions.length === 0) {
      return;
    }

    transformedPayload.functions = payload.functions.map((func) => ({
      name: func.name,
      path: `./functions/${func.name}.js`, // Default path since it's not in the API
      runtime: func.runtime as FunctionRuntime,
      defaultArgs: func.default_args,
      executionEnvironment: func.execution_environment as FunctionExecutionEnvironment,
      active: func.active,
    }));
  }
}

export default FunctionsProcessConfigStrategy;
