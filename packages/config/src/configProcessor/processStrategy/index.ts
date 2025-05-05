import BuildProcessConfigStrategy from '../processStrategy/implementations/buildProcessConfigStrategy';
import CacheProcessConfigStrategy from '../processStrategy/implementations/cacheProcessConfigStrategy';
import OriginProcessConfigStrategy from '../processStrategy/implementations/originProcessConfigStrategy';
import PurgeProcessConfigStrategy from '../processStrategy/implementations/purgeProcessConfigStrategy';
import RulesProcessConfigStrategy from '../processStrategy/implementations/rulesProcessConfigStrategy';
import NetworkListProcessConfigStrategy from '../processStrategy/implementations/secure/networkListProcessConfigStrategy';
import WafProcessConfigStrategy from '../processStrategy/implementations/secure/wafProcessConfigStrategy';
import ProcessConfigContext from '../processStrategy/processConfigContext';
import ApplicationProcessConfigStrategy from './implementations/applicationProcessConfigStrategy';
import FunctionsProcessConfigStrategy from './implementations/functionsProcessConfigStrategy';
import FirewallProcessConfigStrategy from './implementations/secure/firewallProcessConfigStrategy';
import WorkloadProcessConfigStrategy from './implementations/workloadProcessConfigStrategy';

export function factoryProcessContext(contextType = 'transformToConfig') {
  const processConfigContext = new ProcessConfigContext();
  processConfigContext.setStrategy('build', new BuildProcessConfigStrategy());
  processConfigContext.setStrategy('origin', new OriginProcessConfigStrategy());
  processConfigContext.setStrategy('cache', new CacheProcessConfigStrategy());
  processConfigContext.setStrategy('workload', new WorkloadProcessConfigStrategy());
  processConfigContext.setStrategy('purge', new PurgeProcessConfigStrategy());
  processConfigContext.setStrategy('networkList', new NetworkListProcessConfigStrategy());
  processConfigContext.setStrategy('waf', new WafProcessConfigStrategy());
  processConfigContext.setStrategy('firewall', new FirewallProcessConfigStrategy());
  processConfigContext.setStrategy('functions', new FunctionsProcessConfigStrategy());
  // Rules must be last to apply to behaviors (origin, cache...)
  processConfigContext.setStrategy('rules', new RulesProcessConfigStrategy());
  processConfigContext.setStrategy('application', new ApplicationProcessConfigStrategy());
  return { context: processConfigContext, contextType };
}
