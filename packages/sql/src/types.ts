import { JsonObjectQueryExecutionResponse } from './utils/mappers/to-object';

/* eslint-disable no-unused-vars */
export interface AzionDatabase {
  id: number;
  name: string;
  client_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  /**
   * Executes a query or multiple queries on the database.
   *
   * @param {string[]} statements - An array of SQL statements to execute.
   * @param {AzionClientOptions} [options] - Additional options for the query execution.
   * @returns {Promise<AzionQueryResponse | null>} A promise that resolves to the query response or null if the execution failed.
   *
   * @example
   * const result = await database.query([
   *   'SELECT * FROM users WHERE id = ?',
   *   'UPDATE users SET last_login = NOW() WHERE id = ?'
   * ], { debug: true });
   */
  query?: (statements: string[], options?: AzionClientOptions) => Promise<AzionQueryResponse | null>;

  /**
   * Executes one or more SQL statements on the database.
   *
   * @param {string[]} statements - An array of SQL statements to execute.
   * @param {AzionClientOptions} [options] - Additional options for the execution.
   * @returns {Promise<AzionQueryResponse | null>} A promise that resolves to the execution response or null if the execution failed.
   *
   * @example
   * const result = await database.execute([
   *   'INSERT INTO users (name, email) VALUES (?, ?)',
   *   'DELETE FROM old_users WHERE last_login < ?'
   * ], { force: true });
   */
  execute?: (statements: string[], options?: AzionClientOptions) => Promise<AzionQueryResponse | null>;

  /**
   * Retrieves a list of tables in the database.
   *
   * @param {AzionClientOptions} [options] - Additional options for listing tables.
   * @returns {Promise<AzionQueryResponse | null>} A promise that resolves to the list of tables or null if the operation failed.
   *
   * @example
   * const tables = await database.listTables({ debug: true });
   */
  listTables?: (options?: AzionClientOptions) => Promise<AzionQueryResponse | null>;
}

export interface AzionDeletedDatabase {
  id: number;
  state: 'executed' | 'pending';
  data: null;
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

export type AzionQueryResponse = {
  state: 'executed' | 'pending' | 'executed-runtime';
  data: QueryResult[] | NonSelectQueryResult;
  toObject?: () => JsonObjectQueryExecutionResponse;
};

export type AzionDatabaseCollectionOptions = {
  ordering?: string;
  page?: number;
  page_size?: number;
  search?: string;
};

export interface AzionSQLClient {
  /**
   * Deletes a database by its ID.
   *
   * @param {number} id - ID of the database to delete.
   * @returns {Promise<AzionDeletedDatabase | null>} Object confirming deletion or null if deletion failed.
   *
   * @example
   * const result = await sqlClient.deleteDatabase(123);
   * if (result) {
   *   console.log(`Database ${result.id} deleted successfully`);
   * } else {
   *   console.error('Failed to delete database');
   * }
   */
  createDatabase: (name: string) => Promise<AzionDatabase | null>;
  /**
   * Deletes a database by its ID.
   *
   * @param {number} id - ID of the database to delete.
   * @returns {Promise<AzionDeletedDatabase | null>} Object confirming deletion or null if deletion failed.
   *
   * @example
   * const result = await sqlClient.deleteDatabase(123);
   * if (result) {
   *   console.log(`Database ${result.id} deleted successfully`);
   * } else {
   *   console.error('Failed to delete database');
   * }
   */
  deleteDatabase: (id: number) => Promise<AzionDeletedDatabase | null>;
  /**
   * Retrieves a database by its Name.
   *
   * @param {string} name - Name of the database to retrieve.
   * @returns {Promise<AzionDatabase | null>} The retrieved database object or null if not found.
   *
   * @example
   * const database = await sqlClient.getDatabase('my-db');
   * if (database) {
   *   console.log(`Retrieved database: ${database.name}`);
   * } else {
   *   console.error('Database not found');
   * }
   */
  getDatabase?: (name: string) => Promise<AzionDatabase | null>;

  /**
   * Retrieves a list of databases with optional filtering and pagination.
   *
   * @param {AzionDatabaseCollectionOptions} [params] - Optional parameters for filtering and pagination.
   * @param {string} [params.ordering] - Field to order the results by.
   * @param {number} [params.page] - Page number for pagination.
   * @param {number} [params.page_size] - Number of items per page.
   * @param {string} [params.search] - Search term to filter databases.
   * @returns {Promise<AzionDatabase[] | null>} Array of database objects or null if retrieval failed.
   *
   * @example
   * const databases = await sqlClient.getDatabases({ page: 1, page_size: 10, search: 'test' });
   * if (databases) {
   *   console.log(`Retrieved ${databases.length} databases`);
   *   databases.forEach(db => console.log(`- ${db.name} (ID: ${db.id})`));
   * } else {
   *   console.error('Failed to retrieve databases');
   * }
   */
  getDatabases: (params?: {
    ordering?: string;
    page?: number;
    page_size?: number;
    search?: string;
  }) => Promise<AzionDatabase[] | null>;
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
