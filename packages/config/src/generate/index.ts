import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';
import addKeywords from 'ajv-keywords';

import { AzionConfig } from '../types';
import convertLegacyConfig from './helpers/convertLegacyConfig';
import azionConfigSchema from './helpers/schema';
import BuildManifestStrategy from './strategy/implementations/buildManifestStrategy';
import CacheManifestStrategy from './strategy/implementations/cacheManifestStrategy';
import DomainManisfestStrategy from './strategy/implementations/domainManifestStrategy';
import OriginManifestStrategy from './strategy/implementations/originManifestStrategy';
import PurgeManifestStrategy from './strategy/implementations/purgeManifestStrategy';
import RulesManifestStrategy from './strategy/implementations/rulesManifestStrategy';
import ManifestContext from './strategy/manifestContext';

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

function generateManifest(inputConfig: AzionConfig) {
  /*  Converts legacy configuration properties to the new `behavior` format. */
  const config = convertLegacyConfig(inputConfig);
  validateConfig(config);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payloadCDN: any = {};

  // Manifest Strategy Pattern
  const manifestContext = new ManifestContext();
  manifestContext.setStrategy('build', new BuildManifestStrategy());
  manifestContext.setStrategy('origin', new OriginManifestStrategy());
  manifestContext.setStrategy('cache', new CacheManifestStrategy());
  manifestContext.setStrategy('domain', new DomainManisfestStrategy());
  manifestContext.setStrategy('purge', new PurgeManifestStrategy());

  // Rules must be last to apply to behaviors (origin, cache...)
  manifestContext.setStrategy('rules', new RulesManifestStrategy());
  manifestContext.generate(config, payloadCDN);

  return payloadCDN;
}

export { generateManifest, validateConfig };
