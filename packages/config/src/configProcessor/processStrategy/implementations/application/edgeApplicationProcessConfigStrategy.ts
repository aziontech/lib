import { AzionConfig, AzionEdgeApplication } from '../../../../types';
import ProcessConfigStrategy from '../../processConfigStrategy';
import CacheProcessConfigStrategy from './cacheProcessConfigStrategy';
import RulesProcessConfigStrategy from './rulesProcessConfigStrategy';

class EdgeApplicationProcessConfigStrategy extends ProcessConfigStrategy {
  private cacheStrategy = new CacheProcessConfigStrategy();
  private rulesStrategy = new RulesProcessConfigStrategy();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformToManifest(config: AzionConfig, context: Record<string, any>) {
    if (!config.edgeApplication || !Array.isArray(config.edgeApplication)) {
      return context;
    }

    context.application = config.edgeApplication.map((app: AzionEdgeApplication) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const application: Record<string, any> = {
        main_settings: {
          name: app.name,
          active: app.active ?? true,
          debug: app.debug ?? false,
          edge_cache_enabled: app.edgeCacheEnabled ?? true,
          edge_functions_enabled: app.edgeFunctionsEnabled ?? false,
          application_accelerator_enabled: app.applicationAcceleratorEnabled ?? false,
          image_processor_enabled: app.imageProcessorEnabled ?? false,
          tiered_cache_enabled: app.tieredCacheEnabled ?? false,
        },
      };

      if (app.cache) {
        application.cache_settings = this.cacheStrategy.transformToManifest(app.cache);
      }

      if (app.rules) {
        application.rules = this.rulesStrategy.transformToManifest(app.rules, config.functions);
      }

      return application;
    });

    return context;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformToConfig(payload: any, transformedPayload: AzionConfig) {
    if (!payload.application || !Array.isArray(payload.application)) {
      transformedPayload.edgeApplication = [];
      return transformedPayload;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transformedPayload.edgeApplication = payload.application.map((app: any) => {
      const mainSettings = app.main_settings || {};

      return {
        name: mainSettings.name,
        active: mainSettings.active,
        debug: mainSettings.debug,
        edgeCacheEnabled: mainSettings.edge_cache_enabled,
        edgeFunctionsEnabled: mainSettings.edge_functions_enabled,
        applicationAcceleratorEnabled: mainSettings.application_accelerator_enabled,
        imageProcessorEnabled: mainSettings.image_processor_enabled,
        tieredCacheEnabled: mainSettings.tiered_cache_enabled,
        cache: app.cache_settings ? this.cacheStrategy.transformToConfig(app.cache_settings) : undefined,
        rules: app.rules ? this.rulesStrategy.transformToConfig(app.rules, transformedPayload) : undefined,
      };
    });

    return transformedPayload;
  }
}

export default EdgeApplicationProcessConfigStrategy;
