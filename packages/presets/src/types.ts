import type { AzionBuild } from 'azion/config';
import { AzionConfig } from 'azion/config';
import { FetchEvent } from 'azion/types';

export type PresetMetadata = {
  name: string;
};

export type AzionBuildPreset = {
  config: AzionConfig;
  handler: (event: FetchEvent) => Promise<Response>;
  prebuild?: (context: AzionBuild) => Promise<void>;
  postbuild?: (context: AzionBuild) => Promise<void>;
  metadata: PresetMetadata;
};
