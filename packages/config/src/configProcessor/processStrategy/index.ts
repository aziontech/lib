import ApplicationProcessConfigStrategy from './implementations/application/applicationProcessConfigStrategy';
import BuildProcessConfigStrategy from './implementations/buildProcessConfigStrategy';
import ConnectorProcessConfigStrategy from './implementations/connectorProcessConfigStrategy';
import CustomPagesProcessConfigStrategy from './implementations/customPagesProcessConfigStrategy';
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
  processConfigContext.setStrategy('storage', new StorageProcessConfigStrategy());
  processConfigContext.setStrategy('firewall', new FirewallProcessConfigStrategy());
  processConfigContext.setStrategy('functions', new FunctionsProcessConfigStrategy());
  processConfigContext.setStrategy('applications', new ApplicationProcessConfigStrategy());
  processConfigContext.setStrategy('connectors', new ConnectorProcessConfigStrategy());
  processConfigContext.setStrategy('workloads', new WorkloadProcessConfigStrategy());
  processConfigContext.setStrategy('workload_deployments', new WorkloadDeploymentsProcessConfigStrategy());
  processConfigContext.setStrategy('custom_pages', new CustomPagesProcessConfigStrategy());
  return processConfigContext;
}

export { factoryProcessContext };
