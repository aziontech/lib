/* eslint-disable @typescript-eslint/no-explicit-any */
import { AzionDatabaseCollectionOptions } from '../../types';
import { limitArraySize } from '../../utils';
import fetchWithErrorHandling from '../../utils/fetch';
import {
  type ApiCreateDatabaseResponse,
  type ApiDatabaseListResponse,
  type ApiDeleteDatabaseResponse,
  type ApiError,
  type ApiQueryExecutionResponse,
  type ApiRetrieveDatabaseResponse,
} from './types';

import { AzionEnvironment } from '../../types';

/**
 * Gets base URL based on environment
 */
const getBaseUrl = (env: AzionEnvironment = 'production'): string => {
  const urls: Record<AzionEnvironment, string> = {
    production: 'https://api.azion.com/v4//workspace/sql/databases',
    development: '/v4//workspace/sql/databases',
    staging: 'https://stage-api.azion.com/v4//workspace/sql/databases',
  };
  return urls[env];
};

/**
 * Builds request headers based on token and additional headers
 */
const buildHeaders = (token?: string, additionalHeaders = {}) => {
  const baseHeaders = {
    Accept: 'application/json',
    ...additionalHeaders,
  };

  if (token) {
    return {
      ...baseHeaders,
      Authorization: `Token ${token}`,
    };
  }

  return baseHeaders;
};

/**
 * Builds fetch request options
 */
const buildFetchOptions = (method: string, headers: Record<string, string>, body?: string) => {
  const options: RequestInit = {
    method,
    headers,
    credentials: 'include',
  };

  if (body) {
    options.body = body;
  }

  return options;
};

const handleApiError = (fields: string[], data: any, operation: string): ApiError => {
  let error: ApiError = { message: 'Error unknown', operation: operation };

  if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
    const firstError = data.errors[0];
    if (firstError.detail) {
      error = {
        message: firstError.detail,
        operation: operation,
      };
      return error;
    }
    if (firstError.title) {
      error = {
        message: firstError.title,
        operation: operation,
      };
      return error;
    }
  }

  fields.forEach((field: string) => {
    if (data[field]) {
      const message = Array.isArray(data[field]) ? data[field].join(', ') : data[field];
      error = {
        message: message,
        operation: operation,
      };
    }
  });
  return error;
};

/**
 * Creates a new Database.
 */
const postDatabase = async (
  token: string,
  name: string,
  debug?: boolean,
  env: AzionEnvironment = 'production',
): Promise<ApiCreateDatabaseResponse> => {
  try {
    const baseUrl = getBaseUrl(env);
    const headers = buildHeaders(token, { 'Content-Type': 'application/json' });
    const options = buildFetchOptions('POST', headers, JSON.stringify({ name }));

    const result = await fetchWithErrorHandling(baseUrl, options, debug);

    if (result.errors) {
      return {
        error: handleApiError([], result, 'post database'),
      };
    }

    const dataResult = result.data;

    if (debug) console.log('Response Post Database', JSON.stringify(result));
    return {
      state: result.state,
      data: dataResult,
    };
  } catch (error) {
    if (debug) console.error('Error creating EdgeDB:', error);
    return {
      error: { message: (error as Error).message, operation: 'post database' },
    };
  }
};

/**
 * Deletes an existing Database.
 */
const deleteDatabase = async (
  token: string,
  id: number,
  debug?: boolean,
  env: AzionEnvironment = 'production',
): Promise<ApiDeleteDatabaseResponse> => {
  try {
    const baseUrl = getBaseUrl(env);
    const headers = buildHeaders(token);
    const options = buildFetchOptions('DELETE', headers);

    const result = await fetchWithErrorHandling(`${baseUrl}/${id}`, options, debug);

    if (result.errors) {
      return {
        error: handleApiError([], result, 'delete database'),
      };
    }
    return result;
  } catch (error: any) {
    if (debug) console.error('Error deleting EdgeDB:', error);
    return {
      error: { message: error.toString(), operation: 'delete database' },
    };
  }
};

/**
 * Executes a query on an Database.
 */
const postQueryDatabase = async (
  token: string,
  id: number,
  statements: string[],
  debug?: boolean,
  env: AzionEnvironment = 'production',
): Promise<ApiQueryExecutionResponse> => {
  try {
    const baseUrl = getBaseUrl(env);
    const headers = buildHeaders(token, { 'Content-Type': 'application/json' });
    const options = buildFetchOptions('POST', headers, JSON.stringify({ statements }));

    const result = await fetchWithErrorHandling(`${baseUrl}/${id}/query`, options, debug);

    if (result.errors) {
      return {
        error: handleApiError([], result, 'post query'),
      };
    }

    const dataResult = result.data;

    if (debug) {
      const limitedData: ApiQueryExecutionResponse = {
        ...result,
        data: (result as ApiQueryExecutionResponse)?.data?.map((data) => ({
          ...data,
          results: {
            ...data.results,
            rows: limitArraySize(data.results?.rows, 10),
          },
        })),
      };
      console.log('Response Query:', JSON.stringify(limitedData));
    }
    return {
      state: result.state,
      data: dataResult,
    };
  } catch (error: any) {
    if (debug) console.error('Error querying EdgeDB:', error);
    return {
      error: { message: error.toString(), operation: 'post query' },
    };
  }
};

/**
 * Retrieves a list of Databases.
 */
const getDatabases = async (
  token: string,
  params?: Partial<AzionDatabaseCollectionOptions>,
  debug?: boolean,
  env: AzionEnvironment = 'production',
): Promise<ApiDatabaseListResponse> => {
  try {
    const baseUrl = getBaseUrl(env);
    const url = new URL(baseUrl);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, value.toString());
        }
      });
    }

    const headers = buildHeaders(token);
    const options = buildFetchOptions('GET', headers);

    const data = await fetchWithErrorHandling(url.toString(), options, debug);

    if (data.errors) {
      return {
        error: handleApiError([], data, 'get databases'),
      };
    }

    const dataResult = data.results;

    if (debug) {
      const limitedData = {
        ...data,
        results: limitArraySize(data.results, 10),
      };
      console.log('Response Databases:', JSON.stringify(limitedData));
    }

    return {
      count: data.count,
      results: dataResult,
    };
  } catch (error) {
    if (debug) console.error('Error getting all EdgeDBs:', error);
    return {
      error: { message: (error as Error).message, operation: 'get databases' },
    };
  }
};

/**
 * Retrieve of Databases.
 */
const retrieveDatabase = async (
  token: string,
  id: number,
  debug?: boolean,
  env: AzionEnvironment = 'production',
): Promise<ApiRetrieveDatabaseResponse> => {
  try {
    const baseUrl = getBaseUrl(env);
    const url = new URL(baseUrl);

    url.pathname += `/${id}`;

    const headers = buildHeaders(token);
    const options = buildFetchOptions('GET', headers);

    const result = await fetchWithErrorHandling(url.toString(), options, debug);

    if (result.errors) {
      return {
        error: handleApiError([], result, 'retrieve database'),
      };
    }

    if (debug) {
      console.log('Response Databases:', JSON.stringify(result));
    }

    return {
      data: result.data,
    };
  } catch (error) {
    if (debug) console.error('Error getting all EdgeDBs:', error);
    return {
      error: { message: (error as Error).message, operation: 'get databases' },
    };
  }
};

export { deleteDatabase, getDatabases, postDatabase, postQueryDatabase, retrieveDatabase };
