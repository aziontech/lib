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
    functionName: string,
    instanceName: string,
  ) {
    if (!Array.isArray(edgeFunctions) || !edgeFunctions.find((func) => func.name === functionName)) {
      throw new Error(
        `Function instance "${instanceName}" references Edge Function "${functionName}" which is not defined in the edgeFunctions array.`,
      );
    }
  }

  /**
   * Validate storage binding reference
   */
  private validateStorageBinding(config: AzionConfig, bucketName: string, instanceName: string) {
    if (!Array.isArray(config?.edgeStorage) || !config.edgeStorage.find((storage) => storage.name === bucketName)) {
      throw new Error(
        `Function instance "${instanceName}" references storage bucket "${bucketName}" which is not defined in the edgeStorage configuration.`,
      );
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

      // Validate storage binding if exists
      if (instance.bindings?.storage?.bucket) {
        this.validateStorageBinding(config, instance.bindings.storage.bucket, instance.name);
      }

      return {
        name: instance.name,
        edge_function: instance.ref, // Will be resolved to ID by CLI/API
        args: instance.args || {},
      };
    });
  }

  /**
   * Transform V4 manifest format back to azion.config Function Instances
   * Note: API V4 returns edge_function as ID, but azion.config expects function name.
   * The CLI should resolve ID to name before calling this method.
   */
  transformToConfig(
    payload: Array<{ name: string; edge_function: number | string; args?: Record<string, unknown> }>,
  ): AzionFunctionInstance[] {
    if (!Array.isArray(payload) || payload.length === 0) {
      return [];
    }

    return payload.map((instance) => ({
      name: instance.name,
      ref: String(instance.edge_function), // CLI should resolve ID to function name before calling this
      args: instance.args,
      // Note: bindings are not returned by V4 API, so we don't restore them
    }));
  }
}

export default FunctionInstancesProcessConfigStrategy;
