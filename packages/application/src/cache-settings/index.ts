import { AzionApplicationCollectionResponse, AzionApplicationResponse, AzionClientOptions } from '../types';
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

/**
 * Creates a new cache setting for a specific application.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {number} Id - Application ID.
 * @param {ApiBaseCacheSettingPayload} cacheSettingData - Data for the cache setting to be created.
 * @param {AzionClientOptions} [options] - Client options including debug mode.
 * @returns {Promise<AzionApplicationResponse<AzionCacheSetting>>} The created cache setting or an error.
 */
export const createCacheSettingMethod = async (
  token: string,
  Id: number,
  cacheSettingData: ApiBaseCacheSettingPayload,
  options?: AzionClientOptions,
): Promise<AzionApplicationResponse<AzionCacheSetting>> => {
  try {
    const apiResponse = await postCacheSetting(resolveToken(token), Id, cacheSettingData, resolveDebug(options?.debug));
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

/**
 * Retrieves a specific cache setting from an application.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {number} Id - Application ID.
 * @param {number} cacheSettingId - Cache setting ID.
 * @param {AzionClientOptions} [options] - Client options including debug mode.
 * @returns {Promise<AzionApplicationResponse<AzionCacheSetting>>} The retrieved cache setting or an error.
 */
export const getCacheSettingMethod = async (
  token: string,
  Id: number,
  cacheSettingId: number,
  options?: AzionClientOptions,
): Promise<AzionApplicationResponse<AzionCacheSetting>> => {
  try {
    const apiResponse = await getCacheSetting(resolveToken(token), Id, cacheSettingId, resolveDebug(options?.debug));
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

/**
 * Retrieves a list of cache settings for a specific application.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {number} Id - Application ID.
 * @param {ApiListCacheSettingsParams} [params] - Parameters for listing cache settings.
 * @param {AzionClientOptions} [options] - Client options including debug mode.
 * @returns {Promise<AzionApplicationCollectionResponse<AzionCacheSetting>>} A collection of cache settings or an error.
 */
export const getCacheSettingsMethod = async (
  token: string,
  Id: number,
  params?: ApiListCacheSettingsParams,
  options?: AzionClientOptions,
): Promise<AzionApplicationCollectionResponse<AzionCacheSetting>> => {
  try {
    const apiResponse = await getCacheSettings(resolveToken(token), Id, params, resolveDebug(options?.debug));

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

/**
 * Updates an existing cache setting for a specific application.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {number} Id - Application ID.
 * @param {number} cacheSettingId - Cache setting ID to update.
 * @param {ApiUpdateCacheSettingPayload} cacheSettingData - Updated data for the cache setting.
 * @param {AzionClientOptions} [options] - Client options including debug mode.
 * @returns {Promise<AzionApplicationResponse<AzionCacheSetting>>} The updated cache setting or an error.
 */
export const updateCacheSettingMethod = async (
  token: string,
  Id: number,
  cacheSettingId: number,
  cacheSettingData: ApiUpdateCacheSettingPayload,
  options?: AzionClientOptions,
): Promise<AzionApplicationResponse<AzionCacheSetting>> => {
  try {
    const apiResponse = await patchCacheSetting(
      resolveToken(token),
      Id,
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

/**
 * Deletes a specific cache setting from an application.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {number} Id - Application ID.
 * @param {number} cacheSettingId - Cache setting ID to delete.
 * @param {AzionClientOptions} [options] - Client options including debug mode.
 * @returns {Promise<AzionApplicationResponse<void>>} A response indicating success or an error.
 */
export const deleteCacheSettingMethod = async (
  token: string,
  Id: number,
  cacheSettingId: number,
  options?: AzionClientOptions,
): Promise<AzionApplicationResponse<void>> => {
  try {
    await deleteCacheSetting(resolveToken(token), Id, cacheSettingId, resolveDebug(options?.debug));
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

/**
 * Wrapper function to create a new cache setting for a specific application.
 *
 * @param {Object} params - Parameters for creating a cache setting.
 * @param {number} params.applicationId - Application ID.
 * @param {ApiBaseCacheSettingPayload} params.data - Data for the cache setting to be created.
 * @param {AzionClientOptions} [params.options] - Client options including debug mode.
 * @returns {Promise<AzionApplicationResponse<AzionCacheSetting>>} The created cache setting or an error.
 *
 * @example
 * const result = await createCacheSetting({
 *   applicationId: 1234,
 *   data: { name: 'My Cache Setting', browser_cache_settings: 'override' },
 *   options: { debug: true }
 * });
 * if (result.data) {
 *   console.log(`Cache setting created: ${result.data.name}`);
 * } else {
 *   console.error('Failed to create cache setting:', result.error);
 * }
 */
export const createCacheSettingWrapper = ({
  applicationId,
  data,
  options,
}: {
  applicationId: number;
  data: ApiBaseCacheSettingPayload;
  options?: AzionClientOptions;
}): Promise<AzionApplicationResponse<AzionCacheSetting>> =>
  createCacheSettingMethod(resolveToken(), applicationId, data, options);

/**
 * Function to retrieve a specific cache setting from an application.
 *
 * @param {Object} params - Parameters for retrieving a cache setting.
 * @param {number} params.applicationId - Application ID.
 * @param {number} params.cacheSettingId - Cache setting ID.
 * @param {AzionClientOptions} [params.options] - Client options including debug mode.
 * @returns {Promise<AzionApplicationResponse<AzionCacheSetting>>} The retrieved cache setting or an error.
 *
 * @example
 * const result = await getCacheSetting({
 *   applicationId: 1234,
 *   cacheSettingId: 5678,
 *   options: { debug: true }
 * });
 * if (result.data) {
 *   console.log(`Retrieved cache setting: ${result.data.name}`);
 * } else {
 *   console.error('Failed to get cache setting:', result.error);
 * }
 */
export const getCacheSettingWrapper = ({
  applicationId,
  cacheSettingId,
  options,
}: {
  applicationId: number;
  cacheSettingId: number;
  options?: AzionClientOptions;
}): Promise<AzionApplicationResponse<AzionCacheSetting>> =>
  getCacheSettingMethod(resolveToken(), applicationId, cacheSettingId, options);

/**
 * Wrapper function to retrieve a list of cache settings for a specific application.
 *
 * @param {Object} params - Parameters for listing cache settings.
 * @param {number} params.applicationId - Application ID.
 * @param {ApiListCacheSettingsParams} [params.params] - Parameters for filtering and pagination.
 * @param {AzionClientOptions} [params.options] - Client options including debug mode.
 * @returns {Promise<AzionApplicationCollectionResponse<AzionCacheSetting>>} A collection of cache settings or an error.
 *
 * @example
 * const result = await getCacheSettings({
 *   applicationId: 1234,
 *   params: { page: 1, page_size: 20 },
 *   options: { debug: true }
 * });
 * if (result.data) {
 *   console.log(`Retrieved ${result.data.results.length} cache settings`);
 * } else {
 *   console.error('Failed to get cache settings:', result.error);
 * }
 */
export const getCacheSettingsWrapper = ({
  applicationId,
  params,
  options,
}: {
  applicationId: number;
  params?: ApiListCacheSettingsParams;
  options?: AzionClientOptions;
}): Promise<AzionApplicationCollectionResponse<AzionCacheSetting>> =>
  getCacheSettingsMethod(resolveToken(), applicationId, params, options);

/**
 * Wrapper function to update an existing cache setting for a specific application.
 *
 * @param {Object} params - Parameters for updating a cache setting.
 * @param {number} params.applicationId - Application ID.
 * @param {number} params.cacheSettingId - Cache setting ID to update.
 * @param {ApiUpdateCacheSettingPayload} params.data - Updated data for the cache setting.
 * @param {AzionClientOptions} [params.options] - Client options including debug mode.
 * @returns {Promise<AzionApplicationResponse<AzionCacheSetting>>} The updated cache setting or an error.
 *
 * @example
 * const result = await updateCacheSetting({
 *   applicationId: 1234,
 *   cacheSettingId: 5678,
 *   data: { name: 'Updated Cache Setting' },
 *   options: { debug: true }
 * });
 * if (result.data) {
 *   console.log(`Updated cache setting: ${result.data.name}`);
 * } else {
 *   console.error('Failed to update cache setting:', result.error);
 * }
 */
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
}): Promise<AzionApplicationResponse<AzionCacheSetting>> =>
  updateCacheSettingMethod(resolveToken(), applicationId, cacheSettingId, data, options);

/**
 * Wrapper function to delete a specific cache setting from an application.
 *
 * @param {Object} params - Parameters for deleting a cache setting.
 * @param {number} params.applicationId - Application ID.
 * @param {number} params.cacheSettingId - Cache setting ID to delete.
 * @param {AzionClientOptions} [params.options] - Client options including debug mode.
 * @returns {Promise<AzionApplicationResponse<void>>} A response indicating success or an error.
 *
 * @example
 * const result = await deleteCacheSetting({
 *   applicationId: 1234,
 *   cacheSettingId: 5678,
 *   options: { debug: true }
 * });
 * if (result.data !== undefined) {
 *   console.log('Cache setting deleted successfully');
 * } else {
 *   console.error('Failed to delete cache setting:', result.error);
 * }
 */
export const deleteCacheSettingWrapper = ({
  applicationId,
  cacheSettingId,
  options,
}: {
  applicationId: number;
  cacheSettingId: number;
  options?: AzionClientOptions;
}): Promise<AzionApplicationResponse<void>> =>
  deleteCacheSettingMethod(resolveToken(), applicationId, cacheSettingId, options);
