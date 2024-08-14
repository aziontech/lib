import { deleteEdgeDatabase, getEdgeDatabases, postEdgeDatabase, postQueryEdgeDatabase } from './services/api/index';
import { ApiDatabaseResponse } from './services/api/types';
import { getAzionSql, InternalAzionSql } from './services/runtime/index';
import type {
  CreateSQLClient,
  Database,
  DatabaseCollectionOptions,
  DeletedDatabase,
  QueryParams,
  QueryResponse,
  SQLClient,
} from './types';
import { createInternalOrExternalMethod } from './utils/index';
import { toObjectQueryExecutionResponse } from './utils/mappers/to-object';

const resolveToken = (token?: string) => token ?? process.env.AZION_TOKEN ?? '';
const resolveDebug = (debug?: boolean) => debug ?? !!process.env.AZION_DEBUG;

/**
 * Creates a new database.
 * @param token Token to authenticate with the API.
 * @param name Name of the database to create.
 * @param debug Debug mode for detailed logging.
 * @returns The created database object or null if creation failed.
 */
const createDatabaseMethod = async (token: string, name: string, debug: boolean = false): Promise<Database | null> => {
  const apiResponse = await postEdgeDatabase(resolveToken(token), name, resolveDebug(debug));
  if (apiResponse) {
    const { data } = apiResponse;
    return {
      ...data,
      query: (statements: string[]) => queryDatabaseMethod(token, data.name, statements, undefined, debug),
      execute: (statements: string[]) => queryDatabaseMethod(token, data.name, statements, undefined, debug),
    };
  }
  return null;
};

/**
 * Deletes a database by its ID.
 * @param token Token to authenticate with the API.
 * @param id ID of the database to delete.
 * @param debug Debug mode for detailed logging.
 * @returns Object confirming deletion or null if deletion failed.
 */
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

/**
 * Get a database by its name.
 * @param token Token to authenticate with the API.
 * @param name Name of the database to retrieve.
 * @param debug Debug mode for detailed logging.
 * @returns The retrieved database object or null if not found.
 */
const getDatabaseMethod = async (token: string, name: string, debug: boolean = false): Promise<Database | null> => {
  const databaseResponse = await getEdgeDatabases(resolveToken(token), { search: name }, resolveDebug(debug));
  if (!databaseResponse?.results || databaseResponse?.results?.length === 0) {
    return null;
  }
  const databaseResult = databaseResponse?.results[0];
  if (!databaseResult || databaseResult.id === undefined) {
    return null;
  }
  return {
    ...databaseResult,
    query: (statements: string[]) => queryDatabaseMethod(token, name, statements, undefined, debug),
    execute: (statements: string[]) => queryDatabaseMethod(token, name, statements, undefined, debug),
  };
};

/**
 * Retrieves a list of databases with optional filtering and pagination.
 * @param token Token to authenticate with the API.
 * @param params Optional parameters for filtering and pagination.
 * @param debug Debug mode for detailed logging.
 * @returns Array of database objects or null if retrieval failed.
 */
const getDatabasesMethod = async (
  token: string,
  params?: DatabaseCollectionOptions,
  debug: boolean = false,
): Promise<Database[] | null> => {
  const apiResponse = await getEdgeDatabases(resolveToken(token), params, resolveDebug(debug));
  if (apiResponse) {
    return apiResponse.results.map((db: ApiDatabaseResponse) => ({
      ...db,
      query: (statements: string[]): Promise<QueryResponse | null> =>
        queryDatabaseMethod(token, db.name, statements, undefined, debug),
      execute: (statements: string[]): Promise<QueryResponse | null> =>
        queryDatabaseMethod(token, db.name, statements, undefined, debug),
    }));
  }
  return null;
};

/**
 * Executes a query on a database.
 * Receive createInternalOrExternalMethod as a parameter to create a method that can be used internally or externally.
 */
const queryDatabaseMethod = createInternalOrExternalMethod({
  validation: getAzionSql(),

  internal: async (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    token: string,
    name: string,
    statements: string[],
    params?: QueryParams[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    debug: boolean = false,
  ): Promise<QueryResponse | null> => {
    const internalSql = new InternalAzionSql();
    const internalResult = await internalSql.query(name, statements, params);
    const resultStatements: QueryResponse = {
      state: 'pending',
      data: [],
    };
    const data = await internalSql.mapperQuery(internalResult);
    if (data && data.length > 0) {
      resultStatements.state = 'executed';
      resultStatements.data = data;
    }
    return {
      ...resultStatements,
      toObject: () => toObjectQueryExecutionResponse(resultStatements),
    };
  },
  external: async (
    token: string,
    name: string,
    statements: string[],
    params?: QueryParams[],
    debug: boolean = false,
  ): Promise<QueryResponse | null> => {
    const databaseResponse = await getEdgeDatabases(resolveToken(token), { search: name }, resolveDebug(debug));
    if (!databaseResponse?.results || databaseResponse?.results?.length === 0) {
      return null;
    }
    const database = databaseResponse?.results[0];
    if (!database || database?.id === undefined) {
      return null;
    }
    const apiResponse = await postQueryEdgeDatabase(resolveToken(token), database.id, statements, resolveDebug(debug));
    if (apiResponse) {
      const resultStatements: QueryResponse = {
        state: `${apiResponse.state}`,
        data: apiResponse.data.map((result, index) => {
          let info;
          if (result?.results?.query_duration_ms) {
            info = {
              durationMs: result?.results?.query_duration_ms,
              rowsRead: result?.results?.rows_read,
              rowsWritten: result?.results?.rows_written,
            };
          }
          return {
            statement: statements[index]?.split(' ')[0], // TODO: This can improve
            columns: result?.results?.columns,
            rows: result?.results?.rows,
            info,
          };
        }),
        toObject: () => toObjectQueryExecutionResponse(resultStatements),
      };
      return resultStatements;
    }
    return null;
  },
});

const executeDatabaseMethod = async (
  token: string,
  name: string,
  statements: string[],
  params?: QueryParams[],
  debug: boolean = false,
): Promise<null> => {
  await queryDatabaseMethod(token, name, statements, params, debug);
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
 * Retrieves a database by its Name.
 *
 * @param {string} name - Name of the database to retrieve.
 * @param {boolean} [debug=false] - Enable debug mode for detailed logging.
 * @returns {Promise<Database | null>} The retrieved database object or null if not found.
 *
 * @example
 * const database = await getDatabase('my-db', true);
 * if (database) {
 *   console.log(`Retrieved database: ${database.id}`);
 * } else {
 *   console.error('Database not found');
 * }
 */
const getDatabaseWrapper = async (name: string, debug: boolean = false): Promise<Database | null> =>
  getDatabaseMethod(resolveToken(), name, resolveDebug(debug));

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
 * Use Query to execute a query on a database.
 * @param name Name of the database to query.
 * @param statements Array of SQL statements to execute.
 * @param params Optional parameters for the query.
 * @param debug Debug mode for detailed logging.
 * @returns The query response object or null if the query failed.
 * @example
 * const queryResult = await useQuery('my-db', ['SELECT * FROM users']);
 * if (queryResult) {
 *  console.log(`Query executed with ${queryResult.data.length} statements`);
 *  const resultObject = queryResult.toObject();
 *  console.log(`Result: ${resultObject}`);
 * } else {
 * console.error('Failed to execute query');
 * }
 */
const useQuery = (
  name: string,
  statements: string[],
  params?: QueryParams[],
  debug: boolean = false,
): Promise<QueryResponse | null> => queryDatabaseMethod(resolveToken(), name, statements, params, resolveDebug(debug));

/**
 * Use Execute to execute a query on a database.
 * @param name Name of the database to query.
 * @param statements Array of SQL statements to execute.
 * @param params Optional parameters for the query.
 * @param debug Debug mode for detailed logging.
 * @returns null if the query failed.
 * @example
 * await useExecute('my-db', ['INSERT INTO users (name) VALUES ("John")']);
 * console.log('Query executed successfully');
 */
const useExecute = (
  name: string,
  statements: string[],
  params?: QueryParams[],
  debug: boolean = false,
): Promise<null> => executeDatabaseMethod(resolveToken(), name, statements, params, resolveDebug(debug));

/**
 * Creates an SQL client with methods to interact with Azion Edge SQL databases.
 *
 * @param {Partial<{ token: string; debug: boolean }>} [config] - Configuration options for the SQL client.
 * @returns {SQLClient} An object with methods to interact with SQL databases.
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
const client: CreateSQLClient = (config?: Partial<{ token: string; debug: boolean }>): SQLClient => {
  const tokenValue = resolveToken(config?.token);
  const debugValue = resolveDebug(config?.debug);

  const client: SQLClient = {
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
     * Retrieves a database by its Name.
     *
     * @param {string} name - Name of the database to retrieve.
     * @returns {Promise<Database | null>} The retrieved database object or null if not found.
     *
     * @example
     * const database = await sqlClient.getDatabase('my-db');
     * if (database) {
     *   console.log(`Retrieved database: ${database.name}`);
     * } else {
     *   console.error('Database not found');
     * }
     */
    getDatabase: (name: string): Promise<Database | null> => getDatabaseMethod(tokenValue, name, debugValue),

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
  getDatabaseWrapper as getDatabase,
  getDatabasesWrapper as getDatabases,
  useExecute,
  useQuery,
};

export default client;
