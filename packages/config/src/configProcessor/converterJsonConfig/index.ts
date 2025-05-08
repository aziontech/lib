import { AzionConfig } from '../../types';
import { schemaManifest } from '../helpers/schemaManifest';
import { factoryProcessContext } from '../processStrategy';
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
function convertJsonConfigToObject(config: string): AzionConfig {
  let configObject = {};
  try {
    configObject = JSON.parse(config);
  } catch (error) {
    throw new Error('Invalid JSON configuration.');
  }
  validateConfig(configObject, schemaManifest);
  const payloadConfig: AzionConfig = {};
  const { context } = factoryProcessContext();

  context.transformToConfig(configObject, payloadConfig);

  return payloadConfig;
}

export { convertJsonConfigToObject };
