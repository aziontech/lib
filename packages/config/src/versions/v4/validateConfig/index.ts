import type { AzionConfig } from '../../../types';
import { createConfigValidator } from '../../shared/validateConfig';
import azionConfigSchema from '../schemas/schema';

/**
 * Validates the provided configuration against a JSON Schema.
 * If the configuration is not valid, an exception is thrown with the first validation issues encountered.
 * @param {AzionConfig | Record<string, unknown>} config - The configuration to be validated.
 * @param {object} schema - The JSON Schema to be used for validation. Default is the Azion CDN configuration schema.
 * @throws {Error} Throws an error if the configuration fails validation.
 */
const validateConfig = createConfigValidator<AzionConfig>(azionConfigSchema);

export { validateConfig };
