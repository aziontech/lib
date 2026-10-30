import type { AzionConfigV6 } from '../../types';
import DeploymentProcessConfigStrategy from './deploymentProcessConfigStrategy';

describe('DeploymentProcessConfigStrategy (v6)', () => {
  let strategy: DeploymentProcessConfigStrategy;

  beforeEach(() => {
    strategy = new DeploymentProcessConfigStrategy();
  });

  describe('transformToManifest', () => {
    it('should return an empty array when there are no deployments', () => {
      expect(strategy.transformToManifest({ version: 6 })).toEqual([]);
    });

    it('should apply the defaults the API requires to a minimal deployment', () => {
      expect(strategy.transformToManifest({ version: 6, deployments: [{ name: 'default-deployment' }] })).toEqual([
        {
          name: 'default-deployment',
          description: null,
          binding_policy: 'FLEXIBLE',
          strategy_defaults: {},
        },
      ]);
    });

    it('should map every field of the deployment to the manifest', () => {
      const [deployment] = strategy.transformToManifest({
        version: 6,
        deployments: [
          {
            name: 'default-deployment',
            description: 'Default',
            bindingPolicy: 'STRICT',
            deploymentPolicy: 'single_version',
            strategyDefaults: { skewProtection: { enabled: true, defaultTtlSeconds: 3600 } },
          },
        ],
      });

      expect(deployment).toEqual({
        name: 'default-deployment',
        description: 'Default',
        binding_policy: 'STRICT',
        strategy_defaults: { skew_protection: { enabled: true, default_ttl_seconds: 3600 } },
        deployment_policy: 'single_version',
      });
    });
  });

  describe('transformToConfig', () => {
    it('should not set deployments when the manifest has none', () => {
      const transformedPayload: AzionConfigV6 = { version: 6 };

      expect(strategy.transformToConfig({}, transformedPayload)).toBeUndefined();
      expect(transformedPayload.deployments).toBeUndefined();
    });

    it('should round trip a deployment through the manifest', () => {
      const config: AzionConfigV6 = {
        version: 6,
        deployments: [
          {
            name: 'default-deployment',
            description: 'Default',
            bindingPolicy: 'STRICT',
            deploymentPolicy: 'single_version',
            strategyDefaults: { skewProtection: { enabled: true, defaultTtlSeconds: 3600 } },
          },
        ],
      };
      const transformedPayload: AzionConfigV6 = { version: 6 };

      strategy.transformToConfig({ deployments: strategy.transformToManifest(config) }, transformedPayload);

      expect(transformedPayload.deployments).toEqual(config.deployments);
    });
  });
});
