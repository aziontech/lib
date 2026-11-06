import type { AzionBuildPreset } from '@aziontech/config';
import config from './config';
import configV6 from './config.v6';
import metadata from './metadata';
import prebuild from './prebuild';

export const nitro: AzionBuildPreset = { config, configs: { 4: config, 6: configV6 }, metadata, prebuild };
