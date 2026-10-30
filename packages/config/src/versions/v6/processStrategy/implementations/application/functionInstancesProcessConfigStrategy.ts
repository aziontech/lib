import type { AzionFunctionInstance } from '../../../../../types';
import ProcessConfigStrategy from '../../../../shared/processStrategy/processConfigStrategy';
import type { AzionConfigV6, AzionFunctionV6 } from '../../../types';

/**
 * FunctionInstancesProcessConfigStrategy V6
 * @class FunctionInstancesProcessConfigStrategy
 * @description This class is implementation of the Function Instances Process Config Strategy for API V6.
 */
class FunctionInstancesProcessConfigStrategy extends ProcessConfigStrategy<AzionConfigV6> {
  /**
   * Validate that referenced Function exists
   */
  private validateFunctionReference(
    functions: AzionFunctionV6[] | undefined,
    functionNameOrId: string | number,
    instanceName: string,
  ) {
    // Only validate if it's a string (name), skip validation for numbers (IDs)
    if (typeof functionNameOrId === 'string') {
      if (!Array.isArray(functions) || !functions.find((func) => func.name === functionNameOrId)) {
        throw new Error(`Function instance "${instanceName}" references non-existent Function "${functionNameOrId}".`);
      }
    }
  }

  /**
   * Transform azion.config Function Instances to V6 manifest format
   */
  transformToManifest(functionInstances: AzionFunctionInstance[], config: AzionConfigV6) {
    if (!Array.isArray(functionInstances) || functionInstances.length === 0) {
      return;
    }

    return functionInstances.map((instance) => {
      // Validate Function reference
      this.validateFunctionReference(config.functions, instance.ref, instance.name);

      return {
        name: instance.name,
        function: instance.ref,
        args: instance.args || {},
        active: instance.active ?? true,
      };
    });
  }

  /**
   * Transform V6 manifest format back to azion.config Function Instances
   * Note: the API returns function as ID, but azion.config expects function name.
   * The CLI should resolve ID to name before calling this method.
   */
  transformToConfig(
    payload: Array<{ name: string; function: number | string; args?: Record<string, unknown>; active?: boolean }>,
  ): AzionFunctionInstance[] {
    if (!Array.isArray(payload) || payload.length === 0) {
      return [];
    }

    return payload.map((instance) => ({
      name: instance.name,
      ref: instance.function,
      args: instance.args,
      active: instance.active ?? true,
    }));
  }
}

export default FunctionInstancesProcessConfigStrategy;
