import { AzionConfig } from '../../../types';
import ProcessConfigStrategy from '../processConfigStrategy';
import CacheProcessConfigStrategy from './cacheProcessConfigStrategy';
import RulesProcessConfigStrategy from './rulesProcessConfigStrategy';

export default class ApplicationProcessConfigStrategy extends ProcessConfigStrategy {
  private rulesStrategy = new RulesProcessConfigStrategy();
  private cacheStrategy = new CacheProcessConfigStrategy();

  private validateWorkloadReferences(config: AzionConfig) {
    if (!config.workload || !config.edgeApplication) {
      return;
    }

    const applicationNames = new Set(config.edgeApplication.map((app) => app.name));
    if (!applicationNames.has(config.workload.edgeApplication)) {
      throw new Error(
        `Edge Application "${config.workload.edgeApplication}" referenced in workload "${config.workload.name}" is not defined in the application array.`,
      );
    }
  }

  transformToManifest(config: AzionConfig) {
    if (!config.edgeApplication || config.edgeApplication.length === 0) {
      return undefined;
    }

    this.validateWorkloadReferences(config);

    return config.edgeApplication.map((app) => {
      const tempConfig: AzionConfig = {
        rules: app.rules,
        cache: app.cache,
      };

      // Processa rules, cache e functions para o manifesto
      const rulesManifest = this.rulesStrategy.transformToManifest(tempConfig, {});
      const cacheManifest = this.cacheStrategy.transformToManifest(tempConfig);

      return {
        name: app.name,
        modules: {
          edge_cache_enabled: app.edgeCache ?? true,
          edge_functions_enabled: app.edgeFunctions ?? false,
          application_accelerator_enabled: app.applicationAccelerator ?? false,
          image_processor_enabled: app.imageProcessor ?? false,
          tiered_cache_enabled: app.tieredCache ?? false,
        },
        active: app.active ?? true,
        debug: app.debug ?? false,
        rules: rulesManifest,
        cache_settings: cacheManifest,
      };
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformToConfig(payload: Record<string, unknown>, transformedPayload: AzionConfig) {
    if (!payload.application || !Array.isArray(payload.application) || payload.application.length === 0) {
      return undefined;
    }

    transformedPayload.edgeApplication = (payload.edgeApplication as Record<string, unknown>[]).map((app) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tempPayload: any = {
        rules: app.rules,
        cache: app.cache_settings,
        functions: app.functions,
      };

      const tempConfig: AzionConfig = {};

      this.rulesStrategy.transformToConfig(tempPayload, tempConfig);
      this.cacheStrategy.transformToConfig(tempPayload, tempConfig);

      return {
        name: app.name as string,
        edgeCache: (app.modules as Record<string, boolean>)?.edge_cache_enabled ?? true,
        edgeFunctions: (app.modules as Record<string, boolean>)?.edge_functions_enabled ?? false,
        applicationAccelerator: (app.modules as Record<string, boolean>)?.application_accelerator_enabled ?? false,
        imageProcessor: (app.modules as Record<string, boolean>)?.image_processor_enabled ?? false,
        tieredCache: (app.modules as Record<string, boolean>)?.tiered_cache_enabled ?? false,
        active: (app.active as boolean) ?? true,
        debug: (app.debug as boolean) ?? false,
        rules: tempConfig.rules,
        cache: tempConfig.cache,
      };
    });

    return transformedPayload.edgeApplication;
  }
}
