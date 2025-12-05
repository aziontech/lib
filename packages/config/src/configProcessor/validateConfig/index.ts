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

  const handleMessageError = (errors: unknown[]) => {
    const messages = errors
      ?.slice(0, 3)
      ?.map((error: unknown, index: number) => {
        const errorObject = error as {
          message: string;
          instancePath: string;
          params: { missingProperty?: string | undefined };
        };

        const errorDetails = [
          `📍 Error #${index + 1}:`,
          `   Message: ${errorObject.message}`,
          errorObject.instancePath ? `   Path: ${errorObject.instancePath}` : null,
          errorObject.params?.missingProperty ? `   Missing Property: ${errorObject.params.missingProperty}` : null,
        ]
          .filter(Boolean)
          .join('\n');

        return errorDetails;
      })
      .join('\n\n');

    const totalErrors = errors?.length || 0;
    const moreErrorsNote = totalErrors > 3 ? `\n\n... and ${totalErrors - 3} more error(s)` : '';

    return `⛔️ Azion Configuration Validation Failed\n${'-'.repeat(50)}\n${messages}${moreErrorsNote}\n${'-'.repeat(50)}`;
  };

  if (!valid) {
    if (validate.errors && validate.errors.length > 0) {
      const messages = handleMessageError(validate.errors);
      throw new Error(messages);
    } else {
      throw new Error('Azion validation failed.');
    }
  }
}

export { validateConfig };
