import { AzionConfig, AzionEdgeApplication } from '../../../../types';
import ProcessConfigStrategy from '../../processConfigStrategy';
import CacheProcessConfigStrategy from './cacheProcessConfigStrategy';
import RulesProcessConfigStrategy from './rulesProcessConfigStrategy';

class EdgeApplicationProcessConfigStrategy extends ProcessConfigStrategy {
  private cacheStrategy = new CacheProcessConfigStrategy();
  private rulesStrategy = new RulesProcessConfigStrategy();

  transformToManifest(config: AzionConfig) {
    if (!config.edgeApplication || !Array.isArray(config.edgeApplication)) {
      return [];
    }

    return config.edgeApplication.map((app: AzionEdgeApplication) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const application: Record<string, any> = {
        name: app.name,
        active: app.active ?? true,
        debug: app.debug ?? false,
        edge_cache_enabled: app.edgeCacheEnabled ?? true,
        edge_functions_enabled: app.edgeFunctionsEnabled ?? false,
        application_accelerator_enabled: app.applicationAcceleratorEnabled ?? false,
        image_processor_enabled: app.imageProcessorEnabled ?? false,
        tiered_cache_enabled: app.tieredCacheEnabled ?? false,
      };

      if (app.cache) {
        application.cache_settings = this.cacheStrategy.transformToManifest(app.cache);
      }

      if (app.rules) {
        application.rules = this.rulesStrategy.transformToManifest(app.rules, config.edgeFunction);
      }

      return application;
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformToConfig(payload: any, transformedPayload: AzionConfig) {
    if (!payload.edgeApplication || !Array.isArray(payload.edgeApplication)) {
      transformedPayload.edgeApplication = [];
      return transformedPayload.edgeApplication;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transformedPayload.edgeApplication = payload.edgeApplication.map((app: any) => {
      return {
        name: app.name,
        active: app.active,
        debug: app.debug,
        edgeCacheEnabled: app.edge_cache_enabled,
        edgeFunctionsEnabled: app.edge_functions_enabled,
        applicationAcceleratorEnabled: app.application_accelerator_enabled,
        imageProcessorEnabled: app.image_processor_enabled,
        tieredCacheEnabled: app.tiered_cache_enabled,
        cache: app.cache_settings ? this.cacheStrategy.transformToConfig(app.cache_settings) : undefined,
        rules: app.rules ? this.rulesStrategy.transformToConfig(app.rules, transformedPayload) : undefined,
      };
    });

    return transformedPayload.edgeApplication;
  }
}

export default EdgeApplicationProcessConfigStrategy;
