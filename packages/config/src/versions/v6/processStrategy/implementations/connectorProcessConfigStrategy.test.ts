import type { AzionConfigV6, AzionConnectorV6 } from '../../types';
import ConnectorProcessConfigStrategy from './connectorProcessConfigStrategy';

describe('ConnectorProcessConfigStrategy (v6)', () => {
  let strategy: ConnectorProcessConfigStrategy;

  const toManifest = (connectors: AzionConnectorV6[]) =>
    strategy.transformToManifest({ version: 6, connectors }) as Record<string, unknown>[];

  beforeEach(() => {
    strategy = new ConnectorProcessConfigStrategy();
  });

  describe('transformToManifest', () => {
    it('should return undefined when there are no connectors', () => {
      expect(strategy.transformToManifest({ version: 6 })).toBeUndefined();
      expect(toManifest([])).toBeUndefined();
    });

    it('should map a storage connector, leaving the prefix out when it is not set', () => {
      expect(
        toManifest([
          { name: 'with-prefix', type: 'storage', attributes: { bucket: 'my-bucket', prefix: 'p' } },
          { name: 'no-prefix', type: 'storage', attributes: { bucket: 'my-bucket' } },
        ]),
      ).toEqual([
        { name: 'with-prefix', type: 'storage', attributes: { bucket: 'my-bucket', prefix: 'p' } },
        { name: 'no-prefix', type: 'storage', attributes: { bucket: 'my-bucket' } },
      ]);
    });

    it('should map a live ingest connector', () => {
      expect(toManifest([{ name: 'ingest', type: 'live_ingest', attributes: { region: 'br-east-1' } }])).toEqual([
        { name: 'ingest', type: 'live_ingest', attributes: { region: 'br-east-1' } },
      ]);
    });

    it('should apply the defaults to an http connector with only the addresses and no null module configs', () => {
      const [connector] = toManifest([
        { name: 'origin', type: 'http', attributes: { addresses: [{ address: 'origin.example.com' }] } },
      ]);

      expect(connector).toEqual({
        name: 'origin',
        type: 'http',
        attributes: {
          addresses: [{ address: 'origin.example.com', http_port: 80, https_port: 443 }],
          connection_options: {
            dns_resolution: 'both',
            transport_policy: 'preserve',
            http_version_policy: 'http1_1',
            host: '${host}',
            path_prefix: '',
            following_redirect: false,
            real_ip_header: 'X-Real-IP',
            real_port_header: 'X-Real-PORT',
          },
          modules: {
            load_balancer: { enabled: false },
            origin_shield: { enabled: false },
          },
        },
      });
    });

    it('should map every field of an http connector to the manifest', () => {
      const [connector] = toManifest([
        {
          name: 'origin',
          type: 'http',
          attributes: {
            addresses: [
              {
                address: 'origin.example.com',
                httpPort: 8080,
                httpsPort: 8443,
                modules: { loadBalancer: { serverRole: 'backup', weight: 10 } },
              },
            ],
            connectionOptions: {
              dnsResolution: 'force_ipv6',
              transportPolicy: 'force_https',
              httpVersionPolicy: 'http1_1',
              host: 'example.com',
              pathPrefix: '/api',
              followingRedirect: true,
              realIpHeader: 'X-Client-IP',
              realPortHeader: 'X-Client-Port',
            },
            modules: {
              loadBalancer: {
                enabled: true,
                config: { method: 'ip_hash', maxRetries: 2, connectionTimeout: 10, readWriteTimeout: 20 },
              },
              originShield: {
                enabled: true,
                config: {
                  originIpAcl: { enabled: true },
                  hmac: {
                    enabled: true,
                    config: {
                      type: 'aws4_hmac_sha256',
                      attributes: { region: 'us-east-1', accessKey: 'key', secretKey: 'secret' },
                    },
                  },
                },
              },
            },
          },
        },
      ]);

      expect(connector).toEqual({
        name: 'origin',
        type: 'http',
        attributes: {
          addresses: [
            {
              address: 'origin.example.com',
              http_port: 8080,
              https_port: 8443,
              modules: { load_balancer: { server_role: 'backup', weight: 10 } },
            },
          ],
          connection_options: {
            dns_resolution: 'force_ipv6',
            transport_policy: 'force_https',
            http_version_policy: 'http1_1',
            host: 'example.com',
            path_prefix: '/api',
            following_redirect: true,
            real_ip_header: 'X-Client-IP',
            real_port_header: 'X-Client-Port',
          },
          modules: {
            load_balancer: {
              enabled: true,
              config: { method: 'ip_hash', max_retries: 2, connection_timeout: 10, read_write_timeout: 20 },
            },
            origin_shield: {
              enabled: true,
              config: {
                origin_ip_acl: { enabled: true },
                hmac: {
                  enabled: true,
                  config: {
                    type: 'aws4_hmac_sha256',
                    attributes: { region: 'us-east-1', service: 's3', access_key: 'key', secret_key: 'secret' },
                  },
                },
              },
            },
          },
        },
      });
    });
  });

  describe('transformToConfig', () => {
    it('should not set connectors when the manifest has none', () => {
      const transformedPayload: AzionConfigV6 = { version: 6 };

      expect(strategy.transformToConfig({}, transformedPayload)).toBeUndefined();
      expect(transformedPayload.connectors).toBeUndefined();
    });

    it('should round trip storage, live ingest and http connectors through the manifest', () => {
      const connectors: AzionConnectorV6[] = [
        { name: 'files', type: 'storage', attributes: { bucket: 'my-bucket', prefix: 'p' } },
        { name: 'ingest', type: 'live_ingest', attributes: { region: 'us-east-2' } },
        {
          name: 'origin',
          type: 'http',
          attributes: {
            addresses: [
              {
                address: 'origin.example.com',
                httpPort: 80,
                httpsPort: 443,
                modules: { loadBalancer: { serverRole: 'primary', weight: 5 } },
              },
            ],
            connectionOptions: {
              dnsResolution: 'both',
              transportPolicy: 'preserve',
              httpVersionPolicy: 'http1_1',
              host: '${host}',
              pathPrefix: '',
              followingRedirect: false,
              realIpHeader: 'X-Real-IP',
              realPortHeader: 'X-Real-PORT',
            },
            modules: {
              loadBalancer: {
                enabled: true,
                config: { method: 'round_robin', maxRetries: 0, connectionTimeout: 60, readWriteTimeout: 120 },
              },
              originShield: {
                enabled: true,
                config: {
                  originIpAcl: { enabled: false },
                  hmac: {
                    enabled: true,
                    config: {
                      type: 'aws4_hmac_sha256',
                      attributes: { region: 'us-east-1', service: 's3', accessKey: 'key', secretKey: 'secret' },
                    },
                  },
                },
              },
            },
          },
        },
      ];
      const transformedPayload: AzionConfigV6 = { version: 6 };

      strategy.transformToConfig({ connectors: toManifest(connectors) }, transformedPayload);

      expect(transformedPayload.connectors).toEqual(connectors);
    });
  });
});
