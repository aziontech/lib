import { getVersionModule, resolveApiVersion } from '../../versions/registry';
import type { AnyAzionConfig } from '../../versions/types';

/**
 * Validates the provided configuration against the JSON Schema of the API version it targets.
 * The version is read from `config.version` and defaults to the package default.
 * @param {AzionConfig | Record<string, unknown>} config - The configuration to be validated.
 * @param {object} schema - Optional JSON Schema overriding the version's default schema.
 * @throws {Error} Throws an error if the configuration fails validation or declares an unsupported version.
 */
function validateConfig(config: AnyAzionConfig | Record<string, unknown>, schema?: Record<string, unknown>) {
  const version = resolveApiVersion(config);
  return getVersionModule(version).validateConfig(config, schema);
}

export { validateConfig };
