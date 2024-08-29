import { AzionDatabaseCollectionOptions } from '../../types';
import { limitArraySize } from '../../utils';
import type {
  ApiCreateDatabaseResponse,
  ApiDeleteDatabaseResponse,
  ApiListDatabasesResponse,
  ApiQueryExecutionResponse,
} from './types';

const BASE_URL = 'https://api.azion.com/v4/edge_sql/databases';

/**
 * Creates a new Edge Database.
 * @param {string} token - The authorization token.
 * @param {string} name - The name of the database.
 * @param {boolean} [debug] - Optional debug flag.
 * @returns {Promise<ApiCreateDatabaseResponse | null>} The response from the API or null if an error occurs.
 */
const postEdgeDatabase = async (
  token: string,
  name: string,
  debug?: boolean,
): Promise<ApiCreateDatabaseResponse | null> => {
  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });
    const data = await response.json();
    if (debug) console.log('Response', data);
    return data;
  } catch (error) {
    if (debug) console.error('Error creating EdgeDB:', error);
    return null;
  }
};

/**
 * Deletes an existing Edge Database.
 * @param {string} token - The authorization token.
 * @param {number} id - The ID of the database to delete.
 * @param {boolean} [debug] - Optional debug flag.
 * @returns {Promise<ApiDeleteDatabaseResponse | null>} The response from the API or null if an error occurs.
 */
const deleteEdgeDatabase = async (
  token: string,
  id: number,
  debug?: boolean,
): Promise<ApiDeleteDatabaseResponse | null> => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    if (debug) console.log('Response:', response);
    return response.json();
  } catch (error) {
    if (debug) console.error('Error deleting EdgeDB:', error);
    return null;
  }
};

/**
 * Executes a query on an Edge Database.
 * @param {string} token - The authorization token.
 * @param {number} id - The ID of the database to query.
 * @param {string[]} statements - The SQL statements to execute.
 * @param {boolean} [debug] - Optional debug flag.
 * @returns {Promise<ApiQueryExecutionResponse | null>} The response from the API or null if an error occurs.
 */
const postQueryEdgeDatabase = async (
  token: string,
  id: number,
  statements: string[],
  debug?: boolean,
): Promise<ApiQueryExecutionResponse | null> => {
  try {
    const response = await fetch(`${BASE_URL}/${id}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ statements }),
    });

    if (!response.ok) {
      if (debug) console.error('Error querying EdgeDB:', response.statusText);
      throw new Error(`Error querying EdgeDB: ${response.statusText}`);
    }

    const json = await response.json();

    if (json.error) {
      if (debug) console.error('Error querying EdgeDB:', json.error);
      throw new Error(json.error);
    }

    if (debug) {
      // limit the size of the array to 10
      const limitedData: ApiQueryExecutionResponse = {
        ...json,
        data: (json as ApiQueryExecutionResponse)?.data?.map((data) => {
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
    return json;
  } catch (error) {
    if (debug) console.error('Error querying EdgeDB:', error);
    throw new Error((error as Error)?.message);
  }
};

/**
 * Retrieves an Edge Database by ID.
 * @param {string} token - The authorization token.
 * @param {number} id - The ID of the database to retrieve.
 * @param {boolean} [debug] - Optional debug flag.
 * @returns {Promise<ApiCreateDatabaseResponse | null>} The response from the API or null if an error occurs.
 */
const getEdgeDatabaseById = async (
  token: string,
  id: number,
  debug?: boolean,
): Promise<ApiCreateDatabaseResponse | null> => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    const database = await response.json();
    if (debug) console.log('Response:', database);
    return database;
  } catch (error) {
    if (debug) console.error('Error getting EdgeDB:', error);
    return null;
  }
};

/**
 * Retrieves a list of Edge Databases.
 * @param {string} token - The authorization token.
 * @param {Partial<AzionDatabaseCollectionOptions>} [params] - Optional query parameters.
 * @param {boolean} [debug] - Optional debug flag.
 * @returns {Promise<ApiListDatabasesResponse | null>} The response from the API or null if an error occurs.
 */
const getEdgeDatabases = async (
  token: string,
  params?: Partial<AzionDatabaseCollectionOptions>,
  debug?: boolean,
): Promise<ApiListDatabasesResponse | null> => {
  try {
    const url = new URL(BASE_URL);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, value.toString());
        }
      });
    }
    const response = await fetch(url?.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    const data = await response.json();
    if (debug) {
      // limit the size of the array to 10
      const limitedData = {
        ...data,
        results: limitArraySize(data.results, 10),
      };
      console.log('Response Databases:', JSON.stringify(limitedData));
    }
    return data;
  } catch (error) {
    if (debug) console.error('Error getting all EdgeDBs:', error);
    return null;
  }
};

export { deleteEdgeDatabase, getEdgeDatabaseById, getEdgeDatabases, postEdgeDatabase, postQueryEdgeDatabase };
