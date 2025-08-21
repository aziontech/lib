import EdgeApplicationProcessConfigStrategy from './implementations/application/edgeApplicationProcessConfigStrategy';
import BuildProcessConfigStrategy from './implementations/buildProcessConfigStrategy';
import EdgeConnectorProcessConfigStrategy from './implementations/edgeConnectorProcessConfigStrategy';
import FunctionsProcessConfigStrategy from './implementations/functionsProcessConfigStrategy';
import PurgeProcessConfigStrategy from './implementations/purgeProcessConfigStrategy';
import FirewallProcessConfigStrategy from './implementations/secure/firewallProcessConfigStrategy';
import NetworkListProcessConfigStrategy from './implementations/secure/networkListProcessConfigStrategy';
import WafProcessConfigStrategy from './implementations/secure/wafProcessConfigStrategy';
import StorageProcessConfigStrategy from './implementations/storageProcessConfigStrategy';
import WorkloadDeploymentsProcessConfigStrategy from './implementations/workloadDeploymentsProcessConfigStrategy';
import WorkloadProcessConfigStrategy from './implementations/workloadProcessConfigStrategy';
import ProcessConfigContext from './processConfigContext';

function factoryProcessContext() {
  const processConfigContext = new ProcessConfigContext();
  processConfigContext.setStrategy('build', new BuildProcessConfigStrategy());
  processConfigContext.setStrategy('purge', new PurgeProcessConfigStrategy());
  processConfigContext.setStrategy('network_list', new NetworkListProcessConfigStrategy());
  processConfigContext.setStrategy('waf', new WafProcessConfigStrategy());
  processConfigContext.setStrategy('edge_storage', new StorageProcessConfigStrategy());
  processConfigContext.setStrategy('firewall', new FirewallProcessConfigStrategy());
  processConfigContext.setStrategy('edge_functions', new FunctionsProcessConfigStrategy());
  processConfigContext.setStrategy('edge_applications', new EdgeApplicationProcessConfigStrategy());
  processConfigContext.setStrategy('workloads', new WorkloadProcessConfigStrategy());
  processConfigContext.setStrategy('edge_connectors', new EdgeConnectorProcessConfigStrategy());
  processConfigContext.setStrategy('workload_deployments', new WorkloadDeploymentsProcessConfigStrategy());
  return processConfigContext;
}

export { factoryProcessContext };
