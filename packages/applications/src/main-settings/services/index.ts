import { fetchWithErrorHandling } from '../../utils';
import {
  ApiCreateApplicationPayload,
  ApiCreateApplicationResponse,
  ApiDeleteApplicationResponse,
  ApiGetApplicationResponse,
  ApiListApplicationsParams,
  ApiListApplicationsResponse,
  ApiUpdateApplicationPayload,
  ApiUpdateApplicationResponse,
} from './types';

const BASE_URL = 'https://api.azionapi.net/edge_applications';

/**
 * Lists all edge applications with optional filtering and pagination.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {ApiListApplicationsParams} [params] - Optional parameters for filtering and pagination.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @returns {Promise<ApiListApplicationsResponse>} Array of applications or an error if retrieval failed.
 */
const getApplications = async (
  token: string,
  params?: ApiListApplicationsParams,
  debug?: boolean,
): Promise<ApiListApplicationsResponse> => {
  try {
    const { order_by = 'name', sort = 'asc', page = 1, page_size = 10 } = params || {};
    const queryParams = new URLSearchParams({
      order_by,
      sort,
      page: String(page),
      page_size: String(page_size),
    });
    const data = await fetchWithErrorHandling(
      `${BASE_URL}?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: { Accept: 'application/json; version=3', Authorization: `Token ${token}` },
      },
      debug,
    );
    return data;
  } catch (error) {
    if (debug) console.error('Error getting all applications:', error);
    throw error;
  }
};

/**
 * Retrieves edge application settings by ID.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {number} Id - ID of the edge application.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @returns {Promise<ApiGetApplicationResponse>} Application data or an error if retrieval failed.
 */
const getApplicationById = async (token: string, Id: number, debug?: boolean): Promise<ApiGetApplicationResponse> => {
  try {
    const data = await fetchWithErrorHandling(
      `${BASE_URL}/${Id}`,
      {
        method: 'GET',
        headers: { Accept: 'application/json; version=3', Authorization: `Token ${token}` },
      },
      debug,
    );
    return data;
  } catch (error) {
    if (debug) console.error('Error getting application by ID:', error);
    throw error;
  }
};

/**
 * Creates a new edge application.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {ApiCreateApplicationPayload} applicationData - Data of the application to be created.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @returns {Promise<ApiCreateApplicationResponse>} The created application or an error if creation failed.
 */
const postApplication = async (
  token: string,
  applicationData: ApiCreateApplicationPayload,
  debug?: boolean,
): Promise<ApiCreateApplicationResponse> => {
  try {
    const data = await fetchWithErrorHandling(
      BASE_URL,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json; version=3',
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(applicationData),
      },
      debug,
    );
    return data;
  } catch (error) {
    if (debug) console.error('Error creating application:', error);
    throw error;
  }
};

/**
 * Overwrites edge application settings.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {number} Id - ID of the edge application to update.
 * @param {ApiUpdateApplicationPayload} applicationData - New data for the application.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @returns {Promise<ApiUpdateApplicationResponse>} The updated application or an error if update failed.
 */
const putApplication = async (
  token: string,
  Id: number,
  applicationData: ApiUpdateApplicationPayload,
  debug?: boolean,
): Promise<ApiUpdateApplicationResponse> => {
  try {
    const data = await fetchWithErrorHandling(
      `${BASE_URL}/${Id}`,
      {
        method: 'PUT',
        headers: {
          Accept: 'application/json; version=3',
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(applicationData),
      },
      debug,
    );
    return data;
  } catch (error) {
    if (debug) console.error('Error updating application:', error);
    throw error;
  }
};

/**
 * Partially updates edge application settings.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {number} Id - ID of the edge application to update.
 * @param {Partial<ApiUpdateApplicationPayload>} applicationData - Partial data for the application update.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @returns {Promise<ApiUpdateApplicationResponse>} The updated application or an error if update failed.
 */
const patchApplication = async (
  token: string,
  Id: number,
  applicationData: Partial<ApiUpdateApplicationPayload>,
  debug?: boolean,
): Promise<ApiUpdateApplicationResponse> => {
  try {
    const data = await fetchWithErrorHandling(
      `${BASE_URL}/${Id}`,
      {
        method: 'PATCH',
        headers: {
          Accept: 'application/json; version=3',
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(applicationData),
      },
      debug,
    );
    return data;
  } catch (error) {
    if (debug) console.error('Error patching application:', error);
    throw error;
  }
};

/**
 * Deletes an edge application.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {number} Id - ID of the edge application to delete.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @returns {Promise<ApiDeleteApplicationResponse>} Confirmation of deletion or an error if deletion failed.
 */
const deleteApplication = async (token: string, Id: number, debug?: boolean): Promise<ApiDeleteApplicationResponse> => {
  try {
    const data = await fetchWithErrorHandling(
      `${BASE_URL}/${Id}`,
      {
        method: 'DELETE',
        headers: { Accept: 'application/json; version=3', Authorization: `Token ${token}` },
      },
      debug,
    );
    return data;
  } catch (error) {
    if (debug) console.error('Error deleting application:', error);
    throw error;
  }
};

export { deleteApplication, getApplicationById, getApplications, patchApplication, postApplication, putApplication };
