import type { AzionBuild, AzionFunction, AzionFunctionInstance, AzionRules } from '../../types';

/**
 * Function of the Azion API v6.
 * TODO: add `bindings` (storage) once the v6 config has storage.
 */
export type AzionFunctionV6 = Omit<AzionFunction, 'bindings'>;

/**
 * Application of the Azion API v6.
 * TODO: add the remaining resources of an application (cache settings, device groups).
 */
export type AzionApplicationV6 = {
  /** Application name */
  name: string;
  /** Enable edge cache */
  edgeCacheEnabled?: boolean;
  /** Enable functions */
  functionsEnabled?: boolean;
  /** Enable application accelerator */
  applicationAcceleratorEnabled?: boolean;
  /** Enable image processor */
  imageProcessorEnabled?: boolean;
  /** Indicates if the application is active */
  active?: boolean;
  /** Enable debug mode */
  debug?: boolean;
  /** Rules configuration */
  rules?: AzionRules;
  /** Function instances */
  functionsInstances?: AzionFunctionInstance[];
};

/**
 * Config of the Azion API v6.
 * TODO: structure placeholder. Add the remaining v6 resources once their schemas are defined.
 */
export type AzionConfigV6 = {
  /** Azion API version this config targets. */
  version: 6;
  /** Build configuration (shared by every API version). */
  build?: AzionBuild;
  /** Functions */
  functions?: AzionFunctionV6[];
  /** Applications */
  applications?: AzionApplicationV6[];
};
