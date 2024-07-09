import createSqlClient from 'azion/sql';

import createStorageClient from 'azion/storage';
import { SQLInternalClient } from '../../sql/src/types';
import { StorageInternalClient } from '../../storage/src/types';

import { AzionClient, ClientConfig } from './types';

/**
 * Creates an Azion Client with methods to interact with Azion
 *
 * @param {ClientConfig} [config] - Client configuration options.
 * @param {string} [config.token] - Authentication token for Azion API.
 * @param {boolean} [config.debug=false] - Enable debug mode for detailed logging.
 * @returns {AzionClient} An object containing SQL and Storage clients.
 *
 * @example
 * // Create a client with a token and debug mode enabled
 * const client = createClient({ token: 'your-api-token', debug: true });
 *
 * @example
 * // Create a client using environment variables for token
 * const client = createClient({ debug: true });
 *
 * @example
 * // Use the SQL client
 * const databases = await client.sql.getDatabases();
 *
 * @example
 * // Use the Storage client
 * const buckets = await client.storage.getBuckets();
 */
function createClient({ token, debug = false }: ClientConfig = {}): AzionClient {
  const storageClient: StorageInternalClient = createStorageClient({ token, debug });
  const sqlClient: SQLInternalClient = createSqlClient({ token, debug });

  return {
    /**
     * Storage client with methods to interact with Azion Edge Storage.
     *
     * @example
     * // Create a new bucket
     * const newBucket = await client.storage.createBucket('my-new-bucket', 'public');
     *
     * // Get all buckets
     * const allBuckets = await client.storage.getBuckets();
     *
     * // Delete a bucket
     * const deletedBucket = await client.storage.deleteBucket('my-bucket');
     */
    storage: storageClient,
    /**
     * SQL client with methods to interact with Azion Edge SQL databases.
     *
     * @example
     * // Create a new database
     * const newDatabase = await client.sql.createDatabase('my-new-db');
     *
     * // Get all databases
     * const allDatabases = await client.sql.getDatabases();
     *
     * // Query a database
     * const queryResult = await client.sql.query('SELECT * FROM users');
     */
    sql: sqlClient,
  };
}

export { createClient };
export default createClient;
