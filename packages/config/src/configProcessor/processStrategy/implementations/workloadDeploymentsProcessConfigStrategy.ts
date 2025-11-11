import { AzionApplication, AzionConfig, AzionCustomPage, AzionFirewall, AzionWorkloadDeployment } from '../../../types';
import ProcessConfigStrategy from '../processConfigStrategy';

/**
 * WorkloadDeploymentsProcessConfigStrategy V4
 * @class WorkloadDeploymentsProcessConfigStrategy
 * @description This class is implementation of the Workload Deployments ProcessConfig Strategy for API V4.
 */
class WorkloadDeploymentsProcessConfigStrategy extends ProcessConfigStrategy {
  /**
   * Validate Application references
   */
  private validateEdgeApplicationReference(
    applications: AzionApplication[] | undefined,
    applicationNameOrId: string | number,
    deploymentName: string,
  ) {
    // Only validate if it's a string (name), skip validation for numbers (IDs)
    if (typeof applicationNameOrId === 'string') {
      if (!Array.isArray(applications) || !applications.find((app) => app.name === applicationNameOrId)) {
        throw new Error(
          `Workload deployment "${deploymentName}" references non-existent Application "${applicationNameOrId}".`,
        );
      }
    }
  }

  /**
   * Validate Firewall references
   */
  private validateEdgeFirewallReference(
    edgeFirewalls: AzionFirewall[] | undefined,
    firewallNameOrId: string | number,
    deploymentName: string,
  ) {
    // Only validate if it's a string (name), skip validation for numbers (IDs)
    if (typeof firewallNameOrId === 'string') {
      if (!Array.isArray(edgeFirewalls) || !edgeFirewalls.find((firewall) => firewall.name === firewallNameOrId)) {
        throw new Error(
          `Workload deployment "${deploymentName}" references non-existent Firewall "${firewallNameOrId}".`,
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
      // Validate Application reference
      this.validateEdgeApplicationReference(
        config.applications,
        deployment.strategy.attributes.application,
        deployment.name,
      );

      // Validate Firewall reference if provided
      if (deployment.strategy.attributes.firewall) {
        this.validateEdgeFirewallReference(config.firewall, deployment.strategy.attributes.firewall, deployment.name);
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
            application: String(deployment.strategy.attributes.application), // Convert to string for API manifest
            firewall: deployment.strategy.attributes.firewall ? String(deployment.strategy.attributes.firewall) : null, // Convert to string for API manifest
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
  transformToConfig(
    payload: {
      workload_deployments?: Array<{
        name: string;
        current?: boolean;
        active?: boolean;
        strategy: {
          type: string;
          attributes: {
            application: number | string;
            firewall?: number | string | null;
            custom_page?: number | null;
          };
        };
      }>;
    },
    transformedPayload: AzionConfig,
  ) {
    if (!Array.isArray(payload?.workload_deployments) || payload.workload_deployments.length === 0) {
      return {};
    }

    transformedPayload.workloads = transformedPayload?.workloads?.map((workload, workloadIndex) => {
      return {
        ...workload,
        deployments: payload?.workload_deployments?.map((deployment, deploymentIndex) => {
          if (deploymentIndex === workloadIndex) {
            return {
              ...deployment,
              strategy: {
                ...deployment.strategy,
                attributes: {
                  application: String(deployment.strategy.attributes.application), // CLI should resolve ID to name
                  firewall: deployment.strategy.attributes.firewall
                    ? String(deployment.strategy.attributes.firewall)
                    : null, // CLI should resolve ID to name
                  customPage: deployment.strategy.attributes.custom_page
                    ? String(deployment.strategy.attributes.custom_page)
                    : null, // CLI should resolve ID to name
                },
              },
            };
          }
          return deployment;
        }),
      };
    });

    return transformedPayload.workloads;
  }
}

export default WorkloadDeploymentsProcessConfigStrategy;
