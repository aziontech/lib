import type { ConfigVersionAccessors, ConfigVersionModule } from '../types';
import { convertJsonConfigToObject } from './converterJsonConfig';
import { factoryProcessContext } from './processStrategy';
import { validateConfig } from './validateConfig';
import type { AzionConfigV6 } from './types';
import { validateManifest } from './validateManifest';

const accessors: ConfigVersionAccessors = {
  getApplicationName: (config) => (config as AzionConfigV6).applications?.[0]?.name,
  getStorage: (config) => {
    // TODO: multiple storage support
    const storage = (config as AzionConfigV6).storage?.[0];
    return storage ? { bucket: storage.name, prefix: storage.prefix ?? '' } : undefined;
  },
  // the keys of a preset that only serve an application, which a firewall-only project does not have. The environments
  // and the deployments only exist to bind a workload to an application, so they go along with the workloads
  firewallReplacedKeys: ['applications', 'workloads', 'connectors', 'functions', 'environments', 'deployments'],
};

// v6 has its own AzionConfig type, which is not assignable to the default (v4) one used by the shared contract
const v6 = {
  version: 6,
  factoryProcessContext,
  validateConfig,
  validateManifest,
  convertJsonConfigToObject,
  accessors,
} as unknown as ConfigVersionModule;

export default v6;
