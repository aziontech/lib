/* eslint-disable @typescript-eslint/no-explicit-any */
import { AzionDatabaseCollectionOptions } from '../../types';
import { limitArraySize } from '../../utils';
import fetchWithErrorHandling from '../../utils/fetch';
import type {
  ApiCreateDatabaseResponse,
  ApiDeleteDatabaseResponse,
  ApiListDatabasesResponse,
  ApiQueryExecutionResponse,
} from './types';
import { hasDataError } from './utils';

import { AzionEnvironment } from '../../types';

/**
 * Gets base URL based on environment
 */
const getBaseUrl = (env: AzionEnvironment = 'production'): string => {
  const urls: Record<AzionEnvironment, string> = {
    production: 'https://api.azion.com/v4/edge_sql/databases',
    development: '/v4/edge_sql/databases',
    staging: 'https://stage-api.azion.com/v4/edge_sql/databases',
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

const handleApiError = (fields: string[], data: any, operation: string) => {
  let error = { message: 'Error unknown', operation: operation };
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
 * Creates a new Edge Database.
 */
const postEdgeDatabase = async (
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

    if (!result.state) {
      result.error = handleApiError(['detail'], result, 'post database');
      return {
        error: result.error ?? JSON.stringify(result),
      };
    }

    if (debug) console.log('Response Post Database', JSON.stringify(result));
    return {
      state: result.state,
      data: {
        clientId: result.data.client_id,
        createdAt: result.data.created_at,
        deletedAt: result.data.deleted_at,
        id: result.data.id,
        isActive: result.data.is_active,
        name: result.data.name,
        status: result.data.status,
        updatedAt: result.data.updated_at,
      },
    };
  } catch (error: any) {
    if (debug) console.error('Error creating EdgeDB:', error);
    return {
      error: { message: error.toString(), operation: 'post database' },
    };
  }
};

/**
 * Deletes an existing Edge Database.
 */
const deleteEdgeDatabase = async (
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

    if (!result.state) {
      result.error = handleApiError(['detail'], result, 'delete database');
      return {
        error: result.error ?? JSON.stringify(result),
      };
    }
    return {
      state: result.state,
      data: {
        id,
      },
    };
  } catch (error: any) {
    if (debug) console.error('Error deleting EdgeDB:', error);
    return {
      error: { message: error.toString(), operation: 'delete database' },
    };
  }
};

/**
 * Executes a query on an Edge Database.
 */
const postQueryEdgeDatabase = async (
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

    if (!result.data || !Array.isArray(result.data)) {
      result.error = handleApiError(['detail'], result, 'post query');
      return {
        error: result.error ?? JSON.stringify(result),
      };
    }

    const hasErrorResult = hasDataError(result.data);

    if (hasErrorResult) {
      return {
        error: {
          message: hasErrorResult?.message,
          operation: 'post query',
        },
        state: result.state,
        data: result.data.filter((data: any) => data?.results),
      };
    }

    if (debug) {
      const limitedData: ApiQueryExecutionResponse = {
        ...result,
        data: (result as ApiQueryExecutionResponse)?.data?.map((data) => ({
          ...data,
          results: {
            ...data.results,
            rows: limitArraySize(data.results.rows, 10),
          },
        })),
      };
      console.log('Response Query:', JSON.stringify(limitedData));
    }
    return {
      state: result.state,
      data: result.data,
    };
  } catch (error: any) {
    if (debug) console.error('Error querying EdgeDB:', error);
    return {
      error: { message: error.toString(), operation: 'post query' },
    };
  }
};

/**
 * Retrieves a list of Edge Databases.
 */
const getEdgeDatabases = async (
  token: string,
  params?: Partial<AzionDatabaseCollectionOptions>,
  debug?: boolean,
  env: AzionEnvironment = 'production',
): Promise<ApiListDatabasesResponse> => {
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

    if (!data.results) {
      data.error = handleApiError(['detail'], data, 'get databases');
      return {
        error: data.error ?? JSON.stringify(data),
      };
    }

    if (debug) {
      const limitedData = {
        ...data,
        results: limitArraySize(data.results, 10),
      };
      console.log('Response Databases:', JSON.stringify(limitedData));
    }

    return {
      links: data?.links,
      count: data.count,
      results: data.results.map((result: any) => ({
        clientId: result.client_id,
        createdAt: result.created_at,
        deletedAt: result.deleted_at,
        id: result.id,
        isActive: result.is_active,
        name: result.name,
        status: result.status,
        updatedAt: result.updated_at,
      })),
    };
  } catch (error: any) {
    if (debug) console.error('Error getting all EdgeDBs:', error);
    return {
      error: { message: error.toString(), operation: 'get databases' },
    };
  }
};

export { deleteEdgeDatabase, getEdgeDatabases, postEdgeDatabase, postQueryEdgeDatabase };
