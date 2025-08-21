import {
  AzionConfig,
  AzionCustomPage,
  AzionEdgeApplication,
  AzionEdgeFirewall,
  AzionWorkloadDeployment,
} from '../../../types';
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
    applicationNameOrId: string | number,
    deploymentName: string,
  ) {
    // Only validate if it's a string (name), skip validation for numbers (IDs)
    if (typeof applicationNameOrId === 'string') {
      if (!Array.isArray(edgeApplications) || !edgeApplications.find((app) => app.name === applicationNameOrId)) {
        throw new Error(
          `Workload deployment "${deploymentName}" references non-existent Edge Application "${applicationNameOrId}".`,
        );
      }
    }
  }

  /**
   * Validate Edge Firewall references
   */
  private validateEdgeFirewallReference(
    edgeFirewalls: AzionEdgeFirewall[] | undefined,
    firewallNameOrId: string | number,
    deploymentName: string,
  ) {
    // Only validate if it's a string (name), skip validation for numbers (IDs)
    if (typeof firewallNameOrId === 'string') {
      if (!Array.isArray(edgeFirewalls) || !edgeFirewalls.find((firewall) => firewall.name === firewallNameOrId)) {
        throw new Error(
          `Workload deployment "${deploymentName}" references non-existent Edge Firewall "${firewallNameOrId}".`,
        );
      }
    }
  }

  /**
   * Validate Custom Page references
   */
  private validateCustomPageReference(
    customPages: AzionCustomPage[] | undefined,
    customPageNameOrId: string | number,
    deploymentName: string,
  ) {
    // Only validate if it's a string (name), skip validation for numbers (IDs)
    if (typeof customPageNameOrId === 'string') {
      if (!Array.isArray(customPages) || !customPages.find((page) => page.name === customPageNameOrId)) {
        throw new Error(
          `Workload deployment "${deploymentName}" references non-existent Custom Page "${customPageNameOrId}".`,
        );
      }
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

      // Validate Custom Page reference if provided
      if (deployment.strategy.attributes.customPage) {
        this.validateCustomPageReference(
          config.customPages,
          deployment.strategy.attributes.customPage,
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
            edge_application: String(deployment.strategy.attributes.edgeApplication), // Convert to string for API manifest
            edge_firewall: deployment.strategy.attributes.edgeFirewall
              ? String(deployment.strategy.attributes.edgeFirewall)
              : null, // Convert to string for API manifest
            custom_page: deployment.strategy.attributes.customPage
              ? String(deployment.strategy.attributes.customPage)
              : null, // Convert to string for API manifest
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
  }) {
    if (!Array.isArray(payload?.workload_deployments) || payload.workload_deployments.length === 0) {
      return {};
    }

    const workloadDeployments = payload.workload_deployments.map((deployment) => ({
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

    return { workloadDeployments };
  }
}

export default WorkloadDeploymentsProcessConfigStrategy;
