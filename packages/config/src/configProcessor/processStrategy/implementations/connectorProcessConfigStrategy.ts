import { AzionConfig, AzionEdgeConnector } from '../../../types';
import ProcessConfigStrategy from '../processConfigStrategy';

// Interface local específica para o payload da API
interface ConnectorAddressPayload {
  address: string;
  weight?: number;
  server_role?: string;
  status?: string;
}

/**
 * ConnectorProcessConfigStrategy
 * @class ConnectorProcessConfigStrategy
 * @description This class is implementation of the Connector ProcessConfig Strategy for API v4.
 */
class ConnectorProcessConfigStrategy extends ProcessConfigStrategy {
  transformToManifest(config: AzionConfig) {
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    const payload: any[] = [];
    if (!Array.isArray(config?.edgeConnectors) || config?.edgeConnectors.length === 0) {
      return;
    }

    config?.edgeConnectors.forEach((edgeConnector) => {
      // Validação do tipo
      if (edgeConnector.type !== 'http') {
        throw new Error(`Connector type '${edgeConnector.type}' is not supported. Currently only 'http' is supported.`);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const connectorSetting: any = {
        id: edgeConnector.id,
        name: edgeConnector.name,
        type: edgeConnector.type,
        active: edgeConnector.active ?? true,
      };

      // Configuração de endereços
      if (edgeConnector.addresses && edgeConnector.addresses.length > 0) {
        connectorSetting.addresses = edgeConnector.addresses.map((addr) => ({
          address: addr.address,
          weight: addr.weight,
          server_role: addr.serverRole,
          status: addr.status,
        }));
      } else {
        connectorSetting.addresses = [];
      }

      // Configuração de módulos
      if (edgeConnector.modules) {
        connectorSetting.modules = {
          load_balancer_enabled: edgeConnector.modules.loadBalancerEnabled ?? false,
          origin_shield_enabled: edgeConnector.modules.originShieldEnabled ?? false,
        };
      }

      // Configuração TLS
      if (edgeConnector.tls) {
        connectorSetting.tls = {
          policy: edgeConnector.tls.policy || 'off',
        };

        if (edgeConnector.tls.policy === 'custom') {
          connectorSetting.tls.certificate = edgeConnector.tls.certificate;
          connectorSetting.tls.certificates = edgeConnector.tls.certificates;
          connectorSetting.tls.secret = edgeConnector.tls.secret;
          connectorSetting.tls.sni = edgeConnector.tls.sni;
        }
      }

      // Outras configurações
      connectorSetting.load_balance_method = edgeConnector.loadBalanceMethod || 'off';
      connectorSetting.connection_preference = edgeConnector.connectionPreference || ['IPv6', 'IPv4'];
      connectorSetting.connection_timeout = edgeConnector.connectionTimeout || 60;
      connectorSetting.read_write_timeout = edgeConnector.readWriteTimeout || 120;
      connectorSetting.max_retries = edgeConnector.maxRetries || 0;

      // Propriedades específicas do tipo
      if (edgeConnector.typeProperties) {
        connectorSetting.type_properties = {
          versions: edgeConnector.typeProperties.versions || ['http1'],
          host: edgeConnector.typeProperties.host || '',
          path: edgeConnector.typeProperties.path || '',
          following_redirect: edgeConnector.typeProperties.followingRedirect ?? true,
        };

        if (edgeConnector.typeProperties.realIpHeader) {
          connectorSetting.type_properties.real_ip_header = edgeConnector.typeProperties.realIpHeader;
        }

        if (edgeConnector.typeProperties.realPortHeader) {
          connectorSetting.type_properties.real_port_header = edgeConnector.typeProperties.realPortHeader;
        }
      }

      payload.push(connectorSetting);
    });

    return payload;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformToConfig(payload: any, transformedPayload: AzionConfig) {
    const connectors = payload.connectors;
    if (!Array.isArray(connectors) || connectors.length === 0) {
      return;
    }

    transformedPayload.edgeConnectors = [];

    connectors.forEach((conn) => {
      if (conn.type !== 'http') {
        throw new Error(`Connector type '${conn.type}' is not supported. Currently only 'http' is supported.`);
      }

      const connectorSetting: AzionEdgeConnector = {
        id: conn.id,
        name: conn.name,
        type: conn.type,
        active: conn.active ?? true,
      };

      // Endereços
      if (Array.isArray(conn.addresses) && conn.addresses.length > 0) {
        connectorSetting.addresses = conn.addresses.map((addr: ConnectorAddressPayload) => ({
          address: addr.address,
          weight: addr.weight,
          serverRole: addr.server_role,
          status: addr.status,
        }));
      }

      // Módulos
      if (conn.modules) {
        connectorSetting.modules = {
          loadBalancerEnabled: conn.modules.load_balancer_enabled ?? false,
          originShieldEnabled: conn.modules.origin_shield_enabled ?? false,
        };
      }

      // TLS
      if (conn.tls) {
        connectorSetting.tls = {
          policy: conn.tls.policy || 'off',
        };

        if (conn.tls.policy === 'custom') {
          connectorSetting.tls.certificate = conn.tls.certificate;
          connectorSetting.tls.certificates = conn.tls.certificates;
          connectorSetting.tls.secret = conn.tls.secret;
          connectorSetting.tls.sni = conn.tls.sni;
        }
      }

      // Outras configurações
      connectorSetting.loadBalanceMethod = conn.load_balance_method;
      connectorSetting.connectionPreference = conn.connection_preference;
      connectorSetting.connectionTimeout = conn.connection_timeout;
      connectorSetting.readWriteTimeout = conn.read_write_timeout;
      connectorSetting.maxRetries = conn.max_retries;

      // Propriedades específicas do tipo
      if (conn.type_properties) {
        connectorSetting.typeProperties = {
          versions: conn.type_properties.versions,
          host: conn.type_properties.host,
          path: conn.type_properties.path,
          followingRedirect: conn.type_properties.following_redirect,
        };

        if (conn.type_properties.real_ip_header) {
          connectorSetting.typeProperties.realIpHeader = conn.type_properties.real_ip_header;
        }

        if (conn.type_properties.real_port_header) {
          connectorSetting.typeProperties.realPortHeader = conn.type_properties.real_port_header;
        }
      }

      transformedPayload.edgeConnectors!.push(connectorSetting);
    });

    return transformedPayload.edgeConnectors;
  }
}

export default ConnectorProcessConfigStrategy;
