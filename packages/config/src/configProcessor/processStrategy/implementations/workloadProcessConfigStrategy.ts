import { AzionConfig, AzionWorkload } from '../../../types';
import ProcessConfigStrategy from '../processConfigStrategy';

/**
 * WorkloadProcessConfigStrategy V4
 * @class WorkloadProcessConfigStrategy
 * @description This class is implementation of the Workload ProcessConfig Strategy for API V4.
 */
class WorkloadProcessConfigStrategy extends ProcessConfigStrategy {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  transformToManifest(config: AzionConfig, context: Record<string, any>) {
    const workloads = config?.workloads;
    if (!workloads || workloads.length === 0) return [];

    return workloads.map((workload: AzionWorkload) => ({
      name: workload.name,
      active: workload.active ?? true,
      infrastructure: workload.infrastructure || 1,
      workload_domain_allow_access: workload.workloadDomainAllowAccess ?? true,
      domains: workload.domains || [],
      tls: {
        certificate: workload.tls?.certificate || null,
        ciphers: workload.tls?.ciphers || null,
        minimum_version: workload.tls?.minimumVersion || 'tls_1_3',
      },
      protocols: {
        http: {
          versions: workload.protocols?.http?.versions || ['http1', 'http2'],
          http_ports: workload.protocols?.http?.httpPorts || [80],
          https_ports: workload.protocols?.http?.httpsPorts || [443],
          quic_ports: workload.protocols?.http?.quicPorts || null,
        },
      },
      mtls: workload.mtls
        ? {
            verification: workload.mtls.verification || 'enforce',
            certificate: workload.mtls.certificate,
            crl: workload.mtls.crl,
          }
        : undefined,
    }));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformToConfig(payload: { workloads?: any[] }) {
    if (!payload.workloads || payload.workloads.length === 0) {
      return {};
    }

    const workloads = payload.workloads.map((workload) => ({
      name: workload.name,
      active: workload.active,
      infrastructure: workload.infrastructure,
      workloadDomainAllowAccess: workload.workload_domain_allow_access,
      domains: workload.domains,
      tls: {
        certificate: workload.tls?.certificate,
        ciphers: workload.tls?.ciphers,
        minimumVersion: workload.tls?.minimum_version,
      },
      protocols: {
        http: {
          versions: workload.protocols?.http?.versions,
          httpPorts: workload.protocols?.http?.http_ports,
          httpsPorts: workload.protocols?.http?.https_ports,
          quicPorts: workload.protocols?.http?.quic_ports,
        },
      },
      mtls: workload.mtls
        ? {
            verification: workload.mtls.verification,
            certificate: workload.mtls.certificate,
            crl: workload.mtls.crl,
          }
        : undefined,
    }));

    return { workloads };
  }
}

export default WorkloadProcessConfigStrategy;
