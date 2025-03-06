import { AzionBuildPreset } from 'azion/config';
import config from './config';
import metadata from './metadata';

const preset: AzionBuildPreset = { config, metadata };

export default preset;
