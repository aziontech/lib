import { fetchWithErrorHandling } from '../../utils';
import {
  ApiCreateFunctionInstancePayload,
  ApiCreateFunctionInstanceResponse,
  ApiDeleteFunctionInstanceResponse,
  ApiGetFunctionInstanceResponse,
  ApiListFunctionInstancesParams,
  ApiListFunctionInstancesResponse,
  ApiUpdateFunctionInstancePayload,
  ApiUpdateFunctionInstanceResponse,
} from './types';

const BASE_URL = 'https://api.azionapi.net/edge_applications';

/**
 * Lists all function instances for an edge application.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {number} Id - ID of the edge application.
 * @param {ApiListFunctionInstancesParams} [params] - Optional parameters for filtering and pagination.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @returns {Promise<ApiListFunctionInstancesResponse>} Array of function instances or an error if retrieval failed.
 */
const listFunctionInstances = async (
  token: string,
  Id: number,
  params?: ApiListFunctionInstancesParams,
  debug?: boolean,
): Promise<ApiListFunctionInstancesResponse> => {
  try {
    const { page = 1, page_size = 10, sort = 'asc', order_by = 'name', filter = '' } = params || {};
    const queryParams = new URLSearchParams({
      page: String(page),
      page_size: String(page_size),
      sort,
      order_by,
      filter,
    });
    const data = await fetchWithErrorHandling(
      `${BASE_URL}/${Id}/functions_instances?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: { Accept: 'application/json; version=3', Authorization: `Token ${token}` },
      },
      debug,
    );
    return data;
  } catch (error) {
    if (debug) console.error('Error listing function instances:', error);
    throw error;
  }
};

/**
 * Retrieves a specific function instance by ID.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {number} Id - ID of the edge application.
 * @param {number} functionInstanceId - ID of the function instance.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @returns {Promise<ApiGetFunctionInstanceResponse>} Function instance data or an error if retrieval failed.
 */
const getFunctionInstanceById = async (
  token: string,
  Id: number,
  functionInstanceId: number,
  debug?: boolean,
): Promise<ApiGetFunctionInstanceResponse> => {
  try {
    const data = await fetchWithErrorHandling(
      `${BASE_URL}/${Id}/functions_instances/${functionInstanceId}`,
      {
        method: 'GET',
        headers: { Accept: 'application/json; version=3', Authorization: `Token ${token}` },
      },
      debug,
    );
    return data;
  } catch (error) {
    if (debug) console.error('Error getting function instance by ID:', error);
    throw error;
  }
};

/**
 * Creates a new function instance for an edge application.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {number} edgeApplicationId - ID of the edge application.
 * @param {ApiCreateFunctionInstancePayload} functionInstanceData - Data of the function instance to be created.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @returns {Promise<ApiCreateFunctionInstanceResponse>} The created function instance or an error if creation failed.
 */
const createFunctionInstance = async (
  token: string,
  edgeApplicationId: number,
  functionInstanceData: ApiCreateFunctionInstancePayload,
  debug?: boolean,
): Promise<ApiCreateFunctionInstanceResponse> => {
  try {
    const data = await fetchWithErrorHandling(
      `${BASE_URL}/${edgeApplicationId}/functions_instances`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json; version=3',
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(functionInstanceData),
      },
      debug,
    );
    if (debug) console.log('Response:', data);
    return data;
  } catch (error) {
    if (debug) console.error('Error creating function instance:', error);
    throw error;
  }
};

/**
 * Updates an existing function instance.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {number} Id - ID of the edge application.
 * @param {number} functionInstanceId - ID of the function instance to update.
 * @param {ApiUpdateFunctionInstancePayload} functionInstanceData - New data for the function instance.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @returns {Promise<ApiUpdateFunctionInstanceResponse>} The updated function instance or an error if update failed.
 */
const updateFunctionInstance = async (
  token: string,
  Id: number,
  functionInstanceId: number,
  functionInstanceData: ApiUpdateFunctionInstancePayload,
  debug?: boolean,
): Promise<ApiUpdateFunctionInstanceResponse> => {
  try {
    const data = await fetchWithErrorHandling(
      `${BASE_URL}/${Id}/functions_instances/${functionInstanceId}`,
      {
        method: 'PATCH',
        headers: {
          Accept: 'application/json; version=3',
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(functionInstanceData),
      },
      debug,
    );
    return data;
  } catch (error) {
    if (debug) console.error('Error updating function instance:', error);
    throw error;
  }
};

/**
 * Deletes a function instance.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {number} edgeApplicationId - ID of the edge application.
 * @param {number} edgeFunctionInstanceId - ID of the function instance to delete.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @returns {Promise<ApiDeleteFunctionInstanceResponse>} Confirmation of deletion or an error if deletion failed.
 */
const deleteFunctionInstance = async (
  token: string,
  edgeApplicationId: number,
  edgeFunctionInstanceId: number,
  debug?: boolean,
): Promise<ApiDeleteFunctionInstanceResponse> => {
  try {
    const data = await fetchWithErrorHandling(
      `${BASE_URL}/${edgeApplicationId}/functions_instances/${edgeFunctionInstanceId}`,
      {
        method: 'DELETE',
        headers: { Accept: 'application/json; version=3', Authorization: `Token ${token}` },
      },
      debug,
    );
    return data;
  } catch (error) {
    if (debug) console.error('Error deleting function instance:', error);
    throw error;
  }
};

export {
  createFunctionInstance,
  deleteFunctionInstance,
  getFunctionInstanceById,
  listFunctionInstances,
  updateFunctionInstance,
};
