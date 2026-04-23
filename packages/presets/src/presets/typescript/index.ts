import type { AzionBuildPreset } from '@aziontech/config';
import config from './config';
import metadata from './metadata';

export const typescript: AzionBuildPreset = { config, metadata };
