import {
  EDGE_CONNECTOR_DNS_RESOLUTION,
  EDGE_CONNECTOR_HMAC_TYPE,
  EDGE_CONNECTOR_HTTP_VERSION_POLICY,
  EDGE_CONNECTOR_LOAD_BALANCE_METHOD,
  EDGE_CONNECTOR_TRANSPORT_POLICY,
} from '../../../constants';
import { AzionConfig, AzionEdgeConnector, EdgeConnectorType } from '../../../types';
import ProcessConfigStrategy from '../processConfigStrategy';

/**
 * EdgeConnectorProcessConfigStrategy V4
 * @class EdgeConnectorProcessConfigStrategy
 * @description This class is implementation of the Edge Connector ProcessConfig Strategy for API V4.
 */
class EdgeConnectorProcessConfigStrategy extends ProcessConfigStrategy {
  /**
   * Transform azion.config edge connectors to V4 manifest format
   */
  transformToManifest(config: AzionConfig) {
    const edgeConnectors = config?.edgeConnectors;
    if (!edgeConnectors || edgeConnectors.length === 0) {
      return;
    }

    return edgeConnectors.map((connector: AzionEdgeConnector) => {
      const baseConnector = {
        name: connector.name,
        active: connector.active ?? true,
        type: connector.type,
      };

      // Handle different connector types
      if (connector.type === 'edge_storage') {
        return {
          ...baseConnector,
          attributes: {
            bucket: connector.attributes.bucket,
            prefix: connector.attributes.prefix,
          },
        };
      }

      // Handle http and live_ingest connectors
      return {
        ...baseConnector,
        attributes: {
          addresses: connector.attributes.addresses.map((addr) => ({
            active: addr.active ?? true,
            address: addr.address,
            http_port: addr.httpPort ?? 80,
            https_port: addr.httpsPort ?? 443,
            modules: addr.modules || null,
          })),
          connection_options: {
            dns_resolution: connector.attributes.connectionOptions.dnsResolution ?? 'preserve',
            transport_policy: connector.attributes.connectionOptions.transportPolicy ?? 'preserve',
            http_version_policy: connector.attributes.connectionOptions.httpVersionPolicy ?? 'http1_1',
            host: connector.attributes.connectionOptions.host ?? '${host}',
            path_prefix: connector.attributes.connectionOptions.pathPrefix ?? '',
            following_redirect: connector.attributes.connectionOptions.followingRedirect ?? false,
            real_ip_header: connector.attributes.connectionOptions.realIpHeader ?? 'X-Real-IP',
            real_port_header: connector.attributes.connectionOptions.realPortHeader ?? 'X-Real-PORT',
          },
          modules: {
            load_balancer: {
              enabled: connector.attributes.modules?.loadBalancer?.enabled ?? false,
              config: connector.attributes.modules?.loadBalancer?.config
                ? {
                    method: connector.attributes.modules.loadBalancer.config.method ?? 'round_robin',
                    max_retries: connector.attributes.modules.loadBalancer.config.maxRetries ?? 0,
                    connection_timeout: connector.attributes.modules.loadBalancer.config.connectionTimeout ?? 60,
                    read_write_timeout: connector.attributes.modules.loadBalancer.config.readWriteTimeout ?? 120,
                  }
                : null,
            },
            origin_shield: {
              enabled: connector.attributes.modules?.originShield?.enabled ?? false,
              config: connector.attributes.modules?.originShield?.config
                ? {
                    origin_ip_acl: {
                      enabled: connector.attributes.modules.originShield.config.originIpAcl?.enabled ?? false,
                    },
                    hmac: {
                      enabled: connector.attributes.modules.originShield.config.hmac?.enabled ?? false,
                      config: connector.attributes.modules.originShield.config.hmac?.config
                        ? {
                            type: connector.attributes.modules.originShield.config.hmac.config.type,
                            attributes: {
                              region: connector.attributes.modules.originShield.config.hmac.config.attributes.region,
                              service:
                                connector.attributes.modules.originShield.config.hmac.config.attributes.service ?? 's3',
                              access_key:
                                connector.attributes.modules.originShield.config.hmac.config.attributes.accessKey,
                              secret_key:
                                connector.attributes.modules.originShield.config.hmac.config.attributes.secretKey,
                            },
                          }
                        : null,
                    },
                  }
                : null,
            },
          },
        },
      };
    });
  }

  /**
   * Transform V4 manifest format back to azion.config edge connectors
   */
  transformToConfig(
    payload: {
      edge_connectors?: Array<{
        name: string;
        active?: boolean;
        type: EdgeConnectorType;
        attributes: {
          // For edge_storage
          bucket?: string;
          prefix?: string;
          // For http and live_ingest
          addresses?: Array<{
            active?: boolean;
            address: string;
            http_port?: number;
            https_port?: number;
            modules?: import('../../../types').EdgeConnectorAddressModules | null;
          }>;
          connection_options?: {
            dns_resolution?: string;
            transport_policy?: string;
            http_version_policy?: string;
            host?: string;
            path_prefix?: string;
            following_redirect?: boolean;
            real_ip_header?: string;
            real_port_header?: string;
          };
          modules?: {
            load_balancer: {
              enabled: boolean;
              config?: {
                method?: string;
                max_retries?: number;
                connection_timeout?: number;
                read_write_timeout?: number;
              } | null;
            };
            origin_shield: {
              enabled: boolean;
              config?: {
                origin_ip_acl?: {
                  enabled?: boolean;
                };
                hmac?: {
                  enabled?: boolean;
                  config?: {
                    type: string;
                    attributes: {
                      region: string;
                      service?: string;
                      access_key: string;
                      secret_key: string;
                    };
                  } | null;
                };
              } | null;
            };
          };
        };
      }>;
    },
    transformedPayload: AzionConfig,
  ) {
    if (!payload.edge_connectors || payload.edge_connectors.length === 0) {
      return;
    }

    transformedPayload.edgeConnectors = payload.edge_connectors.map((connector) => {
      const baseConnector = {
        name: connector.name,
        active: connector.active,
        type: connector.type,
      };

      // Handle different connector types
      if (connector.type === 'edge_storage') {
        return {
          ...baseConnector,
          attributes: {
            bucket: connector.attributes.bucket!,
            prefix: connector.attributes.prefix,
          },
        } as AzionEdgeConnector;
      }

      // Handle http and live_ingest connectors
      return {
        ...baseConnector,
        attributes: {
          addresses: connector.attributes.addresses!.map((addr) => ({
            active: addr.active,
            address: addr.address,
            httpPort: addr.http_port,
            httpsPort: addr.https_port,
            modules: addr.modules as import('../../../types').EdgeConnectorAddressModules | null,
          })),
          connectionOptions: {
            dnsResolution: connector.attributes.connection_options!
              .dns_resolution as (typeof EDGE_CONNECTOR_DNS_RESOLUTION)[number],
            transportPolicy: connector.attributes.connection_options!
              .transport_policy as (typeof EDGE_CONNECTOR_TRANSPORT_POLICY)[number],
            httpVersionPolicy: connector.attributes.connection_options!
              .http_version_policy as (typeof EDGE_CONNECTOR_HTTP_VERSION_POLICY)[number],
            host: connector.attributes.connection_options!.host,
            pathPrefix: connector.attributes.connection_options!.path_prefix,
            followingRedirect: connector.attributes.connection_options!.following_redirect,
            realIpHeader: connector.attributes.connection_options!.real_ip_header,
            realPortHeader: connector.attributes.connection_options!.real_port_header,
          },
          modules: {
            loadBalancer: {
              enabled: connector.attributes.modules!.load_balancer.enabled,
              config: connector.attributes.modules!.load_balancer.config
                ? {
                    method: connector.attributes.modules!.load_balancer.config
                      .method as (typeof EDGE_CONNECTOR_LOAD_BALANCE_METHOD)[number],
                    maxRetries: connector.attributes.modules!.load_balancer.config.max_retries,
                    connectionTimeout: connector.attributes.modules!.load_balancer.config.connection_timeout,
                    readWriteTimeout: connector.attributes.modules!.load_balancer.config.read_write_timeout,
                  }
                : null,
            },
            originShield: {
              enabled: connector.attributes.modules!.origin_shield.enabled,
              config: connector.attributes.modules!.origin_shield.config
                ? {
                    originIpAcl: {
                      enabled: connector.attributes.modules!.origin_shield.config.origin_ip_acl?.enabled,
                    },
                    hmac: {
                      enabled: connector.attributes.modules!.origin_shield.config.hmac?.enabled,
                      config: connector.attributes.modules!.origin_shield.config.hmac?.config
                        ? {
                            type: connector.attributes.modules!.origin_shield.config.hmac.config
                              .type as (typeof EDGE_CONNECTOR_HMAC_TYPE)[number],
                            attributes: {
                              region: connector.attributes.modules!.origin_shield.config.hmac.config.attributes.region,
                              service:
                                connector.attributes.modules!.origin_shield.config.hmac.config.attributes.service,
                              accessKey:
                                connector.attributes.modules!.origin_shield.config.hmac.config.attributes.access_key,
                              secretKey:
                                connector.attributes.modules!.origin_shield.config.hmac.config.attributes.secret_key,
                            },
                          }
                        : null,
                    },
                  }
                : null,
            },
          },
        },
      } as AzionEdgeConnector;
    });

    return transformedPayload.edgeConnectors;
  }
}

export default EdgeConnectorProcessConfigStrategy;
