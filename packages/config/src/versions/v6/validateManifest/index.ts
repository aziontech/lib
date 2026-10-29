import { createManifestValidator } from '../../shared/validateManifest';
import { schemaManifest as azionManifestSchema } from '../schemas/schemaManifest';

/**
 * Validates the provided manifest against the Azion Manifest Schema (API v6).
 * @param {Record<string, unknown>} manifest - The manifest to be validated.
 * @param {object} schema - Optional JSON Schema overriding the default manifest schema.
 * @throws {Error} Throws an error if the manifest fails validation.
 */
const validateManifest = createManifestValidator(azionManifestSchema);

export { validateManifest };
