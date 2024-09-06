import { AzionApplicationCollectionResponse, AzionApplicationResponse, AzionClientOptions } from '../types';
import { resolveDebug, resolveToken } from '../utils';
import { createOrigin, deleteOrigin, getOriginByKey, listOrigins, updateOrigin } from './services/index';
import { ApiCreateOriginPayload, ApiListOriginsParams, ApiUpdateOriginRequest } from './services/types';
import { AzionOrigin } from './types';

const createOriginMethod = async (
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

const deleteOriginMethod = async (
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

const getOriginMethod = async (
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

const getOriginsMethod = async (
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

const updateOriginMethod = async (
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
 * Creates a new origin for an Azion Edge Application.
 *
 * @async
 * @function
 * @param {Object} params - The parameters for creating an origin.
 * @param {number} params.applicationId - The ID of the application to create the origin for.
 * @param {ApiCreateOriginPayload} params.data - The data for the new origin.
 * @param {AzionClientOptions} [params.options] - Optional client options.
 * @returns {Promise<AzionApplicationResponse<AzionOrigin>>} A promise that resolves with the created origin data or an error.
 *
 * @example
 * const result = await createOrigin({
 *   applicationId: 123,
 *   data: { name: 'My New Origin', addresses: [{ address: 'example.com' }] },
 *   options: { debug: true }
 * });
 * if (result.data) {
 *   console.log('Origin created:', result.data);
 * } else {
 *   console.error('Error:', result.error);
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
 * Deletes an origin from an Azion Edge Application.
 *
 * @async
 * @function
 * @param {Object} params - The parameters for deleting an origin.
 * @param {number} params.applicationId - The ID of the application containing the origin.
 * @param {string} params.originKey - The key of the origin to delete.
 * @param {AzionClientOptions} [params.options] - Optional client options.
 * @returns {Promise<AzionApplicationResponse<void>>} A promise that resolves when the origin is deleted or rejects with an error.
 *
 * @example
 * const result = await deleteOrigin({
 *   applicationId: 123,
 *   originKey: 'origin-key',
 *   options: { debug: true }
 * });
 * if (result.data !== undefined) {
 *   console.log('Origin deleted successfully');
 * } else {
 *   console.error('Error:', result.error);
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
 * Retrieves a specific origin from an Azion Edge Application.
 *
 * @async
 * @function
 * @param {Object} params - The parameters for retrieving an origin.
 * @param {number} params.applicationId - The ID of the application containing the origin.
 * @param {string} params.originKey - The key of the origin to retrieve.
 * @param {AzionClientOptions} [params.options] - Optional client options.
 * @returns {Promise<AzionApplicationResponse<AzionOrigin>>} A promise that resolves with the origin data or an error.
 *
 * @example
 * const result = await getOrigin({
 *   applicationId: 123,
 *   originKey: 'origin-key',
 *   options: { debug: true }
 * });
 * if (result.data) {
 *   console.log('Origin retrieved:', result.data);
 * } else {
 *   console.error('Error:', result.error);
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
 * Retrieves a list of origins for an Azion Edge Application.
 *
 * @async
 * @function
 * @param {Object} params - The parameters for retrieving origins.
 * @param {number} params.applicationId - The ID of the application to retrieve origins from.
 * @param {ApiListOriginsParams} [params.params] - Optional parameters for filtering and pagination.
 * @param {AzionClientOptions} [params.options] - Optional client options.
 * @returns {Promise<AzionApplicationCollectionResponse<AzionOrigin>>} A promise that resolves with a collection of origins or an error.
 *
 * @example
 * const result = await getOrigins({
 *   applicationId: 123,
 *   params: { page: 1, page_size: 20 },
 *   options: { debug: true }
 * });
 * if (result.data) {
 *   console.log('Origins retrieved:', result.data.results);
 * } else {
 *   console.error('Error:', result.error);
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
 * Updates an existing origin in an Azion Edge Application.
 *
 * @async
 * @function
 * @param {Object} params - The parameters for updating an origin.
 * @param {number} params.applicationId - The ID of the application containing the origin.
 * @param {string} params.originKey - The key of the origin to update.
 * @param {ApiUpdateOriginRequest} params.data - The updated data for the origin.
 * @param {AzionClientOptions} [params.options] - Optional client options.
 * @returns {Promise<AzionApplicationResponse<AzionOrigin>>} A promise that resolves with the updated origin data or an error.
 *
 * @example
 * const result = await updateOrigin({
 *   applicationId: 123,
 *   originKey: 'origin-key',
 *   data: { name: 'Updated Origin Name' },
 *   options: { debug: true }
 * });
 * if (result.data) {
 *   console.log('Origin updated:', result.data);
 * } else {
 *   console.error('Error:', result.error);
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
