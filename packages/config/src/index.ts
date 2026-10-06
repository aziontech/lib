import { convertJsonConfigToObject, processConfig, validateConfig, validateManifest } from './configProcessor';
import {
  convertToV4Config,
  convertV3ToV4Config,
  isV3LegacyConfig,
} from './configProcessor/helpers/convertLegacyConfig';
import { AzionConfig } from './types';
import type { AzionConfigV3 } from './versions/v3/types';
import { getApplicationName, getFirewallReplacedKeys, getStorage } from './versions/accessors';
import { getPresetApiVersions, resolvePresetConfig } from './versions/presetConfig';
import {
  SUPPORTED_API_VERSIONS,
  getVersionModule,
  isSupportedApiVersion,
  resolveApiVersion,
} from './versions/registry';
import { DEFAULT_API_VERSION } from './versions/types';

/**
 * Helper function to provide IntelliSense for Azion configuration.
 * Similar to Vite's defineConfig - provides type safety without runtime overhead.
 *
 * Declare `version: 3` to get the Azion API v3 types (the remaining v3 types live under the `V3` namespace).
 *
 * @param {AnyAzionConfig} config - The configuration object for the Azion Platform.
 * @returns {AzionConfig} The same configuration object (no validation or processing)
 *
 * @example
 * import { defineConfig } from '@aziontech/config';
 *
 * export default defineConfig({
 *   build: {
 *     preset: 'typescript',
 *   },
 *   domain: {
 *     name: 'example.com',
 *   },
 *   // ... other configurations
 * });
 */
function defineConfig(config: AzionConfigV3): AzionConfigV3;
function defineConfig(config: AzionConfig): AzionConfig;
function defineConfig(config: AzionConfig | AzionConfigV3): AzionConfig | AzionConfigV3 {
  return config;
}

export {
  DEFAULT_API_VERSION,
  SUPPORTED_API_VERSIONS,
  convertJsonConfigToObject,
  convertToV4Config,
  convertV3ToV4Config,
  defineConfig,
  getApplicationName,
  getFirewallReplacedKeys,
  getPresetApiVersions,
  getStorage,
  getVersionModule,
  isSupportedApiVersion,
  isV3LegacyConfig,
  processConfig,
  resolveApiVersion,
  resolvePresetConfig,
  validateConfig,
  validateManifest,
};

export type * from './types';
export type { AnyAzionConfig, ApiVersion, ConfigByVersion, ConfigVersionModule } from './versions/types';
export type { AzionConfigV3 };
export type * as V3 from './versions/v3/types';
