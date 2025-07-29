import { AzionConfig, AzionEdgeApplication } from '../../../../types';
import ProcessConfigStrategy from '../../processConfigStrategy';
import CacheProcessConfigStrategy from './cacheProcessConfigStrategy';
import DeviceGroupsProcessConfigStrategy from './deviceGroupsProcessConfigStrategy';
import FunctionInstancesProcessConfigStrategy from './functionInstancesProcessConfigStrategy';
import RulesProcessConfigStrategy from './rulesProcessConfigStrategy';

class EdgeApplicationProcessConfigStrategy extends ProcessConfigStrategy {
  private cacheStrategy = new CacheProcessConfigStrategy();
  private rulesStrategy = new RulesProcessConfigStrategy();
  private deviceGroupsStrategy = new DeviceGroupsProcessConfigStrategy();
  private functionInstancesStrategy = new FunctionInstancesProcessConfigStrategy();

  transformToManifest(config: AzionConfig) {
    if (!config.edgeApplications || !Array.isArray(config.edgeApplications)) {
      return [];
    }

    return config.edgeApplications.map((app: AzionEdgeApplication) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const application: Record<string, any> = {
        name: app.name,
        active: app.active ?? true,
        debug: app.debug ?? false,
        modules: {
          edge_cache: {
            enabled: app.edgeCacheEnabled ?? true,
          },
          edge_functions: {
            enabled: app.edgeFunctionsEnabled ?? false,
          },
          application_accelerator: {
            enabled: app.applicationAcceleratorEnabled ?? false,
          },
          image_processor: {
            enabled: app.imageProcessorEnabled ?? false,
          },
          tiered_cache: {
            enabled: app.tieredCacheEnabled ?? false,
          },
        },
      };

      if (app.cache) {
        application.cache_settings = this.cacheStrategy.transformToManifest(app.cache);
      }

      if (app.rules) {
        application.rules = this.rulesStrategy.transformToManifest(
          app.rules,
          config.edgeFunctions,
          config.edgeConnectors,
        );
      }

      if (app.deviceGroups) {
        application.device_groups = this.deviceGroupsStrategy.transformToManifest(app.deviceGroups);
      }

      if (app.functions) {
        application.functions_instances = this.functionInstancesStrategy.transformToManifest(app.functions, config);
      }

      return application;
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformToConfig(payload: any, transformedPayload: AzionConfig) {
    if (!payload.edgeApplications || !Array.isArray(payload.edgeApplications)) {
      transformedPayload.edgeApplications = [];
      return transformedPayload.edgeApplications;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transformedPayload.edgeApplications = payload.edgeApplications.map((app: any) => {
      return {
        name: app.name,
        active: app.active,
        debug: app.debug,
        edgeCacheEnabled: app.modules?.edge_cache?.enabled,
        edgeFunctionsEnabled: app.modules?.edge_functions?.enabled,
        applicationAcceleratorEnabled: app.modules?.application_accelerator?.enabled,
        imageProcessorEnabled: app.modules?.image_processor?.enabled,
        tieredCacheEnabled: app.modules?.tiered_cache?.enabled,
        cache: app.cache_settings ? this.cacheStrategy.transformToConfig(app.cache_settings) : undefined,
        rules: app.rules ? this.rulesStrategy.transformToConfig(app.rules) : undefined,
        deviceGroups: app.device_groups ? this.deviceGroupsStrategy.transformToConfig(app.device_groups) : undefined,
        functions: app.functions_instances
          ? this.functionInstancesStrategy.transformToConfig(app.functions_instances)
          : undefined,
      };
    });

    return transformedPayload.edgeApplications;
  }
}

export default EdgeApplicationProcessConfigStrategy;
