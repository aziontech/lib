import BuildProcessConfigStrategy from '../processStrategy/implementations/buildProcessConfigStrategy';
import PurgeProcessConfigStrategy from '../processStrategy/implementations/purgeProcessConfigStrategy';
import NetworkListProcessConfigStrategy from '../processStrategy/implementations/secure/networkListProcessConfigStrategy';
import WafProcessConfigStrategy from '../processStrategy/implementations/secure/wafProcessConfigStrategy';
import ProcessConfigContext from '../processStrategy/processConfigContext';
import EdgeApplicationProcessConfigStrategy from './implementations/application/edgeApplicationProcessConfigStrategy';
import EdgeConnectorProcessConfigStrategy from './implementations/edgeConnectorProcessConfigStrategy';
import FunctionsProcessConfigStrategy from './implementations/functionsProcessConfigStrategy';
import FirewallProcessConfigStrategy from './implementations/secure/firewallProcessConfigStrategy';
import WorkloadProcessConfigStrategy from './implementations/workloadProcessConfigStrategy';

function factoryProcessContext() {
  const processConfigContext = new ProcessConfigContext();
  processConfigContext.setStrategy('build', new BuildProcessConfigStrategy());
  processConfigContext.setStrategy('purge', new PurgeProcessConfigStrategy());
  processConfigContext.setStrategy('networkList', new NetworkListProcessConfigStrategy());
  processConfigContext.setStrategy('waf', new WafProcessConfigStrategy());
  processConfigContext.setStrategy('firewall', new FirewallProcessConfigStrategy());
  processConfigContext.setStrategy('edgeFunctions', new FunctionsProcessConfigStrategy());
  processConfigContext.setStrategy('edgeApplications', new EdgeApplicationProcessConfigStrategy());
  processConfigContext.setStrategy('workloads', new WorkloadProcessConfigStrategy());
  processConfigContext.setStrategy('edgeConnectors', new EdgeConnectorProcessConfigStrategy());
  return processConfigContext;
}

export { factoryProcessContext };
