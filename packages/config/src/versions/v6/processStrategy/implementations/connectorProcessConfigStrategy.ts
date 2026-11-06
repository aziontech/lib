import ProcessConfigStrategy from '../../../shared/processStrategy/processConfigStrategy';
import type { AzionConfigV6, AzionConnectorV6 } from '../../types';

/**
 * ConnectorProcessConfigStrategy V6
 * @class ConnectorProcessConfigStrategy
 * @description Converts the v6 connectors (http, storage and live ingest) between the config and the manifest.
 * The v6 API does not accept null in the module configs, so they are left out of the manifest when the config has none.
 */
class ConnectorProcessConfigStrategy extends ProcessConfigStrategy<AzionConfigV6> {
  /**
   * Transform azion.config connectors to V6 manifest format
   */
  transformToManifest(config: AzionConfigV6) {
    const connectors = config?.connectors;
    if (!connectors || connectors.length === 0) {
      return;
    }

    return connectors.map((connector: AzionConnectorV6) => {
      const baseConnector = {
        name: connector.name,
        active: connector.active ?? true,
        type: connector.type,
      };

      if (connector.type === 'storage') {
        return {
          ...baseConnector,
          attributes: {
            bucket: connector.attributes.bucket,
            ...(connector.attributes.prefix !== undefined && { prefix: connector.attributes.prefix }),
          },
        };
      }

      if (connector.type === 'live_ingest') {
        return {
          ...baseConnector,
          attributes: {
            region: connector.attributes.region,
          },
        };
      }

      const { addresses, connectionOptions, modules } = connector.attributes;
      const loadBalancer = modules?.loadBalancer;
      const originShield = modules?.originShield;
      const hmac = originShield?.config?.hmac;

      return {
        ...baseConnector,
        attributes: {
          addresses: addresses.map((addr) => ({
            active: addr.active ?? true,
            address: addr.address,
            http_port: addr.httpPort ?? 80,
            https_port: addr.httpsPort ?? 443,
            ...(addr.modules?.loadBalancer && {
              modules: {
                load_balancer: {
                  ...(addr.modules.loadBalancer.serverRole && { server_role: addr.modules.loadBalancer.serverRole }),
                  ...(addr.modules.loadBalancer.weight !== undefined && { weight: addr.modules.loadBalancer.weight }),
                },
              },
            }),
          })),
          connection_options: {
            dns_resolution: connectionOptions?.dnsResolution ?? 'both',
            transport_policy: connectionOptions?.transportPolicy ?? 'preserve',
            http_version_policy: connectionOptions?.httpVersionPolicy ?? 'http1_1',
            host: connectionOptions?.host ?? '${host}',
            path_prefix: connectionOptions?.pathPrefix ?? '',
            following_redirect: connectionOptions?.followingRedirect ?? false,
            real_ip_header: connectionOptions?.realIpHeader ?? 'X-Real-IP',
            real_port_header: connectionOptions?.realPortHeader ?? 'X-Real-PORT',
          },
          modules: {
            load_balancer: {
              enabled: loadBalancer?.enabled ?? false,
              ...(loadBalancer?.config && {
                config: {
                  method: loadBalancer.config.method ?? 'round_robin',
                  max_retries: loadBalancer.config.maxRetries ?? 0,
                  connection_timeout: loadBalancer.config.connectionTimeout ?? 60,
                  read_write_timeout: loadBalancer.config.readWriteTimeout ?? 120,
                },
              }),
            },
            origin_shield: {
              enabled: originShield?.enabled ?? false,
              ...(originShield?.config && {
                config: {
                  origin_ip_acl: {
                    enabled: originShield.config.originIpAcl?.enabled ?? false,
                  },
                  ...(hmac && {
                    hmac: {
                      enabled: hmac.enabled ?? false,
                      ...(hmac.config && {
                        config: {
                          type: hmac.config.type,
                          attributes: {
                            region: hmac.config.attributes.region,
                            service: hmac.config.attributes.service ?? 's3',
                            access_key: hmac.config.attributes.accessKey,
                            secret_key: hmac.config.attributes.secretKey,
                          },
                        },
                      }),
                    },
                  }),
                },
              }),
            },
          },
        },
      };
    });
  }

  /**
   * Transform V6 manifest format back to azion.config connectors
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformToConfig(payload: { connectors?: any[] }, transformedPayload: AzionConfigV6) {
    if (!payload.connectors || payload.connectors.length === 0) {
      return;
    }

    transformedPayload.connectors = payload.connectors.map((connector) => {
      const baseConnector = {
        name: connector.name,
        active: connector.active,
        type: connector.type,
      };

      if (connector.type === 'storage') {
        return {
          ...baseConnector,
          attributes: {
            bucket: connector.attributes.bucket,
            prefix: connector.attributes.prefix,
          },
        } as AzionConnectorV6;
      }

      if (connector.type === 'live_ingest') {
        return {
          ...baseConnector,
          attributes: { region: connector.attributes.region },
        } as AzionConnectorV6;
      }

      const { addresses, connection_options: options, modules } = connector.attributes;
      const loadBalancer = modules?.load_balancer;
      const originShield = modules?.origin_shield;
      const hmac = originShield?.config?.hmac;

      return {
        ...baseConnector,
        attributes: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          addresses: addresses.map((addr: any) => ({
            active: addr.active,
            address: addr.address,
            httpPort: addr.http_port,
            httpsPort: addr.https_port,
            modules: addr.modules?.load_balancer && {
              loadBalancer: {
                serverRole: addr.modules.load_balancer.server_role,
                weight: addr.modules.load_balancer.weight,
              },
            },
          })),
          connectionOptions: options && {
            dnsResolution: options.dns_resolution,
            transportPolicy: options.transport_policy,
            httpVersionPolicy: options.http_version_policy,
            host: options.host,
            pathPrefix: options.path_prefix,
            followingRedirect: options.following_redirect,
            realIpHeader: options.real_ip_header,
            realPortHeader: options.real_port_header,
          },
          modules: modules && {
            loadBalancer: loadBalancer && {
              enabled: loadBalancer.enabled,
              config: loadBalancer.config && {
                method: loadBalancer.config.method,
                maxRetries: loadBalancer.config.max_retries,
                connectionTimeout: loadBalancer.config.connection_timeout,
                readWriteTimeout: loadBalancer.config.read_write_timeout,
              },
            },
            originShield: originShield && {
              enabled: originShield.enabled,
              config: originShield.config && {
                originIpAcl: originShield.config.origin_ip_acl && {
                  enabled: originShield.config.origin_ip_acl.enabled,
                },
                hmac: hmac && {
                  enabled: hmac.enabled,
                  config: hmac.config && {
                    type: hmac.config.type,
                    attributes: {
                      region: hmac.config.attributes.region,
                      service: hmac.config.attributes.service,
                      accessKey: hmac.config.attributes.access_key,
                      secretKey: hmac.config.attributes.secret_key,
                    },
                  },
                },
              },
            },
          },
        },
      } as AzionConnectorV6;
    });

    return transformedPayload.connectors;
  }
}

export default ConnectorProcessConfigStrategy;
