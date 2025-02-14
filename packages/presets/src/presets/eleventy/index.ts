import { AzionBuildPreset } from 'azion/config';
import config from './config';
import handler from './handler';
import metadata from './metadata';
// import prebuild from './prebuild';
// import postbuild from './postbuild';

const preset: AzionBuildPreset = { config, metadata, handler };

export default preset;
