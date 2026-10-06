import type { AzionConfig } from '../../types';
import type { ConfigVersionModule } from '../types';
import { convertJsonConfigToObject } from './converterJsonConfig';
import { factoryProcessContext } from './processStrategy';
import { validateConfig } from './validateConfig';
import { validateManifest } from './validateManifest';

const v4: ConfigVersionModule = {
  version: 4,
  factoryProcessContext,
  validateConfig,
  validateManifest,
  convertJsonConfigToObject,
  accessors: {
    getApplicationName: (config) => (config as AzionConfig).applications?.[0]?.name,
    getStorage: (config) => {
      // TODO: multiple storage support
      const storage = (config as AzionConfig).storage?.[0];
      return storage ? { bucket: storage.name, prefix: storage.prefix ?? '' } : undefined;
    },
    firewallReplacedKeys: ['applications', 'workloads', 'connectors', 'functions'],
  },
};

export default v4;
