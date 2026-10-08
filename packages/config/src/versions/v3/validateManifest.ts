import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';
import addKeywords from 'ajv-keywords';

import { schemaManifest as azionManifestSchema } from './schemas/schemaManifest';

/**
 * Validates the provided manifest against the Azion Manifest Schema (API v3).
 * @param {Record<string, unknown>} manifest - The manifest to be validated.
 * @param {object} schema - Optional JSON Schema overriding the default manifest schema.
 * @throws {Error} Throws an error if the manifest fails validation.
 */
function validateManifest(manifest: Record<string, unknown>, schema: Record<string, unknown> = azionManifestSchema) {
  const ajv = new Ajv({ allErrors: true, $data: true, allowUnionTypes: true });
  ajvErrors(ajv);
  addKeywords(ajv, ['instanceof']);
  const validate = ajv.compile(schema);
  const valid = validate(manifest);

  if (!valid) {
    if (validate.errors && validate.errors.length > 0) {
      throw new Error('Azion validation: ' + validate.errors[0].message);
    }
    throw new Error('Azion validation failed.');
  }
}

export { validateManifest };
