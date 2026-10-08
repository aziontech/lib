import type { ConfigVersionAccessors, ConfigVersionModule } from '../types';
import type { AzionConfigV3 } from './types';
import { convertJsonConfigToObject } from './converterJsonConfig';
import { factoryProcessContext } from './processStrategy';
import { validateConfig } from './validateConfig';
import { validateManifest } from './validateManifest';

const accessors: ConfigVersionAccessors = {
  // v3 has no applications: the origin/cache/rules of the config are the application
  getApplicationName: () => undefined,
  getStorage: (config) => {
    const origin = (config as AzionConfigV3).origin?.find((item) => item.type === 'object_storage');
    return origin ? { bucket: origin.bucket ?? '', prefix: origin.prefix ?? '' } : undefined;
  },
  firewallReplacedKeys: ['origin', 'cache', 'rules', 'functions'],
};

// v3 has its own AzionConfig type, which is not assignable to the default (v4) one used by the shared contract
const v3 = {
  version: 3,
  factoryProcessContext,
  validateConfig,
  validateManifest,
  convertJsonConfigToObject,
  accessors,
} as unknown as ConfigVersionModule;

export default v3;
