import { AzionBuildPreset } from 'azion/config';
import config from './config';
import handler from './handler';
import metadata from './metadata';
// import prebuild from './prebuild';

const preset: AzionBuildPreset = { config, handler, metadata };

export default preset;
