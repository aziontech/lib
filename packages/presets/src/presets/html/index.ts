import type { AzionBuildPreset } from 'azion/config';
import config from './config';
import handler from './handler';
import metadata from './metadata';

export const HTML: AzionBuildPreset = { config, metadata, handler };
