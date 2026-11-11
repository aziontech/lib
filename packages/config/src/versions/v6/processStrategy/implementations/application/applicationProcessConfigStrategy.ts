import ProcessConfigStrategy from '../../../../shared/processStrategy/processConfigStrategy';
import {
  APPLICATION_ACCELERATOR_FREE_VARIABLES,
  APPLICATION_REQUEST_BEHAVIOR_MODULES,
  APPLICATION_RESPONSE_BEHAVIOR_MODULES,
} from '../../../constants';
import type { AzionApplicationV6, AzionConfigV6, AzionRuleV6 } from '../../../types';
import CacheProcessConfigStrategy from './cacheProcessConfigStrategy';
import DeviceGroupsProcessConfigStrategy from './deviceGroupsProcessConfigStrategy';
import FunctionInstancesProcessConfigStrategy from './functionInstancesProcessConfigStrategy';
import RulesProcessConfigStrategy from './rulesProcessConfigStrategy';

/**
 * ApplicationProcessConfigStrategy
 * @class ApplicationProcessConfigStrategy
 * @description Converts the v6 applications between the config and the manifest.
 * The cache module cannot be disabled, and the behaviors and criterion variables of the rules need the modules the API
 * documents (`RequestPhaseBehaviorRequest`, `ResponsePhaseBehaviorRequest` and the criterion fields).
 */
class ApplicationProcessConfigStrategy extends ProcessConfigStrategy<AzionConfigV6> {
  private cacheStrategy = new CacheProcessConfigStrategy();
  private rulesStrategy = new RulesProcessConfigStrategy();
  private functionInstancesStrategy = new FunctionInstancesProcessConfigStrategy();
  private deviceGroupsStrategy = new DeviceGroupsProcessConfigStrategy();

  /**
   * Validate that the modules the rules need are enabled
   */
  private validateModules(app: AzionApplicationV6, modules: Record<string, { enabled: boolean }>) {
    const flags: Record<string, string> = {
      functions: 'functionsEnabled (or declare functionsInstances)',
      application_accelerator: 'applicationAcceleratorEnabled',
      image_processor: 'imageProcessorEnabled',
      cache: 'edgeCacheEnabled',
    };
    const check = (rule: AzionRuleV6, behaviorModules: Record<string, string>) => {
      rule.behaviors.forEach((behavior) => {
        const module = behaviorModules[behavior.type];
        if (module && !modules[module]?.enabled) {
          throw new Error(
            `Application "${app.name}" rule "${rule.name}" uses the behavior "${behavior.type}", which needs the ${module} module: enable it with ${flags[module]}.`,
          );
        }
      });
      rule.criteria.flat().forEach((criterion) => {
        const variable = String(criterion.variable).replace(/^\$\{|\}$/g, '');
        if (
          !(APPLICATION_ACCELERATOR_FREE_VARIABLES as readonly string[]).includes(variable) &&
          !modules.application_accelerator.enabled
        ) {
          throw new Error(
            `Application "${app.name}" rule "${rule.name}" uses the variable "${variable}", which needs the application_accelerator module: enable it with ${flags.application_accelerator}.`,
          );
        }
      });
    };

    app.rules?.request?.forEach((rule) => check(rule, APPLICATION_REQUEST_BEHAVIOR_MODULES));
    app.rules?.response?.forEach((rule) => check(rule, APPLICATION_RESPONSE_BEHAVIOR_MODULES));
  }

  transformToManifest(config: AzionConfigV6) {
    if (!config.applications || !Array.isArray(config.applications)) {
      return [];
    }

    return config.applications.map((app: AzionApplicationV6) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const application: Record<string, any> = {
        name: app.name,
        debug: app.debug ?? false,
        modules: {
          cache: {
            enabled: true,
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

      this.validateModules(app, application.modules);

      if (app.cache) {
        application.cache_settings = this.cacheStrategy.transformToManifest(app.cache);
      }

      if (app.rules) {
        application.rules = this.rulesStrategy.transformToManifest(app.rules, config.functions, config.connectors);
      }

      if (app.functionsInstances) {
        application.functions_instances = this.functionInstancesStrategy.transformToManifest(
          app.functionsInstances,
          config,
        );
      }

      if (app.deviceGroups) {
        application.device_groups = this.deviceGroupsStrategy.transformToManifest(app.deviceGroups);
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
      debug: app.debug,
      edgeCacheEnabled: app.modules?.cache?.enabled,
      functionsEnabled: app.modules?.functions?.enabled,
      applicationAcceleratorEnabled: app.modules?.application_accelerator?.enabled,
      imageProcessorEnabled: app.modules?.image_processor?.enabled,
      cache: app.cache_settings ? this.cacheStrategy.transformToConfig(app.cache_settings) : undefined,
      rules: app.rules ? this.rulesStrategy.transformToConfig(app.rules) : undefined,
      functionsInstances: app.functions_instances
        ? this.functionInstancesStrategy.transformToConfig(app.functions_instances)
        : undefined,
      deviceGroups: app.device_groups ? this.deviceGroupsStrategy.transformToConfig(app.device_groups) : undefined,
    }));

    return transformedPayload.applications;
  }
}

export default ApplicationProcessConfigStrategy;
