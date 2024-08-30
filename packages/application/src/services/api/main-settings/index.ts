import {
  ApiCreateApplicationRequest,
  ApiCreateApplicationResponse,
  ApiDeleteApplicationResponse,
  ApiGetApplicationResponse,
  ApiListApplicationsParams,
  ApiListApplicationsResponse,
  ApiUpdateApplicationRequest,
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
    const response = await fetch(`${BASE_URL}?${queryParams.toString()}`, {
      method: 'GET',
      headers: { Accept: 'application/json; version=3', Authorization: `Token ${token}` },
    });
    const data = await response.json();
    if (debug) console.log('Response:', data);
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
 * @param {number} edgeApplicationId - ID of the edge application.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @returns {Promise<ApiGetApplicationResponse>} Application data or an error if retrieval failed.
 */
const getApplicationById = async (
  token: string,
  edgeApplicationId: number,
  debug?: boolean,
): Promise<ApiGetApplicationResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/${edgeApplicationId}`, {
      method: 'GET',
      headers: { Accept: 'application/json; version=3', Authorization: `Token ${token}` },
    });
    const data = await response.json();
    if (debug) console.log('Response:', data);
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
 * @param {ApiCreateApplicationRequest} applicationData - Data of the application to be created.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @returns {Promise<ApiCreateApplicationResponse>} The created application or an error if creation failed.
 */
const createApplication = async (
  token: string,
  applicationData: ApiCreateApplicationRequest,
  debug?: boolean,
): Promise<ApiCreateApplicationResponse> => {
  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json; version=3',
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(applicationData),
    });
    const data = await response.json();
    if (debug) console.log('Response:', data);
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
 * @param {number} edgeApplicationId - ID of the edge application to update.
 * @param {ApiUpdateApplicationRequest} applicationData - New data for the application.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @returns {Promise<ApiUpdateApplicationResponse>} The updated application or an error if update failed.
 */
const updateApplication = async (
  token: string,
  edgeApplicationId: number,
  applicationData: ApiUpdateApplicationRequest,
  debug?: boolean,
): Promise<ApiUpdateApplicationResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/${edgeApplicationId}`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json; version=3',
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(applicationData),
    });
    const data = await response.json();
    if (debug) console.log('Response:', data);
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
 * @param {number} edgeApplicationId - ID of the edge application to update.
 * @param {Partial<ApiUpdateApplicationRequest>} applicationData - Partial data for the application update.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @returns {Promise<ApiUpdateApplicationResponse>} The updated application or an error if update failed.
 */
const patchApplication = async (
  token: string,
  edgeApplicationId: number,
  applicationData: Partial<ApiUpdateApplicationRequest>,
  debug?: boolean,
): Promise<ApiUpdateApplicationResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/${edgeApplicationId}`, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json; version=3',
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(applicationData),
    });
    const data = await response.json();
    if (debug) console.log('Response:', data);
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
 * @param {number} edgeApplicationId - ID of the edge application to delete.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @returns {Promise<ApiDeleteApplicationResponse>} Confirmation of deletion or an error if deletion failed.
 */
const deleteApplication = async (
  token: string,
  edgeApplicationId: number,
  debug?: boolean,
): Promise<ApiDeleteApplicationResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/${edgeApplicationId}`, {
      method: 'DELETE',
      headers: { Accept: 'application/json; version=3', Authorization: `Token ${token}` },
    });
    const data = await response.json();
    if (debug) console.log('Response:', data);
    return data;
  } catch (error) {
    if (debug) console.error('Error deleting application:', error);
    throw error;
  }
};

export {
  createApplication,
  deleteApplication,
  getApplicationById,
  getApplications,
  patchApplication,
  updateApplication,
};
