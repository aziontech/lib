import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';
import addKeywords from 'ajv-keywords';

import { AzionConfig } from '../../types';
import azionConfigSchema from '../helpers/schema';

/**
 * Validates the provided configuration against a JSON Schema.
 * This function uses AJV (Another JSON Schema Validator) to validate the configuration.
 * If the configuration is not valid, an exception is thrown with the error message of the first validation issue encountered.
 * @param {AzionConfig | Record<string, unknown>} config - The configuration to be validated.
 * @param {object} schema - The JSON Schema to be used for validation. Default is the Azion CDN configuration schema.
 * @throws {Error} Throws an error if the configuration fails validation.
 */
function validateConfig(
  config: AzionConfig | Record<string, unknown>,
  schema: Record<string, unknown> = azionConfigSchema,
) {
  /*  Converts legacy configuration properties to the new `behavior` format. */
  const ajv = new Ajv({ allErrors: true, $data: true, allowUnionTypes: true });
  ajvErrors(ajv);
  addKeywords(ajv, ['instanceof']);
  const validate = ajv.compile(schema);
  const valid = validate(config);

  if (!valid) {
    if (validate.errors && validate.errors.length > 0) {
      const firstError = validate.errors[0];
      console.error('🔍 AJV Validation Error Details:');
      console.error('  Path:', firstError.instancePath);
      console.error('  Schema Path:', firstError.schemaPath);
      console.error('  Message:', firstError.message);
      console.error('  Keyword:', firstError.keyword);
      console.error('  Params:', firstError.params);
      console.error('  Data:', JSON.stringify(firstError.data, null, 2));

      // Log all errors for debugging
      console.error('📋 All Validation Errors:');
      validate.errors.forEach((error, index) => {
        console.error(`  ${index + 1}. Path: ${error.instancePath}`);
        console.error(`     Message: ${error.message}`);
        console.error(`     Keyword: ${error.keyword}`);
        console.error(`     Schema Path: ${error.schemaPath}`);
        console.error('---');
      });

      throw new Error('Azion Config validation: ' + firstError.message);
    } else {
      throw new Error('Azion Config validation failed.');
    }
  }
}

export { validateConfig };
