import { JsonObjectQueryExecutionResponse } from './utils/mappers/to-object';

export type AzionDatabaseResponse = {
  data?: AzionDatabase | AzionDatabase[] | Pick<AzionDatabase, 'id'>;
  error?: {
    message: string;
    operation: string;
  };
};

/* eslint-disable no-unused-vars */
export interface AzionDatabase {
  id: number;
  name: string;
  clientId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  /**
   * Executes a query or multiple queries on the database.
   *
   * @param {string[]} statements - An array of SQL statements to execute.
   * @param {AzionClientOptions} [options] - Additional options for the query execution.
   * @returns {Promise<AzionDatabaseQueryResponse>} A promise that resolves to the query response or error if the operation failed.
   *
   * @example
   * const result = await database.query([
   *   'SELECT * FROM users WHERE id = ?',
   *   'UPDATE users SET last_login = NOW() WHERE id = ?'
   * ], { debug: true });
   */
  query?: (statements: string[], options?: AzionClientOptions) => Promise<AzionDatabaseQueryResponse>;

  /**
   * Executes one or more SQL statements on the database.
   *
   * @param {string[]} statements - An array of SQL statements to execute.
   * @param {AzionClientOptions} [options] - Additional options for the execution.
   * @returns {Promise<AzionDatabaseQueryResponse>} A promise that resolves to the query response or error if the operation failed.
   *
   * @example
   * const result = await database.execute([
   *   'INSERT INTO users (name, email) VALUES (?, ?)',
   *   'DELETE FROM old_users WHERE last_login < ?'
   * ], { force: true });
   */
  execute?: (statements: string[], options?: AzionClientOptions) => Promise<AzionDatabaseQueryResponse>;

  /**
   * Retrieves a list of tables in the database.
   *
   * @param {AzionClientOptions} [options] - Additional options for listing tables.
   * @returns {Promise<AzionDatabaseQueryResponse>} A promise that resolves to the query response or error if the operation failed.
   *
   * @example
   * const tables = await database.listTables({ debug: true });
   */
  listTables?: (options?: AzionClientOptions) => Promise<AzionDatabaseQueryResponse>;
}

export type AzionQueryParams = string | number | boolean | null;

export type AzionQueryExecutionParams = {
  statements: string[];
  params?: (AzionQueryParams | Record<string, AzionQueryParams>)[];
};

export type AzionQueryExecutionInfo = {
  rowsRead?: number;
  rowsWritten?: number;
  durationMs?: number;
};

export type NonSelectQueryResult = {
  info?: AzionQueryExecutionInfo;
};

export type QueryResult = {
  columns?: string[];
  rows?: (number | string)[][];
  statement?: string;
  info?: AzionQueryExecutionInfo;
};

export type AzionDatabaseQueryResponse = {
  state: 'executed' | 'pending' | 'executed-runtime' | 'failed';
  data?: QueryResult[] | NonSelectQueryResult | undefined;
  toObject?: () => JsonObjectQueryExecutionResponse;
  error?: {
    message: string;
    operation: string;
  };
};

export type AzionDatabaseExecutionResponse = AzionDatabaseQueryResponse;

export type AzionDatabaseCollectionOptions = {
  ordering?: string;
  page?: number;
  page_size?: number;
  search?: string;
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
  createDatabase: (name: string) => Promise<AzionDatabaseResponse>;
  /**
   * Deletes a database by its ID.
   *
   * @param {number} id - ID of the database to delete.
   * @returns {Promise<AzionDatabaseResponse>} Object confirming deletion or error if the operation failed.
   *
   * @example
   * const { data, error } = await sqlClient.deleteDatabase(123);
   * if (data) {
   * console.log(`Database ${data.name} (ID: ${data.id}) deleted successfully`);
   * } else {
   * console.error(`Failed to delete database: ${error.message}`);
   *
   */
  deleteDatabase: (id: number) => Promise<AzionDatabaseResponse>;
  /**
   * Retrieves a database by its Name.
   *
   * @param {string} name - Name of the database to retrieve.
   * @returns {Promise<AzionDatabaseResponse>} The retrieved database object or null if not found.
   *
   * @example
   * const { data, error } = await sqlClient.getDatabase('my-db');
   * if (data) {
   *  console.log(`Retrieved database ${data.name} (ID: ${data.id})`);
   * } else {
   * console.error(`Failed to retrieve database: ${error.message}`);
   *
   */
  getDatabase?: (name: string) => Promise<AzionDatabaseResponse>;

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
  }) => Promise<AzionDatabaseResponse>;
}

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
