import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';
import addKeywords from 'ajv-keywords';

import { AzionConfig } from '../types';
import convertLegacyConfig from './helpers/convertLegacyConfig';
import azionConfigSchema from './helpers/schema';
import { schemaManifest } from './helpers/schemaManifest';
import BuildProcessConfigStrategy from './strategy/implementations/buildProcessConfigStrategy';
import CacheProcessConfigStrategy from './strategy/implementations/cacheProcessConfigStrategy';
import DomainProcessConfigStrategy from './strategy/implementations/domainProcessConfigStrategy';
import OriginProcessConfigStrategy from './strategy/implementations/originProcessConfigStrategy';
import PurgeProcessConfigStrategy from './strategy/implementations/purgeProcessConfigStrategy';
import RulesProcessConfigStrategy from './strategy/implementations/rulesProcessConfigStrategy';
import NetworkListProcessConfigStrategy from './strategy/implementations/secure/networkListProcessConfigStrategy';
import WafProcessConfigStrategy from './strategy/implementations/secure/wafProcessConfigStrategy';
import ProcessConfigContext from './strategy/processConfigContext';

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
  const ajv = new Ajv({ allErrors: true, $data: true, allowUnionTypes: true });
  ajvErrors(ajv);
  addKeywords(ajv, ['instanceof']);
  const validate = ajv.compile(schema);
  const valid = validate(config);

  if (!valid) {
    if (validate.errors && validate.errors.length > 0) {
      throw new Error(validate.errors[0].message);
    } else {
      throw new Error('Configuration validation failed.');
    }
  }
}

function factoryProcessContext() {
  const processConfigContext = new ProcessConfigContext();
  processConfigContext.setStrategy('build', new BuildProcessConfigStrategy());
  processConfigContext.setStrategy('origin', new OriginProcessConfigStrategy());
  processConfigContext.setStrategy('cache', new CacheProcessConfigStrategy());
  processConfigContext.setStrategy('domain', new DomainProcessConfigStrategy());
  processConfigContext.setStrategy('purge', new PurgeProcessConfigStrategy());
  processConfigContext.setStrategy('networkList', new NetworkListProcessConfigStrategy());
  processConfigContext.setStrategy('waf', new WafProcessConfigStrategy());
  // Rules must be last to apply to behaviors (origin, cache...)
  processConfigContext.setStrategy('rules', new RulesProcessConfigStrategy());
  return processConfigContext;
}

/**
 * Processes the provided configuration object and returns a JSON object that can be used to create or update an Azion CDN configuration.
 * @param inputConfig AzionConfig
 * @returns
 *
 * @example
 * const config = {
 *  origin: [
 *    {
 *      name: 'My Origin',
 *      type: 'single_origin',
 *      addresses: [
 *        {
 *          address: 'origin.example.com',
 *          weight: 100,
 *        },
 *      ],
 *      protocolPolicy: 'https',
 *    },
 *  ],
 * }
 * const payloadCDN = processConfig(config);
 * console.log(payloadCDN);
 */
function processConfig(inputConfig: AzionConfig) {
  /*  Converts legacy configuration properties to the new `behavior` format. */
  const config = convertLegacyConfig(inputConfig);
  validateConfig(config);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payloadCDN: any = {};

  // ProcessConfig Strategy Pattern
  const processConfigContext = factoryProcessContext();
  processConfigContext.transformToManifest(config, payloadCDN);

  return payloadCDN;
}

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
  const processConfigContext = factoryProcessContext();

  processConfigContext.transformToConfig(configObject, payloadConfig);

  return payloadConfig;
}

export { convertJsonConfigToObject, processConfig, validateConfig };
