/* eslint-disable no-unused-vars */

import { AzionApplicationClient } from '../../application/src/types';
import { AzionPurgeClient } from '../../purge/src/types';
import { AzionClientOptions, AzionSQLClient } from '../../sql/src/types';
import { AzionStorageClient } from '../../storage/src/types';

/**
 * Azion Client interface containing all available service clients.
 *
 * @interface AzionClient
 *
 * @property {AzionStorageClient} storage - Client for Azion Edge Storage operations.
 * @property {AzionSQLClient} sql - Client for Azion Edge SQL database operations.
 * @property {AzionPurgeClient} purge - Client for Azion Edge Purge operations.
 * @property {AzionApplicationClient}  - Client for Azion Edge Application operations.
 */
export interface AzionClient {
  /**
   * Storage client with methods to interact with Azion Edge Storage.
   *
   * @type {AzionStorageClient}
   *
   * @example
   * // Create a new bucket
   * const newBucket = await client.storage.createBucket({ name: 'my-new-bucket', edge_access: 'public' });
   */
  storage: AzionStorageClient;

  /**
   * SQL client with methods to interact with Azion Edge SQL databases.
   *
   * @type {AzionSQLClient}
   *
   * @example
   * // Create a new database
   * const newDatabase = await client.sql.createDatabase('my-new-db');
   */
  sql: AzionSQLClient;

  /**
   * Purge client with methods to interact with Azion Edge Purge.
   *
   * @type {AzionPurgeClient}
   *
   * @example
   * // Purge a URL
   * const purgeResult = await client.purge.purgeURL(['http://example.com/image.jpg']);
   */
  purge: AzionPurgeClient;

  /**
   * Edge Application client with methods to interact with Azion Edge Applications.
   *
   * @type {AzionApplicationClient}
   *
   * @example
   * // Create a new Edge Application
   * const newApp = await client..create({ data: { name: 'My New App' } });
   */
  application: AzionApplicationClient;
}

/**
 * Configuration options for creating an Azion client.
 *
 * @interface AzionClientConfig
 *
 * @property {string} [token] - The authentication token for Azion API. If not provided,
 * the client will attempt to use the AZION_TOKEN environment variable.
 *
 * @property {AzionClientOptions} [options] - Additional options for configuring the client.
 * @property {boolean} [options.debug] - Enable debug mode for detailed logging.
 *
 * @example
 * // Create a client with a token and debug mode enabled
 * const config: AzionClientConfig = {
 *   token: 'your-api-token',
 *   options: { debug: true }
 * };
 * const client = createClient(config);
 *
 * @example
 * // Create a client using environment variables for token and default options
 * const client = createClient();
 */
export interface AzionClientConfig {
  token?: string;
  options?: AzionClientOptions;
}
export interface AzionClientConfig {
  token?: string;
  options?: AzionClientOptions;
}
