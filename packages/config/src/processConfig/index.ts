import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';
import addKeywords from 'ajv-keywords';

import { AzionConfig } from '../types';
import convertLegacyConfig from './helpers/convertLegacyConfig';
import azionConfigSchema from './helpers/schema';
import BuildProcessConfigStrategy from './strategy/implementations/buildProcessConfigStrategy';
import CacheProcessConfigStrategy from './strategy/implementations/cacheProcessConfigStrategy';
import DomainProcessConfigStrategy from './strategy/implementations/domainProcessConfigStrategy';
import OriginProcessConfigStrategy from './strategy/implementations/originProcessConfigStrategy';
import PurgeProcessConfigStrategy from './strategy/implementations/purgeProcessConfigStrategy';
import RulesProcessConfigStrategy from './strategy/implementations/rulesProcessConfigStrategy';
import ProcessConfigContext from './strategy/processConfigContext';

/**
 * Validates the provided configuration against a JSON Schema.
 * This function uses AJV (Another JSON Schema Validator) to validate the configuration.
 * If the configuration is not valid, an exception is thrown with the error message of the first validation issue encountered.
 * @param {object} config - The configuration object to be validated.
 * @throws {Error} Throws an error if the configuration fails validation.
 */
function validateConfig(config: AzionConfig) {
  const ajv = new Ajv({ allErrors: true, $data: true, allowUnionTypes: true });
  ajvErrors(ajv);
  addKeywords(ajv, ['instanceof']);
  const validate = ajv.compile(azionConfigSchema);
  const valid = validate(config);

  if (!valid) {
    if (validate.errors && validate.errors.length > 0) {
      throw new Error(validate.errors[0].message);
    } else {
      throw new Error('Configuration validation failed.');
    }
  }
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
  const processConfigContext = new ProcessConfigContext();
  processConfigContext.setStrategy('build', new BuildProcessConfigStrategy());
  processConfigContext.setStrategy('origin', new OriginProcessConfigStrategy());
  processConfigContext.setStrategy('cache', new CacheProcessConfigStrategy());
  processConfigContext.setStrategy('domain', new DomainProcessConfigStrategy());
  processConfigContext.setStrategy('purge', new PurgeProcessConfigStrategy());

  // Rules must be last to apply to behaviors (origin, cache...)
  processConfigContext.setStrategy('rules', new RulesProcessConfigStrategy());
  processConfigContext.generate(config, payloadCDN);

  return payloadCDN;
}

export { processConfig, validateConfig };
