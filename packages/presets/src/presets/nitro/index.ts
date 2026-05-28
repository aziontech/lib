import type { AzionBuildPreset } from '@aziontech/config';
import config from './config';
import metadata from './metadata';
import prebuild from './prebuild';

export const nitro: AzionBuildPreset = { config, metadata, prebuild };
