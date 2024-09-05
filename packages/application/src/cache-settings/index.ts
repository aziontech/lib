import { AzionClientOptions, AzionEdgeApplicationCollectionResponse, AzionEdgeApplicationResponse } from '../types';
import { resolveDebug, resolveToken } from '../utils';
import {
  deleteCacheSetting,
  getCacheSetting,
  getCacheSettings,
  patchCacheSetting,
  postCacheSetting,
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
    const apiResponse = await postCacheSetting(
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
    const apiResponse = await getCacheSetting(
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
    const apiResponse = await getCacheSettings(
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
    const apiResponse = await patchCacheSetting(
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
    await deleteCacheSetting(resolveToken(token), edgeApplicationId, cacheSettingId, resolveDebug(options?.debug));
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

export const createCacheSettingWrapper = ({
  applicationId,
  data,
  options,
}: {
  applicationId: number;
  data: ApiBaseCacheSettingPayload;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationResponse<AzionCacheSetting>> =>
  createCacheSettingMethod(resolveToken(), applicationId, data, options);

export const getCacheSettingWrapper = ({
  applicationId,
  cacheSettingId,
  options,
}: {
  applicationId: number;
  cacheSettingId: number;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationResponse<AzionCacheSetting>> =>
  getCacheSettingMethod(resolveToken(), applicationId, cacheSettingId, options);

export const getCacheSettingsWrapper = ({
  applicationId,
  params,
  options,
}: {
  applicationId: number;
  params?: ApiListCacheSettingsParams;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationCollectionResponse<AzionCacheSetting>> =>
  getCacheSettingsMethod(resolveToken(), applicationId, params, options);

export const updateCacheSettingWrapper = ({
  applicationId,
  cacheSettingId,
  data,
  options,
}: {
  applicationId: number;
  cacheSettingId: number;
  data: ApiUpdateCacheSettingPayload;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationResponse<AzionCacheSetting>> =>
  updateCacheSettingMethod(resolveToken(), applicationId, cacheSettingId, data, options);

export const deleteCacheSettingWrapper = ({
  applicationId,
  cacheSettingId,
  options,
}: {
  applicationId: number;
  cacheSettingId: number;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationResponse<void>> =>
  deleteCacheSettingMethod(resolveToken(), applicationId, cacheSettingId, options);
