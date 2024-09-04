import {
  ApiCreateCacheSettingPayload,
  ApiCreateCacheSettingResponse,
  ApiDeleteCacheSettingResponse,
  ApiGetCacheSettingResponse,
  ApiListCacheSettingsParams,
  ApiListCacheSettingsResponse,
  ApiUpdateCacheSettingPayload,
  ApiUpdateCacheSettingResponse,
} from './types';

const BASE_URL = 'https://api.azionapi.net/edge_applications';

export const getCacheSettingsApi = async (
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

export const getCacheSettingByIdApi = async (
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

export const createCacheSettingApi = async (
  token: string,
  edgeApplicationId: number,
  cacheSettingData: ApiCreateCacheSettingPayload,
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

export const updateCacheSettingApi = async (
  token: string,
  edgeApplicationId: number,
  cacheSettingId: number,
  cacheSettingData: ApiUpdateCacheSettingPayload,
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

export const deleteCacheSettingApi = async (
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