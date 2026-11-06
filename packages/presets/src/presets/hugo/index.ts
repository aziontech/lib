import type { AzionBuildPreset } from '@aziontech/config';
import config from './config';
import configV3 from './config.v3';
import configV6 from './config.v6';
import handler from './handler';
import metadata from './metadata';
import prebuild from './prebuild';

export const hugo: AzionBuildPreset = {
  config,
  configs: { 3: configV3, 4: config, 6: configV6 },
  metadata,
  handler,
  prebuild,
};
