import { ApiVersion, DEFAULT_API_VERSION } from '../../versions/types';
import { getVersionModule } from '../../versions/registry';

/**
 * Validates the provided manifest against the Manifest Schema of an API version.
 * Manifests do not carry a version, so it is passed through `options.version`.
 * @param {Record<string, unknown>} manifest - The manifest to be validated.
 * @param {object} schema - Optional JSON Schema overriding the version's default manifest schema.
 * @param {{ version?: ApiVersion }} options - Target API version. Defaults to the package default.
 * @throws {Error} Throws an error if the manifest fails validation.
 */
function validateManifest(
  manifest: Record<string, unknown>,
  schema?: Record<string, unknown>,
  options: { version?: ApiVersion } = {},
) {
  return getVersionModule(options.version ?? DEFAULT_API_VERSION).validateManifest(manifest, schema);
}

export { validateManifest };
