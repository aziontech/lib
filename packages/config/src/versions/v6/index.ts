import type { ConfigVersionAccessors, ConfigVersionModule } from '../types';
import { convertJsonConfigToObject } from './converterJsonConfig';
import { factoryProcessContext } from './processStrategy';
import { validateConfig } from './validateConfig';
import type { AzionConfigV6 } from './types';
import { validateManifest } from './validateManifest';

const accessors: ConfigVersionAccessors = {
  getApplicationName: (config) => (config as AzionConfigV6).applications?.[0]?.name,
  // TODO: define where v6 keeps the storage and the firewall keys
  getStorage: () => undefined,
  firewallReplacedKeys: [],
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
