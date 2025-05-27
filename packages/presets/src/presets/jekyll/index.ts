import type { AzionBuildPreset } from 'azion/config';
import config from './config';
import handler from './handler';
import metadata from './metadata';
import prebuild from './prebuild';

export const Jekyll: AzionBuildPreset = { config, metadata, handler, prebuild };
