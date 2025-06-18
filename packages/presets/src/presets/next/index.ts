import type { AzionBuildPreset } from 'azion/config';
import config from './config';
import handler from './handler';
import metadata from './metadata';
import postbuild from './postbuild';
import prebuild from './prebuild';

export const next: AzionBuildPreset = { config, metadata, handler, prebuild, postbuild };
