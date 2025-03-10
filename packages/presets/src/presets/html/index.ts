import { AzionBuildPreset } from 'azion/config';
import config from './config';
import handler from './handler';
import metadata from './metadata';

export const html: AzionBuildPreset = { config, metadata, handler };
