import { AzionConfig, AzionDeviceGroup, AzionEdgeApplication } from '../../../../types';
import ProcessConfigStrategy from '../../processConfigStrategy';
import CacheProcessConfigStrategy from './cacheProcessConfigStrategy';
import RulesProcessConfigStrategy from './rulesProcessConfigStrategy';

class EdgeApplicationProcessConfigStrategy extends ProcessConfigStrategy {
  private cacheStrategy = new CacheProcessConfigStrategy();
  private rulesStrategy = new RulesProcessConfigStrategy();

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
        application.device_groups = app.deviceGroups.map((deviceGroup) => ({
          name: deviceGroup.name,
          user_agent: deviceGroup.userAgent,
        }));
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
        rules: app.rules ? this.rulesStrategy.transformToConfig(app.rules, transformedPayload) : undefined,
        deviceGroups: app.device_groups
          ? app.device_groups.map(
              (deviceGroup: { name: string; user_agent: string }): AzionDeviceGroup => ({
                name: deviceGroup.name,
                userAgent: deviceGroup.user_agent,
              }),
            )
          : undefined,
      };
    });

    return transformedPayload.edgeApplications;
  }
}

export default EdgeApplicationProcessConfigStrategy;
