import { AzionConfig } from '../../types';
import { getVersionModule, resolveApiVersion } from '../../versions/registry';
import type { AnyAzionConfig } from '../../versions/types';
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
function processConfig(inputConfig: AnyAzionConfig) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payloadCDN: any = {};
  // ProcessConfig Strategy Pattern: the strategies come from the API version the config targets
  const processConfigContext = getVersionModule(resolveApiVersion(inputConfig)).factoryProcessContext();
  // each version's strategies read their own config shape; the shared contract is typed with the default one
  processConfigContext.transformToManifest(inputConfig as AzionConfig, payloadCDN);
  return payloadCDN;
}
export { processConfig, validateConfig };
