import type { AzionBuildPreset } from 'azion/config';
import config from './config';
import handler from './handler';
import metadata from './metadata';
// import prebuild from './prebuild';
// import postbuild from './postbuild';

export const rustwasm: AzionBuildPreset = { config, metadata, handler };
