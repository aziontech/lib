import { fetchWithErrorHandling } from '../../utils';
import {
  ApiCreateOriginPayload,
  ApiCreateOriginResponse,
  ApiDeleteOriginResponse,
  ApiGetOriginResponse,
  ApiListOriginsParams,
  ApiListOriginsResponse,
  ApiUpdateOriginRequest,
  ApiUpdateOriginResponse,
} from './types';

const BASE_URL = 'https://api.azionapi.net/edge_applications';

/**
 * Lists all origins for an edge application.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {number} Id - ID of the edge application.
 * @param {ApiListOriginsParams} [params] - Optional parameters for filtering and pagination.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @returns {Promise<ApiListOriginsResponse>} Array of origins or an error if retrieval failed.
 */
const listOrigins = async (
  token: string,
  Id: number,
  params?: ApiListOriginsParams,
  debug?: boolean,
): Promise<ApiListOriginsResponse> => {
  try {
    const { page = 1, page_size = 10, sort = 'name', order = 'asc', filter = '' } = params || {};
    const queryParams = new URLSearchParams({
      page: String(page),
      page_size: String(page_size),
      sort,
      order,
      filter,
    });
    const data = await fetchWithErrorHandling(
      `${BASE_URL}/${Id}/origins?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: { Accept: 'application/json; version=3', Authorization: `Token ${token}` },
      },
      debug,
    );
    return data;
  } catch (error) {
    if (debug) console.error('Error listing origins:', error);
    throw error;
  }
};

/**
 * Retrieves a specific origin by key.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {number} Id - ID of the edge application.
 * @param {string} originKey - Key of the origin.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @returns {Promise<ApiGetOriginResponse>} Origin data or an error if retrieval failed.
 */
const getOriginByKey = async (
  token: string,
  Id: number,
  originKey: string,
  debug?: boolean,
): Promise<ApiGetOriginResponse> => {
  try {
    const data = await fetchWithErrorHandling(
      `${BASE_URL}/${Id}/origins/${originKey}`,
      {
        method: 'GET',
        headers: { Accept: 'application/json; version=3', Authorization: `Token ${token}` },
      },
      debug,
    );
    return data;
  } catch (error) {
    if (debug) console.error('Error getting origin by key:', error);
    throw error;
  }
};

/**
 * Creates a new origin for an edge application.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {number} Id - ID of the edge application.
 * @param {ApiCreateOriginPayload} originData - Data of the origin to be created.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @returns {Promise<ApiCreateOriginResponse>} The created origin or an error if creation failed.
 */
const createOrigin = async (
  token: string,
  Id: number,
  originData: ApiCreateOriginPayload,
  debug?: boolean,
): Promise<ApiCreateOriginResponse> => {
  try {
    const data = await fetchWithErrorHandling(
      `${BASE_URL}/${Id}/origins`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json; version=3',
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(originData),
      },
      debug,
    );
    return data;
  } catch (error) {
    if (debug) console.error('Error creating origin:', error);
    throw error;
  }
};

/**
 * Updates an existing origin.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {number} Id - ID of the edge application.
 * @param {string} originKey - Key of the origin to update.
 * @param {ApiUpdateOriginRequest} originData - New data for the origin.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @returns {Promise<ApiUpdateOriginResponse>} The updated origin or an error if update failed.
 */
const updateOrigin = async (
  token: string,
  Id: number,
  originKey: string,
  originData: ApiUpdateOriginRequest,
  debug?: boolean,
): Promise<ApiUpdateOriginResponse> => {
  try {
    const data = await fetchWithErrorHandling(
      `${BASE_URL}/${Id}/origins/${originKey}`,
      {
        method: 'PATCH',
        headers: {
          Accept: 'application/json; version=3',
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(originData),
      },
      debug,
    );
    return data;
  } catch (error) {
    if (debug) console.error('Error updating origin:', error);
    throw error;
  }
};

/**
 * Deletes an origin.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {number} Id - ID of the edge application.
 * @param {string} originKey - Key of the origin to delete.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @returns {Promise<ApiDeleteOriginResponse>} Confirmation of deletion or an error if deletion failed.
 */
const deleteOrigin = async (
  token: string,
  Id: number,
  originKey: string,
  debug?: boolean,
): Promise<ApiDeleteOriginResponse> => {
  try {
    const data = await fetchWithErrorHandling(
      `${BASE_URL}/${Id}/origins/${originKey}`,
      {
        method: 'DELETE',
        headers: { Accept: 'application/json; version=3', Authorization: `Token ${token}` },
      },
      debug,
    );
    return data;
  } catch (error) {
    if (debug) console.error('Error deleting origin:', error);
    throw error;
  }
};

export { createOrigin, deleteOrigin, getOriginByKey, listOrigins, updateOrigin };
