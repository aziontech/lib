import type { AzionConfigV6, AzionWorkloadV6 } from '../../types';
import WorkloadProcessConfigStrategy from './workloadProcessConfigStrategy';

describe('WorkloadProcessConfigStrategy (v6)', () => {
  let strategy: WorkloadProcessConfigStrategy;

  const declared: AzionConfigV6 = {
    version: 6,
    environments: [{ name: 'production', deploymentPolicy: 'single_version' }],
    deployments: [{ name: 'default-deployment', bindingPolicy: 'FLEXIBLE' }],
  };

  beforeEach(() => {
    strategy = new WorkloadProcessConfigStrategy();
  });

  describe('transformToManifest', () => {
    it('should return an empty array when there are no workloads', () => {
      expect(strategy.transformToManifest({ version: 6 })).toEqual([]);
      expect(strategy.transformToManifest({ version: 6, workloads: [] })).toEqual([]);
    });

    it('should apply the defaults to a minimal workload', () => {
      const result = strategy.transformToManifest({ version: 6, workloads: [{ name: 'my-workload' }] });

      expect(result).toEqual([
        {
          name: 'my-workload',
          infrastructure: 1,
          workload_domain_allow_access: true,
          tls: { minimum_version: 'tls_1_3' },
          protocols: {
            http: {
              versions: ['http1', 'http2', 'http3'],
              http_ports: [80],
              https_ports: [443],
              quic_ports: [443],
            },
          },
          mtls: undefined,
          bindings: [],
        },
      ]);
    });

    it('should not send tls.ciphers when it is not set (the v6 API does not accept null)', () => {
      const [withoutCiphers] = strategy.transformToManifest({ version: 6, workloads: [{ name: 'w' }] });
      const [withCiphers] = strategy.transformToManifest({
        version: 6,
        workloads: [{ name: 'w', tls: { ciphers: 3, minimumVersion: 'tls_1_2' } }],
      });

      expect(withoutCiphers.tls).not.toHaveProperty('ciphers');
      expect(withCiphers.tls).toEqual({ ciphers: 3, minimum_version: 'tls_1_2' });
    });

    it('should map every field of the workload, the mtls and the bindings to the manifest', () => {
      const [workload] = strategy.transformToManifest({
        ...declared,
        workloads: [
          {
            name: 'my-workload',
            infrastructure: 2,
            workloadDomainAllowAccess: false,
            protocols: { http: { versions: ['http2'], httpPorts: [8080], httpsPorts: [8443], quicPorts: [8443] } },
            mtls: { enabled: true, config: { verification: 'permissive', certificate: 10, crl: [1] } },
            bindings: [
              {
                environment: 'production',
                deployment: 'default-deployment',
                domains: [{ domain: 'example.com', certificate: 7 }, { domain: 'www.example.com' }],
              },
            ],
          },
        ],
      });

      expect(workload).toEqual(
        expect.objectContaining({
          infrastructure: 2,
          workload_domain_allow_access: false,
          protocols: { http: { versions: ['http2'], http_ports: [8080], https_ports: [8443], quic_ports: [8443] } },
          mtls: { enabled: true, config: { verification: 'permissive', certificate: 10, crl: [1] } },
        }),
      );
      expect(workload.bindings).toEqual([
        {
          environment_name: 'production',
          deployment_name: 'default-deployment',
          domains: [
            { domain: 'example.com', certificate: 7 },
            { domain: 'www.example.com', certificate: null },
          ],
        },
      ]);
    });

    it('should name the environment and the deployment of a binding as names, not as ids (the CLI resolves the ids)', () => {
      const [workload] = strategy.transformToManifest({
        ...declared,
        workloads: [{ name: 'w', bindings: [{ environment: 'production', deployment: 'default-deployment' }] }],
      });

      expect(Object.keys(workload.bindings[0])).toEqual(['environment_name', 'deployment_name', 'domains']);
    });

    it('should throw when a binding references an environment that is not declared', () => {
      expect(() =>
        strategy.transformToManifest({
          ...declared,
          workloads: [{ name: 'w', bindings: [{ environment: 'staging', deployment: 'default-deployment' }] }],
        }),
      ).toThrow('Workload "w" binding references non-existent Environment "staging".');
    });

    it('should throw when a binding references a deployment that is not declared', () => {
      expect(() =>
        strategy.transformToManifest({
          ...declared,
          workloads: [{ name: 'w', bindings: [{ environment: 'production', deployment: 'other' }] }],
        }),
      ).toThrow('Workload "w" binding references non-existent Deployment "other".');
      expect(() =>
        strategy.transformToManifest({
          version: 6,
          workloads: [{ name: 'w', bindings: [{ environment: 'production', deployment: 'd' }] }],
        }),
      ).toThrow('non-existent Environment "production"');
    });
  });

  describe('transformToConfig', () => {
    it('should not set workloads when the manifest has none', () => {
      const transformedPayload: AzionConfigV6 = { version: 6 };

      expect(strategy.transformToConfig({}, transformedPayload)).toBeUndefined();
      expect(transformedPayload.workloads).toBeUndefined();
    });

    it('should map the manifest workloads and bindings back to the config', () => {
      const transformedPayload: AzionConfigV6 = { version: 6 };

      strategy.transformToConfig(
        {
          workloads: [
            {
              name: 'my-workload',
              infrastructure: 1,
              workload_domain_allow_access: true,
              tls: { ciphers: 3, minimum_version: 'tls_1_2' },
              protocols: { http: { versions: ['http1'], http_ports: [80], https_ports: [443], quic_ports: null } },
              bindings: [
                {
                  environment_name: 'production',
                  deployment_name: 'default-deployment',
                  domains: [{ domain: 'a.com', certificate: 1 }],
                },
              ],
            },
          ],
        },
        transformedPayload,
      );

      expect(transformedPayload.workloads).toEqual([
        {
          name: 'my-workload',
          infrastructure: 1,
          workloadDomainAllowAccess: true,
          tls: { ciphers: 3, minimumVersion: 'tls_1_2' },
          protocols: { http: { versions: ['http1'], httpPorts: [80], httpsPorts: [443], quicPorts: null } },
          mtls: undefined,
          bindings: [
            {
              environment: 'production',
              deployment: 'default-deployment',
              domains: [{ domain: 'a.com', certificate: 1 }],
            },
          ],
        },
      ]);
    });
  });

  describe('workload_domain_allow_access', () => {
    const config = (
      policy: 'single_version' | 'versioned_urls',
      workload: Partial<AzionWorkloadV6> = {},
    ): AzionConfigV6 => ({
      version: 6,
      environments: [{ name: 'production', deploymentPolicy: policy }],
      deployments: [{ name: 'default-deployment', bindingPolicy: 'FLEXIBLE' }],
      workloads: [
        { name: 'w', bindings: [{ environment: 'production', deployment: 'default-deployment' }], ...workload },
      ],
    });

    it('should be true by default, and false by default when the workload is bound to a versioned_urls environment', () => {
      expect(strategy.transformToManifest(config('single_version'))[0].workload_domain_allow_access).toBe(true);
      expect(strategy.transformToManifest(config('versioned_urls'))[0].workload_domain_allow_access).toBe(false);
      expect(
        strategy.transformToManifest({ version: 6, workloads: [{ name: 'w' }] })[0].workload_domain_allow_access,
      ).toBe(true);
    });

    it('should accept an explicit value for a single_version environment, and false for a versioned_urls one', () => {
      expect(
        strategy.transformToManifest(config('single_version', { workloadDomainAllowAccess: false }))[0]
          .workload_domain_allow_access,
      ).toBe(false);
      expect(
        strategy.transformToManifest(config('versioned_urls', { workloadDomainAllowAccess: false }))[0]
          .workload_domain_allow_access,
      ).toBe(false);
    });

    it('should throw when true is set for a workload bound to a versioned_urls environment', () => {
      expect(() => strategy.transformToManifest(config('versioned_urls', { workloadDomainAllowAccess: true }))).toThrow(
        'Workload "w" cannot set workloadDomainAllowAccess to true: it is bound to an environment whose deploymentPolicy is versioned_urls.',
      );
    });
  });
});
