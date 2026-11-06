import ProcessConfigStrategy from '../../../shared/processStrategy/processConfigStrategy';
import type { AzionConfigV6, AzionWorkloadDeploymentV6 } from '../../types';

/**
 * WorkloadDeploymentsProcessConfigStrategy V6
 * @class WorkloadDeploymentsProcessConfigStrategy
 * @description Converts the deployments of the v6 workloads between the config and the manifest.
 * The manifest lists the deployments of every workload under `workload_deployments`, as v4 does, and each one carries the
 * `workload_name` it belongs to, because the API creates a deployment under a workload
 * (`/workspace/workloads/{workload_id}/deployments`) and the Azion CLI is the one that knows the workload ID.
 * The application, firewall and custom page of the strategy are IDs in the API: a name is validated against the config
 * and kept in the manifest for the CLI to resolve, and an ID goes through as the number it is.
 */
class WorkloadDeploymentsProcessConfigStrategy extends ProcessConfigStrategy<AzionConfigV6> {
  /**
   * Validate that a referenced resource is declared. A number is an ID, which is not validated.
   */
  private validateReference(
    resources: { name: string }[] | undefined,
    nameOrId: string | number,
    label: string,
    deploymentName: string,
  ) {
    if (typeof nameOrId === 'string' && !resources?.some((resource) => resource.name === nameOrId)) {
      throw new Error(`Workload deployment "${deploymentName}" references non-existent ${label} "${nameOrId}".`);
    }
  }

  transformToManifest(config: AzionConfigV6) {
    const workloads = config?.workloads;
    if (!workloads || workloads.length === 0) {
      return [];
    }

    return workloads.flatMap((workload) =>
      (workload.deployments ?? []).map((deployment: AzionWorkloadDeploymentV6) => {
        const { application, firewall, customPage } = deployment.strategy.attributes;

        this.validateReference(config.applications, application, 'Application', deployment.name);
        if (firewall) this.validateReference(config.firewall, firewall, 'Firewall', deployment.name);
        if (customPage) this.validateReference(config.customPages, customPage, 'Custom Page', deployment.name);

        return {
          workload_name: workload.name,
          name: deployment.name,
          current: deployment.current ?? true,
          active: deployment.active ?? true,
          strategy: {
            type: deployment.strategy.type,
            attributes: {
              application,
              firewall: firewall ?? null,
              custom_page: customPage ?? null,
            },
          },
        };
      }),
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformToConfig(payload: { workload_deployments?: any[] }, transformedPayload: AzionConfigV6) {
    if (!Array.isArray(payload?.workload_deployments) || payload.workload_deployments.length === 0) {
      return;
    }

    transformedPayload.workloads = (transformedPayload.workloads ?? []).map((workload) => ({
      ...workload,
      deployments: payload
        .workload_deployments!.filter((deployment) => deployment.workload_name === workload.name)
        .map((deployment) => ({
          name: deployment.name,
          current: deployment.current,
          active: deployment.active,
          strategy: {
            type: deployment.strategy.type,
            attributes: {
              application: deployment.strategy.attributes.application,
              firewall: deployment.strategy.attributes.firewall ?? null,
              customPage: deployment.strategy.attributes.custom_page ?? null,
            },
          },
        })),
    }));

    return transformedPayload.workloads;
  }
}

export default WorkloadDeploymentsProcessConfigStrategy;
