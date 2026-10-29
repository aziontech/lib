import { createJsonConfigConverter } from '../../shared/converterJsonConfig';
import { factoryProcessContext } from '../processStrategy';
import type { AzionConfigV6 } from '../types';
import { validateManifest } from '../validateManifest';

/**
 * Converts a JSON manifest string to an AzionConfigV6 object.
 * @param {string} config - The JSON string to be converted.
 * @returns {AzionConfigV6} The AzionConfigV6 object.
 * @throws {Error} Throws an error if the provided JSON string is invalid.
 */
const convertJsonConfigToObject = createJsonConfigConverter<AzionConfigV6>({
  validate: (manifest) => validateManifest(manifest),
  factoryProcessContext,
  createConfig: () => ({ version: 6 }),
});

export { convertJsonConfigToObject };
