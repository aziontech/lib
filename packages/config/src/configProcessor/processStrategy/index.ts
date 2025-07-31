import EdgeApplicationProcessConfigStrategy from './implementations/application/edgeApplicationProcessConfigStrategy';
import BuildProcessConfigStrategy from './implementations/buildProcessConfigStrategy';
import EdgeConnectorProcessConfigStrategy from './implementations/edgeConnectorProcessConfigStrategy';
import FunctionsProcessConfigStrategy from './implementations/functionsProcessConfigStrategy';
import PurgeProcessConfigStrategy from './implementations/purgeProcessConfigStrategy';
import FirewallProcessConfigStrategy from './implementations/secure/firewallProcessConfigStrategy';
import NetworkListProcessConfigStrategy from './implementations/secure/networkListProcessConfigStrategy';
import WafProcessConfigStrategy from './implementations/secure/wafProcessConfigStrategy';
import StorageProcessConfigStrategy from './implementations/storageProcessConfigStrategy';
import WorkloadProcessConfigStrategy from './implementations/workloadProcessConfigStrategy';
import ProcessConfigContext from './processConfigContext';

function factoryProcessContext() {
  const processConfigContext = new ProcessConfigContext();
  processConfigContext.setStrategy('build', new BuildProcessConfigStrategy());
  processConfigContext.setStrategy('purge', new PurgeProcessConfigStrategy());
  processConfigContext.setStrategy('networkList', new NetworkListProcessConfigStrategy());
  processConfigContext.setStrategy('waf', new WafProcessConfigStrategy());
  processConfigContext.setStrategy('edgeStorage', new StorageProcessConfigStrategy());
  processConfigContext.setStrategy('firewall', new FirewallProcessConfigStrategy());
  processConfigContext.setStrategy('edgeFunctions', new FunctionsProcessConfigStrategy());
  processConfigContext.setStrategy('edgeApplications', new EdgeApplicationProcessConfigStrategy());
  processConfigContext.setStrategy('workloads', new WorkloadProcessConfigStrategy());
  processConfigContext.setStrategy('edgeConnectors', new EdgeConnectorProcessConfigStrategy());
  return processConfigContext;
}

export { factoryProcessContext };
