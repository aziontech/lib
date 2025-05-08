import {
  APPLICATION_SUPPORTED_CIPHERS,
  WORKLOAD_NETWORK_MAPS,
  WORKLOAD_TLS_MINIMUM_VERSIONS,
} from '../../../constants';
import { AzionConfig } from '../../../types';
import WorkloadProcessConfigStrategy from './workloadProcessConfigStrategy';

describe('WorkloadProcessConfigStrategy', () => {
  let strategy: WorkloadProcessConfigStrategy;

  beforeEach(() => {
    strategy = new WorkloadProcessConfigStrategy();
  });

  describe('transformToManifest', () => {
    it('should transform a complete config to manifest', () => {
      const config: AzionConfig = {
        workload: {
          name: 'My Workload',
          alternateDomains: ['example.com', 'api.example.com'],
          edgeApplication: 12345,
          active: true,
          networkMap: WORKLOAD_NETWORK_MAPS[0],
          edgeFirewall: 67890,
          tls: {
            certificate: 12345,
            ciphers: APPLICATION_SUPPORTED_CIPHERS[0],
            minimumVersion: WORKLOAD_TLS_MINIMUM_VERSIONS[2],
          },
          protocols: {
            http: {
              versions: ['http1', 'http2'],
              httpPorts: [80],
              httpsPorts: [443],
              quicPorts: null,
            },
          },
          mtls: {
            verification: 'enforce',
            certificate: 12345,
            crl: [1111, 2222],
          },
          domains: [
            {
              domain: 'example.com',
              allowAccess: true,
            },
            {
              domain: 'test.example.com',
              allowAccess: false,
            },
          ],
        },
      };

      const manifest = strategy.transformToManifest(config);
      expect(manifest).toEqual({
        name: 'My Workload',
        alternate_domains: ['example.com', 'api.example.com'],
        edge_application: 12345,
        active: true,
        network_map: WORKLOAD_NETWORK_MAPS[0],
        edge_firewall: 67890,
        tls: {
          certificate: 12345,
          ciphers: APPLICATION_SUPPORTED_CIPHERS[0],
          minimum_version: WORKLOAD_TLS_MINIMUM_VERSIONS[2],
        },
        protocols: {
          http: {
            versions: ['http1', 'http2'],
            http_ports: [80],
            https_ports: [443],
            quic_ports: null,
          },
        },
        mtls: {
          verification: 'enforce',
          certificate: 12345,
          crl: [1111, 2222],
        },
        domains: [
          {
            domain: 'example.com',
            allow_access: true,
          },
          {
            domain: 'test.example.com',
            allow_access: false,
          },
        ],
      });
    });

    it('should handle minimal workload config', () => {
      const config: AzionConfig = {
        workload: {
          name: 'Minimal Workload',
          edgeApplication: 12345,
        },
      };

      const manifest = strategy.transformToManifest(config);
      expect(manifest).toEqual({
        name: 'Minimal Workload',
        alternate_domains: [],
        edge_application: 12345,
        active: true,
        network_map: '1',
        edge_firewall: null,
      });
    });

    it('should return undefined when no workload config is provided', () => {
      const config: AzionConfig = {};
      const manifest = strategy.transformToManifest(config);
      expect(manifest).toBeUndefined();
    });

    it('should throw error for invalid cipher suite', () => {
      const config: AzionConfig = {
        workload: {
          name: 'Invalid Workload',
          edgeApplication: 12345,
          tls: {
            ciphers: 'INVALID_CIPHER' as unknown as (typeof APPLICATION_SUPPORTED_CIPHERS)[number],
          },
        },
      };

      expect(() => strategy.transformToManifest(config)).toThrow(/invalid cipher suite/);
    });

    it('should throw error for invalid TLS version', () => {
      const config: AzionConfig = {
        workload: {
          name: 'Invalid Workload',
          edgeApplication: 12345,
          tls: {
            minimumVersion: 'tls_2_0' as unknown as (typeof WORKLOAD_TLS_MINIMUM_VERSIONS)[number],
          },
        },
      };

      expect(() => strategy.transformToManifest(config)).toThrow(/invalid minimum TLS version/);
    });
  });

  describe('transformToConfig', () => {
    it('should transform a complete manifest to config', () => {
      const manifest = {
        workload: {
          name: 'My Workload',
          alternate_domains: ['example.com', 'api.example.com'],
          edge_application: 12345,
          active: true,
          network_map: '1',
          edge_firewall: 67890,
          tls: {
            certificate: 12345,
            ciphers: 'TLSv1.2_2021',
            minimum_version: 'tls_1_2',
          },
          protocols: {
            http: {
              versions: ['http1', 'http2'],
              http_ports: [80],
              https_ports: [443],
              quic_ports: null,
            },
          },
          mtls: {
            verification: 'enforce',
            certificate: 12345,
            crl: [1111, 2222],
          },
          domains: [
            {
              domain: 'example.com',
              allow_access: true,
            },
            {
              domain: 'test.example.com',
              allow_access: false,
            },
          ],
        },
      };

      const config = {};
      const result = strategy.transformToConfig(manifest, config as AzionConfig);
      expect(result).toEqual({
        name: 'My Workload',
        alternateDomains: ['example.com', 'api.example.com'],
        edgeApplication: 12345,
        active: true,
        networkMap: '1',
        edgeFirewall: 67890,
        tls: {
          certificate: 12345,
          ciphers: 'TLSv1.2_2021',
          minimumVersion: 'tls_1_2',
        },
        protocols: {
          http: {
            versions: ['http1', 'http2'],
            httpPorts: [80],
            httpsPorts: [443],
            quicPorts: null,
          },
        },
        mtls: {
          verification: 'enforce',
          certificate: 12345,
          crl: [1111, 2222],
        },
        domains: [
          {
            domain: 'example.com',
            allowAccess: true,
          },
          {
            domain: 'test.example.com',
            allowAccess: false,
          },
        ],
      });
    });

    it('should handle minimal workload manifest', () => {
      const manifest = {
        workload: {
          name: 'Minimal Workload',
          edge_application: 12345,
        },
      };

      const config = {};
      const result = strategy.transformToConfig(manifest, config as AzionConfig);
      expect(result).toEqual({
        name: 'Minimal Workload',
        alternateDomains: [],
        edgeApplication: 12345,
        active: true,
        networkMap: '1',
        edgeFirewall: null,
      });
    });

    it('should return undefined when no workload manifest is provided', () => {
      const manifest = {};
      const config = {};
      const result = strategy.transformToConfig(manifest, config as AzionConfig);
      expect(result).toBeUndefined();
    });
  });
});
