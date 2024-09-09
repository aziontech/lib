import { AzionApplicationCollectionResponse, AzionApplicationResponse, AzionClientOptions } from '../types';
import { resolveDebug, resolveToken } from '../utils';
import { createOrigin, deleteOrigin, getOriginByKey, listOrigins, updateOrigin } from './services/index';
import { ApiCreateOriginPayload, ApiListOriginsParams, ApiUpdateOriginRequest } from './services/types';
import { AzionOrigin } from './types';

export const createOriginMethod = async (
  token: string,
  Id: number,
  originData: ApiCreateOriginPayload,
  options?: AzionClientOptions,
): Promise<AzionApplicationResponse<AzionOrigin>> => {
  try {
    const { results } = await createOrigin(token, Id, originData, resolveDebug(options?.debug));
    return { data: results };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to create origin',
        operation: 'create origin',
      },
    };
  }
};

export const deleteOriginMethod = async (
  token: string,
  Id: number,
  originKey: string,
  options?: AzionClientOptions,
): Promise<AzionApplicationResponse<void>> => {
  try {
    await deleteOrigin(token, Id, originKey, resolveDebug(options?.debug));
    return { data: undefined };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to delete origin',
        operation: 'delete origin',
      },
    };
  }
};

export const getOriginMethod = async (
  token: string,
  Id: number,
  originKey: string,
  options?: AzionClientOptions,
): Promise<AzionApplicationResponse<AzionOrigin>> => {
  try {
    const { results } = await getOriginByKey(token, Id, originKey, resolveDebug(options?.debug));
    return { data: results };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to get origin',
        operation: 'get origin',
      },
    };
  }
};

export const getOriginsMethod = async (
  token: string,
  Id: number,
  params?: ApiListOriginsParams,
  options?: AzionClientOptions,
): Promise<AzionApplicationCollectionResponse<AzionOrigin>> => {
  try {
    const data = await listOrigins(token, Id, params, resolveDebug(options?.debug));
    return { data };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to get origins',
        operation: 'get origins',
      },
    };
  }
};

export const updateOriginMethod = async (
  token: string,
  Id: number,
  originKey: string,
  originData: ApiUpdateOriginRequest,
  options?: AzionClientOptions,
): Promise<AzionApplicationResponse<AzionOrigin>> => {
  try {
    const { results } = await updateOrigin(token, Id, originKey, originData, resolveDebug(options?.debug));
    return { data: results };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to update origin',
        operation: 'update origin',
      },
    };
  }
};

/**
 * Creates a new origin for a specific application.
 *
 * @param {Object} params - Parameters for creating an origin.
 * @param {number} params.applicationId - Application ID.
 * @param {ApiCreateOriginPayload} params.data - Data for the origin to be created.
 * @param {AzionClientOptions} [params.options] - Client options including debug mode.
 * @returns {Promise<AzionApplicationResponse<AzionOrigin>>} The created origin or an error.
 *
 * @example
 * const { error, data } = await createOrigin({
 *   applicationId: 1234,
 *   data: {
 *     name: 'My New Origin',
 *     addresses: [{ address: 'example.com' }],
 *     origin_type: 'single_origin'
 *   },
 *   options: { debug: true }
 * });
 * if (error) {
 *   console.error('Failed to create origin:', error);
 * } else {
 *   console.log('Origin created:', data);
 * }
 */
export const createOriginWrapper = ({
  applicationId,
  data,
  options,
}: {
  applicationId: number;
  data: ApiCreateOriginPayload;
  options?: AzionClientOptions;
}): Promise<AzionApplicationResponse<AzionOrigin>> => createOriginMethod(resolveToken(), applicationId, data, options);

/**
 * Deletes a specific origin from an application.
 *
 * @param {Object} params - Parameters for deleting an origin.
 * @param {number} params.applicationId - Application ID.
 * @param {string} params.originKey - Key of the origin to delete.
 * @param {AzionClientOptions} [params.options] - Client options including debug mode.
 * @returns {Promise<AzionApplicationResponse<void>>} A response indicating success or an error.
 *
 * @example
 * const { error, data } = await deleteOrigin({
 *   applicationId: 1234,
 *   originKey: 'origin-key',
 *   options: { debug: true }
 * });
 * if (error) {
 *   console.error('Failed to delete origin:', error);
 * } else {
 *   console.log('Origin deleted successfully');
 * }
 */
export const deleteOriginWrapper = ({
  applicationId,
  originKey,
  options,
}: {
  applicationId: number;
  originKey: string;
  options?: AzionClientOptions;
}): Promise<AzionApplicationResponse<void>> => deleteOriginMethod(resolveToken(), applicationId, originKey, options);

/**
 * Retrieves a specific origin from an application.
 *
 * @param {Object} params - Parameters for retrieving an origin.
 * @param {number} params.applicationId - Application ID.
 * @param {string} params.originKey - Key of the origin to retrieve.
 * @param {AzionClientOptions} [params.options] - Client options including debug mode.
 * @returns {Promise<AzionApplicationResponse<AzionOrigin>>} The retrieved origin or an error.
 *
 * @example
 * const { error, data } = await getOrigin({
 *   applicationId: 1234,
 *   originKey: 'origin-key',
 *   options: { debug: true }
 * });
 * if (error) {
 *   console.error('Failed to get origin:', error);
 * } else {
 *   console.log('Retrieved origin:', data);
 * }
 */
export const getOriginWrapper = ({
  applicationId,
  originKey,
  options,
}: {
  applicationId: number;
  originKey: string;
  options?: AzionClientOptions;
}): Promise<AzionApplicationResponse<AzionOrigin>> =>
  getOriginMethod(resolveToken(), applicationId, originKey, options);

/**
 * Retrieves a list of origins for a specific application.
 *
 * @param {Object} params - Parameters for listing origins.
 * @param {number} params.applicationId - Application ID.
 * @param {ApiListOriginsParams} [params.params] - Parameters for filtering and pagination.
 * @param {AzionClientOptions} [params.options] - Client options including debug mode.
 * @returns {Promise<AzionApplicationCollectionResponse<AzionOrigin>>} A collection of origins or an error.
 *
 * @example
 * const { error, data } = await getOrigins({
 *   applicationId: 1234,
 *   params: { page: 1, page_size: 20 },
 *   options: { debug: true }
 * });
 * if (error) {
 *   console.error('Failed to get origins:', error);
 * } else {
 *   console.log('Retrieved origins:', data.results);
 * }
 */
export const getOriginsWrapper = ({
  applicationId,
  params,
  options,
}: {
  applicationId: number;
  params?: ApiListOriginsParams;
  options?: AzionClientOptions;
}): Promise<AzionApplicationCollectionResponse<AzionOrigin>> =>
  getOriginsMethod(resolveToken(), applicationId, params, options);

/**
 * Updates an existing origin in a specific application.
 *
 * @param {Object} params - Parameters for updating an origin.
 * @param {number} params.applicationId - Application ID.
 * @param {string} params.originKey - Key of the origin to update.
 * @param {ApiUpdateOriginRequest} params.data - Updated data for the origin.
 * @param {AzionClientOptions} [params.options] - Client options including debug mode.
 * @returns {Promise<AzionApplicationResponse<AzionOrigin>>} The updated origin or an error.
 *
 * @example
 * const { error, data } = await updateOrigin({
 *   applicationId: 1234,
 *   originKey: 'origin-key',
 *   data: {
 *     name: 'Updated Origin',
 *     addresses: [{ address: 'updated-example.com' }]
 *   },
 *   options: { debug: true }
 * });
 * if (error) {
 *   console.error('Failed to update origin:', error);
 * } else {
 *   console.log('Updated origin:', data);
 * }
 */
export const updateOriginWrapper = ({
  applicationId,
  originKey,
  data,
  options,
}: {
  applicationId: number;
  originKey: string;
  data: ApiUpdateOriginRequest;
  options?: AzionClientOptions;
}): Promise<AzionApplicationResponse<AzionOrigin>> =>
  updateOriginMethod(resolveToken(), applicationId, originKey, data, options);
