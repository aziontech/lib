import { AzionConfig } from 'azion/config';

export interface AzionBuildPreset {
  config: AzionConfig;
  handler?: () => void;
  prebuild?: () => void;
  postbuild?: () => void;
}
