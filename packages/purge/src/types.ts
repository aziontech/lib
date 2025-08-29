export interface AzionPurgeResponse<T> {
  data?: T;
  error?: {
    message: string;
    operation: string;
  };
}

export interface AzionPurge {
  state: 'executed' | 'pending';
  items: string[];
}

export interface AzionPurgeClient {
  /**
   * Purge a URL from the Azion cache.
   *
   * @param {string[]} url - URLs to purge.
   * @param {AzionClientOptions} [options] - Client options including debug mode.
   * @returns {Promise<AzionPurgeResponse<AzionPurge>>} The purge response or error if the purge failed.
   *
   * @example
   * const { data: response, error } = await purgeClient.purgeURL(['http://www.domain.com/path/image.jpg'], { debug: true });
   * if (response) {
   *   console.log('Purge successful:', response);
   * } else {
   *   console.error('Purge failed', error);
   * }
   */
  purgeURL: (urls: string[]) => Promise<AzionPurgeResponse<AzionPurge>>;
  /**
   * Purge a Cache Key from the Azion cache.
   *
   * @param {string[]} cacheKey - Cache Keys to purge.
   * @param {AzionClientOptions} [options] - Client options including debug mode.
   * @returns {Promise<AzionPurgeResponse<AzionPurge>>} The purge response or error if the purge failed.
   *
   * @example
   * const { data: response, error } = await purgeClient.purgeCacheKey(['http://www.domain.com/path/image.jpg'], { debug: true });
   * if (response) {
   *   console.log('Purge successful:', response);
   * } else {
   *   console.error('Purge failed', error);
   * }
   */
  purgeCacheKey: (cacheKeys: string[]) => Promise<AzionPurgeResponse<AzionPurge>>;
  /**
   * Purge using a wildcard expression from the Azion cache.
   *
   * @param {string[]} wildcard - Wildcard expressions to purge.
   * @param {AzionClientOptions} [options] - Client options including debug mode.
   * @returns {Promise<AzionPurgeResponse<AzionPurge>>} The purge response or error if the purge failed.
   *
   * @example
   * const { data: response, error } = await purgeClient.purgeWildCard(['http://www.domain.com/path/image.jpg*'], { debug: true });
   * if (response) {
   *   console.log('Purge successful:', response);
   * } else {
   *   console.error('Purge failed', error);
   * }
   */
  purgeWildCard: (wildcards: string[]) => Promise<AzionPurgeResponse<AzionPurge>>;
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
