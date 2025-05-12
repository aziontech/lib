import { AzionConfig, AzionEdgeConnector } from '../../../types';
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
        tls: addr.tls ?? { policy: 'preserve' },
      })),
      tls: connector.tls ?? { policy: 'preserve' },
      load_balance_method: connector.loadBalanceMethod ?? 'off',
      connection_preference: connector.connectionPreference ?? ['IPv6', 'IPv4'],
      connection_timeout: connector.connectionTimeout ?? 60,
      read_write_timeout: connector.readWriteTimeout ?? 120,
      max_retries: connector.maxRetries ?? 0,
    }));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformToConfig(payload: { edge_connector?: any[] }, transformedPayload: AzionConfig) {
    if (!payload.edge_connector || payload.edge_connector.length === 0) {
      return;
    }

    transformedPayload.edgeConnectors = payload.edge_connector.map((connector) => ({
      name: connector.name,
      modules: {
        loadBalancerEnabled: connector.modules.load_balancer_enabled,
        originShieldEnabled: connector.modules.origin_shield_enabled,
      },
      active: connector.active,
      type: connector.type,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      addresses: connector.addresses?.map((addr: any) => ({
        address: addr.address,
        plainPort: addr.plain_port,
        tlsPort: addr.tls_port,
        serverRole: addr.server_role,
        weight: addr.weight,
        active: addr.active,
        maxConns: addr.max_conns,
        maxFails: addr.max_fails,
        failTimeout: addr.fail_timeout,
        tls: addr.tls,
      })),
      tls: connector.tls,
      loadBalanceMethod: connector.load_balance_method,
      connectionPreference: connector.connection_preference,
      connectionTimeout: connector.connection_timeout,
      readWriteTimeout: connector.read_write_timeout,
      maxRetries: connector.max_retries,
    }));

    return transformedPayload.edgeConnectors;
  }
}

export default EdgeConnectorProcessConfigStrategy;
