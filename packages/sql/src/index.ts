import { deleteEdgeDatabase, getEdgeDatabases, postEdgeDatabase } from './services/api/index';
import { ApiDatabaseResponse } from './services/api/types';
import { apiQuery, runtimeQuery } from './services/index';
import { getAzionSql } from './services/runtime/index';
import type {
  AzionClientOptions,
  AzionDatabase,
  AzionDatabaseCollectionOptions,
  AzionDeletedDatabase,
  AzionQueryResponse,
  AzionSQLClient,
  CreateAzionSQLClient,
} from './types';

const envDebugFlag = process.env.AZION_DEBUG && process.env.AZION_DEBUG === 'true';
const resolveToken = (token?: string) => token ?? process.env.AZION_TOKEN ?? '';
const resolveDebug = (debug?: boolean) => debug ?? !!envDebugFlag;

/**
 * Creates a new database.
 * @param token Token to authenticate with the API.
 * @param name Name of the database to create.
 * @param debug Debug mode for detailed logging.
 * @returns The created database object or null if creation failed.
 */
const createDatabaseMethod = async (
  token: string,
  name: string,
  options?: AzionClientOptions,
): Promise<AzionDatabase | null> => {
  const apiResponse = await postEdgeDatabase(resolveToken(token), name, resolveDebug(options?.debug));
  if (apiResponse) {
    const { data } = apiResponse;
    return {
      ...data,
      query: (statements: string[]) =>
        queryDatabaseMethod(resolveToken(token), data.name, statements, {
          ...options,
          debug: resolveDebug(options?.debug),
        }),
      execute: (statements: string[], options?: AzionClientOptions) =>
        executeDatabaseMethod(resolveToken(token), data.name, statements, {
          ...options,
          debug: resolveDebug(options?.debug),
        }),
      listTables: (options?: AzionClientOptions) =>
        listTablesWrapper(data.name, {
          ...options,
          debug: resolveDebug(options?.debug),
        }),
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
  options?: AzionClientOptions,
): Promise<AzionDeletedDatabase | null> => {
  const apiResponse = await deleteEdgeDatabase(resolveToken(token), id, resolveDebug(options?.debug));
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
const getDatabaseMethod = async (
  token: string,
  name: string,
  options?: AzionClientOptions,
): Promise<AzionDatabase | null> => {
  if (!name || name === '') {
    throw new Error('Database name is required');
  }
  const databaseResponse = await getEdgeDatabases(resolveToken(token), { search: name }, resolveDebug(options?.debug));
  if (!databaseResponse?.results || databaseResponse?.results?.length === 0) {
    throw new Error(`Database with name '${name}' not found`);
  }
  const databaseResult = databaseResponse?.results[0];
  if (!databaseResult || databaseResult.id === undefined || databaseResult.name !== name) {
    throw new Error(`Database with name '${name}' not found`);
  }
  return {
    ...databaseResult,
    query: (statements: string[], options?: AzionClientOptions) =>
      queryDatabaseMethod(resolveToken(token), databaseResult.name, statements, {
        ...options,
        debug: resolveDebug(options?.debug),
      }),
    execute: (statements: string[], options?: AzionClientOptions) =>
      executeDatabaseMethod(resolveToken(token), databaseResult.name, statements, {
        ...options,
        debug: resolveDebug(options?.debug),
      }),
    listTables: (options?: AzionClientOptions) =>
      listTablesWrapper(databaseResult.name, {
        ...options,
        debug: resolveDebug(options?.debug),
      }),
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
  params?: AzionDatabaseCollectionOptions,
  options?: AzionClientOptions,
): Promise<AzionDatabase[] | null> => {
  const apiResponse = await getEdgeDatabases(resolveToken(token), params, resolveDebug(options?.debug));
  if (apiResponse) {
    return apiResponse.results.map((db: ApiDatabaseResponse) => ({
      ...db,
      query: (statements: string[]): Promise<AzionQueryResponse | null> =>
        queryDatabaseMethod(resolveToken(token), db.name, statements, {
          ...options,
          debug: resolveDebug(options?.debug),
        }),
      execute: (statements: string[], options?: AzionClientOptions): Promise<AzionQueryResponse | null> =>
        executeDatabaseMethod(resolveToken(token), db.name, statements, {
          ...options,
          debug: resolveDebug(options?.debug),
        }),
      listTables: (options?: AzionClientOptions): Promise<AzionQueryResponse | null> =>
        listTablesWrapper(db.name, {
          ...options,
          debug: resolveDebug(options?.debug),
        }),
    }));
  }
  return null;
};

/**
 * Query a database with a set of SQL statements.
 * @param token The token to authenticate with the API.
 * @param name Name of the database to query.
 * @param statements Array of SQL statements to execute.
 * @param options Optional parameters for the query.
 * @returns
 */
const queryDatabaseMethod = async (
  token: string,
  name: string,
  statements: string[],
  options?: AzionClientOptions,
): Promise<AzionQueryResponse> => {
  if (!name || name === '') {
    throw new Error('Database name is required');
  }
  if (options?.debug) {
    console.log(`Executing statements on database ${name}: ${statements}`);
  }
  if (!Array.isArray(statements) || statements.length === 0) {
    throw new Error('No statements to execute. Please provide at least one statement. e.g ["SELECT * FROM users"]');
  }
  const isStatement = statements.some((statement) =>
    ['SELECT', 'PRAGMA'].some((keyword) => statement.trim().toUpperCase().startsWith(keyword)),
  );

  if (!isStatement) {
    throw new Error('Only read statements are allowed');
  }
  if (getAzionSql()) {
    return runtimeQuery(resolveToken(token), name, statements, { ...options, debug: resolveDebug(options?.debug) });
  }
  return apiQuery(resolveToken(token), name, statements, { ...options, debug: resolveDebug(options?.debug) });
};

/**
 * Executes a set of SQL statements on a database.
 * @param token The token to authenticate with the API.
 * @param name The name of the database to execute the statements on.
 * @param statements Array of SQL statements to execute.
 * @param options Optional parameters for the query.
 * @returns
 */
const executeDatabaseMethod = async (
  token: string,
  name: string,
  statements: string[],
  options?: AzionClientOptions,
): Promise<AzionQueryResponse> => {
  if (options?.debug) {
    console.log(`Executing statements on database ${name}: ${statements}`);
  }
  if (!name || name === '') {
    throw new Error('Database name is required');
  }
  if (!Array.isArray(statements) || statements.length === 0) {
    throw new Error(
      'No statements to execute. Please provide at least one statement. e.g ["INSERT INTO users (name) VALUES (\'John\')"]',
    );
  }
  const isWriteStatement = statements.some((statement) =>
    ['INSERT', 'UPDATE', 'DELETE'].some((keyword) => statement.trim().toUpperCase().startsWith(keyword)),
  );
  const isAdminStatement = statements.some((statement) =>
    ['CREATE', 'ALTER', 'DROP', 'TRUNCATE'].some((keyword) => statement.trim().toUpperCase().startsWith(keyword)),
  );
  if (!isAdminStatement && !isWriteStatement) {
    throw new Error('Only write statements are allowed');
  }
  if (isAdminStatement && options?.force === false) {
    throw new Error('To admin statements, you need to set the force option to true');
  }
  const resultQuery = await apiQuery(token, name, statements, options);
  return {
    state: resultQuery.state,
    data: {},
  };
};

/**
 * Creates a new database.
 *
 * @param {string} name - Name of the database to create.
 * @param {AzionClientOptions} [options] - Optional parameters for the deletion.
 * @returns {Promise<AzionDatabase | null>} The created database object or null if creation failed.
 *
 * @example
 * const database = await createDatabase('my-new-database', { debug: true });
 * if (database) {
 *   console.log(`Database created with ID: ${database.id}`);
 * } else {
 *   console.error('Failed to create database');
 * }
 */
const createDatabaseWrapper = async (name: string, options?: AzionClientOptions): Promise<AzionDatabase | null> =>
  await createDatabaseMethod(resolveToken(), name, { ...options, debug: resolveDebug(options?.debug) });

/**
 * Deletes a database by its ID.
 *
 * @param {number} id - ID of the database to delete.
 * @param {AzionClientOptions} [options] - Optional parameters for the deletion.
 * @returns {Promise<AzionDeletedDatabase | null>} Object confirming deletion or null if deletion failed.
 *
 * @example
 * const result = await deleteDatabase(123, { debug: true });
 * if (result) {
 *   console.log(`Database ${result.id} deleted successfully`);
 * } else {
 *   console.error('Failed to delete database');
 * }
 */
const deleteDatabaseWrapper = (id: number, options?: AzionClientOptions): Promise<AzionDeletedDatabase | null> =>
  deleteDatabaseMethod(resolveToken(), id, { ...options, debug: resolveDebug(options?.debug) });

/**
 * Retrieves a database by its Name.
 *
 * @param {string} name - Name of the database to retrieve.
 * @param {AzionClientOptions} [options] - Optional parameters for the deletion.
 * @returns {Promise<AzionDatabase | null>} The retrieved database object or null if not found.
 *
 * @example
 * const database = await getDatabase('my-db', { debug: true });
 * if (database) {
 *   console.log(`Retrieved database: ${database.id}`);
 * } else {
 *   console.error('Database not found');
 * }
 */
const getDatabaseWrapper = async (name: string, options?: AzionClientOptions): Promise<AzionDatabase | null> =>
  getDatabaseMethod(resolveToken(), name, { ...options, debug: resolveDebug(options?.debug) });

/**
 * Retrieves a list of databases with optional filtering and pagination.
 *
 * @param {Partial<AzionDatabaseCollectionOptions>} [params] - Optional parameters for filtering and pagination.
 * @param {AzionClientOptions} [options] - Optional parameters for the deletion.
 * @returns {Promise<AzionDatabase[] | null>} Array of database objects or null if retrieval failed.
 *
 * @example
 * const databases = await getDatabases({ page: 1, page_size: 10 }, { debug: true });
 * if (databases) {
 *   console.log(`Retrieved ${databases.length} databases`);
 * } else {
 *   console.error('Failed to retrieve databases');
 * }
 */
const getDatabasesWrapper = (
  params?: Partial<AzionDatabaseCollectionOptions>,
  options?: AzionClientOptions,
): Promise<AzionDatabase[] | null> =>
  getDatabasesMethod(resolveToken(), params, { ...options, debug: resolveDebug(options?.debug) });

/**
 * List tables from a database.
 * @param databaseName Name of the database to list tables from.
 * @param options Optional parameters for the query.
 * @returns The query response object or null if the query failed.
 */
const listTablesWrapper = async (
  databaseName: string,
  options?: AzionClientOptions,
): Promise<AzionQueryResponse | null> => {
  return queryDatabaseMethod(resolveToken(), databaseName, ['PRAGMA table_list'], {
    ...options,
    debug: resolveDebug(options?.debug),
  });
};

/**
 * Use Query to execute a query on a database.
 * @param name Name of the database to query.
 * @param statements Array of SQL statements to execute.
 * @param options Optional parameters for the query.
 * @param options.debug Debug mode for detailed logging.
 * @param options.force Force the query execution.
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
  options?: AzionClientOptions,
): Promise<AzionQueryResponse | null> =>
  queryDatabaseMethod(resolveToken(), name, statements, { ...options, debug: resolveDebug(options?.debug) });

/**
 * Use Execute to execute a set of SQL statements on a database.
 * @param name Name of the database to execute the statements on.
 * @param statements Array of SQL statements to execute.
 * @param options.debug Debug mode for detailed logging.
 * @param options.force Force the query execution.
 * @returns The query response object or null if the query failed.
 * @example
 * const executeResult = await useExecute('my-db', ['INSERT INTO users (name) VALUES ("John")']);
 * if (executeResult?.state === 'executed') {
 *   console.log(`Executed with success`);
 * }
 */
const useExecute = async (
  name: string,
  statements: string[],
  options?: AzionClientOptions,
): Promise<AzionQueryResponse | null> =>
  executeDatabaseMethod(resolveToken(), name, statements, { ...options, debug: resolveDebug(options?.debug) });

/**
 * Creates an SQL client with methods to interact with Azion Edge SQL databases.
 *
 * @param {Partial<{ token?: string; options?: AzionClientOptions; }>} [config] - Configuration options for the SQL client.
 * @returns {AzionSQLClient} An object with methods to interact with SQL databases.
 *
 * @example
 * const sqlClient = createClient({ token: 'your-api-token', options: { debug: true } });
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
const client: CreateAzionSQLClient = (
  config?: Partial<{ token?: string; options?: AzionClientOptions }>,
): AzionSQLClient => {
  const tokenValue = resolveToken(config?.token);
  const debugValue = resolveDebug(config?.options?.debug);

  const client: AzionSQLClient = {
    /**
     * Creates a new database.
     *
     * @param {string} name - Name of the new database.
     * @returns {Promise<AzionDatabase | null>} The created database object or null if creation failed.
     *
     * @example
     * const newDatabase = await sqlClient.createDatabase('my-new-db');
     * if (newDatabase) {
     *   console.log(`Database created with ID: ${newDatabase.id}`);
     * } else {
     *   console.error('Failed to create database');
     * }
     */
    createDatabase: (name: string): Promise<AzionDatabase | null> =>
      createDatabaseMethod(tokenValue, name, { ...config, debug: debugValue }),

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
    deleteDatabase: (id: number): Promise<AzionDeletedDatabase | null> =>
      deleteDatabaseMethod(tokenValue, id, { ...config, debug: debugValue }),

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
    getDatabase: (name: string): Promise<AzionDatabase | null> =>
      getDatabaseMethod(tokenValue, name, { ...config, debug: debugValue }),

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
    getDatabases: (params?: AzionDatabaseCollectionOptions): Promise<AzionDatabase[] | null> =>
      getDatabasesMethod(tokenValue, params, { ...config, debug: debugValue }),
  } as const;

  return client;
};
export {
  client as createClient,
  createDatabaseWrapper as createDatabase,
  deleteDatabaseWrapper as deleteDatabase,
  getDatabaseWrapper as getDatabase,
  getDatabasesWrapper as getDatabases,
  listTablesWrapper as listTables,
  useExecute,
  useQuery,
};

export default client;

export type * from './types';
