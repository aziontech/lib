import { JsonObjectQueryExecutionResponse } from './utils/mappers/to-object';

export type Database = {
  id: number;
  name: string;
  status: 'creating' | 'created' | 'deleting';
  active: boolean;
  lastModified: string;
  lastEditor: string | null;
  productVersion: string;
};

export type AzionSQLError = {
  message: string;
  operation: string;
  metadata?: Record<string, unknown>;
};

export type AzionDatabase = Database & {
  /**
   * Executes a query or multiple queries on the database.
   *
   * @param {string[]} statements - An array of SQL statements to execute.
   * @param {AzionClientOptions} [options] - Additional options for the query execution.
   * @returns {Promise<AzionDatabaseResponse<AzionDatabaseQueryResponse>} A promise that resolves to the query response or error if the operation faile>d.
   *
   * @example
   * const result = await database.query([
   *   'SELECT * FROM users WHERE id = ?',
   *   'UPDATE users SET last_login = NOW() WHERE id = ?'
   * ], { debug: true });
   */
  query: (
    statements: string[],
    options?: AzionClientOptions,
  ) => Promise<AzionDatabaseResponse<AzionDatabaseQueryResponse>>;

  /**
   * Executes one or more SQL statements on the database.
   *
   * @param {string[]} statements - An array of SQL statements to execute.
   * @param {AzionClientOptions} [options] - Additional options for the execution.
   * @returns {Promise<AzionDatabaseResponse<AzionDatabaseQueryResponse>} A promise that resolves to the query response or error if the operation faile>d.
   *
   * @example
   * const result = await database.execute([
   *   'INSERT INTO users (name, email) VALUES (?, ?)',
   *   'DELETE FROM old_users WHERE last_login < ?'
   * ], { force: true });
   */
  execute: (
    statements: string[],
    options?: AzionClientOptions,
  ) => Promise<AzionDatabaseResponse<AzionDatabaseQueryResponse>>;

  /**
   * Retrieves a list of tables in the database.
   *
   * @param {AzionClientOptions} [options] - Additional options for listing tables.
   * @returns {Promise<AzionDatabaseResponse<AzionDatabaseQueryResponse>} A promise that resolves to the query response or error if the operation faile>d.
   *
   * @example
   * const { data: tables, error } = await database.getTables({ debug: true });
   */
  getTables: (options?: AzionClientOptions) => Promise<AzionDatabaseResponse<AzionDatabaseQueryResponse>>;
};

export type QueryResult = {
  columns?: string[];
  rows?: (string | number)[][];
  statement?: string;
  error?: string;
};

export type ToObjectQueryExecution = {
  data: Array<{
    statement?: string;
    rows: Record<string, string | number>[];
  }>;
};

export type AzionDatabaseQueryResponse = {
  state: 'pending' | 'failed' | 'executed' | 'executed-runtime';
  results?: QueryResult[];
  toObject: () => JsonObjectQueryExecutionResponse | null;
};

export type AzionDatabaseResponse<T> = {
  data?: T;
  error?: AzionSQLError;
};

export type AzionQueryParams =
  | string
  | number
  | boolean
  | null
  | {
      type: string;
      value: string | number | boolean | null;
    };

export type AzionQueryExecutionParams = {
  statements: string[];
  params: Array<AzionQueryParams | Record<string, AzionQueryParams>>;
};

export type AzionDatabaseExecutionResponse = AzionDatabaseQueryResponse;

export type AzionDatabaseCollectionOptions = {
  ordering?: string;
  page?: number;
  page_size?: number;
  search?: string;
};

export type AzionDatabaseCollections = {
  databases?: AzionDatabase[];
  count?: number;
};

export type AzionDatabaseDeleteResponse = {
  state: 'pending' | 'failed' | 'executed';
};

export interface AzionSQLClient {
  /**
   * Creates a new database with the specified name.
   *
   * @param {string} name - Name of the database to create.
   * @returns {Promise<AzionDatabaseResponse>} Object confirming creation of the database or an error message.
   *
   * @example
   * const { data, error } = await sqlClient.createDatabase('my-db');
   * if (data) {
   *  console.log(`Database ${data.name} created successfully`);
   * } else {
   * console.error(`Failed to create database: ${error.message}`);
   *
   */
  createDatabase: (name: string) => Promise<AzionDatabaseResponse<AzionDatabase>>;
  /**
   * Deletes a database by its ID.
   *
   * @param {number} id - ID of the database to delete.
   * @returns {Promise<AzionDatabaseResponse<AzionDatabaseDeleteResponse>>} Object confirming deletion or error if the operation failed.
   *
   * @example
   * const { data, error } = await sqlClient.deleteDatabase(123);
   * if (data) {
   * console.log(`Database ${data.name} (ID: ${data.id}) deleted successfully`);
   * } else {
   * console.error(`Failed to delete database: ${error.message}`);
   *
   */
  deleteDatabase: (id: number) => Promise<AzionDatabaseResponse<AzionDatabaseDeleteResponse>>;
  /**
   * Retrieves a database by its Name.
   *
   * @param {string} name - Name of the database to retrieve.
   * @returns {Promise<AzionDatabaseResponse<AzionDatabase>>} The retrieved database object or null if not found.
   *
   * @example
   * const { data, error } = await sqlClient.getDatabase('my-db');
   * if (data) {
   *  console.log(`Retrieved database ${data.name} (ID: ${data.id})`);
   * } else {
   * console.error(`Failed to retrieve database: ${error.message}`);
   *
   */
  getDatabase: (name: string) => Promise<AzionDatabaseResponse<AzionDatabase>>;

  /**
   * Retrieves a list of databases with optional filtering and pagination.
   *
   * @param {AzionDatabaseCollectionOptions} [params] - Optional parameters for filtering and pagination.
   * @param {string} [params.ordering] - Field to order the results by.
   * @param {number} [params.page] - Page number for pagination.
   * @param {number} [params.page_size] - Number of items per page.
   * @param {string} [params.search] - Search term to filter databases.
   * @returns {Promise<AzionDatabaseResponse>} Array of database objects or error message.
   *
   * @example
   * const { data, error } = await sqlClient.getDatabases({ page: 1, page_size: 10, search: 'test' });
   * if (data) {
   * console.log(`Retrieved ${data.length} databases`);
   * } else {
   * console.error(`Failed to retrieve databases: ${error.message}`);
   *
   */
  getDatabases: (params?: {
    ordering?: string;
    page?: number;
    page_size?: number;
    search?: string;
  }) => Promise<AzionDatabaseResponse<AzionDatabaseCollections>>;
}

/**
 * Defines the execution environment for the Azion client.
 *
 * @type {('development' | 'staging' | 'production')}
 *
 * @property {'development'} development - Development environment for local testing
 * @property {'staging'} staging - Staging/testing environment
 * @property {'production'} production - Production environment
 *
 * @example
 * const environment: AzionEnvironment = 'development';
 *
 * @example
 * const clientOptions = {
 *   env: 'production' as AzionEnvironment
 * };
 */
export type AzionEnvironment = 'development' | 'staging' | 'production';

/**
 * Options for configuring the Azion client behavior.
 *
 * @property {boolean} [debug] - Enable debug mode for detailed logging.
 * @property {boolean} [force] - Force the operation even if it might be destructive.
 * @property {AzionEnvironment} [env] - Environment to use (dev, stage, prod).
 * @property {boolean} [external] - Force using external REST API instead of built-in runtime API.
 *
 * @example
 * const options: AzionClientOptions = {
 *   debug: true,
 *   force: false,
 *   env: 'dev',
 *   external: true
 * };
 */
export type AzionClientOptions = {
  /** Enable debug mode for detailed logging */
  debug?: boolean;
  /** Force the operation even if it might be destructive */
  force?: boolean;
  /** Environment to use (dev, stage, prod) */
  env?: AzionEnvironment;
  /** Force using external REST API instead of built-in runtime API */
  external?: boolean;
};

/**
 * Function type for creating an Azion SQL Client.
 *
 * @param {Object} [config] - Configuration options for the SQL client.
 * @param {string} [config.token] - Authentication token for Azion API. If not provided,
 * the client will attempt to use the AZION_TOKEN environment variable.
 * @param {AzionClientOptions} [config.options] - Additional client options.
 *
 * @returns {AzionSQLClient} An instance of the Azion SQL Client.
 *
 * @example
 * // Create an SQL client with a token and debug mode enabled
 * const sqlClient = createAzionSQLClient({
 *   token: 'your-api-token',
 *   options: { debug: true }
 * });
 *
 * @example
 * // Create an SQL client using environment variables for token
 * const sqlClient = createAzionSQLClient();
 */
export type CreateAzionSQLClient = (
  config?: Partial<{ token?: string; options?: AzionClientOptions }>,
) => AzionSQLClient;
