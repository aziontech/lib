import ProcessConfigContext from '../../shared/processStrategy/processConfigContext';
import type { AzionConfigV6 } from '../types';
import ApplicationProcessConfigStrategy from './implementations/application/applicationProcessConfigStrategy';
import BuildProcessConfigStrategy from './implementations/buildProcessConfigStrategy';
import ConnectorProcessConfigStrategy from './implementations/connectorProcessConfigStrategy';
import CustomPagesProcessConfigStrategy from './implementations/customPagesProcessConfigStrategy';
import DeploymentProcessConfigStrategy from './implementations/deploymentProcessConfigStrategy';
import EnvironmentProcessConfigStrategy from './implementations/environmentProcessConfigStrategy';
import FunctionsProcessConfigStrategy from './implementations/functionsProcessConfigStrategy';
import PurgeProcessConfigStrategy from './implementations/purgeProcessConfigStrategy';
import FirewallProcessConfigStrategy from './implementations/secure/firewallProcessConfigStrategy';
import NetworkListProcessConfigStrategy from './implementations/secure/networkListProcessConfigStrategy';
import WafProcessConfigStrategy from './implementations/secure/wafProcessConfigStrategy';
import StorageProcessConfigStrategy from './implementations/storageProcessConfigStrategy';
import WorkloadProcessConfigStrategy from './implementations/workloadProcessConfigStrategy';
import VersionProcessConfigStrategy from './implementations/versionProcessConfigStrategy';

function factoryProcessContext() {
  const processConfigContext = new ProcessConfigContext<AzionConfigV6>();
  processConfigContext.setStrategy('version', new VersionProcessConfigStrategy());
  processConfigContext.setStrategy('build', new BuildProcessConfigStrategy());
  processConfigContext.setStrategy('functions', new FunctionsProcessConfigStrategy());
  processConfigContext.setStrategy('network_list', new NetworkListProcessConfigStrategy());
  processConfigContext.setStrategy('waf', new WafProcessConfigStrategy());
  processConfigContext.setStrategy('storage', new StorageProcessConfigStrategy());
  processConfigContext.setStrategy('firewall', new FirewallProcessConfigStrategy());
  processConfigContext.setStrategy('connectors', new ConnectorProcessConfigStrategy());
  processConfigContext.setStrategy('custom_pages', new CustomPagesProcessConfigStrategy());
  processConfigContext.setStrategy('applications', new ApplicationProcessConfigStrategy());
  processConfigContext.setStrategy('environments', new EnvironmentProcessConfigStrategy());
  processConfigContext.setStrategy('deployments', new DeploymentProcessConfigStrategy());
  processConfigContext.setStrategy('workloads', new WorkloadProcessConfigStrategy());
  processConfigContext.setStrategy('purge', new PurgeProcessConfigStrategy());
  return processConfigContext;
}

export { factoryProcessContext };
