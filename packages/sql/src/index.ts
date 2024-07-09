import {
  deleteEdgeDatabase,
  getEdgeDatabaseById,
  getEdgeDatabases,
  postEdgeDatabase,
  postQueryEdgeDatabase,
} from './services';
import {
  ApiDatabaseResponse,
  CreateSQLInternalClient,
  Database,
  DatabaseCollectionOptions,
  DeletedDatabase,
  Query,
  SQLInternalClient,
} from './types';

const resolveToken = (token?: string) => token ?? process.env.AZION_TOKEN ?? '';
const resolveDebug = (debug: boolean = false) => debug || !!process.env.AZION_DEBUG;

const createDatabaseMethod = async (token: string, name: string, debug: boolean = false): Promise<Database | null> => {
  const apiResponse = await postEdgeDatabase(resolveToken(token), name, resolveDebug(debug));
  if (apiResponse) {
    const { data } = apiResponse;
    return {
      ...data,
      query: (statements: string[]) => queryDatabaseMethod(token, data.id, statements, debug),
      execute: (statements: string[]) => queryDatabaseMethod(token, data.id, statements, debug),
    };
  }
  return null;
};

const deleteDatabaseMethod = async (
  token: string,
  id: number,
  debug: boolean = false,
): Promise<DeletedDatabase | null> => {
  const apiResponse = await deleteEdgeDatabase(resolveToken(token), id, resolveDebug(debug));
  if (apiResponse) {
    const { data, state } = apiResponse;
    return {
      id,
      data,
      state,
    };
  }
  return null;
};

const getDatabaseByIdMethod = async (token: string, id: number, debug: boolean = false): Promise<Database | null> => {
  const apiResponse = await getEdgeDatabaseById(resolveToken(token), id, resolveDebug(debug));
  if (apiResponse) {
    const { data } = apiResponse;
    return {
      ...data,
      query: (statements: string[]) => queryDatabaseMethod(token, id, statements, debug),
      execute: (statements: string[]) => queryDatabaseMethod(token, id, statements, debug),
    };
  }
  return null;
};

const getDatabasesMethod = async (
  token: string,
  params?: DatabaseCollectionOptions,
  debug: boolean = false,
): Promise<Database[] | null> => {
  const apiResponse = await getEdgeDatabases(resolveToken(token), params, resolveDebug(debug));
  if (apiResponse) {
    return apiResponse.results.map((db: ApiDatabaseResponse) => ({
      ...db,
      query: (statements: string[]): Promise<Query | null> => queryDatabaseMethod(token, db.id, statements, debug),
      execute: (statements: string[]): Promise<Query | null> => queryDatabaseMethod(token, db.id, statements, debug),
    }));
  }
  return null;
};

const queryDatabaseMethod = async (
  token: string,
  id: number,
  statements: string[],
  debug: boolean = false,
): Promise<Query | null> => {
  const apiResponse = await postQueryEdgeDatabase(resolveToken(token), id, statements, resolveDebug(debug));
  if (apiResponse) {
    return {
      state: apiResponse.state,
      columns: apiResponse.data[0].results.columns,
      rows: apiResponse.data[0].results.rows,
    };
  }
  return null;
};

/**
 * Creates a new database.
 *
 * @param {string} name - Name of the database to create.
 * @param {boolean} [debug=false] - Enable debug mode for detailed logging.
 * @returns {Promise<Database | null>} The created database object or null if creation failed.
 *
 * @example
 * const database = await createDatabase('my-new-database', true);
 * if (database) {
 *   console.log(`Database created with ID: ${database.id}`);
 * } else {
 *   console.error('Failed to create database');
 * }
 */
const createDatabaseWrapper = async (name: string, debug: boolean = false): Promise<Database | null> =>
  await createDatabaseMethod(resolveToken(), name, resolveDebug(debug));

/**
 * Deletes a database by its ID.
 *
 * @param {number} id - ID of the database to delete.
 * @param {boolean} [debug=false] - Enable debug mode for detailed logging.
 * @returns {Promise<DeletedDatabase | null>} Object confirming deletion or null if deletion failed.
 *
 * @example
 * const result = await deleteDatabase(123, true);
 * if (result) {
 *   console.log(`Database ${result.id} deleted successfully`);
 * } else {
 *   console.error('Failed to delete database');
 * }
 */
const deleteDatabaseWrapper = (id: number, debug: boolean = false): Promise<DeletedDatabase | null> =>
  deleteDatabaseMethod(resolveToken(), id, resolveDebug(debug));

/**
 * Retrieves a database by its ID.
 *
 * @param {number} id - ID of the database to retrieve.
 * @param {boolean} [debug=false] - Enable debug mode for detailed logging.
 * @returns {Promise<Database | null>} The retrieved database object or null if not found.
 *
 * @example
 * const database = await getDatabaseById(123, true);
 * if (database) {
 *   console.log(`Retrieved database: ${database.name}`);
 * } else {
 *   console.error('Database not found');
 * }
 */
const getDatabaseByIdWrapper = async (id: number, debug: boolean = false): Promise<Database | null> =>
  getDatabaseByIdMethod(resolveToken(), id, resolveDebug(debug));

/**
 * Retrieves a list of databases with optional filtering and pagination.
 *
 * @param {Partial<DatabaseCollectionOptions>} [params] - Optional parameters for filtering and pagination.
 * @param {boolean} [debug=false] - Enable debug mode for detailed logging.
 * @returns {Promise<Database[] | null>} Array of database objects or null if retrieval failed.
 *
 * @example
 * const databases = await getDatabases({ page: 1, page_size: 10 }, true);
 * if (databases) {
 *   console.log(`Retrieved ${databases.length} databases`);
 * } else {
 *   console.error('Failed to retrieve databases');
 * }
 */
const getDatabasesWrapper = (
  params?: Partial<DatabaseCollectionOptions>,
  debug: boolean = false,
): Promise<Database[] | null> => getDatabasesMethod(resolveToken(), params, resolveDebug(debug));

/**
 * Executes a query on a specific database.
 *
 * @param {number} id - ID of the database to query.
 * @param {string[]} statements - Array of SQL statements to execute.
 * @param {boolean} [debug=false] - Enable debug mode for detailed logging.
 * @returns {Promise<Query | null>} Query result object or null if execution failed.
 *
 * @example
 * const result = await queryDatabase(123, ['SELECT * FROM users'], true);
 * if (result) {
 *   console.log(`Query executed. Rows returned: ${result.rows.length}`);
 * } else {
 *   console.error('Query execution failed');
 * }
 */
const queryDatabaseWrapper = (id: number, statements: string[], debug: boolean = false): Promise<Query | null> =>
  queryDatabaseMethod(resolveToken(), id, statements, resolveDebug(debug));

/**
 * Creates an SQL client with methods to interact with Azion Edge SQL databases.
 *
 * @param {Partial<{ token: string; debug: boolean }>} [config] - Configuration options for the SQL client.
 * @returns {SQLInternalClient} An object with methods to interact with SQL databases.
 *
 * @example
 * const sqlClient = createClient({ token: 'your-api-token', debug: true });
 *
 * // Create a new database
 * const newDatabase = await sqlClient.createDatabase('my-new-db');
 *
 * // Get all databases
 * const allDatabases = await sqlClient.getDatabases();
 *
 * // Query a database
 * const queryResult = await newDatabase.query(['SELECT * FROM users']);
 */
const client: CreateSQLInternalClient = (config?: Partial<{ token: string; debug: boolean }>) => {
  const tokenValue = resolveToken(config?.token);
  const debugValue = resolveDebug(config?.debug);

  const client: SQLInternalClient = {
    /**
     * Creates a new database.
     *
     * @param {string} name - Name of the new database.
     * @returns {Promise<Database | null>} The created database object or null if creation failed.
     *
     * @example
     * const newDatabase = await sqlClient.createDatabase('my-new-db');
     * if (newDatabase) {
     *   console.log(`Database created with ID: ${newDatabase.id}`);
     * } else {
     *   console.error('Failed to create database');
     * }
     */
    createDatabase: (name: string): Promise<Database | null> => createDatabaseMethod(tokenValue, name, debugValue),

    /**
     * Deletes a database by its ID.
     *
     * @param {number} id - ID of the database to delete.
     * @returns {Promise<DeletedDatabase | null>} Object confirming deletion or null if deletion failed.
     *
     * @example
     * const result = await sqlClient.deleteDatabase(123);
     * if (result) {
     *   console.log(`Database ${result.id} deleted successfully`);
     * } else {
     *   console.error('Failed to delete database');
     * }
     */
    deleteDatabase: (id: number): Promise<DeletedDatabase | null> => deleteDatabaseMethod(tokenValue, id, debugValue),

    /**
     * Retrieves a database by its ID.
     *
     * @param {number} id - ID of the database to retrieve.
     * @returns {Promise<Database | null>} The retrieved database object or null if not found.
     *
     * @example
     * const database = await sqlClient.getDatabaseById(123);
     * if (database) {
     *   console.log(`Retrieved database: ${database.name}`);
     * } else {
     *   console.error('Database not found');
     * }
     */
    getDatabaseById: (id: number): Promise<Database | null> => getDatabaseByIdMethod(tokenValue, id, debugValue),

    /**
     * Retrieves a list of databases with optional filtering and pagination.
     *
     * @param {DatabaseCollectionOptions} [params] - Optional parameters for filtering and pagination.
     * @param {string} [params.ordering] - Field to order the results by.
     * @param {number} [params.page] - Page number for pagination.
     * @param {number} [params.page_size] - Number of items per page.
     * @param {string} [params.search] - Search term to filter databases.
     * @returns {Promise<Database[] | null>} Array of database objects or null if retrieval failed.
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
    getDatabases: (params?: DatabaseCollectionOptions): Promise<Database[] | null> =>
      getDatabasesMethod(tokenValue, params, debugValue),
  } as const;

  return client;
};
export {
  client as createClient,
  createDatabaseWrapper as createDatabase,
  deleteDatabaseWrapper as deleteDatabase,
  getDatabaseByIdWrapper as getDatabaseById,
  getDatabasesWrapper as getDatabases,
  queryDatabaseWrapper as useExecute,
  queryDatabaseWrapper as useQuery,
};

export default client;
