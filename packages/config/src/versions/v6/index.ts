import type { ConfigVersionAccessors, ConfigVersionModule } from '../types';
import { convertJsonConfigToObject } from './converterJsonConfig';
import { factoryProcessContext } from './processStrategy';
import { validateConfig } from './validateConfig';
import { validateManifest } from './validateManifest';

const accessors: ConfigVersionAccessors = {
  // TODO: define where v6 keeps the application name, the storage and the firewall keys
  getApplicationName: () => undefined,
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
