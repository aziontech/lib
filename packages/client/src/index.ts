import createAzionApplicationClient, { AzionApplicationClient } from 'azion/applications';
import { defineConfig } from 'azion/config';
import createPurgeClient, { AzionPurgeClient } from 'azion/purge';
import createSqlClient, { AzionSQLClient } from 'azion/sql';
import createStorageClient, { AzionStorageClient } from 'azion/storage';

import { AzionClient, AzionClientConfig } from './types';

/**
 * Creates an Azion Client with methods to interact with Azion services
 *
 * @param {AzionClientConfig} [config] - Client configuration options.
 * @param {string} [config.token] - Authentication token for Azion API.
 * @param {boolean} [config.debug=false] - Enable debug mode for detailed logging.
 * @returns {AzionClient} An object containing SQL, Storage, Purge, and Edge Application clients.
 *
 * @example
 * // Create a client with a token and debug mode enabled
 * const client = createClient({ token: 'your-api-token', debug: true });
 *
 * @example
 * // Create a client using environment variables for token
 * const client = createClient({ debug: true });
 */
function createClient({ token, options }: AzionClientConfig = {}): AzionClient {
  /**
   * Storage client with methods to interact with Azion Edge Storage.
   * @type {AzionStorageClient}
   */
  const storageClient: AzionStorageClient = createStorageClient({ token, options });

  /**
   * SQL client with methods to interact with Azion Edge SQL databases.
   * @type {AzionSQLClient}
   */
  const sqlClient: AzionSQLClient = createSqlClient({ token, options });

  /**
   * Purge client with methods to interact with Azion Edge Purge.
   * @type {AzionPurgeClient}
   */
  const purgeClient: AzionPurgeClient = createPurgeClient({ token, options });

  /**
   * Edge Application client with methods to interact with Azion Edge Applications.
   * @type {AzionApplicationClient}
   */
  const applicationClient: AzionApplicationClient = createAzionApplicationClient({ token, options });

  /**
   * Azion Client object containing Storage, SQL, Purge, and Edge Application clients.
   * Use this object to interact with various Azion services.
   *
   * @type {AzionClient}
   *
   * @property {AzionStorageClient} storage - Client for Azion Edge Storage operations.
   * @property {AzionSQLClient} sql - Client for Azion Edge SQL database operations.
   * @property {AzionPurgeClient} purge - Client for Azion Edge Purge operations.
   * @property {AzionApplicationClient} application - Client for Azion Edge Application operations.
   */
  const client: AzionClient = {
    storage: storageClient,
    sql: sqlClient,
    purge: purgeClient,
    application: applicationClient,
  };

  return client;
}

export { createClient, defineConfig };

export default createClient;

export type * from './types';
