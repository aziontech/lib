import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';
import addKeywords from 'ajv-keywords';

/**
 * Creates the manifest validator of an API version.
 * @param {object} defaultSchema - JSON Schema of the version's manifest, used when the caller does not pass one.
 * @returns A function that validates a manifest and throws an error if it fails validation.
 */
function createManifestValidator(defaultSchema: Record<string, unknown>) {
  return function validateManifest(manifest: Record<string, unknown>, schema: Record<string, unknown> = defaultSchema) {
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
  };
}

export { createManifestValidator };
