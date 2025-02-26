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

const BASE_URL =
  process.env.AZION_ENV === 'stage'
    ? 'https://stage-api.azion.com/v4/edge_sql/databases'
    : 'https://api.azion.com/v4/edge_sql/databases';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
 * @param {string} token - The authorization token.
 * @param {string} name - The name of the database.
 * @param {boolean} [debug] - Optional debug flag.
 * @returns {ApiCreateDatabaseResponse} The response from the API.
 */
const postEdgeDatabase = async (token: string, name: string, debug?: boolean): Promise<ApiCreateDatabaseResponse> => {
  try {
    const result = await fetchWithErrorHandling(
      BASE_URL,
      {
        method: 'POST',
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      },
      debug,
    );
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
 * @param {string} token - The authorization token.
 * @param {number} id - The ID of the database to delete.
 * @param {boolean} [debug] - Optional debug flag.
 * @returns {Promise<ApiDeleteDatabaseResponse>} The response from the API or error if an error occurs.
 */
const deleteEdgeDatabase = async (token: string, id: number, debug?: boolean): Promise<ApiDeleteDatabaseResponse> => {
  try {
    const result = await fetchWithErrorHandling(
      `${BASE_URL}/${id}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Token ${token}`,
        },
      },
      debug,
    );
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
 * @param {string} token - The authorization token.
 * @param {number} id - The ID of the database to query.
 * @param {string[]} statements - The SQL statements to execute.
 * @param {boolean} [debug] - Optional debug flag.
 * @returns {Promise<ApiQueryExecutionResponse>} The response from the API or error if an error occurs.
 */
const postQueryEdgeDatabase = async (
  token: string,
  id: number,
  statements: string[],
  debug?: boolean,
): Promise<ApiQueryExecutionResponse> => {
  try {
    const result = await fetchWithErrorHandling(
      `${BASE_URL}/${id}/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ statements }),
      },
      debug,
    );

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
      // limit the size of the array to 10
      const limitedData: ApiQueryExecutionResponse = {
        ...result,
        data: (result as ApiQueryExecutionResponse)?.data?.map((data) => {
          return {
            ...data,
            results: {
              ...data.results,
              rows: limitArraySize(data.results.rows, 10),
            },
          };
        }),
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
 * Retrieves an Edge Database by ID.
 * @param {string} token - The authorization token.
 * @param {number} id - The ID of the database to retrieve.
 * @param {boolean} [debug] - Optional debug flag.
 * @returns {Promise<ApiCreateDatabaseResponse>} The response from the API or error.
 */
const getEdgeDatabaseById = async (token: string, id: number, debug?: boolean): Promise<ApiCreateDatabaseResponse> => {
  try {
    const result = await fetchWithErrorHandling(
      `${BASE_URL}/${id}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Token ${token}`,
        },
      },
      debug,
    );
    if (!result.data) {
      result.error = handleApiError(['detail'], result, 'get database');
      return {
        error: result.error ?? JSON.stringify(result),
      };
    }
    if (debug) console.log('Response:', result);
    return result;
  } catch (error: any) {
    if (debug) console.error('Error getting EdgeDB:', error);
    return {
      error: { message: error.toString(), operation: 'get database' },
    };
  }
};

/**
 * Retrieves a list of Edge Databases.
 * @param {string} token - The authorization token.
 * @param {Partial<AzionDatabaseCollectionOptions>} [params] - Optional query parameters.
 * @param {boolean} [debug] - Optional debug flag.
 * @returns {Promise<ApiListDatabasesResponse>} The response from the API or error.
 */
const getEdgeDatabases = async (
  token: string,
  params?: Partial<AzionDatabaseCollectionOptions>,
  debug?: boolean,
): Promise<ApiListDatabasesResponse> => {
  try {
    const url = new URL(BASE_URL);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, value.toString());
        }
      });
    }
    const data = await fetchWithErrorHandling(
      url?.toString(),
      {
        method: 'GET',
        headers: {
          Authorization: `Token ${token}`,
        },
      },
      debug,
    );
    if (!data.results) {
      data.error = handleApiError(['detail'], data, 'get databases');
      return {
        error: data.error ?? JSON.stringify(data),
      };
    }
    if (debug) {
      // limit the size of the array to 10
      const limitedData = {
        ...data,
        results: limitArraySize(data.results, 10),
      };
      console.log('Response Databases:', JSON.stringify(limitedData));
    }
    return {
      links: data?.links,
      count: data.count,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export { deleteEdgeDatabase, getEdgeDatabaseById, getEdgeDatabases, postEdgeDatabase, postQueryEdgeDatabase };
