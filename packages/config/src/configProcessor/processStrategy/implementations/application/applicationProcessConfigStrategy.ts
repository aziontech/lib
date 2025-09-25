import { AzionApplication, AzionConfig } from '../../../../types';
import ProcessConfigStrategy from '../../processConfigStrategy';
import CacheProcessConfigStrategy from './cacheProcessConfigStrategy';
import DeviceGroupsProcessConfigStrategy from './deviceGroupsProcessConfigStrategy';
import FunctionInstancesProcessConfigStrategy from './functionInstancesProcessConfigStrategy';
import RulesProcessConfigStrategy from './rulesProcessConfigStrategy';

class ApplicationProcessConfigStrategy extends ProcessConfigStrategy {
  private cacheStrategy = new CacheProcessConfigStrategy();
  private rulesStrategy = new RulesProcessConfigStrategy();
  private deviceGroupsStrategy = new DeviceGroupsProcessConfigStrategy();
  private functionInstancesStrategy = new FunctionInstancesProcessConfigStrategy();

  transformToManifest(config: AzionConfig) {
    if (!config.applications || !Array.isArray(config.applications)) {
      return [];
    }

    return config.applications.map((app: AzionApplication) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const application: Record<string, any> = {
        name: app.name,
        active: app.active ?? true,
        debug: app.debug ?? false,
        modules: {
          cache: {
            enabled: app.edgeCacheEnabled ?? true,
          },
          functions: {
            enabled:
              app.functionsEnabled || (app.functionsInstances && app.functionsInstances.length > 0) ? true : false,
          },
          application_accelerator: {
            enabled: app.applicationAcceleratorEnabled ?? true,
          },
          image_processor: {
            enabled: app.imageProcessorEnabled ?? false,
          },
        },
      };

      if (app.cache) {
        application.cache_settings = this.cacheStrategy.transformToManifest(app.cache);
      }

      if (app.rules) {
        application.rules = this.rulesStrategy.transformToManifest(app.rules, config.functions, config.connectors);
      }

      if (app.deviceGroups) {
        application.device_groups = this.deviceGroupsStrategy.transformToManifest(app.deviceGroups);
      }

      if (app.functionsInstances) {
        application.functions_instances = this.functionInstancesStrategy.transformToManifest(
          app.functionsInstances,
          config,
        );
      }

      return application;
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformToConfig(payload: any, transformedPayload: AzionConfig) {
    if (!payload.applications || !Array.isArray(payload.applications)) {
      transformedPayload.applications = [];
      return transformedPayload.applications;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transformedPayload.applications = payload.applications.map((app: any) => {
      return {
        name: app.name,
        active: app.active,
        debug: app.debug,
        edgeCacheEnabled: app.modules?.cache?.enabled,
        functionsEnabled: app.modules?.functions?.enabled,
        applicationAcceleratorEnabled: app.modules?.application_accelerator?.enabled,
        imageProcessorEnabled: app.modules?.image_processor?.enabled,
        tieredCacheEnabled: app.modules?.cache?.tiered_cache?.enabled !== undefined ? true : false,
        cache: app.cache_settings ? this.cacheStrategy.transformToConfig(app.cache_settings) : undefined,
        rules: app.rules ? this.rulesStrategy.transformToConfig(app.rules) : undefined,
        deviceGroups: app.device_groups ? this.deviceGroupsStrategy.transformToConfig(app.device_groups) : undefined,
        functionsInstances: app.functions_instances
          ? this.functionInstancesStrategy.transformToConfig(app.functions_instances)
          : undefined,
      };
    });

    return transformedPayload.applications;
  }
}

export default ApplicationProcessConfigStrategy;
