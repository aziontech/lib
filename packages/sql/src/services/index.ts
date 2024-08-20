import { AzionClientOptions, AzionQueryResponse, QueryResult } from '../types';
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
): Promise<AzionQueryResponse> => {
  const databaseResponse = await getEdgeDatabases(token, { search: name }, options?.debug);
  if (!databaseResponse?.results || databaseResponse?.results?.length === 0) {
    throw new Error(`Database ${name} not found`);
  }
  const database = databaseResponse?.results[0];
  if (!database || database?.id === undefined) {
    throw new Error(`Database ${name} not found`);
  }
  const apiResponse = await postQueryEdgeDatabase(token, database.id, statements, options?.debug);
  if (apiResponse) {
    const resultStatements: AzionQueryResponse = {
      state: 'executed',
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
  return {
    state: 'executed',
    data: [],
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
): Promise<AzionQueryResponse> => {
  const internalSql = new InternalAzionSql();
  const internalResult = await internalSql.query(name, statements, options);
  const resultStatements: AzionQueryResponse = {
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
    const limitedData: AzionQueryResponse = {
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
};
