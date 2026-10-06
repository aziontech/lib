import type { AzionBuildPreset } from '../types';
import { isSupportedApiVersion } from './registry';
import { AnyAzionConfig, ApiVersion, DEFAULT_API_VERSION } from './types';

/**
 * Deep clones plain objects and arrays. Functions (e.g. `build.extend`) and class instances are kept by reference.
 */
function clone<T>(value: T): T {
  if (Array.isArray(value)) return value.map(clone) as T;
  if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, clone(item)])) as T;
  }
  return value;
}

/**
 * Returns the config a preset provides for an API version.
 * The result is a copy, so callers can change it without affecting the preset (presets are module singletons).
 *
 * A preset that only declares `config` (e.g. a user defined preset) is treated as supporting the default version.
 * @throws {Error} When the preset has no config for the requested version.
 */
function resolvePresetConfig(
  preset: Pick<AzionBuildPreset, 'config' | 'configs' | 'metadata'>,
  version: ApiVersion = DEFAULT_API_VERSION,
): AnyAzionConfig {
  const config = preset.configs?.[version] ?? (version === DEFAULT_API_VERSION ? preset.config : undefined);
  if (!config) {
    const available = getPresetApiVersions(preset);
    throw new Error(
      `Preset "${preset.metadata?.name}" does not support config version ${version}. ` +
        `Supported versions: ${available.join(', ') || 'none'}.`,
    );
  }
  return clone(config);
}

/**
 * Lists the API versions a preset has a config for.
 */
function getPresetApiVersions(preset: Pick<AzionBuildPreset, 'config' | 'configs'>): ApiVersion[] {
  const versions = new Set<ApiVersion>();
  Object.entries(preset.configs ?? {}).forEach(([key, value]) => {
    const version = Number(key);
    if (value && isSupportedApiVersion(version)) versions.add(version);
  });
  if (preset.config) versions.add(DEFAULT_API_VERSION);
  return [...versions].sort((a, b) => a - b);
}

export { getPresetApiVersions, resolvePresetConfig };
