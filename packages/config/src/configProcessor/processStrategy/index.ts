import BuildProcessConfigStrategy from '../processStrategy/implementations/buildProcessConfigStrategy';
import CacheProcessConfigStrategy from '../processStrategy/implementations/cacheProcessConfigStrategy';
import DomainProcessConfigStrategy from '../processStrategy/implementations/domainProcessConfigStrategy';
import OriginProcessConfigStrategy from '../processStrategy/implementations/originProcessConfigStrategy';
import PurgeProcessConfigStrategy from '../processStrategy/implementations/purgeProcessConfigStrategy';
import RulesProcessConfigStrategy from '../processStrategy/implementations/rulesProcessConfigStrategy';
import NetworkListProcessConfigStrategy from '../processStrategy/implementations/secure/networkListProcessConfigStrategy';
import WafProcessConfigStrategy from '../processStrategy/implementations/secure/wafProcessConfigStrategy';
import ProcessConfigContext from '../processStrategy/processConfigContext';
import FunctionsProcessConfigStrategy from './implementations/functionsProcessConfigStrategy';
import FirewallProcessConfigStrategy from './implementations/secure/firewallProcessConfigStrategy';

function factoryProcessContext() {
  const processConfigContext = new ProcessConfigContext();
  processConfigContext.setStrategy('build', new BuildProcessConfigStrategy());
  processConfigContext.setStrategy('origin', new OriginProcessConfigStrategy());
  processConfigContext.setStrategy('cache', new CacheProcessConfigStrategy());
  processConfigContext.setStrategy('domain', new DomainProcessConfigStrategy());
  processConfigContext.setStrategy('purge', new PurgeProcessConfigStrategy());
  processConfigContext.setStrategy('networkList', new NetworkListProcessConfigStrategy());
  processConfigContext.setStrategy('waf', new WafProcessConfigStrategy());
  processConfigContext.setStrategy('firewall', new FirewallProcessConfigStrategy());
  processConfigContext.setStrategy('functions', new FunctionsProcessConfigStrategy());
  // Rules must be last to apply to behaviors (origin, cache...)
  processConfigContext.setStrategy('rules', new RulesProcessConfigStrategy());
  return processConfigContext;
}

export { factoryProcessContext };
