import { deleteEdgeDatabase, getEdgeDatabases, postEdgeDatabase } from './services/api/index';
import { ApiDatabase } from './services/api/types';
import { apiQuery, runtimeQuery } from './services/index';
import { getAzionSql } from './services/runtime/index';
import {
  type AzionClientOptions,
  type AzionDatabase,
  type AzionDatabaseCollectionOptions,
  type AzionDatabaseCollections,
  type AzionDatabaseDeleteResponse,
  type AzionDatabaseQueryResponse,
  type AzionDatabaseResponse,
  type AzionEnvironment,
  type AzionSQLClient,
  type CreateAzionSQLClient,
} from './types';
import { handleUnknownError } from './utils/validations/error-response';

/**
 * Determines if the code is running in a browser environment.
 *
 * @returns {boolean} True if running in a browser, false otherwise.
 *
 * @example
 * if (isBrowserEnvironment()) {
 *   console.log('Running in browser');
 * } else {
 *   console.log('Running in Node.js');
 * }
 */
const isBrowserEnvironment = (): boolean => {
  return typeof window !== 'undefined' && typeof window.document !== 'undefined';
};

const envDebugFlag = !isBrowserEnvironment() && process?.env.AZION_DEBUG === 'true';

const resolveToken = (token?: string) => {
  if (isBrowserEnvironment()) {
    return token ?? '';
  }
  return token ?? process?.env.AZION_TOKEN ?? '';
};

const resolveDebug = (debug?: boolean) => debug ?? !!envDebugFlag;

const resolveEnv = (env?: AzionEnvironment): AzionEnvironment => {
  if (isBrowserEnvironment()) {
    return env ?? 'production';
  }
  return env ?? (process?.env.AZION_ENV as AzionEnvironment) ?? 'production';
};

const resolveClientOptions = (options?: AzionClientOptions): AzionClientOptions => ({
  ...options,
  debug: resolveDebug(options?.debug),
  env: resolveEnv(options?.env),
});

const AzionDatabaseTransform = {
  parse: (data: ApiDatabase): Partial<AzionDatabase> => ({
    id: data.id,
    name: data.name,
    status: data.status,
    active: data.active,
    lastModified: data.last_modified,
    lastEditor: data.last_editor,
    productVersion: data.product_version,
  }),
};

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
  try {
    const resolvedOptions = resolveClientOptions(options);
    const apiResponse = await postEdgeDatabase(resolveToken(token), name, resolvedOptions.debug, resolvedOptions.env);
    if (apiResponse.data) {
      const databaseTransformed: Partial<AzionDatabase> = AzionDatabaseTransform.parse(apiResponse.data);
      // TODO: Breaking change: removed clientId, createdAt, updatedAt, deletedAt, isActive
      return {
        data: {
          state: apiResponse.state ?? 'executed',
          ...databaseTransformed,
          query: (statements: string[]) => queryDatabaseMethod(resolveToken(token), name, statements, resolvedOptions),
          execute: (statements: string[]) =>
            executeDatabaseMethod(resolveToken(token), name, statements, resolvedOptions),
          getTables: (options?: AzionClientOptions) =>
            listTablesWrapper(name, {
              ...options,
              debug: resolvedOptions.debug,
            }),
        },
      } as AzionDatabaseResponse<AzionDatabase>;
    }
    return {
      error: apiResponse.error,
    };
  } catch (error) {
    return handleUnknownError(error, 'create database');
  }
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
): Promise<AzionDatabaseResponse<AzionDatabaseDeleteResponse>> => {
  const resolvedOptions = resolveClientOptions(options);
  const apiResponse = await deleteEdgeDatabase(resolveToken(token), id, resolvedOptions.debug, resolvedOptions.env);
  if (apiResponse?.state) {
    return {
      data: {
        state: apiResponse.state ?? 'executed',
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
// TODO: Breaking change: removed clientId, createdAt, updatedAt, deletedAt, isActive
const getDatabaseMethod = async (
  token: string,
  name: string,
  options?: AzionClientOptions,
): Promise<AzionDatabaseResponse<AzionDatabase>> => {
  try {
    const resolvedOptions = resolveClientOptions(options);

    const apiResponse = await getEdgeDatabases(
      resolveToken(token),
      { search: name, page_size: 1 },
      resolvedOptions.debug,
      resolvedOptions.env,
    );

    if (apiResponse.results && apiResponse.results.length > 0) {
      const filteredResults = apiResponse.results.filter((db: ApiDatabase) => db.name === name);
      if (filteredResults.length === 0) {
        return {
          error: {
            message: `Database ${name} not found`,
            operation: 'get database',
          },
        };
      }
      const databaseTransformed: Partial<AzionDatabase> = AzionDatabaseTransform.parse(filteredResults[0]);
      // TODO: Breaking change: removed clientId, createdAt, updatedAt, deletedAt, isActive
      return {
        data: {
          ...databaseTransformed,
          query: (statements: string[]) => queryDatabaseMethod(resolveToken(token), name, statements, resolvedOptions),
          execute: (statements: string[]) =>
            executeDatabaseMethod(resolveToken(token), name, statements, resolvedOptions),
          getTables: (options?: AzionClientOptions) =>
            listTablesWrapper(name, {
              ...options,
              debug: resolvedOptions.debug,
            }),
        },
      } as AzionDatabaseResponse<AzionDatabase>;
    }

    return {
      error: apiResponse.error,
    };
  } catch (error) {
    return handleUnknownError(error, 'get database');
  }
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
  const resolvedOptions = resolveClientOptions(options);
  const apiResponse = await getEdgeDatabases(resolveToken(token), params, resolvedOptions.debug, resolvedOptions.env);

  // If the API response contains an error, return it
  if (apiResponse.error) {
    return {
      error: apiResponse.error,
    };
  }
  // If no results are found, return an empty collection with count
  if (!apiResponse?.results || apiResponse?.results?.length === 0) {
    return {
      data: {
        count: apiResponse.count ?? 0,
        databases: [],
      },
    };
  }

  return {
    data: {
      count: apiResponse.count ?? 0,
      databases: apiResponse.results.map((db: ApiDatabase) => ({
        ...AzionDatabaseTransform.parse(db),
        query: (statements: string[]): Promise<AzionDatabaseResponse<AzionDatabaseQueryResponse>> =>
          queryDatabaseMethod(resolveToken(token), db.name, statements, resolvedOptions),
        execute: (statements: string[]): Promise<AzionDatabaseResponse<AzionDatabaseQueryResponse>> =>
          executeDatabaseMethod(resolveToken(token), db.name, statements, resolvedOptions),
        getTables: (options?: AzionClientOptions): Promise<AzionDatabaseResponse<AzionDatabaseQueryResponse>> =>
          listTablesWrapper(db.name, {
            ...options,
            debug: resolvedOptions.debug,
          }),
      })),
    },
  } as AzionDatabaseResponse<AzionDatabaseCollections>;
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
  const resolvedOptions = resolveClientOptions(options);
  // TODO: Validate the name format if needed
  if (!name || name === '') {
    return {
      error: {
        message: 'Database name is required',
        operation: 'query database',
      },
    };
  }
  if (resolvedOptions.debug) {
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
  if (resolvedOptions.external || !getAzionSql()) {
    return apiQuery(token, name, statements, resolvedOptions);
  }
  return runtimeQuery(token, name, statements, resolvedOptions);
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
  const resolvedOptions = resolveClientOptions(options);
  if (resolvedOptions.debug) {
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
    statement.toUpperCase().match(/^(CREATE|DROP|ALTER|ATTACH|VACUUM|PRAGMA)/),
  );
  if (!isAdminStatement && !isWriteStatement) {
    return {
      error: {
        message: 'Only write statements are allowed',
        operation: 'execute database',
      },
    };
  }
  if (isAdminStatement && resolvedOptions.force === false) {
    return {
      error: {
        message: 'To admin statements, you need to set the force option to true',
        operation: 'execute database',
      },
    };
  }
  if (resolvedOptions.external || !getAzionSql()) {
    return apiQuery(token, name, statements, resolvedOptions);
  }
  return runtimeQuery(token, name, statements, resolvedOptions);
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
): Promise<AzionDatabaseResponse<AzionDatabase>> => createDatabaseMethod(resolveToken(), name, options);

/**
 * Deletes a database by its ID.
 *
 * @param {number} id - ID of the database to delete.
 * @param {AzionClientOptions} [options] - Optional parameters for the deletion.
 * @returns {Promise<AzionDatabaseResponse<AzionDatabaseDeleteResponse>>} Object confirming deletion or error if deletion failed.
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
): Promise<AzionDatabaseResponse<AzionDatabaseDeleteResponse>> => deleteDatabaseMethod(resolveToken(), id, options);

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
): Promise<AzionDatabaseResponse<AzionDatabase>> => getDatabaseMethod(resolveToken(), name, options);

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
): Promise<AzionDatabaseResponse<AzionDatabaseCollections>> => getDatabasesMethod(resolveToken(), params, options);

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
  const resolvedOptions = resolveClientOptions(options);
  return queryDatabaseMethod(resolveToken(), databaseName, ['PRAGMA table_list'], resolvedOptions);
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
  queryDatabaseMethod(resolveToken(), name, statements, options);

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
  executeDatabaseMethod(resolveToken(), name, statements, options);

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
      createDatabaseMethod(tokenValue, name, { ...config?.options, debug: debugValue }),
    deleteDatabase: (id: number): Promise<AzionDatabaseResponse<AzionDatabaseDeleteResponse>> =>
      deleteDatabaseMethod(tokenValue, id, { ...config?.options, debug: debugValue }),
    getDatabase: (name: string): Promise<AzionDatabaseResponse<AzionDatabase>> =>
      getDatabaseMethod(tokenValue, name, { ...config?.options, debug: debugValue }),
    getDatabases: (params?: AzionDatabaseCollectionOptions): Promise<AzionDatabaseResponse<AzionDatabaseCollections>> =>
      getDatabasesMethod(tokenValue, params, { ...config?.options, debug: debugValue }),
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
