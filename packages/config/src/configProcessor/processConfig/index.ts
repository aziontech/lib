import { AzionConfig } from '../../types';
import convertLegacyConfig from '../helpers/convertLegacyConfig';
import { factoryProcessContext } from '../processStrategy';
import { validateConfig } from '../validateConfig';

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
export { processConfig, validateConfig };
