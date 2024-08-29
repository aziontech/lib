/* eslint-disable no-unused-vars */

import { AzionPurgeClient } from '../../purge/src/types';
import { AzionClientOptions, AzionSQLClient } from '../../sql/src/types';
import { AzionStorageClient } from '../../storage/src/types';

export interface AzionClient {
  /**
   * Storage client with methods to interact with Azion Edge Storage.
   *
   * @type {AzionStorageClient}
   *
   * @example
   * // Create a new bucket
   * const newBucket = await client.storage.createBucket({ name: 'my-new-bucket', edge_access: 'public' });
   *
   * @example
   * // Get all buckets
   * const allBuckets = await client.storage.getBuckets({ params: { page: 1, page_size: 10 } });
   *
   * @example
   * // Get a specific bucket and perform operations
   * const bucket = await client.storage.getBucket({ name: 'my-bucket' });
   * if (bucket) {
   *   // Upload a new object
   *   const newObject = await bucket.createObject({ key: 'example.txt', content: 'Hello, World!' });
   *
   *   // Get all objects in the bucket
   *   const objects = await bucket.getObjects({ params: { page: 1, page_size: 10 } });
   *
   *   // Get a specific object
   *   const object = await bucket.getObjectByKey({ key: 'example.txt' });
   *
   *   // Update an object
   *   const updatedObject = await bucket.updateObject({ key: 'example.txt', content: 'Updated content' });
   *
   *   // Delete an object
   *   const deletedObject = await bucket.deleteObject({ key: 'example.txt' });
   * }
   *
   * @example
   * // Delete a bucket
   * const deletedBucket = await client.storage.deleteBucket({ name: 'my-bucket' });
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
   *
   * @example
   * // Get all databases
   * const allDatabases = await client.sql.getDatabases();
   *
   * @example
   * // Get a specific database and perform operations
   * const db = await client.sql.getDatabase('my-db');
   * if (db) {
   *   // Execute a query
   *   const queryResult = await db.query(['SELECT * FROM users WHERE id = ?', 1]);
   *
   *   // Execute multiple statements
   *   const executeResult = await db.execute([
   *     'INSERT INTO users (name, email) VALUES (?, ?)',
   *     'UPDATE users SET last_login = NOW() WHERE id = ?'
   *   ], ['John Doe', 'john@example.com', 1]);
   *
   *   // List tables in the database
   *   const tables = await db.listTables();
   * }
   *
   * @example
   * // Delete a database
   * const deletedDatabase = await client.sql.deleteDatabase(123); // Using database ID
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
   *
   * @example
   * // Purge a cache key
   * const cacheKeyResult = await client.purge.purgeCacheKey(['my-cache-key-1', 'my-cache-key-2']);
   *
   * @example
   * // Purge using a wildcard
   * const wildcardResult = await client.purge.purgeWildCard(['http://example.com/*']);
   */
  purge: AzionPurgeClient;
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
