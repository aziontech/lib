import { AzionConfig, AzionEdgeApplication, AzionEdgeFirewall, AzionWorkloadDeployment } from '../../../types';
import ProcessConfigStrategy from '../processConfigStrategy';

/**
 * WorkloadDeploymentsProcessConfigStrategy V4
 * @class WorkloadDeploymentsProcessConfigStrategy
 * @description This class is implementation of the Workload Deployments ProcessConfig Strategy for API V4.
 */
class WorkloadDeploymentsProcessConfigStrategy extends ProcessConfigStrategy {
  /**
   * Validate Edge Application references
   */
  private validateEdgeApplicationReference(
    edgeApplications: AzionEdgeApplication[] | undefined,
    applicationName: string,
    deploymentName: string,
  ) {
    if (!Array.isArray(edgeApplications) || !edgeApplications.find((app) => app.name === applicationName)) {
      throw new Error(
        `Workload deployment "${deploymentName}" references non-existent Edge Application "${applicationName}".`,
      );
    }
  }

  /**
   * Validate Edge Firewall references
   */
  private validateEdgeFirewallReference(
    edgeFirewalls: AzionEdgeFirewall[] | undefined,
    firewallName: string,
    deploymentName: string,
  ) {
    if (!Array.isArray(edgeFirewalls) || !edgeFirewalls.find((firewall) => firewall.name === firewallName)) {
      throw new Error(
        `Workload deployment "${deploymentName}" references non-existent Edge Firewall "${firewallName}".`,
      );
    }
  }

  /**
   * Extract deployments from all workloads and transform to V4 manifest format
   */
  transformToManifest(config: AzionConfig) {
    const workloads = config?.workloads;
    if (!workloads || workloads.length === 0) {
      return [];
    }

    // Collect all deployments from all workloads
    const allDeployments: AzionWorkloadDeployment[] = [];
    workloads.forEach((workload) => {
      if (workload.deployments && workload.deployments.length > 0) {
        allDeployments.push(...workload.deployments);
      }
    });

    if (allDeployments.length === 0) {
      return [];
    }

    // Validate references and transform
    return allDeployments.map((deployment) => {
      // Validate Edge Application reference
      this.validateEdgeApplicationReference(
        config.edgeApplications,
        deployment.strategy.attributes.edgeApplication,
        deployment.name,
      );

      // Validate Edge Firewall reference if provided
      if (deployment.strategy.attributes.edgeFirewall) {
        this.validateEdgeFirewallReference(
          config.edgeFirewall,
          deployment.strategy.attributes.edgeFirewall,
          deployment.name,
        );
      }

      return {
        name: deployment.name,
        current: deployment.current ?? true,
        active: deployment.active ?? true,
        strategy: {
          type: deployment.strategy.type,
          attributes: {
            edge_application: deployment.strategy.attributes.edgeApplication, // CLI will resolve name to ID
            edge_firewall: deployment.strategy.attributes.edgeFirewall || null, // CLI will resolve name to ID
            custom_page: deployment.strategy.attributes.customPage || null,
          },
        },
      };
    });
  }

  /**
   * Transform V4 manifest format back to azion.config
   * Note: This recreates deployments but doesn't assign them back to specific workloads
   * The CLI should handle the workload association logic
   */
  transformToConfig(payload: {
    workload_deployments?: Array<{
      name: string;
      current?: boolean;
      active?: boolean;
      strategy: {
        type: string;
        attributes: {
          edge_application: number | string;
          edge_firewall?: number | string | null;
          custom_page?: number | null;
        };
      };
    }>;
  }): AzionWorkloadDeployment[] {
    if (!Array.isArray(payload?.workload_deployments) || payload.workload_deployments.length === 0) {
      return [];
    }

    return payload.workload_deployments.map((deployment) => ({
      name: deployment.name,
      current: deployment.current,
      active: deployment.active,
      strategy: {
        type: deployment.strategy.type,
        attributes: {
          edgeApplication: String(deployment.strategy.attributes.edge_application), // CLI should resolve ID to name
          edgeFirewall: deployment.strategy.attributes.edge_firewall
            ? String(deployment.strategy.attributes.edge_firewall)
            : null, // CLI should resolve ID to name
          customPage: deployment.strategy.attributes.custom_page,
        },
      },
    }));

    // Note: The returned deployments need to be assigned back to their respective workloads by the CLI
  }
}

export default WorkloadDeploymentsProcessConfigStrategy;
