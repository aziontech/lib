import ProcessConfigStrategy from '../../../shared/processStrategy/processConfigStrategy';
import type { AzionConfigV6, AzionWorkloadV6 } from '../../types';

/**
 * WorkloadProcessConfigStrategy V6
 * @class WorkloadProcessConfigStrategy
 * @description Converts the v6 workloads between the config and the manifest.
 * A binding references an environment and a deployment by the name it has in the config. The manifest keeps that name
 * in `environment_name` and `deployment_name`: the Azion CLI creates the environment and the deployment, so it is the
 * one that knows their ids and sends them to the API.
 */
class WorkloadProcessConfigStrategy extends ProcessConfigStrategy<AzionConfigV6> {
  /**
   * Validate that the environment and the deployment of the bindings are declared
   */
  private validateBindingReferences(config: AzionConfigV6, workload: AzionWorkloadV6) {
    workload.bindings?.forEach((binding) => {
      if (!config.environments?.some((environment) => environment.name === binding.environment)) {
        throw new Error(
          `Workload "${workload.name}" binding references non-existent Environment "${binding.environment}".`,
        );
      }
      if (!config.deployments?.some((deployment) => deployment.name === binding.deployment)) {
        throw new Error(
          `Workload "${workload.name}" binding references non-existent Deployment "${binding.deployment}".`,
        );
      }
    });
  }

  /**
   * `workload_domain_allow_access` needs the workload bound to single-version environments only: it is true by default,
   * and it is false by default when a binding uses a `versioned_urls` environment.
   */
  private resolveWorkloadDomainAllowAccess(config: AzionConfigV6, workload: AzionWorkloadV6) {
    const versionedUrls = workload.bindings?.some(
      (binding) =>
        config.environments?.find((environment) => environment.name === binding.environment)?.deploymentPolicy ===
        'versioned_urls',
    );

    if (workload.workloadDomainAllowAccess && versionedUrls) {
      throw new Error(
        `Workload "${workload.name}" cannot set workloadDomainAllowAccess to true: it is bound to an environment whose deploymentPolicy is versioned_urls.`,
      );
    }

    return workload.workloadDomainAllowAccess ?? !versionedUrls;
  }

  transformToManifest(config: AzionConfigV6) {
    const workloads = config?.workloads;
    if (!workloads || workloads.length === 0) return [];

    return workloads.map((workload: AzionWorkloadV6) => {
      this.validateBindingReferences(config, workload);

      return {
        name: workload.name,
        infrastructure: workload.infrastructure || 1,
        workload_domain_allow_access: this.resolveWorkloadDomainAllowAccess(config, workload),
        tls: {
          ...(workload.tls?.ciphers && { ciphers: workload.tls.ciphers }),
          minimum_version: workload.tls?.minimumVersion || 'tls_1_3',
        },
        protocols: {
          http: {
            versions: workload.protocols?.http?.versions || ['http1', 'http2', 'http3'],
            http_ports: workload.protocols?.http?.httpPorts || [80],
            https_ports: workload.protocols?.http?.httpsPorts || [443],
            quic_ports: workload.protocols?.http?.quicPorts || [443],
          },
        },
        mtls: workload.mtls
          ? {
              enabled: workload.mtls.enabled || false,
              config: {
                verification: workload.mtls.config.verification || 'enforce',
                certificate: workload.mtls.config.certificate,
                crl: workload.mtls.config.crl,
              },
            }
          : undefined,
        bindings: (workload.bindings ?? []).map((binding) => ({
          environment_name: binding.environment,
          deployment_name: binding.deployment,
          domains: (binding.domains ?? []).map((item) => ({
            domain: item.domain,
            certificate: item.certificate ?? null,
          })),
        })),
      };
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformToConfig(payload: { workloads?: any[] }, transformedPayload: AzionConfigV6) {
    if (!payload.workloads || payload.workloads.length === 0) {
      return;
    }

    transformedPayload.workloads = payload.workloads.map((workload) => ({
      name: workload.name,
      infrastructure: workload.infrastructure,
      workloadDomainAllowAccess: workload.workload_domain_allow_access,
      tls: {
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
            enabled: workload.mtls.enabled || false,
            config: {
              verification: workload.mtls.config.verification || 'enforce',
              certificate: workload.mtls.config.certificate,
              crl: workload.mtls.config.crl,
            },
          }
        : undefined,
      bindings: workload.bindings?.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (binding: any) => ({
          environment: binding.environment_name,
          deployment: binding.deployment_name,
          domains: binding.domains,
        }),
      ),
    }));

    return transformedPayload.workloads;
  }
}

export default WorkloadProcessConfigStrategy;
