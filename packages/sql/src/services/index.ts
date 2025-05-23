import { AzionClientOptions, AzionDatabaseQueryResponse, AzionDatabaseResponse, QueryResult } from '../types';
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
): Promise<AzionDatabaseResponse<AzionDatabaseQueryResponse>> => {
  const databaseResponse = await getEdgeDatabases(token, { search: name }, options?.debug);

  if (databaseResponse?.error) {
    return {
      error: databaseResponse?.error,
    };
  }

  const databases = databaseResponse?.results;
  if (!databases || databases.length === 0) {
    return {
      error: {
        message: `Database ${name} not found`,
        operation: 'apiQuery',
      },
    };
  }

  const database = databases[0];
  if (!database?.id) {
    return {
      error: {
        message: `Database ${name} not found`,
        operation: 'apiQuery',
      },
    };
  }

  const { state, data, error } = await postQueryEdgeDatabase(token, database.id, statements, options?.debug);

  let resultStatements: AzionDatabaseQueryResponse = {
    state: 'executed',
    results: undefined,
    toObject: () => null,
  };

  const isData = data && data.length > 0;
  if (isData) {
    resultStatements = {
      state,
      results: data.map((result, index) => {
        return {
          statement: statements[index]?.split(' ')[0],
          columns:
            result?.results?.columns && result?.results?.columns.length > 0 ? result?.results?.columns : undefined,
          rows: result?.results?.rows && result?.results?.rows.length > 0 ? result?.results?.rows : undefined,
        };
      }),
      toObject: () => toObjectQueryExecutionResponse(resultStatements),
    };
  }
  return {
    data: isData ? resultStatements : undefined,
    error,
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
): Promise<AzionDatabaseResponse<AzionDatabaseQueryResponse>> => {
  try {
    const internalSql = new InternalAzionSql();
    const internalResult = await internalSql.query(name, statements, options);
    const resultStatements: AzionDatabaseQueryResponse = {
      results: [],
      toObject: () => null,
    };
    const data = await internalSql.mapperQuery(internalResult);
    if (data && data.length > 0) {
      resultStatements.state = 'executed-runtime';
      resultStatements.results = data;
    }
    if (options?.debug) {
      // limit the size of the array to 10
      const limitedData: AzionDatabaseQueryResponse = {
        ...resultStatements,
        results: (resultStatements.results as QueryResult[]).map((data) => {
          return {
            ...data,
            rows: limitArraySize(data?.rows || [], 10),
          };
        }),
      };
      console.log('Response Query:', JSON.stringify(limitedData));
    }
    return {
      data: {
        ...resultStatements,
        toObject: () => toObjectQueryExecutionResponse(resultStatements),
      },
    };
  } catch (error) {
    return {
      error: {
        message: (error as Error)?.message || 'Error executing query',
        operation: 'executing query',
      },
    };
  }
};
