import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';
import addKeywords from 'ajv-keywords';

import { schemaManifest as azionManifestSchema } from '../helpers/schemaManifest';

/**
 * Validates the provided manifest against the Azion Manifest Schema.
 * This function uses AJV (Another JSON Schema Validator) to validate the manifest.
 * If the manifest is not valid, an exception is thrown with the error message of the first validation issue encountered.
 * @param {Record<string, unknown>} manifest - The manifest to be validated.
 * @param {object} schema - The JSON Schema to be used for validation. Default is the Azion Manifest schema.
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
      const firstError = validate.errors[0];
      throw new Error('Azion validation: ' + firstError.message);
    } else {
      throw new Error('Azion validation failed.');
    }
  }
}

export { validateManifest };
