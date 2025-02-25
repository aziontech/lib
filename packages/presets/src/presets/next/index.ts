import { AzionBuildPreset } from 'azion/config';
import config from './config';
import handler from './handler';
import metadata from './metadata';
import postbuild from './postbuild';
import prebuild from './prebuild';
``;

const preset: AzionBuildPreset = { config, metadata, handler, prebuild, postbuild };

export default preset;
