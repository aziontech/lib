import type { AzionBuild } from '../../types';

/**
 * Config of the Azion API v6.
 * TODO: structure placeholder. Replace with the v6 resources once the schemas are defined.
 */
export type AzionConfigV6 = {
  /** Azion API version this config targets. */
  version: 6;
  /** Build configuration (shared by every API version). */
  build?: AzionBuild;
};
