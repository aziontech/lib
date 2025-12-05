import { AzionConfig } from '../../../types';
import WorkloadDeploymentsProcessConfigStrategy from './workloadDeploymentsProcessConfigStrategy';

describe('WorkloadDeploymentsProcessConfigStrategy', () => {
  let strategy: WorkloadDeploymentsProcessConfigStrategy;

  beforeEach(() => {
    strategy = new WorkloadDeploymentsProcessConfigStrategy();
  });

  describe('transformToManifest', () => {
    it('should return empty array when no workloads are provided', () => {
      const config: AzionConfig = {};
      const result = strategy.transformToManifest(config);
      expect(result).toEqual([]);
    });

    it('should return empty array when workloads array is empty', () => {
      const config: AzionConfig = { workloads: [] };
      const result = strategy.transformToManifest(config);
      expect(result).toEqual([]);
    });

    it('should return empty array when no deployments are found in workloads', () => {
      const config: AzionConfig = {
        workloads: [
          {
            name: 'test-workload',
            domains: ['example.com'],
          },
        ],
      };
      const result = strategy.transformToManifest(config);
      expect(result).toEqual([]);
    });

    it('should transform a basic deployment configuration to manifest format', () => {
      const config: AzionConfig = {
        applications: [{ name: 'my-edge-app' }],
        workloads: [
          {
            name: 'test-workload',
            domains: ['example.com'],
            deployments: [
              {
                name: 'production',
                current: true,
                active: true,
                strategy: {
                  type: 'application',
                  attributes: {
                    application: 'my-edge-app',
                    firewall: null,
                    customPage: null,
                  },
                },
              },
            ],
          },
        ],
      };

      const result = strategy.transformToManifest(config);

      expect(result).toEqual([
        {
          name: 'production',
          current: true,
          active: true,
          strategy: {
            type: 'application',
            attributes: {
              application: 'my-edge-app',
              firewall: null,
              custom_page: null,
            },
          },
        },
      ]);
    });

    it('should transform deployments with numeric IDs without validation', () => {
      const config: AzionConfig = {
        workloads: [
          {
            name: 'test-workload',
            domains: ['example.com'],
            deployments: [
              {
                name: 'production',
                strategy: {
                  type: 'application',
                  attributes: {
                    application: 12345, // Numeric ID should not be validated
                    firewall: 67890,
                    customPage: 54321,
                  },
                },
              },
            ],
          },
        ],
      };

      const result = strategy.transformToManifest(config);

      expect(result).toEqual([
        {
          name: 'production',
          current: true,
          active: true,
          strategy: {
            type: 'application',
            attributes: {
              application: '12345',
              firewall: '67890',
              custom_page: '54321',
            },
          },
        },
      ]);
    });

    it('should collect and transform deployments from multiple workloads', () => {
      const config: AzionConfig = {
        applications: [{ name: 'app-1' }, { name: 'app-2' }],
        workloads: [
          {
            name: 'workload-1',
            deployments: [
              {
                name: 'deployment-1',
                strategy: {
                  type: 'application',
                  attributes: {
                    application: 'app-1',
                    firewall: null,
                    customPage: null,
                  },
                },
              },
            ],
          },
          {
            name: 'workload-2',
            deployments: [
              {
                name: 'deployment-2',
                strategy: {
                  type: 'application',
                  attributes: {
                    application: 'app-2',
                    firewall: null,
                    customPage: null,
                  },
                },
              },
            ],
          },
        ],
      };

      const result = strategy.transformToManifest(config);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('deployment-1');
      expect(result[1].name).toBe('deployment-2');
    });

    it('should throw error when application reference is invalid', () => {
      const config: AzionConfig = {
        applications: [{ name: 'existing-app' }],
        workloads: [
          {
            name: 'test-workload',
            deployments: [
              {
                name: 'production',
                strategy: {
                  type: 'application',
                  attributes: {
                    application: 'non-existent-app', // This app doesn't exist
                    firewall: null,
                    customPage: null,
                  },
                },
              },
            ],
          },
        ],
      };

      expect(() => strategy.transformToManifest(config)).toThrow(
        'Workload deployment "production" references non-existent Application "non-existent-app"',
      );
    });

    it('should throw error when firewall reference is invalid', () => {
      const config: AzionConfig = {
        applications: [{ name: 'my-app' }],
        firewall: [{ name: 'existing-firewall' }],
        workloads: [
          {
            name: 'test-workload',
            deployments: [
              {
                name: 'production',
                strategy: {
                  type: 'application',
                  attributes: {
                    application: 'my-app',
                    firewall: 'non-existent-firewall', // This firewall doesn't exist
                    customPage: null,
                  },
                },
              },
            ],
          },
        ],
      };

      expect(() => strategy.transformToManifest(config)).toThrow(
        'Workload deployment "production" references non-existent Firewall "non-existent-firewall"',
      );
    });

    it('should throw error when custom page reference is invalid', () => {
      const config: AzionConfig = {
        applications: [{ name: 'my-app' }],
        customPages: [{ name: 'existing-page', active: true, pages: [] }],
        workloads: [
          {
            name: 'test-workload',
            deployments: [
              {
                name: 'production',
                strategy: {
                  type: 'application',
                  attributes: {
                    application: 'my-app',
                    firewall: null,
                    customPage: 'non-existent-page', // This custom page doesn't exist
                  },
                },
              },
            ],
          },
        ],
      };

      expect(() => strategy.transformToManifest(config)).toThrow(
        'Workload deployment "production" references non-existent Custom Page "non-existent-page"',
      );
    });
  });

  describe('transformToConfig', () => {
    it('should return empty object when no workload_deployments are provided', () => {
      const payload = {};
      const transformedPayload: AzionConfig = {};
      const result = strategy.transformToConfig(payload, transformedPayload);
      expect(result).toEqual({});
    });

    it('should return empty object when workload_deployments array is empty', () => {
      const payload = { workload_deployments: [] };
      const transformedPayload: AzionConfig = {};
      const result = strategy.transformToConfig(payload, transformedPayload);
      expect(result).toEqual({});
    });

    it('should transform a basic workload_deployment manifest to config format', () => {
      const payload = {
        workloads: [
          {
            name: 'test-workload',
          },
        ],
        workload_deployments: [
          {
            name: 'production',
            current: true,
            active: true,
            strategy: {
              type: 'application',
              attributes: {
                application: 'my-edge-app',
                firewall: null,
                custom_page: null,
              },
            },
          },
        ],
      };

      const transformedPayload: AzionConfig = {
        workloads: [
          {
            name: 'test-workload',
          },
        ],
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = strategy.transformToConfig(payload, transformedPayload) as any[];

      expect(result).toEqual([
        {
          name: 'test-workload',
          deployments: [
            {
              name: 'production',
              current: true,
              active: true,
              strategy: {
                type: 'application',
                attributes: {
                  application: 'my-edge-app',
                  firewall: null,
                  customPage: null,
                },
              },
            },
          ],
        },
      ]);
    });

    it('should transform numeric IDs to strings in the config format', () => {
      const payload = {
        workloads: [
          {
            name: 'test-workload',
          },
        ],
        workload_deployments: [
          {
            name: 'production',
            strategy: {
              type: 'application',
              attributes: {
                application: 12345,
                firewall: 67890,
                custom_page: 54321,
              },
            },
          },
        ],
      };

      const transformedPayload: AzionConfig = {
        workloads: [
          {
            name: 'test-workload',
          },
        ],
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = strategy.transformToConfig(payload, transformedPayload) as any[];

      expect(result).toEqual([
        {
          name: 'test-workload',
          deployments: [
            {
              name: 'production',
              strategy: {
                type: 'application',
                attributes: {
                  application: '12345',
                  firewall: '67890',
                  customPage: '54321',
                },
              },
            },
          ],
        },
      ]);
    });

    it('should transform multiple workload_deployments to config format', () => {
      const payload = {
        workloads: [
          {
            name: 'test-workload',
          },
          {
            name: 'test-workload-2',
          },
        ],
        workload_deployments: [
          {
            name: 'deployment-1',
            current: true,
            active: true,
            strategy: {
              type: 'application',
              attributes: {
                application: 'app-1',
                firewall: null,
                custom_page: null,
              },
            },
          },
          {
            name: 'deployment-2',
            current: false,
            active: true,
            strategy: {
              type: 'application',
              attributes: {
                application: 'app-2',
                firewall: 'firewall-1',
                custom_page: null,
              },
            },
          },
        ],
      };

      const transformedPayload: AzionConfig = {
        workloads: [
          {
            name: 'test-workload',
          },
          {
            name: 'test-workload-2',
          },
        ],
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = strategy.transformToConfig(payload, transformedPayload) as any[];
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('test-workload');
      expect(result[1].name).toBe('test-workload-2');
      expect(result[0].deployments[0].strategy.attributes.application).toBe('app-1');
      expect(result[0].deployments[1].strategy.attributes.application).toBe('app-2');
      expect(result[1].deployments[1].strategy.attributes.firewall).toBe('firewall-1');
    });
  });
});
