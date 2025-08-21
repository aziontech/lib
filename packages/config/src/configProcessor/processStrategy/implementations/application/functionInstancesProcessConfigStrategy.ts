import { AzionConfig, AzionEdgeFunction, AzionFunctionInstance } from '../../../../types';
import ProcessConfigStrategy from '../../processConfigStrategy';

/**
 * FunctionInstancesProcessConfigStrategy V4
 * @class FunctionInstancesProcessConfigStrategy
 * @description This class is implementation of the Function Instances Process Config Strategy for API V4.
 */
class FunctionInstancesProcessConfigStrategy extends ProcessConfigStrategy {
  /**
   * Validate that referenced Edge Function exists
   */
  private validateEdgeFunctionReference(
    edgeFunctions: AzionEdgeFunction[] | undefined,
    functionNameOrId: string | number,
    instanceName: string,
  ) {
    // Only validate if it's a string (name), skip validation for numbers (IDs)
    if (typeof functionNameOrId === 'string') {
      if (!Array.isArray(edgeFunctions) || !edgeFunctions.find((func) => func.name === functionNameOrId)) {
        throw new Error(
          `Function instance "${instanceName}" references non-existent Edge Function "${functionNameOrId}".`,
        );
      }
    }
  }

  /**
   * Transform azion.config Function Instances to V4 manifest format
   */
  transformToManifest(functionInstances: AzionFunctionInstance[], config: AzionConfig) {
    if (!Array.isArray(functionInstances) || functionInstances.length === 0) {
      return;
    }

    return functionInstances.map((instance) => {
      // Validate Edge Function reference
      this.validateEdgeFunctionReference(config.edgeFunctions, instance.ref, instance.name);

      return {
        name: instance.name,
        edge_function: instance.ref,
        args: instance.args || {},
        active: instance.active ?? true,
      };
    });
  }

  /**
   * Transform V4 manifest format back to azion.config Function Instances
   * Note: API V4 returns edge_function as ID, but azion.config expects function name.
   * The CLI should resolve ID to name before calling this method.
   */
  transformToConfig(
    payload: Array<{ name: string; edge_function: number | string; args?: Record<string, unknown>; active?: boolean }>,
  ): AzionFunctionInstance[] {
    if (!Array.isArray(payload) || payload.length === 0) {
      return [];
    }

    return payload.map((instance) => ({
      name: instance.name,
      ref: instance.edge_function,
      args: instance.args,
      active: instance.active ?? true,
    }));
  }
}

export default FunctionInstancesProcessConfigStrategy;
