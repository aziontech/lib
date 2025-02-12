import { AzionBuildPreset } from '../../types';
import config from './config';
import handler from './handler';
// import prebuild from './prebuild';
// import postbuild from './postbuild';
import metadata from './metadata';

const preset: AzionBuildPreset = { config, metadata, handler };

export default preset;
