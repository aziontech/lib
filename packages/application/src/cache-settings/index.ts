import { AzionClientOptions, AzionEdgeApplicationCollectionResponse, AzionEdgeApplicationResponse } from '../types';
import { resolveDebug, resolveToken } from '../utils';
import {
  createCacheSettingApi,
  deleteCacheSettingApi,
  getCacheSettingByIdApi,
  getCacheSettingsApi,
  updateCacheSettingApi,
} from './services/index';
import { ApiBaseCacheSettingPayload, ApiListCacheSettingsParams, ApiUpdateCacheSettingPayload } from './services/types';
import { AzionCacheSetting } from './types';

const createCacheSettingMethod = async (
  token: string,
  edgeApplicationId: number,
  cacheSettingData: ApiBaseCacheSettingPayload,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse<AzionCacheSetting>> => {
  try {
    const apiResponse = await createCacheSettingApi(
      resolveToken(token),
      edgeApplicationId,
      cacheSettingData,
      resolveDebug(options?.debug),
    );
    return { data: apiResponse.results };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to create cache setting',
        operation: 'create cache setting',
      },
    };
  }
};

const getCacheSettingMethod = async (
  token: string,
  edgeApplicationId: number,
  cacheSettingId: number,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse<AzionCacheSetting>> => {
  try {
    const apiResponse = await getCacheSettingByIdApi(
      resolveToken(token),
      edgeApplicationId,
      cacheSettingId,
      resolveDebug(options?.debug),
    );
    return { data: apiResponse.results };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to get cache setting',
        operation: 'get cache setting',
      },
    };
  }
};

const getCacheSettingsMethod = async (
  token: string,
  edgeApplicationId: number,
  params?: ApiListCacheSettingsParams,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationCollectionResponse<AzionCacheSetting>> => {
  try {
    const apiResponse = await getCacheSettingsApi(
      resolveToken(token),
      edgeApplicationId,
      params,
      resolveDebug(options?.debug),
    );

    const results: AzionCacheSetting[] = apiResponse.results.map((setting) => ({
      ...setting,
    }));

    return {
      data: {
        count: apiResponse.count,
        total_pages: apiResponse.total_pages,
        schema_version: apiResponse.schema_version,
        links: apiResponse.links,
        results, // results do tipo AzionCacheSetting[]
      },
    };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to get cache settings',
        operation: 'get cache settings',
      },
    };
  }
};

const updateCacheSettingMethod = async (
  token: string,
  edgeApplicationId: number,
  cacheSettingId: number,
  cacheSettingData: ApiUpdateCacheSettingPayload,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse<AzionCacheSetting>> => {
  try {
    const apiResponse = await updateCacheSettingApi(
      resolveToken(token),
      edgeApplicationId,
      cacheSettingId,
      cacheSettingData,
      resolveDebug(options?.debug),
    );
    return { data: apiResponse.results };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to update cache setting',
        operation: 'update cache setting',
      },
    };
  }
};

const deleteCacheSettingMethod = async (
  token: string,
  edgeApplicationId: number,
  cacheSettingId: number,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse<void>> => {
  try {
    await deleteCacheSettingApi(resolveToken(token), edgeApplicationId, cacheSettingId, resolveDebug(options?.debug));
    return { data: undefined };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to delete cache setting',
        operation: 'delete cache setting',
      },
    };
  }
};

export const createCacheSetting = (
  edgeApplicationId: number,
  cacheSettingData: ApiBaseCacheSettingPayload,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse<AzionCacheSetting>> =>
  createCacheSettingMethod(resolveToken(), edgeApplicationId, cacheSettingData, options);

export const getCacheSetting = (
  edgeApplicationId: number,
  cacheSettingId: number,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse<AzionCacheSetting>> =>
  getCacheSettingMethod(resolveToken(), edgeApplicationId, cacheSettingId, options);

export const getCacheSettings = (
  edgeApplicationId: number,
  params?: ApiListCacheSettingsParams,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationCollectionResponse<AzionCacheSetting>> =>
  getCacheSettingsMethod(resolveToken(), edgeApplicationId, params, options);

export const updateCacheSetting = (
  edgeApplicationId: number,
  cacheSettingId: number,
  cacheSettingData: ApiUpdateCacheSettingPayload,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse<AzionCacheSetting>> =>
  updateCacheSettingMethod(resolveToken(), edgeApplicationId, cacheSettingId, cacheSettingData, options);

export const deleteCacheSetting = (
  edgeApplicationId: number,
  cacheSettingId: number,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse<void>> =>
  deleteCacheSettingMethod(resolveToken(), edgeApplicationId, cacheSettingId, options);
