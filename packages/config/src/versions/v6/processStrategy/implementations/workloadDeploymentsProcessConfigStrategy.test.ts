import type { AzionConfigV6, AzionWorkloadDeploymentV6 } from '../../types';
import WorkloadDeploymentsProcessConfigStrategy from './workloadDeploymentsProcessConfigStrategy';

describe('WorkloadDeploymentsProcessConfigStrategy (v6)', () => {
  let strategy: WorkloadDeploymentsProcessConfigStrategy;

  const deployment = (
    attributes: AzionWorkloadDeploymentV6['strategy']['attributes'] = { application: 'my-app' },
    extra: Partial<AzionWorkloadDeploymentV6> = {},
  ): AzionWorkloadDeploymentV6 => ({
    name: 'my-deployment',
    strategy: { type: 'default', attributes },
    ...extra,
  });

  const declared: AzionConfigV6 = {
    version: 6,
    applications: [{ name: 'my-app' }],
    firewall: [{ name: 'my-firewall' }],
    customPages: [{ name: 'my-page', pages: [] }],
  };

  beforeEach(() => {
    strategy = new WorkloadDeploymentsProcessConfigStrategy();
  });

  describe('transformToManifest', () => {
    it('should return an empty array when there are no workloads or deployments', () => {
      expect(strategy.transformToManifest({ version: 6 })).toEqual([]);
      expect(strategy.transformToManifest({ version: 6, workloads: [{ name: 'w' }] })).toEqual([]);
    });

    it('should apply the defaults and name the workload each deployment belongs to', () => {
      const result = strategy.transformToManifest({
        ...declared,
        workloads: [{ name: 'my-workload', deployments: [deployment()] }],
      });

      expect(result).toEqual([
        {
          workload_name: 'my-workload',
          name: 'my-deployment',
          current: true,
          active: true,
          strategy: { type: 'default', attributes: { application: 'my-app', firewall: null, custom_page: null } },
        },
      ]);
    });

    it('should list the deployments of every workload', () => {
      const result = strategy.transformToManifest({
        ...declared,
        workloads: [
          { name: 'a', deployments: [deployment(), deployment({ application: 'my-app' }, { name: 'second' })] },
          { name: 'b', deployments: [deployment({ application: 'my-app' }, { name: 'third' })] },
        ],
      });

      expect(result.map((item) => [item.workload_name, item.name])).toEqual([
        ['a', 'my-deployment'],
        ['a', 'second'],
        ['b', 'third'],
      ]);
    });

    it('should keep names as names and IDs as numbers (the CLI resolves the names)', () => {
      const [named] = strategy.transformToManifest({
        ...declared,
        workloads: [
          {
            name: 'w',
            deployments: [
              deployment(
                { application: 'my-app', firewall: 'my-firewall', customPage: 'my-page' },
                { current: false, active: false },
              ),
            ],
          },
        ],
      });
      const [withIds] = strategy.transformToManifest({
        version: 6,
        workloads: [{ name: 'w', deployments: [deployment({ application: 10, firewall: 20, customPage: 30 })] }],
      });

      expect(named).toEqual(expect.objectContaining({ current: false, active: false }));
      expect(named.strategy.attributes).toEqual({
        application: 'my-app',
        firewall: 'my-firewall',
        custom_page: 'my-page',
      });
      expect(withIds.strategy.attributes).toEqual({ application: 10, firewall: 20, custom_page: 30 });
    });

    it('should throw when the application, firewall or custom page is not declared', () => {
      const run = (attributes: AzionWorkloadDeploymentV6['strategy']['attributes'], config = declared) =>
        strategy.transformToManifest({ ...config, workloads: [{ name: 'w', deployments: [deployment(attributes)] }] });

      expect(() => run({ application: 'other' })).toThrow(
        'Workload deployment "my-deployment" references non-existent Application "other".',
      );
      expect(() => run({ application: 'my-app', firewall: 'other' })).toThrow(
        'Workload deployment "my-deployment" references non-existent Firewall "other".',
      );
      expect(() => run({ application: 'my-app', customPage: 'other' })).toThrow(
        'Workload deployment "my-deployment" references non-existent Custom Page "other".',
      );
      expect(() => run({ application: 'my-app' }, { version: 6 })).toThrow('non-existent Application "my-app"');
    });
  });

  describe('transformToConfig', () => {
    it('should not change the workloads when the manifest has no deployments', () => {
      const transformedPayload: AzionConfigV6 = { version: 6, workloads: [{ name: 'w' }] };

      expect(strategy.transformToConfig({}, transformedPayload)).toBeUndefined();
      expect(strategy.transformToConfig({ workload_deployments: [] }, transformedPayload)).toBeUndefined();
      expect(transformedPayload.workloads).toEqual([{ name: 'w' }]);
    });

    it('should give each workload the deployments that name it', () => {
      const transformedPayload: AzionConfigV6 = { version: 6, workloads: [{ name: 'a' }, { name: 'b' }] };

      strategy.transformToConfig(
        {
          workload_deployments: [
            {
              workload_name: 'b',
              name: 'second',
              current: true,
              active: false,
              strategy: { type: 'default', attributes: { application: 'my-app', firewall: 'f', custom_page: null } },
            },
            {
              workload_name: 'a',
              name: 'first',
              current: true,
              active: true,
              strategy: { type: 'default', attributes: { application: 10 } },
            },
          ],
        },
        transformedPayload,
      );

      expect(transformedPayload.workloads).toEqual([
        {
          name: 'a',
          deployments: [
            {
              name: 'first',
              current: true,
              active: true,
              strategy: { type: 'default', attributes: { application: 10, firewall: null, customPage: null } },
            },
          ],
        },
        {
          name: 'b',
          deployments: [
            {
              name: 'second',
              current: true,
              active: false,
              strategy: { type: 'default', attributes: { application: 'my-app', firewall: 'f', customPage: null } },
            },
          ],
        },
      ]);
    });

    it('should round trip through the manifest', () => {
      const config: AzionConfigV6 = {
        ...declared,
        workloads: [
          {
            name: 'w',
            deployments: [
              deployment(
                { application: 'my-app', firewall: 'my-firewall', customPage: null },
                { current: true, active: true },
              ),
            ],
          },
        ],
      };
      const manifest = { workload_deployments: strategy.transformToManifest(config) };
      const transformedPayload: AzionConfigV6 = { version: 6, workloads: [{ name: 'w' }] };

      strategy.transformToConfig(manifest, transformedPayload);

      expect(transformedPayload.workloads?.[0].deployments).toEqual(config.workloads?.[0].deployments);
    });
  });
});
