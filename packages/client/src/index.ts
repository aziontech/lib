import { defineConfig } from 'azion/config';
import createPurgeClient from 'azion/purge';
import createSqlClient from 'azion/sql';
import createStorageClient from 'azion/storage';

import { PurgeClient } from '../../purge/src/types';
import { SQLClient } from '../../sql/src/types';
import { StorageClient } from '../../storage/src/types';

import { AzionClient, ClientConfig } from './types';

/**
 * Creates an Azion Client with methods to interact with Azion
 *
 * @param {ClientConfig} [config] - Client configuration options.
 * @param {string} [config.token] - Authentication token for Azion API.
 * @param {boolean} [config.debug=false] - Enable debug mode for detailed logging.
 * @returns {AzionClient} An object containing SQL, Storage, and Purge clients.
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
 *
 * @example
 * // Use the Purge client
 * const purgeResult = await client.purge.purgeURL('http://example.com/image.jpg');
 */
function createClient({ token, debug = false }: ClientConfig = {}): AzionClient {
  const storageClient: StorageClient = createStorageClient({ token, debug });
  const sqlClient: SQLClient = createSqlClient({ token, debug });
  const purgeClient: PurgeClient = createPurgeClient({ token, debug });

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
    /**
     * Purge client with methods to interact with Azion Edge Purge.
     *
     * @example
     * // Purge a URL
     * const purgeResult = await client.purge.purgeURL(['http://example.com/image.jpg']);
     *
     * // Purge a cache key
     * const cacheKeyResult = await client.purge.purgeCacheKey(['my-cache-key-1', 'my-cache-key-2']);
     *
     * // Purge using a wildcard
     * const wildcardResult = await client.purge.purgeWildCard(['http://example.com/*']);
     */
    purge: purgeClient,
  };
}

export { createClient, defineConfig };
export default createClient;

export * from './types';
