import ProcessConfigStrategy from '../../../shared/processStrategy/processConfigStrategy';
import type { AzionConfigV6, AzionEnvironmentV6 } from '../../types';

/**
 * EnvironmentProcessConfigStrategy
 * @class EnvironmentProcessConfigStrategy
 * @description Converts the v6 environments between the config and the manifest.
 * The API requires `log_verbosity`, `robots_policy`, `protection`, `branch_tracking` and `description`, so the manifest
 * defaults them to the least intrusive values: normal logs, the robots policy of the origin, no protection, no branch
 * tracking and no description.
 */
class EnvironmentProcessConfigStrategy extends ProcessConfigStrategy<AzionConfigV6> {
  transformToManifest(config: AzionConfigV6) {
    if (!Array.isArray(config?.environments) || config.environments.length === 0) {
      return [];
    }

    return config.environments.map((environment: AzionEnvironmentV6) => {
      const { protection, branchTracking } = environment;

      return {
        name: environment.name,
        description: environment.description ?? null,
        log_verbosity: environment.logVerbosity ?? 'normal',
        robots_policy: environment.robotsPolicy ?? 'respect_origin',
        protection: {
          ...(protection?.azionAuthentication && { azion_authentication: protection.azionAuthentication }),
          ...(protection?.passwordProtection && {
            password_protection: {
              enabled: protection.passwordProtection.enabled,
              secret_id: protection.passwordProtection.secretId,
            },
          }),
          ...(protection?.ipAllowlist && { ip_allowlist: protection.ipAllowlist }),
          ...(protection?.ssoEnforcement && {
            sso_enforcement: {
              enabled: protection.ssoEnforcement.enabled,
              idp_id: protection.ssoEnforcement.idpId,
              allowed_domains: protection.ssoEnforcement.allowedDomains,
            },
          }),
        },
        branch_tracking: branchTracking
          ? {
              enabled: branchTracking.enabled,
              mode: branchTracking.mode,
              branch_match: branchTracking.branchMatch,
            }
          : null,
        ...(environment.deploymentPolicy && { deployment_policy: environment.deploymentPolicy }),
      };
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformToConfig(payload: { environments?: any[] }, transformedPayload: AzionConfigV6) {
    if (!Array.isArray(payload?.environments) || payload.environments.length === 0) {
      return;
    }

    transformedPayload.environments = payload.environments.map((environment) => {
      const protection = environment.protection;
      const branchTracking = environment.branch_tracking;

      return {
        name: environment.name,
        description: environment.description,
        logVerbosity: environment.log_verbosity,
        robotsPolicy: environment.robots_policy,
        protection: protection && {
          azionAuthentication: protection.azion_authentication,
          passwordProtection: protection.password_protection && {
            enabled: protection.password_protection.enabled,
            secretId: protection.password_protection.secret_id,
          },
          ipAllowlist: protection.ip_allowlist,
          ssoEnforcement: protection.sso_enforcement && {
            enabled: protection.sso_enforcement.enabled,
            idpId: protection.sso_enforcement.idp_id,
            allowedDomains: protection.sso_enforcement.allowed_domains,
          },
        },
        branchTracking: branchTracking
          ? {
              enabled: branchTracking.enabled,
              mode: branchTracking.mode,
              branchMatch: branchTracking.branch_match,
            }
          : null,
        deploymentPolicy: environment.deployment_policy,
      };
    });

    return transformedPayload.environments;
  }
}

export default EnvironmentProcessConfigStrategy;
