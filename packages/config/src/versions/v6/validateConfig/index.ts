import { createConfigValidator } from '../../shared/validateConfig';
import azionConfigSchema from '../schemas/schema';
import type { AzionConfigV6 } from '../types';

/**
 * Validates the provided configuration against the v6 JSON Schema.
 * If the configuration is not valid, an exception is thrown with the first validation issues encountered.
 * @param {AzionConfigV6 | Record<string, unknown>} config - The configuration to be validated.
 * @param {object} schema - The JSON Schema to be used for validation. Default is the v6 configuration schema.
 * @throws {Error} Throws an error if the configuration fails validation.
 */
const validateConfig = createConfigValidator<AzionConfigV6>(azionConfigSchema);

export { validateConfig };
