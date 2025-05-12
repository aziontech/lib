import { convertJsonConfigToObject, processConfig, validateConfig } from './configProcessor';
import { AzionConfig } from './types';

/**
 * Configures and validates the options for the Azion Platform.
 *
 * @param {AzionConfig} config - The configuration object for the Azion Platform.
 * @returns {AzionConfig} The validated configuration object.
 *
 * @example
 * const config = defineConfig({
 *   build: {
 *    preset: 'typescript',
 *   },
 *   domain: {
 *     name: 'example.com',
 *     cnameAccessOnly: false,
 *     cnames: ['www.example.com', 'cdn.example.com'],
 *     Id: 12345,
 *     edgeFirewallId: 67890,
 *     digitalCertificateId: null,
 *     mtls: {
 *       verification: 'enforce',
 *       trustedCaCertificateId: 98765,
 *     },
 *   },
 *   origin: [
 *     {
 *       name: 'My Origin',
 *       type: 'single_origin',
 *       addresses: [
 *         {
 *           address: 'origin.example.com',
 *           weight: 100,
 *         },
 *       ],
 *       protocolPolicy: 'https',
 *     },
 *   ],
 *   cache: [
 *     {
 *       name: 'Default Cache',
 *       browser: {
 *         maxAgeSeconds: 3600,
 *       },
 *       edge: {
 *         maxAgeSeconds: 7200,
 *       },
 *     },
 *   ],
 *   rules: {
 *     request: [
 *       {
 *         name: 'Example Rule',
 *         match: 'path',
 *         behavior: {
 *           setOrigin: {
 *             name: 'My Origin',
 *             type: 'single_origin',
 *           },
 *         },
 *       },
 *     ],
 *   },
 *   purge: [
 *     {
 *       type: 'url',
 *       urls: ['https://example.com/path/to/purge'],
 *       method: 'delete',
 *       layer: 'edge_caching',
 *     },
 *   ],
 *   // ... other configurations
 * });
 */
function defineConfig(config: AzionConfig): AzionConfig {
  try {
    validateConfig(config);
  } catch (error) {
    const errorNoStack = new Error((error as Error).message);
    errorNoStack.stack = undefined;
    throw errorNoStack;
  }
  return config;
}

export { convertJsonConfigToObject, defineConfig, processConfig };

export type * from './types';
