export interface ApiPurgeResponse {
  state: 'executed' | 'pending';
  data: {
    items: string[];
  };
}

export interface AzionPurge {
  state: 'executed' | 'pending';
  items: string[];
}

export interface AzionPurgeClient {
  /**
   * Purge a URL from the Azion Edge cache.
   *
   * @param {string[]} url - URLs to purge.
   * @param {AzionClientOptions} [options] - Client options including debug mode.
   * @returns {Promise<AzionPurge | null>} The purge response or null if the purge failed.
   *
   * @example
   * const response = await purgeClient.purgeURL(['http://www.domain.com/path/image.jpg'], { debug: true });
   * if (response) {
   *   console.log('Purge successful:', response);
   * } else {
   *   console.error('Purge failed');
   * }
   */
  purgeURL: (urls: string[]) => Promise<AzionPurge | null>;
  /**
   * Purge a Cache Key from the Azion Edge cache.
   *
   * @param {string[]} cacheKey - Cache Keys to purge.
   * @param {AzionClientOptions} [options] - Client options including debug mode.
   * @returns {Promise<AzionPurge | null>} The purge response or null if the purge failed.
   *
   * @example
   * const response = await purgeClient.purgeCacheKey(['http://www.domain.com/path/image.jpg'], { debug: true });
   * if (response) {
   *   console.log('Purge successful:', response);
   * } else {
   *   console.error('Purge failed');
   * }
   */
  purgeCacheKey: (cacheKeys: string[]) => Promise<AzionPurge | null>;
  /**
   * Purge using a wildcard expression from the Azion Edge cache.
   *
   * @param {string[]} wildcard - Wildcard expressions to purge.
   * @param {AzionClientOptions} [options] - Client options including debug mode.
   * @returns {Promise<AzionPurge | null>} The purge response or null if the purge failed.
   *
   * @example
   * const response = await purgeClient.purgeWildCard(['http://www.domain.com/path/image.jpg*'], { debug: true });
   * if (response) {
   *   console.log('Purge successful:', response);
   * } else {
   *   console.error('Purge failed');
   * }
   */
  purgeWildCard: (wildcards: string[]) => Promise<AzionPurge | null>;
}

/**
 * Function type for creating an Azion Purge Client.
 *
 * @param {Object} [config] - Configuration options for the Purge client.
 * @param {string} [config.token] - Authentication token for Azion API. If not provided,
 * the client will attempt to use the AZION_TOKEN environment variable.
 * @param {AzionClientOptions} [config.options] - Additional client options.
 *
 * @returns {AzionPurgeClient} An instance of the Azion Purge Client.
 *
 * @example
 * // Create a Purge client with a token and debug mode enabled
 * const purgeClient = createAzionPurgeClient({
 *   token: 'your-api-token',
 *   options: { debug: true }
 * });
 *
 * @example
 * // Create a Purge client using environment variables for token
 * const purgeClient = createAzionPurgeClient();
 */
export type CreateAzionPurgeClient = (
  config?: Partial<{ token: string; options?: AzionClientOptions }>,
) => AzionPurgeClient;

/**
 * Options for configuring the Azion client behavior.
 *
 * @property {boolean} [debug] - Enable debug mode for detailed logging.
 * @property {boolean} [force] - Force the operation even if it might be destructive.
 *
 * @example
 * const options: AzionClientOptions = {
 *   debug: true,
 *   force: false
 * };
 */
export type AzionClientOptions = {
  debug?: boolean;
  force?: boolean;
};
