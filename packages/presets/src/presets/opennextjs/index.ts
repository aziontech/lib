import type { AzionBuildPreset } from '@aziontech/config';
import config from './config';
import configV3 from './config.v3';
import metadata from './metadata';
import prebuild from './prebuild';

export const opennextjs: AzionBuildPreset = { config, configs: { 3: configV3, 4: config }, metadata, prebuild };
