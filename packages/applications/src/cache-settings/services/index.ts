import { fetchWithErrorHandling } from '../../utils';
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

export const getCacheSettings = async (
  token: string,
  Id: number,
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
    const data = await fetchWithErrorHandling(
      `${BASE_URL}/${Id}/cache_settings?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: { Accept: 'application/json; version=3', Authorization: `Token ${token}` },
      },
      debug,
    );
    return data;
  } catch (error) {
    if (debug) console.error('Error getting cache settings:', error);
    throw error;
  }
};

export const getCacheSetting = async (
  token: string,
  Id: number,
  cacheSettingId: number,
  debug?: boolean,
): Promise<ApiGetCacheSettingResponse> => {
  try {
    const data = await fetchWithErrorHandling(
      `${BASE_URL}/${Id}/cache_settings/${cacheSettingId}`,
      {
        method: 'GET',
        headers: { Accept: 'application/json; version=3', Authorization: `Token ${token}` },
      },
      debug,
    );
    return data;
  } catch (error) {
    if (debug) console.error('Error getting cache setting by ID:', error);
    throw error;
  }
};

export const postCacheSetting = async (
  token: string,
  Id: number,
  cacheSettingData: ApiCreateCacheSettingPayload,
  debug?: boolean,
): Promise<ApiCreateCacheSettingResponse> => {
  try {
    const data = await fetchWithErrorHandling(
      `${BASE_URL}/${Id}/cache_settings`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json; version=3',
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(cacheSettingData),
      },
      debug,
    );
    return data;
  } catch (error) {
    if (debug) console.error('Error creating cache setting:', error);
    throw error;
  }
};

export const patchCacheSetting = async (
  token: string,
  Id: number,
  cacheSettingId: number,
  cacheSettingData: ApiUpdateCacheSettingPayload,
  debug?: boolean,
): Promise<ApiUpdateCacheSettingResponse> => {
  try {
    const data = await fetchWithErrorHandling(
      `${BASE_URL}/${Id}/cache_settings/${cacheSettingId}`,
      {
        method: 'PATCH',
        headers: {
          Accept: 'application/json; version=3',
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(cacheSettingData),
      },
      debug,
    );
    return data;
  } catch (error) {
    if (debug) console.error('Error updating cache setting:', error);
    throw error;
  }
};

export const deleteCacheSetting = async (
  token: string,
  Id: number,
  cacheSettingId: number,
  debug?: boolean,
): Promise<ApiDeleteCacheSettingResponse> => {
  try {
    const data = await fetchWithErrorHandling(
      `${BASE_URL}/${Id}/cache_settings/${cacheSettingId}`,
      {
        method: 'DELETE',
        headers: { Accept: 'application/json; version=3', Authorization: `Token ${token}` },
      },
      debug,
    );
    return data;
  } catch (error) {
    if (debug) console.error('Error deleting cache setting:', error);
    throw error;
  }
};
