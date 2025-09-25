import { AzionClientOptions, AzionDatabaseQueryResponse, AzionDatabaseResponse, QueryResult } from '../types';
import { limitArraySize } from '../utils';
import { toObjectQueryExecutionResponse } from '../utils/mappers/to-object';
import { getDatabases, postQueryDatabase } from './api/index';
import { InternalAzionSql } from './runtime/index';

// Api Query Internal Method to execute a query on a database
export const apiQuery = async (
  token: string,
  name: string,
  statements: string[],
  options?: AzionClientOptions,
): Promise<AzionDatabaseResponse<AzionDatabaseQueryResponse>> => {
  const databaseResponse = await getDatabases(token, { search: name, page_size: 1 }, options?.debug, options?.env);

  if (databaseResponse?.error) {
    return { error: databaseResponse.error };
  }

  const database = databaseResponse?.results?.[0];
  if (!database?.name) {
    return {
      error: {
        message: `Database ${name} not found`,
        operation: 'apiQuery',
      },
    };
  }

  // call the postQueryDatabase function to execute the query
  const { state, data, error } = await postQueryDatabase(token, database.id, statements, options?.debug, options?.env);

  if (error) {
    return {
      error: {
        message: error.message || 'Error executing query',
        operation: 'apiQuery',
      },
    };
  }
  const resultsWithStatements = data?.map((result, index) => {
    return {
      statement: statements[index]?.split(' ')[0],
      columns: result?.results?.columns && result?.results?.columns.length > 0 ? result?.results?.columns : undefined,
      rows: result?.results?.rows && result?.results?.rows.length > 0 ? result?.results?.rows : undefined,
      error: result?.error || undefined,
    };
  });
  if (options?.debug && resultsWithStatements) {
    // limit the size of the array to 10
    const limitedData = resultsWithStatements.map((data) => {
      return {
        ...data,
        rows: limitArraySize(data?.rows || [], 10),
      };
    });
    console.log(
      'Response Query:',
      JSON.stringify({
        state,
        results: limitedData,
        toObject: () => null,
      }),
    );
  }

  // Check if there are any errors in the results
  const someErrorInStatements =
    resultsWithStatements && resultsWithStatements.filter((result) => result?.error !== undefined);

  return {
    data: {
      state: state as AzionDatabaseQueryResponse['state'],
      results: resultsWithStatements,
      toObject: () =>
        toObjectQueryExecutionResponse({
          results: resultsWithStatements,
          state: state as AzionDatabaseQueryResponse['state'],
          toObject: () => null,
        }),
    },
    // If there are, return an error response
    error:
      someErrorInStatements && someErrorInStatements.length > 0
        ? {
            message: someErrorInStatements.map((result) => result?.error || 'Error executing query').join(', '),
            operation: 'apiQuery',
          }
        : undefined,
  } as AzionDatabaseResponse<AzionDatabaseQueryResponse>;
};

// Runtime Query Internal Method to execute a query on a database
export const runtimeQuery = async (
  token: string,
  name: string,
  statements: string[],

  options?: AzionClientOptions,
): Promise<AzionDatabaseResponse<AzionDatabaseQueryResponse>> => {
  try {
    const internalSql = new InternalAzionSql();
    const internalResult = await internalSql.query(name, statements, options);
    const resultStatements: AzionDatabaseQueryResponse = {
      state: 'executed-runtime',
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
