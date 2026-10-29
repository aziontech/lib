import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';
import addKeywords from 'ajv-keywords';

const MAX_REPORTED_ERRORS = 3;

function formatErrors(errors: unknown[]) {
  const messages = errors
    .slice(0, MAX_REPORTED_ERRORS)
    .map((error: unknown, index: number) => {
      const errorObject = error as {
        message: string;
        instancePath: string;
        params: { missingProperty?: string | undefined };
      };

      return [
        `📍 Error #${index + 1}:`,
        `   Message: ${errorObject.message}`,
        errorObject.instancePath ? `   Path: ${errorObject.instancePath}` : null,
        errorObject.params?.missingProperty ? `   Missing Property: ${errorObject.params.missingProperty}` : null,
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n\n');

  const moreErrorsNote =
    errors.length > MAX_REPORTED_ERRORS ? `\n\n... and ${errors.length - MAX_REPORTED_ERRORS} more error(s)` : '';

  return `⛔️ Azion Configuration Validation Failed\n${'-'.repeat(50)}\n${messages}${moreErrorsNote}\n${'-'.repeat(50)}`;
}

/**
 * Creates the config validator of an API version.
 * The validator uses AJV (Another JSON Schema Validator) and throws an error that reports the first validation issues.
 * @param {object} defaultSchema - JSON Schema of the version's config, used when the caller does not pass one.
 * @returns A function that validates a config and throws an error if it fails validation.
 */
function createConfigValidator<TConfig>(defaultSchema: Record<string, unknown>) {
  return function validateConfig(
    config: TConfig | Record<string, unknown>,
    schema: Record<string, unknown> = defaultSchema,
  ) {
    const ajv = new Ajv({ allErrors: true, $data: true, allowUnionTypes: true });
    ajvErrors(ajv);
    addKeywords(ajv, ['instanceof']);
    const validate = ajv.compile(schema);
    const valid = validate(config);

    if (!valid) {
      if (validate.errors && validate.errors.length > 0) {
        throw new Error(formatErrors(validate.errors));
      }
      throw new Error('Azion validation failed.');
    }
  };
}

export { createConfigValidator };
