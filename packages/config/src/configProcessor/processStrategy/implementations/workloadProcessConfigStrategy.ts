import {
  APPLICATION_SUPPORTED_CIPHERS,
  WORKLOAD_NETWORK_MAPS,
  WORKLOAD_TLS_MINIMUM_VERSIONS,
} from '../../../constants';
import { AzionConfig } from '../../../types';
import ProcessConfigStrategy from '../processConfigStrategy';

/**
 * WorkloadProcessConfigStrategy
 * @class WorkloadProcessConfigStrategy
 * @description This class is implementation of the Workload ProcessConfig Strategy for API v4.
 */
class WorkloadProcessConfigStrategy extends ProcessConfigStrategy {
  transformToManifest(config: AzionConfig) {
    const workload = config?.workload;
    if (!workload || Object.keys(workload).length === 0) {
      return;
    }

    // Validate cipher suite if provided
    if (workload.tls?.ciphers && !APPLICATION_SUPPORTED_CIPHERS.includes(workload.tls.ciphers)) {
      throw new Error(
        `Workload ${workload.name} has an invalid cipher suite: ${workload.tls.ciphers}. Valid values are: ${APPLICATION_SUPPORTED_CIPHERS.join(', ')}.`,
      );
    }

    // Validate TLS minimum version if provided
    if (workload.tls?.minimumVersion && !WORKLOAD_TLS_MINIMUM_VERSIONS.includes(workload.tls.minimumVersion)) {
      throw new Error(
        `Workload ${workload.name} has an invalid minimum TLS version: ${workload.tls.minimumVersion}. Valid values are: ${WORKLOAD_TLS_MINIMUM_VERSIONS.join(', ')}.`,
      );
    }

    // Validate mTLS verification if provided
    if (workload.mtls?.verification && !['enforce', 'permissive'].includes(workload.mtls.verification)) {
      throw new Error(
        `Workload ${workload.name} has an invalid mTLS verification value: ${workload.mtls.verification}. Valid values are: 'enforce', 'permissive'.`,
      );
    }

    // Validate network map if provided
    if (workload.networkMap && !WORKLOAD_NETWORK_MAPS.includes(workload.networkMap)) {
      throw new Error(
        `Workload ${workload.name} has an invalid network map value: ${workload.networkMap}. Valid values are: ${WORKLOAD_NETWORK_MAPS.join(', ')}.`,
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const workloadSetting: any = {
      name: workload.name,
      alternate_domains: workload.alternateDomains || [],
      edge_application: workload.edgeApplication,
      active: workload.active === undefined ? true : workload.active,
      network_map: workload.networkMap || '1',
      edge_firewall: workload.edgeFirewall || null,
    };

    // Add TLS configuration if provided
    if (workload.tls) {
      workloadSetting.tls = {
        certificate: workload.tls.certificate || null,
        ciphers: workload.tls.ciphers || null,
        minimum_version: workload.tls.minimumVersion || 'tls_1_2',
      };
    }

    // Add protocols configuration if provided
    if (workload.protocols?.http) {
      workloadSetting.protocols = {
        http: {
          versions: workload.protocols.http.versions || ['http1', 'http2'],
          http_ports: workload.protocols.http.httpPorts || [80],
          https_ports: workload.protocols.http.httpsPorts || [443],
          quic_ports: workload.protocols.http.quicPorts || null,
        },
      };
    }

    // Add mTLS configuration if provided
    if (workload.mtls) {
      workloadSetting.mtls = {
        verification: workload.mtls.verification || 'enforce',
        certificate: workload.mtls.certificate || null,
        crl: workload.mtls.crl || null,
      };
    }

    // Add domains configuration if provided
    if (workload.domains && workload.domains.length > 0) {
      workloadSetting.domains = workload.domains.map((domain) => ({
        domain: domain.domain || null,
        allow_access: domain.allowAccess === undefined ? true : domain.allowAccess,
      }));
    }

    return workloadSetting;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformToConfig(payload: any, transformedPayload: AzionConfig) {
    const workload = payload.workload;
    if (!workload || Object.keys(workload).length === 0) {
      return;
    }

    transformedPayload.workload = {
      name: workload.name,
      alternateDomains: workload.alternate_domains || [],
      edgeApplication: workload.edge_application,
      active: workload.active === undefined ? true : workload.active,
      networkMap: workload.network_map || '1',
      edgeFirewall: workload.edge_firewall || null,
    };

    // Add TLS configuration if available
    if (workload.tls) {
      transformedPayload.workload.tls = {
        certificate: workload.tls.certificate || null,
        ciphers: workload.tls.ciphers || null,
        minimumVersion: workload.tls.minimum_version || 'tls_1_2',
      };
    }

    // Add protocols configuration if available
    if (workload.protocols?.http) {
      transformedPayload.workload.protocols = {
        http: {
          versions: workload.protocols.http.versions || ['http1', 'http2'],
          httpPorts: workload.protocols.http.http_ports || [80],
          httpsPorts: workload.protocols.http.https_ports || [443],
          quicPorts: workload.protocols.http.quic_ports || null,
        },
      };
    }

    // Add mTLS configuration if available
    if (workload.mtls) {
      transformedPayload.workload.mtls = {
        verification: workload.mtls.verification || 'enforce',
        certificate: workload.mtls.certificate || null,
        crl: workload.mtls.crl || null,
      };
    }

    // Add domains configuration if available
    if (workload.domains && workload.domains.length > 0) {
      transformedPayload.workload.domains = workload.domains.map(
        (domain: { domain?: string | null; allow_access?: boolean }) => ({
          domain: domain.domain || null,
          allowAccess: domain.allow_access === undefined ? true : domain.allow_access,
        }),
      );
    }

    return transformedPayload.workload;
  }
}

export default WorkloadProcessConfigStrategy;
