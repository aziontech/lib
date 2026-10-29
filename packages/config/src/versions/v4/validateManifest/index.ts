import { createManifestValidator } from '../../shared/validateManifest';
import { schemaManifest as azionManifestSchema } from '../schemas/schemaManifest';

/**
 * Validates the provided manifest against the Azion Manifest Schema.
 * If the manifest is not valid, an exception is thrown with the error message of the first validation issue encountered.
 * @param {Record<string, unknown>} manifest - The manifest to be validated.
 * @param {object} schema - The JSON Schema to be used for validation. Default is the Azion Manifest schema.
 * @throws {Error} Throws an error if the manifest fails validation.
 */
const validateManifest = createManifestValidator(azionManifestSchema);

export { validateManifest };
