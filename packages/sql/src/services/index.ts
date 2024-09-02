import { AzionClientOptions, AzionDatabaseQueryResponse, QueryResult } from '../types';
import { limitArraySize } from '../utils';
import { toObjectQueryExecutionResponse } from '../utils/mappers/to-object';
import { getEdgeDatabases, postQueryEdgeDatabase } from './api/index';
import { InternalAzionSql } from './runtime/index';

// Api Query Internal Method to execute a query on a database
export const apiQuery = async (
  token: string,
  name: string,
  statements: string[],
  options?: AzionClientOptions,
): Promise<AzionDatabaseQueryResponse> => {
  const databaseResponse = await getEdgeDatabases(token, { search: name }, options?.debug);

  if (databaseResponse?.detail) {
    return {
      state: 'failed',
      error: {
        message: databaseResponse.detail,
        operation: 'apiQuery',
      },
    };
  }

  const databases = databaseResponse?.results;
  if (!databases || databases.length === 0) {
    return {
      state: 'failed',
      error: {
        message: `Database ${name} not found`,
        operation: 'apiQuery',
      },
    };
  }

  const database = databases[0];
  if (!database?.id) {
    return {
      state: 'failed',
      error: {
        message: `Database ${name} not found`,
        operation: 'apiQuery',
      },
    };
  }

  const { state, data, error } = await postQueryEdgeDatabase(token, database.id, statements, options?.debug);
  if (data) {
    const resultStatements: AzionDatabaseQueryResponse = {
      state,
      data: data.map((result, index) => {
        const info = result?.results?.query_duration_ms
          ? {
              durationMs: result.results.query_duration_ms,
              rowsRead: result.results.rows_read,
              rowsWritten: result.results.rows_written,
            }
          : undefined;

        return {
          statement: statements[index]?.split(' ')[0],
          columns: result?.results?.columns,
          rows: result?.results?.rows,
          info,
        };
      }),
      toObject: () => toObjectQueryExecutionResponse(resultStatements),
    };
    return resultStatements;
  }

  return {
    state,
    error: {
      message: error?.detail || 'Error executing query',
      operation: 'executing query',
    },
  };
};

// Runtime Query Internal Method to execute a query on a database
export const runtimeQuery = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  token: string,
  name: string,
  statements: string[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  options?: AzionClientOptions,
): Promise<AzionDatabaseQueryResponse> => {
  try {
    const internalSql = new InternalAzionSql();
    const internalResult = await internalSql.query(name, statements, options);
    const resultStatements: AzionDatabaseQueryResponse = {
      state: 'executed-runtime',
      data: [],
    };
    const data = await internalSql.mapperQuery(internalResult);
    if (data && data.length > 0) {
      resultStatements.state = 'executed-runtime';
      resultStatements.data = data;
    }
    if (options?.debug) {
      // limit the size of the array to 10
      const limitedData: AzionDatabaseQueryResponse = {
        ...resultStatements,
        data: (resultStatements.data as QueryResult[]).map((data) => {
          return {
            ...data,
            rows: limitArraySize(data?.rows || [], 10),
          };
        }),
      };
      console.log('Response Query:', JSON.stringify(limitedData));
    }
    return {
      ...resultStatements,
      toObject: () => toObjectQueryExecutionResponse(resultStatements),
    };
  } catch (error) {
    return {
      state: 'failed',
      error: {
        message: (error as Error)?.message || 'Error executing query',
        operation: 'executing query',
      },
    };
  }
};
