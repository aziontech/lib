import { AzionBuildPreset } from 'azion/config';
import config from './config';
import handler from './handler';
import metadata from './metadata';

const preset: AzionBuildPreset = { config, metadata, handler };

export default preset;
