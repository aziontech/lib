import ProcessConfigContext from '../../shared/processStrategy/processConfigContext';
import type { AzionConfigV6 } from '../types';

function factoryProcessContext() {
  const processConfigContext = new ProcessConfigContext<AzionConfigV6>();
  // TODO: register the v6 strategies (setStrategy) as the v6 resources are defined
  return processConfigContext;
}

export { factoryProcessContext };
