import type { AzionConfigV6 } from '../../types';
import EnvironmentProcessConfigStrategy from './environmentProcessConfigStrategy';

describe('EnvironmentProcessConfigStrategy (v6)', () => {
  let strategy: EnvironmentProcessConfigStrategy;

  beforeEach(() => {
    strategy = new EnvironmentProcessConfigStrategy();
  });

  describe('transformToManifest', () => {
    it('should return an empty array when there are no environments', () => {
      expect(strategy.transformToManifest({ version: 6 })).toEqual([]);
    });

    it('should write the deployment policy and apply the defaults the API requires to the other fields', () => {
      expect(
        strategy.transformToManifest({
          version: 6,
          environments: [{ name: 'production', deploymentPolicy: 'single_version' }],
        }),
      ).toEqual([
        {
          name: 'production',
          description: null,
          log_verbosity: 'normal',
          robots_policy: 'respect_origin',
          protection: {},
          branch_tracking: null,
          deployment_policy: 'single_version',
        },
      ]);
    });

    it('should write the deployment policy that the config declares', () => {
      const policies = (['single_version', 'versioned_urls'] as const).map(
        (deploymentPolicy) =>
          strategy.transformToManifest({ version: 6, environments: [{ name: 'production', deploymentPolicy }] })?.[0]
            .deployment_policy,
      );

      expect(policies).toEqual(['single_version', 'versioned_urls']);
    });

    it('should map every field of the environment to the manifest', () => {
      const [environment] = strategy.transformToManifest({
        version: 6,
        environments: [
          {
            name: 'staging',
            description: 'Staging',
            logVerbosity: 'verbose',
            robotsPolicy: 'noindex',
            protection: {
              azionAuthentication: { enabled: true },
              passwordProtection: { enabled: true, secretId: 'secret' },
              ipAllowlist: { enabled: true, cidrs: ['10.0.0.0/8'] },
              ssoEnforcement: { enabled: true, idpId: 'idp', allowedDomains: ['azion.com'] },
            },
            branchTracking: { enabled: true, mode: 'branch_is', branchMatch: 'main' },
            deploymentPolicy: 'versioned_urls',
          },
        ],
      });

      expect(environment).toEqual({
        name: 'staging',
        description: 'Staging',
        log_verbosity: 'verbose',
        robots_policy: 'noindex',
        protection: {
          azion_authentication: { enabled: true },
          password_protection: { enabled: true, secret_id: 'secret' },
          ip_allowlist: { enabled: true, cidrs: ['10.0.0.0/8'] },
          sso_enforcement: { enabled: true, idp_id: 'idp', allowed_domains: ['azion.com'] },
        },
        branch_tracking: { enabled: true, mode: 'branch_is', branch_match: 'main' },
        deployment_policy: 'versioned_urls',
      });
    });
  });

  describe('transformToConfig', () => {
    it('should not set environments when the manifest has none', () => {
      const transformedPayload: AzionConfigV6 = { version: 6 };

      expect(strategy.transformToConfig({}, transformedPayload)).toBeUndefined();
      expect(transformedPayload.environments).toBeUndefined();
    });

    it('should round trip an environment through the manifest', () => {
      const config: AzionConfigV6 = {
        version: 6,
        environments: [
          {
            name: 'staging',
            description: 'Staging',
            logVerbosity: 'verbose',
            robotsPolicy: 'noindex',
            protection: {
              azionAuthentication: { enabled: true },
              passwordProtection: { enabled: true, secretId: 'secret' },
              ipAllowlist: { enabled: true, cidrs: ['10.0.0.0/8'] },
              ssoEnforcement: { enabled: true, idpId: 'idp', allowedDomains: ['azion.com'] },
            },
            branchTracking: { enabled: true, mode: 'branch_is', branchMatch: 'main' },
            deploymentPolicy: 'versioned_urls',
          },
        ],
      };
      const transformedPayload: AzionConfigV6 = { version: 6 };

      strategy.transformToConfig({ environments: strategy.transformToManifest(config) }, transformedPayload);

      expect(transformedPayload.environments).toEqual(config.environments);
    });
  });
});
