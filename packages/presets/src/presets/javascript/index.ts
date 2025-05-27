import type { AzionBuildPreset } from 'azion/config';
import config from './config';
import metadata from './metadata';

export const JavaScript: AzionBuildPreset = { config, metadata };
