import type { AzionBuildPreset } from '@aziontech/config';
import config from './config';
import metadata from './metadata';

export const javascript: AzionBuildPreset = { config, metadata };
