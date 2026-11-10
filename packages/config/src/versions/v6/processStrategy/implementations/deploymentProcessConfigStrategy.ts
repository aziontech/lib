import ProcessConfigStrategy from '../../../shared/processStrategy/processConfigStrategy';
import type { AzionConfigV6, AzionDeploymentV6 } from '../../types';

/**
 * DeploymentProcessConfigStrategy
 * @class DeploymentProcessConfigStrategy
 * @description Converts the v6 deployments between the config and the manifest.
 * The creation of a deployment requires `binding_policy`, which the config must declare. The replacement of a
 * deployment also requires `description` and `strategy_defaults`, so the manifest defaults them to no description and
 * no skew protection.
 * The application a deployment serves is not part of it: the Azion CLI sets it when it creates a release.
 */
class DeploymentProcessConfigStrategy extends ProcessConfigStrategy<AzionConfigV6> {
  transformToManifest(config: AzionConfigV6) {
    if (!Array.isArray(config?.deployments) || config.deployments.length === 0) {
      return [];
    }

    return config.deployments.map((deployment: AzionDeploymentV6) => {
      const skewProtection = deployment.strategyDefaults?.skewProtection;

      return {
        name: deployment.name,
        description: deployment.description ?? null,
        binding_policy: deployment.bindingPolicy,
        strategy_defaults: skewProtection
          ? {
              skew_protection: {
                enabled: skewProtection.enabled,
                default_ttl_seconds: skewProtection.defaultTtlSeconds,
              },
            }
          : {},
        ...(deployment.deploymentPolicy && { deployment_policy: deployment.deploymentPolicy }),
      };
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformToConfig(payload: { deployments?: any[] }, transformedPayload: AzionConfigV6) {
    if (!Array.isArray(payload?.deployments) || payload.deployments.length === 0) {
      return;
    }

    transformedPayload.deployments = payload.deployments.map((deployment) => {
      const skewProtection = deployment.strategy_defaults?.skew_protection;

      return {
        name: deployment.name,
        description: deployment.description,
        bindingPolicy: deployment.binding_policy,
        deploymentPolicy: deployment.deployment_policy,
        strategyDefaults: skewProtection
          ? {
              skewProtection: {
                enabled: skewProtection.enabled,
                defaultTtlSeconds: skewProtection.default_ttl_seconds,
              },
            }
          : undefined,
      };
    });

    return transformedPayload.deployments;
  }
}

export default DeploymentProcessConfigStrategy;
