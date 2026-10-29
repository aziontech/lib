import type { AzionConfig } from '../../../types';
import { createJsonConfigConverter } from '../../shared/converterJsonConfig';
import { factoryProcessContext } from '../processStrategy';
import { schemaManifest } from '../schemas/schemaManifest';
import { validateConfig } from '../validateConfig';

/**
 * Converts a JSON string to an AzionConfig object.
 * @param {string} config - The JSON string to be converted.
 * @returns {AzionConfig} The AzionConfig object.
 * @throws {Error} Throws an error if the provided JSON string is invalid.
 *
 * @example
 * const config = `{
 * "origin": [
 *   {
 *    "name": "My Origin",
 *    "origin_type": "single_origin",
 *    "origin_path": '',
 *     "method": 'ip_hash',
 *    "addresses": [
 *      {
 *        "address": "origin.example.com",
 *        "weight": 100
 *      }
 *    ],
 *   }
 * ]
 *}`;
 * const configObject = convertJsonConfigToObject(config);
 * console.log(configObject);
 *
 */
const convertJsonConfigToObject = createJsonConfigConverter<AzionConfig>({
  validate: (manifest) => validateConfig(manifest, schemaManifest),
  factoryProcessContext,
  createConfig: () => ({}),
});

export { convertJsonConfigToObject };
