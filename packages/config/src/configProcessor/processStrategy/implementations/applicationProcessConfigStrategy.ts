import { AzionConfig } from '../../../types';
import ProcessConfigStrategy from '../processConfigStrategy';
import CacheProcessConfigStrategy from './cacheProcessConfigStrategy';
import FunctionsProcessConfigStrategy from './functionsProcessConfigStrategy';
import RulesProcessConfigStrategy from './rulesProcessConfigStrategy';

export default class ApplicationProcessConfigStrategy extends ProcessConfigStrategy {
  private rulesStrategy = new RulesProcessConfigStrategy();
  private cacheStrategy = new CacheProcessConfigStrategy();
  private functionsStrategy = new FunctionsProcessConfigStrategy();

  transformToManifest(config: AzionConfig) {
    if (!config.application || config.application.length === 0) {
      return undefined;
    }

    return config.application.map((app) => {
      const tempConfig: AzionConfig = {
        rules: app.rules,
        cache: app.cache,
        functions: app.functions,
      };

      // Processa rules, cache e functions para o manifesto
      const rulesManifest = this.rulesStrategy.transformToManifest(tempConfig, {});
      const cacheManifest = this.cacheStrategy.transformToManifest(tempConfig);
      const functionsManifest = this.functionsStrategy.transformToManifest(tempConfig);

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
        functions: functionsManifest,
      };
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformToConfig(payload: Record<string, unknown>, transformedPayload: AzionConfig) {
    if (!payload.application || !Array.isArray(payload.application) || payload.application.length === 0) {
      return undefined;
    }

    transformedPayload.application = (payload.application as Record<string, unknown>[]).map((app) => {
      // Cria um payload temporário para processar subelementos
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tempPayload: any = {
        rules: app.rules,
        cache: app.cache_settings,
        functions: app.functions,
      };

      // Cria um objeto de configuração temporário
      const tempConfig: AzionConfig = {};

      // Processa subelementos usando as estratégias específicas
      this.rulesStrategy.transformToConfig(tempPayload, tempConfig);
      this.cacheStrategy.transformToConfig(tempPayload, tempConfig);
      this.functionsStrategy.transformToConfig(tempPayload, tempConfig);

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
        functions: tempConfig.functions,
      };
    });

    return transformedPayload.application;
  }
}
