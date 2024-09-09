import {
  ApiCreateDeviceGroupPayload,
  ApiCreateDeviceGroupResponse,
  ApiDeleteDeviceGroupResponse,
  ApiGetDeviceGroupResponse,
  ApiListDeviceGroupsParams,
  ApiListDeviceGroupsResponse,
  ApiUpdateDeviceGroupPayload,
  ApiUpdateDeviceGroupResponse,
} from './types';

const BASE_URL = 'https://api.azionapi.net/edge_applications';

/**
 * Lists all device groups for an edge application.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {number} Id - ID of the edge application.
 * @param {ApiListDeviceGroupsParams} [params] - Optional parameters for filtering and pagination.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @returns {Promise<ApiListDeviceGroupsResponse>} Array of device groups or an error if retrieval failed.
 */
const getDeviceGroups = async (
  token: string,
  Id: number,
  params?: ApiListDeviceGroupsParams,
  debug?: boolean,
): Promise<ApiListDeviceGroupsResponse> => {
  try {
    const { page = 1, page_size = 10, sort = 'name', order = 'asc' } = params || {};
    const queryParams = new URLSearchParams({
      page: String(page),
      page_size: String(page_size),
      sort,
      order,
    });
    const response = await fetch(`${BASE_URL}/${Id}/device_groups?${queryParams.toString()}`, {
      method: 'GET',
      headers: { Accept: 'application/json; version=3', Authorization: `Token ${token}` },
    });
    const data = await response.json();
    if (debug) console.log('Response:', data);
    return data;
  } catch (error) {
    if (debug) console.error('Error getting device groups:', error);
    throw error;
  }
};

/**
 * Retrieves a specific device group by ID.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {number} Id - ID of the edge application.
 * @param {number} deviceGroupId - ID of the device group.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @returns {Promise<ApiGetDeviceGroupResponse>} Device group data or an error if retrieval failed.
 */
const getDeviceGroupById = async (
  token: string,
  Id: number,
  deviceGroupId: number,
  debug?: boolean,
): Promise<ApiGetDeviceGroupResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/${Id}/device_groups/${deviceGroupId}`, {
      method: 'GET',
      headers: { Accept: 'application/json; version=3', Authorization: `Token ${token}` },
    });
    const data = await response.json();
    if (debug) console.log('Response:', data);
    return data;
  } catch (error) {
    if (debug) console.error('Error getting device group by ID:', error);
    throw error;
  }
};

/**
 * Creates a new device group for an edge application.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {number} Id - ID of the edge application.
 * @param {ApiCreateDeviceGroupPayload} deviceGroupData - Data of the device group to be created.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @returns {Promise<ApiCreateDeviceGroupResponse>} The created device group or an error if creation failed.
 */
const createDeviceGroup = async (
  token: string,
  Id: number,
  deviceGroupData: ApiCreateDeviceGroupPayload,
  debug?: boolean,
): Promise<ApiCreateDeviceGroupResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/${Id}/device_groups`, {
      method: 'POST',
      headers: {
        Accept: 'application/json; version=3',
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(deviceGroupData),
    });
    const data = await response.json();
    if (debug) console.log('Response:', data);
    return data;
  } catch (error) {
    if (debug) console.error('Error creating device group:', error);
    throw error;
  }
};

/**
 * Updates an existing device group.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {number} Id - ID of the edge application.
 * @param {number} deviceGroupId - ID of the device group to update.
 * @param {ApiUpdateDeviceGroupPayload} deviceGroupData - New data for the device group.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @returns {Promise<ApiUpdateDeviceGroupResponse>} The updated device group or an error if update failed.
 */
const updateDeviceGroup = async (
  token: string,
  Id: number,
  deviceGroupId: number,
  deviceGroupData: ApiUpdateDeviceGroupPayload,
  debug?: boolean,
): Promise<ApiUpdateDeviceGroupResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/${Id}/device_groups/${deviceGroupId}`, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json; version=3',
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(deviceGroupData),
    });
    const data = await response.json();
    if (debug) console.log('Response:', data);
    return data;
  } catch (error) {
    if (debug) console.error('Error updating device group:', error);
    throw error;
  }
};

/**
 * Deletes a device group.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {number} Id - ID of the edge application.
 * @param {number} deviceGroupId - ID of the device group to delete.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @returns {Promise<ApiDeleteDeviceGroupResponse>} Confirmation of deletion or an error if deletion failed.
 */
const deleteDeviceGroup = async (
  token: string,
  Id: number,
  deviceGroupId: number,
  debug?: boolean,
): Promise<ApiDeleteDeviceGroupResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/${Id}/device_groups/${deviceGroupId}`, {
      method: 'DELETE',
      headers: { Accept: 'application/json; version=3', Authorization: `Token ${token}` },
    });
    const data = await response.json();
    if (debug) console.log('Response:', data);
    return data;
  } catch (error) {
    if (debug) console.error('Error deleting device group:', error);
    throw error;
  }
};

export { createDeviceGroup, deleteDeviceGroup, getDeviceGroupById, getDeviceGroups, updateDeviceGroup };
