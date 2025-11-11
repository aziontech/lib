import { AzionConfig } from '../../../types';
import WorkloadProcessConfigStrategy from './workloadProcessConfigStrategy';

describe('WorkloadProcessConfigStrategy', () => {
  let strategy: WorkloadProcessConfigStrategy;

  beforeEach(() => {
    strategy = new WorkloadProcessConfigStrategy();
  });

  describe('transformToManifest', () => {
    it('should return empty array when no workloads are provided', () => {
      const config: AzionConfig = {};
      const result = strategy.transformToManifest(config, {});
      expect(result).toEqual([]);
    });

    it('should return empty array when workloads array is empty', () => {
      const config: AzionConfig = { workloads: [] };
      const result = strategy.transformToManifest(config, {});
      expect(result).toEqual([]);
    });

    it('should transform a basic workload configuration to manifest format', () => {
      const config: AzionConfig = {
        workloads: [
          {
            name: 'test-workload',
            active: true,
            domains: ['example.com'],
          },
        ],
      };

      const result = strategy.transformToManifest(config, {});

      expect(result).toEqual([
        expect.objectContaining({
          name: 'test-workload',
          active: true,
          infrastructure: 1,
          workload_domain_allow_access: true,
          domains: ['example.com'],
          tls: {
            certificate: null,
            ciphers: null,
            minimum_version: 'tls_1_3',
          },
          protocols: {
            http: {
              versions: ['http1', 'http2'],
              http_ports: [80],
              https_ports: [443],
              quic_ports: null,
            },
          },
        }),
      ]);
    });

    it('should transform a complete workload configuration to manifest format', () => {
      const config: AzionConfig = {
        workloads: [
          {
            name: 'complete-workload',
            active: false,
            infrastructure: 2,
            workloadDomainAllowAccess: false,
            domains: ['example.com', 'test.com'],
            tls: {
              certificate: 123,
              ciphers: 5,
              minimumVersion: 'tls_1_2',
            },
            protocols: {
              http: {
                versions: ['http1'],
                httpPorts: [8080],
                httpsPorts: [8443],
                quicPorts: [443],
              },
            },
            mtls: {
              enabled: true,
              config: {
                verification: 'permissive',
                certificate: 456,
                crl: [789],
              },
            },
          },
        ],
      };

      const result = strategy.transformToManifest(config, {});

      expect(result).toEqual([
        expect.objectContaining({
          name: 'complete-workload',
          active: false,
          infrastructure: 2,
          workload_domain_allow_access: false,
          domains: ['example.com', 'test.com'],
          tls: {
            certificate: 123,
            ciphers: 5,
            minimum_version: 'tls_1_2',
          },
          protocols: {
            http: {
              versions: ['http1'],
              http_ports: [8080],
              https_ports: [8443],
              quic_ports: [443],
            },
          },
          mtls: {
            enabled: true,
            config: {
              verification: 'permissive',
              certificate: 456,
              crl: [789],
            },
          },
        }),
      ]);
    });

    it('should transform multiple workloads to manifest format', () => {
      const config: AzionConfig = {
        workloads: [
          {
            name: 'workload-1',
            domains: ['example1.com'],
          },
          {
            name: 'workload-2',
            domains: ['example2.com'],
          },
        ],
      };

      const result = strategy.transformToManifest(config, {});

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('workload-1');
      expect(result[1].name).toBe('workload-2');
    });
  });

  describe('transformToConfig', () => {
    it('should return empty object when no workloads are provided', () => {
      const payload = {};
      const transformedPayload: AzionConfig = {};
      const result = strategy.transformToConfig(payload, transformedPayload);
      expect(result).toEqual({});
    });

    it('should return empty object when workloads array is empty', () => {
      const payload = { workloads: [] };
      const transformedPayload: AzionConfig = {};
      const result = strategy.transformToConfig(payload, transformedPayload);
      expect(result).toEqual({});
    });

    it('should transform a basic workload manifest to config format', () => {
      const payload = {
        workloads: [
          {
            name: 'test-workload',
            active: true,
            infrastructure: 1,
            workload_domain_allow_access: true,
            domains: ['example.com'],
            tls: {
              certificate: null,
              ciphers: null,
              minimum_version: 'tls_1_3',
            },
            protocols: {
              http: {
                versions: ['http1', 'http2'],
                http_ports: [80],
                https_ports: [443],
                quic_ports: null,
              },
            },
          },
        ],
      };

      const transformedPayload: AzionConfig = {};

      const result = strategy.transformToConfig(payload, transformedPayload);

      expect(result).toEqual([
        expect.objectContaining({
          name: 'test-workload',
          active: true,
          infrastructure: 1,
          workloadDomainAllowAccess: true,
          domains: ['example.com'],
          tls: {
            certificate: null,
            ciphers: null,
            minimumVersion: 'tls_1_3',
          },
          protocols: {
            http: {
              versions: ['http1', 'http2'],
              httpPorts: [80],
              httpsPorts: [443],
              quicPorts: null,
            },
          },
        }),
      ]);
    });

    it('should transform a complete workload manifest to config format', () => {
      const payload = {
        workloads: [
          {
            name: 'complete-workload',
            active: false,
            infrastructure: 2,
            workload_domain_allow_access: false,
            domains: ['example.com', 'test.com'],
            tls: {
              certificate: 123,
              ciphers: 5,
              minimum_version: 'tls_1_2',
            },
            protocols: {
              http: {
                versions: ['http1'],
                http_ports: [8080],
                https_ports: [8443],
                quic_ports: [443],
              },
            },
            mtls: {
              enabled: true,
              config: {
                verification: 'permissive',
                certificate: 456,
                crl: [789],
              },
            },
          },
        ],
      };

      const transformedPayload: AzionConfig = {};

      const result = strategy.transformToConfig(payload, transformedPayload);

      expect(result).toEqual([
        expect.objectContaining({
          name: 'complete-workload',
          active: false,
          infrastructure: 2,
          workloadDomainAllowAccess: false,
          domains: ['example.com', 'test.com'],
          tls: {
            certificate: 123,
            ciphers: 5,
            minimumVersion: 'tls_1_2',
          },
          protocols: {
            http: {
              versions: ['http1'],
              httpPorts: [8080],
              httpsPorts: [8443],
              quicPorts: [443],
            },
          },
          mtls: {
            enabled: true,
            config: {
              verification: 'permissive',
              certificate: 456,
              crl: [789],
            },
          },
        }),
      ]);
    });

    it('should transform multiple workload manifests to config format', () => {
      const payload = {
        workloads: [
          {
            name: 'workload-1',
            domains: ['example1.com'],
            active: true,
            infrastructure: 1,
            workload_domain_allow_access: true,
            tls: {
              certificate: null,
              ciphers: null,
              minimum_version: 'tls_1_3',
            },
            protocols: {
              http: {
                versions: ['http1', 'http2'],
                http_ports: [80],
                https_ports: [443],
                quic_ports: null,
              },
            },
          },
          {
            name: 'workload-2',
            domains: ['example2.com'],
            active: true,
            infrastructure: 1,
            workload_domain_allow_access: true,
            tls: {
              certificate: null,
              ciphers: null,
              minimum_version: 'tls_1_3',
            },
            protocols: {
              http: {
                versions: ['http1', 'http2'],
                http_ports: [80],
                https_ports: [443],
                quic_ports: null,
              },
            },
          },
        ],
      };

      const transformedPayload: AzionConfig = {};

      const result = strategy.transformToConfig(payload, transformedPayload) as Array<{ name: string }>;

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('workload-1');
      expect(result[1].name).toBe('workload-2');
    });

    it('should handle empty domains array', () => {
      const payload = {
        workloads: [
          {
            name: 'test-workload',
            domains: [],
          },
        ],
      };

      const transformedPayload: AzionConfig = {
        workloads: [],
      };

      const result = strategy.transformToConfig(payload, transformedPayload) as Array<{ domains: string[] }>;

      expect(result[0].domains).toEqual([]);
    });

    it('should handle undefined mtls', () => {
      const payload = {
        workloads: [
          {
            name: 'test-workload',
            mtls: undefined,
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

      const result = strategy.transformToConfig(payload, transformedPayload) as Array<{
        mtls?: {
          enabled?: false;
          config?: { verification: string; certificate?: number | null; crl?: number[] | null };
        };
      }>;

      expect(result[0].mtls).toBeUndefined();
    });
  });
});
