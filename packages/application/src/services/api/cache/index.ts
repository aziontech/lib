import {
  ApiCreateCacheSettingRequest,
  ApiCreateCacheSettingResponse,
  ApiDeleteCacheSettingResponse,
  ApiGetCacheSettingResponse,
  ApiListCacheSettingsParams,
  ApiListCacheSettingsResponse,
  ApiUpdateCacheSettingRequest,
  ApiUpdateCacheSettingResponse,
} from './types';

const BASE_URL = 'https://api.azionapi.net/edge_applications';

/**
 * Lists all cache settings for an edge application.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {number} edgeApplicationId - ID of the edge application.
 * @param {ApiListCacheSettingsParams} [params] - Optional parameters for filtering and pagination.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @returns {Promise<ApiListCacheSettingsResponse>} Array of cache settings or an error if retrieval failed.
 */
const getCacheSettings = async (
  token: string,
  edgeApplicationId: number,
  params?: ApiListCacheSettingsParams,
  debug?: boolean,
): Promise<ApiListCacheSettingsResponse> => {
  try {
    const { page = 1, page_size = 10, sort = 'name', order = 'asc' } = params || {};
    const queryParams = new URLSearchParams({
      page: String(page),
      page_size: String(page_size),
      sort,
      order,
    });
    const response = await fetch(`${BASE_URL}/${edgeApplicationId}/cache_settings?${queryParams.toString()}`, {
      method: 'GET',
      headers: { Accept: 'application/json; version=3', Authorization: `Token ${token}` },
    });
    const data = await response.json();
    if (debug) console.log('Response:', data);
    return data;
  } catch (error) {
    if (debug) console.error('Error getting cache settings:', error);
    throw error;
  }
};

/**
 * Retrieves a specific cache setting by ID.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {number} edgeApplicationId - ID of the edge application.
 * @param {number} cacheSettingId - ID of the cache setting.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @returns {Promise<ApiGetCacheSettingResponse>} Cache setting data or an error if retrieval failed.
 */
const getCacheSettingById = async (
  token: string,
  edgeApplicationId: number,
  cacheSettingId: number,
  debug?: boolean,
): Promise<ApiGetCacheSettingResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/${edgeApplicationId}/cache_settings/${cacheSettingId}`, {
      method: 'GET',
      headers: { Accept: 'application/json; version=3', Authorization: `Token ${token}` },
    });
    const data = await response.json();
    if (debug) console.log('Response:', data);
    return data;
  } catch (error) {
    if (debug) console.error('Error getting cache setting by ID:', error);
    throw error;
  }
};

/**
 * Creates a new cache setting for an edge application.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {number} edgeApplicationId - ID of the edge application.
 * @param {ApiCreateCacheSettingRequest} cacheSettingData - Data of the cache setting to be created.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @returns {Promise<ApiCreateCacheSettingResponse>} The created cache setting or an error if creation failed.
 */
const createCacheSetting = async (
  token: string,
  edgeApplicationId: number,
  cacheSettingData: ApiCreateCacheSettingRequest,
  debug?: boolean,
): Promise<ApiCreateCacheSettingResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/${edgeApplicationId}/cache_settings`, {
      method: 'POST',
      headers: {
        Accept: 'application/json; version=3',
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(cacheSettingData),
    });
    const data = await response.json();
    if (debug) console.log('Response:', data);
    return data;
  } catch (error) {
    if (debug) console.error('Error creating cache setting:', error);
    throw error;
  }
};

/**
 * Updates an existing cache setting.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {number} edgeApplicationId - ID of the edge application.
 * @param {number} cacheSettingId - ID of the cache setting to update.
 * @param {ApiUpdateCacheSettingRequest} cacheSettingData - New data for the cache setting.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @returns {Promise<ApiUpdateCacheSettingResponse>} The updated cache setting or an error if update failed.
 */
const updateCacheSetting = async (
  token: string,
  edgeApplicationId: number,
  cacheSettingId: number,
  cacheSettingData: ApiUpdateCacheSettingRequest,
  debug?: boolean,
): Promise<ApiUpdateCacheSettingResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/${edgeApplicationId}/cache_settings/${cacheSettingId}`, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json; version=3',
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(cacheSettingData),
    });
    const data = await response.json();
    if (debug) console.log('Response:', data);
    return data;
  } catch (error) {
    if (debug) console.error('Error updating cache setting:', error);
    throw error;
  }
};

/**
 * Deletes a cache setting.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {number} edgeApplicationId - ID of the edge application.
 * @param {number} cacheSettingId - ID of the cache setting to delete.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @returns {Promise<ApiDeleteCacheSettingResponse>} Confirmation of deletion or an error if deletion failed.
 */
const deleteCacheSetting = async (
  token: string,
  edgeApplicationId: number,
  cacheSettingId: number,
  debug?: boolean,
): Promise<ApiDeleteCacheSettingResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/${edgeApplicationId}/cache_settings/${cacheSettingId}`, {
      method: 'DELETE',
      headers: { Accept: 'application/json; version=3', Authorization: `Token ${token}` },
    });
    const data = await response.json();
    if (debug) console.log('Response:', data);
    return data;
  } catch (error) {
    if (debug) console.error('Error deleting cache setting:', error);
    throw error;
  }
};

export { createCacheSetting, deleteCacheSetting, getCacheSettingById, getCacheSettings, updateCacheSetting };
