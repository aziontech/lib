import { deleteEdgeDatabase, getEdgeDatabases, postEdgeDatabase } from './services/api/index';
import { ApiDatabaseResponse } from './services/api/types';
import { apiQuery, runtimeQuery } from './services/index';
import { getAzionSql } from './services/runtime/index';
import type {
  AzionClientOptions,
  AzionDatabase,
  AzionDatabaseCollectionOptions,
  AzionDatabaseCollections,
  AzionDatabaseQueryResponse,
  AzionDatabaseResponse,
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
): Promise<AzionDatabaseResponse<AzionDatabase>> => {
  const apiResponse = await postEdgeDatabase(resolveToken(token), name, resolveDebug(options?.debug));
  if (apiResponse.data) {
    return {
      data: {
        ...apiResponse.data,
        query: (statements: string[]) =>
          queryDatabaseMethod(resolveToken(token), name, statements, {
            ...options,
            debug: resolveDebug(options?.debug),
          }),
        execute: (statements: string[], options?: AzionClientOptions) =>
          executeDatabaseMethod(resolveToken(token), name, statements, {
            ...options,
            debug: resolveDebug(options?.debug),
          }),
        getTables: (options?: AzionClientOptions) =>
          listTablesWrapper(name, {
            ...options,
            debug: resolveDebug(options?.debug),
          }),
      },
    } as AzionDatabaseResponse<AzionDatabase>;
  }
  return {
    error: apiResponse.error,
  };
};

/**
 * Deletes a database by its ID.
 * @param token Token to authenticate with the API.
 * @param id ID of the database to delete.
 * @param debug Debug mode for detailed logging.
 * @returns Object confirming deletion or error if deletion failed.
 */
const deleteDatabaseMethod = async (
  token: string,
  id: number,
  options?: AzionClientOptions,
): Promise<AzionDatabaseResponse<{ id: number }>> => {
  const apiResponse = await deleteEdgeDatabase(resolveToken(token), id, resolveDebug(options?.debug));
  if (apiResponse?.data) {
    return {
      data: {
        id: apiResponse.data.id,
      },
    };
  }
  return {
    error: apiResponse.error,
  };
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
): Promise<AzionDatabaseResponse<AzionDatabase>> => {
  if (!name || name === '') {
    return {
      error: {
        message: 'Database name is required',
        operation: 'get database',
      },
    };
  }
  const databaseResponse = await getEdgeDatabases(resolveToken(token), { search: name }, resolveDebug(options?.debug));
  if (!databaseResponse?.results || databaseResponse?.results?.length === 0) {
    return {
      error: {
        message: `Database with name '${name}' not found`,
        operation: 'get database',
      },
    };
  }
  const databaseResult = databaseResponse?.results[0];
  if (!databaseResult || databaseResult.id === undefined || databaseResult.name !== name) {
    return {
      error: {
        message: `Database with name '${name}' not found`,
        operation: 'get database',
      },
    };
  }
  return {
    data: {
      ...databaseResult,
      query: (statements: string[]) =>
        queryDatabaseMethod(resolveToken(token), databaseResult.name, statements, {
          ...options,
          debug: resolveDebug(options?.debug),
        }),
      execute: (statements: string[], options?: AzionClientOptions) =>
        executeDatabaseMethod(resolveToken(token), databaseResult.name, statements, {
          ...options,
          debug: resolveDebug(options?.debug),
        }),
      getTables: (options?: AzionClientOptions) =>
        listTablesWrapper(databaseResult.name, {
          ...options,
          debug: resolveDebug(options?.debug),
        }),
    },
  } as AzionDatabaseResponse<AzionDatabase>;
};

/**
 * Retrieves a list of databases with optional filtering and pagination.
 * @param token Token to authenticate with the API.
 * @param params Optional parameters for filtering and pagination.
 * @param debug Debug mode for detailed logging.
 * @returns Array of database objects or error if retrieval failed.
 */
const getDatabasesMethod = async (
  token: string,
  params?: AzionDatabaseCollectionOptions,
  options?: AzionClientOptions,
): Promise<AzionDatabaseResponse<AzionDatabaseCollections>> => {
  const apiResponse = await getEdgeDatabases(resolveToken(token), params, resolveDebug(options?.debug));
  if (apiResponse?.results && apiResponse.results.length > 0) {
    const databases = apiResponse.results.map((db: ApiDatabaseResponse) => {
      return {
        ...db,
        query: (statements: string[]): Promise<AzionDatabaseResponse<AzionDatabaseQueryResponse>> =>
          queryDatabaseMethod(resolveToken(token), db.name, statements, {
            ...options,
            debug: resolveDebug(options?.debug),
          }),
        execute: (
          statements: string[],
          options?: AzionClientOptions,
        ): Promise<AzionDatabaseResponse<AzionDatabaseQueryResponse>> =>
          executeDatabaseMethod(resolveToken(token), db.name, statements, {
            ...options,
            debug: resolveDebug(options?.debug),
          }),
        getTables: (options?: AzionClientOptions): Promise<AzionDatabaseResponse<AzionDatabaseQueryResponse>> =>
          listTablesWrapper(db.name, {
            ...options,
            debug: resolveDebug(options?.debug),
          }),
      };
    });
    return {
      data: {
        count: apiResponse.count,
        databases,
      },
    };
  }
  return {
    error: apiResponse.error,
  };
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
): Promise<AzionDatabaseResponse<AzionDatabaseQueryResponse>> => {
  if (!name || name === '') {
    return {
      error: {
        message: 'Database name is required',
        operation: 'query database',
      },
    };
  }
  if (options?.debug) {
    console.log(`Executing statements on database ${name}: ${statements}`);
  }
  if (!Array.isArray(statements) || statements.length === 0) {
    return {
      error: {
        message: 'No statements to execute. Please provide at least one statement. e.g ["SELECT * FROM users"]',
        operation: 'query database',
      },
    };
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
): Promise<AzionDatabaseResponse<AzionDatabaseQueryResponse>> => {
  if (options?.debug) {
    console.log(`Executing statements on database ${name}: ${statements}`);
  }
  if (!name || name === '') {
    return {
      error: {
        message: 'Database name is required',
        operation: 'execute database',
      },
    };
  }
  if (!Array.isArray(statements) || statements.length === 0) {
    return {
      error: {
        message:
          'No statements to execute. Please provide at least one statement. e.g ["INSERT INTO users (name) VALUES (\'John\')"]',
        operation: 'execute database',
      },
    };
  }
  const isWriteStatement = statements.some((statement) =>
    ['INSERT', 'UPDATE', 'DELETE'].some((keyword) => statement.trim().toUpperCase().startsWith(keyword)),
  );
  const isAdminStatement = statements.some((statement) =>
    ['CREATE', 'ALTER', 'DROP', 'TRUNCATE'].some((keyword) => statement.trim().toUpperCase().startsWith(keyword)),
  );
  if (!isAdminStatement && !isWriteStatement) {
    return {
      error: {
        message: 'Only write statements are allowed',
        operation: 'execute database',
      },
    };
  }
  if (isAdminStatement && options?.force === false) {
    return {
      error: {
        message: 'To admin statements, you need to set the force option to true',
        operation: 'execute database',
      },
    };
  }
  const resultQuery = await apiQuery(token, name, statements, options);
  return {
    data: resultQuery.data,
  };
};

/**
 * Creates a new database.
 *
 * @param {string} name - Name of the database to create.
 * @param {AzionClientOptions} [options] - Optional parameters for the deletion.
 * @returns {Promise<AzionDatabaseResponse<AzionDatabase>>} The created database object or error if creation failed.
 *
 * @example
 * const { data, error } = await createDatabase('my-new-database', { debug: true });
 * if (data) {
 *  console.log(`Database ${data.id} created successfully`);
 * } else {
 *  console.error(`Failed to create database: ${error.message}`);
 * }
 */
const createDatabaseWrapper = async (
  name: string,
  options?: AzionClientOptions,
): Promise<AzionDatabaseResponse<AzionDatabase>> =>
  await createDatabaseMethod(resolveToken(), name, { ...options, debug: resolveDebug(options?.debug) });

/**
 * Deletes a database by its ID.
 *
 * @param {number} id - ID of the database to delete.
 * @param {AzionClientOptions} [options] - Optional parameters for the deletion.
 * @returns {Promise<AzionDatabaseResponse<{ id: number }>>} Object confirming deletion or error if deletion failed.
 *
 * @example
 * const { data, error } = await deleteDatabase(123, { debug: true });
 * if (data) {
 * console.log(`Database ${data.id} deleted successfully`);
 * } else {
 * console.error(`Failed to delete database: ${error.message}`);
 *
 */
const deleteDatabaseWrapper = (
  id: number,
  options?: AzionClientOptions,
): Promise<AzionDatabaseResponse<{ id: number }>> =>
  deleteDatabaseMethod(resolveToken(), id, { ...options, debug: resolveDebug(options?.debug) });

/**
 * Retrieves a database by its Name.
 *
 * @param {string} name - Name of the database to retrieve.
 * @param {AzionClientOptions} [options] - Optional parameters for the deletion.
 * @returns {Promise<AzionDatabaseResponse<AzionDatabase>>} The retrieved database object or error if not found.
 *
 * @example
 * const { data, error } = await getDatabase('my-db', { debug: true });
 * if (data) {
 *  console.log(`Retrieved database ${data.name} (ID: ${data.id})`);
 * } else {
 *  console.error(`Failed to retrieve database: ${error.message}`);
 * }
 */
const getDatabaseWrapper = async (
  name: string,
  options?: AzionClientOptions,
): Promise<AzionDatabaseResponse<AzionDatabase>> =>
  getDatabaseMethod(resolveToken(), name, { ...options, debug: resolveDebug(options?.debug) });

/**
 * Retrieves a list of databases with optional filtering and pagination.
 *
 * @param {Partial<AzionDatabaseCollectionOptions>} [params] - Optional parameters for filtering and pagination.
 * @param {AzionClientOptions} [options] - Optional parameters for the deletion.
 * @returns {Promise<AzionDatabaseResponse<AzionDatabaseCollections>>} Array of database objects or error if retrieval failed.
 *
 * @example
 * const { data: allDatabases, error } = await getDatabases({ page: 1, page_size: 10 }, { debug: true });
 * if (allDatabases) {
 * console.log(`Retrieved ${allDatabases.count} databases`);
 * allDatabases.results.forEach(db => console.log(`- ${db.name} (ID: ${db.id})`));
 * } else {
 * console.error('Failed to retrieve databases', error);
 * }
 *
 */
const getDatabasesWrapper = (
  params?: Partial<AzionDatabaseCollectionOptions>,
  options?: AzionClientOptions,
): Promise<AzionDatabaseResponse<AzionDatabaseCollections>> =>
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
): Promise<AzionDatabaseResponse<AzionDatabaseQueryResponse>> => {
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
 * const { data, error } = await useQuery('my-db', ['SELECT * FROM users']);
 * if (data) {
 *  console.log(`Query executed with success`, data);
 * } else {
 * console.error(`Failed to execute query: ${error.message}`);
 *
 */
const useQuery = (
  name: string,
  statements: string[],
  options?: AzionClientOptions,
): Promise<AzionDatabaseResponse<AzionDatabaseQueryResponse>> =>
  queryDatabaseMethod(resolveToken(), name, statements, { ...options, debug: resolveDebug(options?.debug) });

/**
 * Use Execute to execute a set of SQL statements on a database.
 * @param name Name of the database to execute the statements on.
 * @param statements Array of SQL statements to execute.
 * @param options.debug Debug mode for detailed logging.
 * @param options.force Force the query execution.
 * @returns The query response object or null if the query failed.
 *
 * @example
 * const { data, error } = await useExecute('my-db', ['INSERT INTO users (name) VALUES ("John")']);
 * if (data) {
 * console.log(`Statements executed with success`, data);
 * } else {
 * console.error(`Failed to execute statements: `, error);
 *
 */
const useExecute = async (
  name: string,
  statements: string[],
  options?: AzionClientOptions,
): Promise<AzionDatabaseResponse<AzionDatabaseQueryResponse>> =>
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
 * const { data: newDatabase } = await sqlClient.createDatabase('my-new-db');
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
    createDatabase: (name: string): Promise<AzionDatabaseResponse<AzionDatabase>> =>
      createDatabaseMethod(tokenValue, name, { ...config, debug: debugValue }),
    deleteDatabase: (id: number): Promise<AzionDatabaseResponse<{ id: number }>> =>
      deleteDatabaseMethod(tokenValue, id, { ...config, debug: debugValue }),
    getDatabase: (name: string): Promise<AzionDatabaseResponse<AzionDatabase>> =>
      getDatabaseMethod(tokenValue, name, { ...config, debug: debugValue }),
    getDatabases: (params?: AzionDatabaseCollectionOptions): Promise<AzionDatabaseResponse<AzionDatabaseCollections>> =>
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
  listTablesWrapper as getTables,
  useExecute,
  useQuery,
};

export default client;

export type * from './types';
