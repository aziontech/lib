import { getVersionModule, resolveApiVersion } from './registry';
import type { AnyAzionConfig, ApiVersion } from './types';

/**
 * Name of the first application a config deploys, or undefined when it has none
 * (or its API version has no such concept). The version defaults to the one the config declares.
 */
function getApplicationName(config: AnyAzionConfig, version: ApiVersion = resolveApiVersion(config)) {
  return getVersionModule(version).accessors.getApplicationName(config);
}

/**
 * Bucket and prefix of the storage a config serves static files from, wherever its API version keeps them.
 */
function getStorage(config: AnyAzionConfig, version: ApiVersion = resolveApiVersion(config)) {
  return getVersionModule(version).accessors.getStorage(config);
}

/**
 * Top-level keys of a preset config that a firewall-only project must not inherit.
 */
function getFirewallReplacedKeys(version: ApiVersion): readonly string[] {
  return getVersionModule(version).accessors.firewallReplacedKeys;
}

export { getApplicationName, getFirewallReplacedKeys, getStorage };
