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
   *
   * @example
   * // Get all buckets
   * const { data: allBuckets } = await client.storage.getBuckets({ params: { page: 1, page_size: 10 } });
   *
   * @example
   * // Get a specific bucket and perform operations
   * const { data: bucket } = await client.storage.getBucket({ name: 'my-bucket' });
   * if (bucket) {
   *   // Upload a new object
   *   const { data: newObject } = await bucket.createObject({ key: 'example.txt', content: 'Hello, World!' });
   *
   *   // Get all objects in the bucket
   *   const { data: objectsResult } = await bucket.getObjects({ params: { page: 1, page_size: 10 } });
   *
   *   // Get a specific object
   *   const { data: object, error } = await bucket.getObjectByKey({ key: 'example.txt' });
   *
   *   // Update an object
   *   const { data: updatedObject } = await bucket.updateObject({ key: 'example.txt', content: 'Updated content' });
   *
   *   // Delete an object
   *   const { data: deletedObject } = await bucket.deleteObject({ key: 'example.txt' });
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
   * const { data: newDatabase } = await client.sql.createDatabase('my-new-db');
   *
   * @example
   * // Get all databases
   * const { data, error } = await client.sql.getDatabases();
   *
   * @example
   * // Get a specific database and perform operations
   * const { data: db, error } = await client.sql.getDatabase('my-db');
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
   *   const tables = await db.getTables();
   * }
   *
   * @example
   * // Delete a database
   * const { data, error } = await client.sql.deleteDatabase(123); // Using database ID
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
   * const { data: newApp } = await client.application.createApplication({
   *   data: {
   *     name: 'My New App',
   *     delivery_protocol: 'http',
   *     origin_type: 'single_origin',
   *     address: 'example.com'
   *   }
   * });
   *
   * @example
   * // Get all Edge Applications
   * const { data: allApps } = await client.application.getApplications({
   *   params: { page: 1, page_size: 20, sort: 'name', order_by: 'asc' }
   * });
   *
   * @example
   * // Get a specific Edge Application and perform operations
   * const { data: app } = await client.application.getApplication({ applicationId: 123 });
   * if (app) {
   *   // Create a new cache setting
   *   const { data: newCacheSetting } = await app.cache.createCacheSetting({
   *     data: { name: 'My Cache Setting', browser_cache_settings: 'override' }
   *   });
   *
   *   // Create a new origin
   *   const { data: newOrigin } = await app.origins.createOrigin({
   *     data: { name: 'My Origin', addresses: [{ address: 'api.example.com' }] }
   *   });
   *
   *   // Create a new rule
   *   const { data: newRule } = await app.rules.request.createRule({
   *     data: {
   *       name: 'My Rule',
   *       behaviors: [{ name: 'set_origin', target: newOrigin.id }],
   *       criteria: [{ condition: 'starts_with', variable: '${uri}', input: '/api' }]
   *     }
   *   });
   *
   *   // Create a new function instance
   *   const { data: newFunction } = await app.functions.createFunctionInstance({
   *     data: {
   *       name: 'My Function Instance',
   *       edge_function_id: 1234,
   *       args: {}
   *     }
   *   });
   * }
   *
   * @example
   * // Update an Edge Application
   * const { data: updatedApp } = await client.application.updateApplication({
   *   applicationId: 123,
   *   data: { name: 'Updated App Name', delivery_protocol: 'https' }
   * });
   *
   * @example
   * // Delete an Edge Application
   * const { data: deletedApp } = await client.application.deleteApplication({ applicationId: 123 });
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
