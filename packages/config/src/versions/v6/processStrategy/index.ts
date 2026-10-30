import ProcessConfigContext from '../../shared/processStrategy/processConfigContext';
import type { AzionConfigV6 } from '../types';
import ApplicationProcessConfigStrategy from './implementations/application/applicationProcessConfigStrategy';
import BuildProcessConfigStrategy from './implementations/buildProcessConfigStrategy';
import FunctionsProcessConfigStrategy from './implementations/functionsProcessConfigStrategy';
import VersionProcessConfigStrategy from './implementations/versionProcessConfigStrategy';

function factoryProcessContext() {
  const processConfigContext = new ProcessConfigContext<AzionConfigV6>();
  processConfigContext.setStrategy('version', new VersionProcessConfigStrategy());
  processConfigContext.setStrategy('build', new BuildProcessConfigStrategy());
  processConfigContext.setStrategy('functions', new FunctionsProcessConfigStrategy());
  processConfigContext.setStrategy('applications', new ApplicationProcessConfigStrategy());
  // TODO: register the other v6 strategies (setStrategy) as the v6 resources are defined
  return processConfigContext;
}

export { factoryProcessContext };
