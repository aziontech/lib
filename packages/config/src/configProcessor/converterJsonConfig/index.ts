import { AzionConfig } from '../../types';
import { getVersionModule } from '../../versions/registry';
import { ApiVersion, DEFAULT_API_VERSION } from '../../versions/types';

/**
 * Converts a JSON manifest string into a config object of the given API version.
 * Manifests do not carry a version, so it is passed through `options.version`.
 * @param {string} config - JSON manifest.
 * @param {{ version?: ApiVersion }} options - Target API version. Defaults to the package default.
 * @returns {AzionConfig} The config object.
 * @throws {Error} If the JSON is invalid or the manifest fails validation.
 */
function convertJsonConfigToObject(config: string, options: { version?: ApiVersion } = {}): AzionConfig {
  return getVersionModule(options.version ?? DEFAULT_API_VERSION).convertJsonConfigToObject(config);
}

export { convertJsonConfigToObject };
