import type { AzionConfigV6 } from '@aziontech/config';

// TODO: add the remaining v6 resources (functions, applications, workloads...) once their schemas are defined
const config: AzionConfigV6 = {
  version: 6,
  build: {
    entry: 'index.js',
  },
};

export default config;
