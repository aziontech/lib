import ProcessConfigStrategy from '../../../../shared/processStrategy/processConfigStrategy';
import type { AzionApplicationV6, AzionConfigV6 } from '../../../types';
import FunctionInstancesProcessConfigStrategy from './functionInstancesProcessConfigStrategy';
import RulesProcessConfigStrategy from './rulesProcessConfigStrategy';

/**
 * ApplicationProcessConfigStrategy
 * @class ApplicationProcessConfigStrategy
 * @description Converts the v6 applications between the config and the manifest.
 * TODO: convert the remaining resources of an application (cache settings, device groups).
 */
class ApplicationProcessConfigStrategy extends ProcessConfigStrategy<AzionConfigV6> {
  private rulesStrategy = new RulesProcessConfigStrategy();
  private functionInstancesStrategy = new FunctionInstancesProcessConfigStrategy();

  transformToManifest(config: AzionConfigV6) {
    if (!config.applications || !Array.isArray(config.applications)) {
      return [];
    }

    return config.applications.map((app: AzionApplicationV6) => {
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

      if (app.rules) {
        application.rules = this.rulesStrategy.transformToManifest(app.rules, config.functions);
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
  transformToConfig(payload: any, transformedPayload: AzionConfigV6) {
    if (!payload.applications || !Array.isArray(payload.applications)) {
      transformedPayload.applications = [];
      return transformedPayload.applications;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transformedPayload.applications = payload.applications.map((app: any) => ({
      name: app.name,
      active: app.active,
      debug: app.debug,
      edgeCacheEnabled: app.modules?.cache?.enabled,
      functionsEnabled: app.modules?.functions?.enabled,
      applicationAcceleratorEnabled: app.modules?.application_accelerator?.enabled,
      imageProcessorEnabled: app.modules?.image_processor?.enabled,
      rules: app.rules ? this.rulesStrategy.transformToConfig(app.rules) : undefined,
      functionsInstances: app.functions_instances
        ? this.functionInstancesStrategy.transformToConfig(app.functions_instances)
        : undefined,
    }));

    return transformedPayload.applications;
  }
}

export default ApplicationProcessConfigStrategy;
