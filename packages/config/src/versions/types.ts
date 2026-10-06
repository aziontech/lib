import type { AzionConfig } from '../types';
import type { AzionConfigV3 } from './v3/types';
import type ProcessConfigContext from './v4/processStrategy/processConfigContext';

/**
 * Config shape of each Azion API version the package knows how to process.
 * To add a new version: create `versions/vN`, add it here and register it in `versions/registry.ts`
 * (the registry is typed on this map, so the compiler fails until it is registered).
 * `ApiVersion`, `SUPPORTED_API_VERSIONS` and `AzionPresetConfigs` are derived from it.
 */
export interface ConfigByVersion {
  3: AzionConfigV3;
  4: AzionConfig;
}

export type ApiVersion = keyof ConfigByVersion;

/**
 * A config of any supported API version.
 */
export type AnyAzionConfig = ConfigByVersion[ApiVersion];

/**
 * Version used when the user config does not declare `version`.
 */
export const DEFAULT_API_VERSION: ApiVersion = 4;

/**
 * Everything that changes from one API version to another.
 * Each `versions/vN/index.ts` exports an implementation of this contract.
 */
export interface ConfigVersionModule {
  version: ApiVersion;
  /** Builds the strategy context that converts config <-> manifest for this version. */
  factoryProcessContext: () => ProcessConfigContext;
  /** Validates a config against this version's schema. Throws on failure. */
  validateConfig: (config: AnyAzionConfig | Record<string, unknown>, schema?: Record<string, unknown>) => void;
  /** Validates a manifest against this version's manifest schema. Throws on failure. */
  validateManifest: (manifest: Record<string, unknown>, schema?: Record<string, unknown>) => void;
  /** Converts a JSON manifest into a config object of this version. */
  convertJsonConfigToObject: (config: string) => AzionConfig;
  /** Reads, from a config of this version, data whose location differs between versions. */
  accessors: ConfigVersionAccessors;
}

/**
 * Where each version keeps the data tools need to read from a config.
 */
export interface ConfigVersionAccessors {
  /** Name of the (first) application the config deploys. Undefined when the version has no such concept. */
  getApplicationName: (config: AnyAzionConfig) => string | undefined;
  /** Storage (bucket and prefix) the config serves static files from. */
  getStorage: (config: AnyAzionConfig) => { bucket: string; prefix: string } | undefined;
  /** Top-level keys of a preset config that a firewall-only project must not inherit. */
  firewallReplacedKeys: readonly string[];
}
