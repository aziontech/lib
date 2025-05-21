import { AzionConfig, AzionWorkload } from '../../../types';
import ProcessConfigStrategy from '../processConfigStrategy';

class WorkloadProcessConfigStrategy extends ProcessConfigStrategy {
  private validateApplicationReferences(config: AzionConfig, workloads: AzionWorkload[]) {
    const applicationNames = config.edgeApplications?.map((app) => app.name) || [];
    const firewallNames = config.firewall?.map((firewall) => firewall.name) || [];

    workloads.forEach((workload) => {
      if (!applicationNames.includes(workload.edgeApplication)) {
        throw new Error(
          `Workload "${workload.name}" references non-existent Edge Application "${workload.edgeApplication}".`,
        );
      }
    });

    workloads.forEach((workload) => {
      if (workload.edgeFirewall && !firewallNames.includes(workload.edgeFirewall)) {
        throw new Error(
          `Workload "${workload.name}" references non-existent Edge Firewall "${workload.edgeFirewall}".`,
        );
      }
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  transformToManifest(config: AzionConfig, context: Record<string, any>) {
    const workloads = config?.workloads;
    if (!workloads || workloads.length === 0) return [];

    this.validateApplicationReferences(config, workloads);

    return workloads.map((workload: AzionWorkload) => ({
      name: workload.name,
      alternate_domains: workload.alternateDomains || [],
      edge_application: workload.edgeApplication,
      active: workload.active ?? true,
      network_map: workload.networkMap || '1',
      edge_firewall: workload.edgeFirewall,
      workload_hostname_allow_access: workload.workloadHostnameAllowAccess ?? true,
      domains: workload.domains || [],
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
    }));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformToConfig(payload: { workloads?: any[] }, transformedPayload: AzionConfig) {
    if (!payload.workloads || payload.workloads.length === 0) {
      return;
    }

    transformedPayload.workloads = payload.workloads.map((workload) => ({
      name: workload.name,
      alternateDomains: workload.alternate_domains,
      edgeApplication: workload.edge_application,
      active: workload.active,
      networkMap: workload.network_map,
      edgeFirewall: workload.edge_firewall,
      workloadHostnameAllowAccess: workload.workload_hostname_allow_access,
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

    return transformedPayload.workloads;
  }
}

export default WorkloadProcessConfigStrategy;
