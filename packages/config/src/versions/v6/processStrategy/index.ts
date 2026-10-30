import ProcessConfigContext from '../../shared/processStrategy/processConfigContext';
import type { AzionConfigV6 } from '../types';
import ApplicationProcessConfigStrategy from './implementations/application/applicationProcessConfigStrategy';
import BuildProcessConfigStrategy from './implementations/buildProcessConfigStrategy';
import ConnectorProcessConfigStrategy from './implementations/connectorProcessConfigStrategy';
import DeploymentProcessConfigStrategy from './implementations/deploymentProcessConfigStrategy';
import EnvironmentProcessConfigStrategy from './implementations/environmentProcessConfigStrategy';
import FunctionsProcessConfigStrategy from './implementations/functionsProcessConfigStrategy';
import StorageProcessConfigStrategy from './implementations/storageProcessConfigStrategy';
import WorkloadProcessConfigStrategy from './implementations/workloadProcessConfigStrategy';
import VersionProcessConfigStrategy from './implementations/versionProcessConfigStrategy';

function factoryProcessContext() {
  const processConfigContext = new ProcessConfigContext<AzionConfigV6>();
  processConfigContext.setStrategy('version', new VersionProcessConfigStrategy());
  processConfigContext.setStrategy('build', new BuildProcessConfigStrategy());
  processConfigContext.setStrategy('functions', new FunctionsProcessConfigStrategy());
  processConfigContext.setStrategy('storage', new StorageProcessConfigStrategy());
  processConfigContext.setStrategy('connectors', new ConnectorProcessConfigStrategy());
  processConfigContext.setStrategy('applications', new ApplicationProcessConfigStrategy());
  processConfigContext.setStrategy('environments', new EnvironmentProcessConfigStrategy());
  processConfigContext.setStrategy('deployments', new DeploymentProcessConfigStrategy());
  processConfigContext.setStrategy('workloads', new WorkloadProcessConfigStrategy());
  // TODO: register the other v6 strategies (setStrategy) as the v6 resources are defined
  return processConfigContext;
}

export { factoryProcessContext };
