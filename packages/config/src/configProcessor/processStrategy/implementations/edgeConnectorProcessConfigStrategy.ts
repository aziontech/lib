import {
  EDGE_CONNECTOR_ALLOWED_PROPERTIES,
  EDGE_CONNECTOR_CONNECTION_PREFERENCE,
  EDGE_CONNECTOR_LOAD_BALANCE,
  EDGE_CONNECTOR_SERVER_ROLE,
} from '../../../constants';
import {
  AzionConfig,
  AzionEdgeConnector,
  EdgeConnectorType,
  EdgeConnectorTypeProperty,
  HttpTypeProperty,
  LiveIngestTypeProperty,
  S3TypeProperty,
  StorageTypeProperty,
} from '../../../types';
import ProcessConfigStrategy from '../processConfigStrategy';

class EdgeConnectorProcessConfigStrategy extends ProcessConfigStrategy {
  transformToManifest(config: AzionConfig) {
    const edgeConnectors = config?.edgeConnectors;
    if (!edgeConnectors || edgeConnectors.length === 0) {
      return;
    }

    return edgeConnectors.map((connector: AzionEdgeConnector) => ({
      name: connector.name,
      modules: {
        load_balancer_enabled: connector.modules.loadBalancerEnabled,
        origin_shield_enabled: connector.modules.originShieldEnabled,
      },
      active: connector.active ?? true,
      type: connector.type,
      type_properties: this.transformTypePropertiesToSnakeCase(connector.type, connector.typeProperties),
      addresses: connector.addresses?.map((addr) => ({
        address: addr.address,
        plain_port: addr.plainPort ?? 80,
        tls_port: addr.tlsPort ?? 443,
        server_role: addr.serverRole ?? 'primary',
        weight: addr.weight ?? 1,
        active: addr.active ?? true,
        max_conns: addr.maxConns ?? 0,
        max_fails: addr.maxFails ?? 1,
        fail_timeout: addr.failTimeout ?? 10,
      })),
      tls: connector.tls ?? { policy: 'preserve' },
      load_balance_method: connector.loadBalanceMethod ?? 'off',
      connection_preference: connector.connectionPreference ?? ['IPv6', 'IPv4'],
      connection_timeout: connector.connectionTimeout ?? 60,
      read_write_timeout: connector.readWriteTimeout ?? 120,
      max_retries: connector.maxRetries ?? 0,
    }));
  }

  private transformTypePropertiesToSnakeCase(type: EdgeConnectorType, properties: EdgeConnectorTypeProperty) {
    if (!properties) {
      throw new Error(`Edge Connector of type '${type}' requires 'typeProperties'. Please add the required properties:
          - For type 'http': { versions: string[], host: string, path: string }
          - For type 'live_ingest': { endpoint: string }
          - For type 's3': { host: string, bucket: string, path: string, region: string, accessKey: string, secretKey: string }
          - For type 'edge_storage': { bucket: string }`);
    }

    switch (type) {
      case 'http': {
        const httpProps = properties as HttpTypeProperty;
        return {
          versions: httpProps.versions,
          host: httpProps.host,
          path: httpProps.path,
          following_redirect: httpProps.followingRedirect,
          real_ip_header: httpProps.realIpHeader,
          real_port_header: httpProps.realPortHeader,
        };
      }
      case 'live_ingest': {
        const liveProps = properties as LiveIngestTypeProperty;
        return {
          endpoint: liveProps.endpoint,
        };
      }
      case 's3': {
        const s3Props = properties as S3TypeProperty;
        return {
          host: s3Props.host,
          bucket: s3Props.bucket,
          path: s3Props.path,
          region: s3Props.region,
          access_key: s3Props.accessKey,
          secret_key: s3Props.secretKey,
        };
      }
      case 'edge_storage': {
        const storageProps = properties as StorageTypeProperty;
        return {
          bucket: storageProps.bucket,
          prefix: storageProps.prefix,
        };
      }
      default:
        throw new Error(`Invalid Edge Connector type: ${type}`);
    }
  }

  private validateTypeProperties(type: EdgeConnectorType, properties: EdgeConnectorTypeProperty) {
    // Check if there are any invalid properties for the type
    const invalidProperties = Object.keys(properties).filter(
      (prop) => !(EDGE_CONNECTOR_ALLOWED_PROPERTIES[type] as unknown as string[]).includes(prop),
    );
    if (invalidProperties.length > 0) {
      throw new Error(`Invalid properties for type ${type}: ${invalidProperties.join(', ')}`);
    }
  }

  transformToConfig(
    payload: {
      edge_connector?: Array<{
        name: string;
        modules: { load_balancer_enabled: boolean; origin_shield_enabled: boolean };
        active?: boolean;
        type: EdgeConnectorType;
        type_properties: Record<string, unknown>;
        addresses?: Array<{
          address: string;
          plain_port?: number;
          tls_port?: number;
          server_role?: string;
          weight?: number;
          active?: boolean;
          max_conns?: number;
          max_fails?: number;
          fail_timeout?: number;
        }>;
        tls?: { policy: string };
        load_balance_method?: string;
        connection_preference?: string[];
        connection_timeout?: number;
        read_write_timeout?: number;
        max_retries?: number;
      }>;
    },
    transformedPayload: AzionConfig,
  ) {
    if (!payload.edge_connector || payload.edge_connector.length === 0) {
      return;
    }

    transformedPayload.edgeConnectors = payload.edge_connector.map(
      (connector: {
        name: string;
        modules: { load_balancer_enabled: boolean; origin_shield_enabled: boolean };
        active?: boolean;
        type: EdgeConnectorType;
        type_properties: Record<string, unknown>;
        addresses?: Array<{
          address: string;
          plain_port?: number;
          tls_port?: number;
          server_role?: string;
          weight?: number;
          active?: boolean;
          max_conns?: number;
          max_fails?: number;
          fail_timeout?: number;
        }>;
        tls?: { policy: string };
        load_balance_method?: string;
        connection_preference?: string[];
        connection_timeout?: number;
        read_write_timeout?: number;
        max_retries?: number;
      }) => {
        const typeProperties = this.transformTypePropertiesFromSnakeCase(connector.type, connector.type_properties);
        this.validateTypeProperties(connector.type, typeProperties);

        return {
          name: connector.name,
          modules: {
            loadBalancerEnabled: connector.modules.load_balancer_enabled,
            originShieldEnabled: connector.modules.origin_shield_enabled,
          },
          active: connector.active,
          type: connector.type,
          typeProperties,
          addresses: connector.addresses?.map((addr) => ({
            address: addr.address,
            plainPort: addr.plain_port,
            tlsPort: addr.tls_port,
            serverRole: addr.server_role as (typeof EDGE_CONNECTOR_SERVER_ROLE)[number],
            weight: addr.weight,
            active: addr.active,
            maxConns: addr.max_conns,
            maxFails: addr.max_fails,
            failTimeout: addr.fail_timeout,
          })),
          tls: connector.tls,
          loadBalanceMethod: connector.load_balance_method as (typeof EDGE_CONNECTOR_LOAD_BALANCE)[number],
          connectionPreference:
            connector.connection_preference as (typeof EDGE_CONNECTOR_CONNECTION_PREFERENCE)[number][],
          connectionTimeout: connector.connection_timeout,
          readWriteTimeout: connector.read_write_timeout,
          maxRetries: connector.max_retries,
        };
      },
    );

    return transformedPayload.edgeConnectors;
  }

  private transformTypePropertiesFromSnakeCase(
    type: EdgeConnectorType,
    properties: Record<string, unknown>,
  ): EdgeConnectorTypeProperty {
    switch (type) {
      case 'http':
        return {
          versions: properties.versions as string[],
          host: properties.host as string,
          path: properties.path as string,
          followingRedirect: properties.following_redirect as boolean,
          realIpHeader: properties.real_ip_header as string,
          realPortHeader: properties.real_port_header as string,
        } as HttpTypeProperty;
      case 'live_ingest':
        return {
          endpoint: properties.endpoint as string,
        } as LiveIngestTypeProperty;
      case 's3':
        return {
          host: properties.host as string,
          bucket: properties.bucket as string,
          path: properties.path as string,
          region: properties.region as string,
          accessKey: properties.access_key as string,
          secretKey: properties.secret_key as string,
        } as S3TypeProperty;
      case 'edge_storage':
        return {
          bucket: properties.bucket as string,
          prefix: properties.prefix as string,
        } as StorageTypeProperty;
      default:
        throw new Error(`Invalid Edge Connector type: ${type}`);
    }
  }
}

export default EdgeConnectorProcessConfigStrategy;
