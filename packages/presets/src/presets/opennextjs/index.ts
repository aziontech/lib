import type { AzionBuildPreset } from 'azion/config';
import config from './config';
import metadata from './metadata';
import prebuild from './prebuild';

export const opennextjs: AzionBuildPreset = { config, metadata, prebuild };
