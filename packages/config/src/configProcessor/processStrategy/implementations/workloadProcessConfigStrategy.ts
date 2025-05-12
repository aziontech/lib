import { AzionConfig, AzionWorkload, AzionWorkloadDomain } from '../../../types';
import ProcessConfigStrategy from '../processConfigStrategy';

class WorkloadProcessConfigStrategy extends ProcessConfigStrategy {
  private validateApplicationReferences(config: AzionConfig, workloads: AzionWorkload[]) {
    const applicationNames = config.edgeApplication?.map((app) => app.name) || [];

    workloads.forEach((workload) => {
      if (!applicationNames.includes(workload.edgeApplication)) {
        throw new Error(
          `Workload "${workload.name}" references non-existent Edge Application "${workload.edgeApplication}".`,
        );
      }
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  transformToManifest(config: AzionConfig, context: Record<string, any>) {
    const workloads = config?.workload;
    if (!workloads || workloads.length === 0) return [];

    this.validateApplicationReferences(config, workloads);

    return workloads.map((workload: AzionWorkload) => ({
      name: workload.name,
      alternate_domains: workload.alternateDomains || [],
      edge_application: workload.edgeApplication,
      active: workload.active ?? true,
      network_map: workload.networkMap || '1',
      edge_firewall: workload.edgeFirewall,
      tls: {
        certificate: workload.tls?.certificate || null,
        ciphers: workload.tls?.ciphers || null,
        minimum_version: workload.tls?.minimumVersion || 'tls_1_2',
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
      domains: workload.domains?.map((domain: AzionWorkloadDomain) => ({
        domain: domain.domain,
        allow_access: domain.allowAccess,
      })),
    }));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformToConfig(payload: { workload?: any[] }, transformedPayload: AzionConfig) {
    if (!payload.workload || payload.workload.length === 0) {
      return;
    }

    transformedPayload.workload = payload.workload.map((workload) => ({
      name: workload.name,
      alternateDomains: workload.alternate_domains,
      edgeApplication: workload.edge_application,
      active: workload.active,
      networkMap: workload.network_map,
      edgeFirewall: workload.edge_firewall,
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      domains: workload.domains?.map((domain: any) => ({
        domain: domain.domain,
        allowAccess: domain.allow_access,
      })),
    }));

    return transformedPayload.workload;
  }
}

export default WorkloadProcessConfigStrategy;
