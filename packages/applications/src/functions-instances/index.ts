import { AzionApplicationCollectionResponse, AzionApplicationResponse, AzionClientOptions } from '../types';
import { resolveDebug, resolveToken } from '../utils';
import {
  createFunctionInstance,
  deleteFunctionInstance,
  getFunctionInstanceById,
  listFunctionInstances,
  updateFunctionInstance,
} from './services/index';
import {
  ApiCreateFunctionInstancePayload,
  ApiListFunctionInstancesParams,
  ApiUpdateFunctionInstancePayload,
} from './services/types';
import { AzionFunctionInstance } from './types';

/**
 * Creates a new function instance for a specific application.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {number} Id - Application ID.
 * @param {ApiCreateFunctionInstancePayload} functionInstanceData - Data for the function instance to be created.
 * @param {AzionClientOptions} [options] - Client options including debug mode.
 * @returns {Promise<AzionApplicationResponse<AzionFunctionInstance>>} The created function instance or an error.
 */
export const createFunctionInstanceMethod = async (
  token: string,
  Id: number,
  functionInstanceData: ApiCreateFunctionInstancePayload,
  options?: AzionClientOptions,
): Promise<AzionApplicationResponse<AzionFunctionInstance>> => {
  try {
    const apiResponse = await createFunctionInstance(
      resolveToken(token),
      Id,
      functionInstanceData,
      resolveDebug(options?.debug),
    );
    return { data: apiResponse.results };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to create function instance',
        operation: 'create function instance',
      },
    };
  }
};

/**
 * Deletes a function instance from a specific application.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {number} Id - Application ID.
 * @param {number} functionInstanceId - ID of the function instance to delete.
 * @param {AzionClientOptions} [options] - Client options including debug mode.
 * @returns {Promise<AzionApplicationResponse<void>>} Confirmation of deletion or an error.
 */
export const deleteFunctionInstanceMethod = async (
  token: string,
  Id: number,
  functionInstanceId: number,
  options?: AzionClientOptions,
): Promise<AzionApplicationResponse<void>> => {
  try {
    await deleteFunctionInstance(resolveToken(token), Id, functionInstanceId, resolveDebug(options?.debug));
    return { data: undefined };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to delete function instance',
        operation: 'delete function instance',
      },
    };
  }
};

/**
 * Retrieves a specific function instance from an application.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {number} Id - Application ID.
 * @param {number} functionInstanceId - ID of the function instance to retrieve.
 * @param {AzionClientOptions} [options] - Client options including debug mode.
 * @returns {Promise<AzionApplicationResponse<AzionFunctionInstance>>} The retrieved function instance or an error.
 */
export const getFunctionInstanceMethod = async (
  token: string,
  Id: number,
  functionInstanceId: number,
  options?: AzionClientOptions,
): Promise<AzionApplicationResponse<AzionFunctionInstance>> => {
  try {
    const { results } = await getFunctionInstanceById(
      resolveToken(token),
      Id,
      functionInstanceId,
      resolveDebug(options?.debug),
    );
    return { data: results };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to get function instance',
        operation: 'get function instance',
      },
    };
  }
};

/**
 * Lists all function instances for a specific application.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {number} Id - Application ID.
 * @param {ApiListFunctionInstancesParams} [params] - Optional parameters for filtering and pagination.
 * @param {AzionClientOptions} [options] - Client options including debug mode.
 * @returns {Promise<AzionApplicationCollectionResponse<AzionFunctionInstance>>} A collection of function instances or an error.
 */
export const getFunctionInstancesMethod = async (
  token: string,
  Id: number,
  params?: ApiListFunctionInstancesParams,
  options?: AzionClientOptions,
): Promise<AzionApplicationCollectionResponse<AzionFunctionInstance>> => {
  try {
    const data = await listFunctionInstances(resolveToken(token), Id, params, resolveDebug(options?.debug));
    return { data };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to get function instances',
        operation: 'get function instances',
      },
    };
  }
};

/**
 * Updates an existing function instance in a specific application.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {number} Id - Application ID.
 * @param {number} functionInstanceId - ID of the function instance to update.
 * @param {ApiUpdateFunctionInstancePayload} functionInstanceData - New data for the function instance.
 * @param {AzionClientOptions} [options] - Client options including debug mode.
 * @returns {Promise<AzionApplicationResponse<AzionFunctionInstance>>} The updated function instance or an error.
 */
export const updateFunctionInstanceMethod = async (
  token: string,
  Id: number,
  functionInstanceId: number,
  functionInstanceData: ApiUpdateFunctionInstancePayload,
  options?: AzionClientOptions,
): Promise<AzionApplicationResponse<AzionFunctionInstance>> => {
  try {
    const { results } = await updateFunctionInstance(
      resolveToken(token),
      Id,
      functionInstanceId,
      functionInstanceData,
      resolveDebug(options?.debug),
    );
    return { data: results };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to update function instance',
        operation: 'update function instance',
      },
    };
  }
};

/**
 * Create a new function instance for a specific application.
 *
 * @param {Object} params - Parameters for creating a function instance.
 * @param {number} params.applicationId - Application ID.
 * @param {ApiCreateFunctionInstancePayload} params.data - Data for the function instance to be created.
 * @param {AzionClientOptions} [params.options] - Client options including debug mode.
 * @returns {Promise<AzionApplicationResponse<AzionFunctionInstance>>} The created function instance or an error.
 *
 * @example
 * const { error, data } = await createFunctionInstance({
 *   applicationId: 1234,
 *   data: {
 *     name: 'My Function Instance',
 *     edge_function_id: 5678,
 *     args: {}
 *   },
 *   options: { debug: true }
 * });
 * if (error) {
 *   console.error('Failed to create function instance:', error);
 * } else {
 *   console.log('Function instance created:', data.name);
 * }
 */
export const createFunctionInstanceWrapper = ({
  applicationId,
  data,
  options,
}: {
  applicationId: number;
  data: ApiCreateFunctionInstancePayload;
  options?: AzionClientOptions;
}): Promise<AzionApplicationResponse<AzionFunctionInstance>> =>
  createFunctionInstanceMethod(resolveToken(), applicationId, data, options);

/**
 * Delete a function instance from a specific application.
 *
 * @param {Object} params - Parameters for deleting a function instance.
 * @param {number} params.applicationId - Application ID.
 * @param {number} params.functionInstanceId - ID of the function instance to delete.
 * @param {AzionClientOptions} [params.options] - Client options including debug mode.
 * @returns {Promise<AzionApplicationResponse<void>>} Confirmation of deletion or an error.
 *
 * @example
 * const { error, data } = await deleteFunctionInstance({
 *   applicationId: 1234,
 *   functionInstanceId: 5678,
 *   options: { debug: true }
 * });
 * if (error) {
 *   console.error('Failed to delete function instance:', error);
 * } else {
 *   console.log('Function instance deleted successfully');
 * }
 */
export const deleteFunctionInstanceWrapper = ({
  applicationId,
  functionInstanceId,
  options,
}: {
  applicationId: number;
  functionInstanceId: number;
  options?: AzionClientOptions;
}): Promise<AzionApplicationResponse<void>> =>
  deleteFunctionInstanceMethod(resolveToken(), applicationId, functionInstanceId, options);

/**
 * Retrieve a specific function instance from an application.
 *
 * @param {Object} params - Parameters for retrieving a function instance.
 * @param {number} params.applicationId - Application ID.
 * @param {number} params.functionInstanceId - ID of the function instance to retrieve.
 * @param {AzionClientOptions} [params.options] - Client options including debug mode.
 * @returns {Promise<AzionApplicationResponse<AzionFunctionInstance>>} The retrieved function instance or an error.
 *
 * @example
 * const { error, data } = await getFunctionInstance({
 *   applicationId: 1234,
 *   functionInstanceId: 5678,
 *   options: { debug: true }
 * });
 * if (error) {
 *   console.error('Failed to get function instance:', error);
 * } else {
 *   console.log('Retrieved function instance:', data.name);
 * }
 */
export const getFunctionInstanceWrapper = ({
  applicationId,
  functionInstanceId,
  options,
}: {
  applicationId: number;
  functionInstanceId: number;
  options?: AzionClientOptions;
}): Promise<AzionApplicationResponse<AzionFunctionInstance>> =>
  getFunctionInstanceMethod(resolveToken(), applicationId, functionInstanceId, options);

/**
 * List all function instances for a specific application.
 *
 * @param {Object} params - Parameters for listing function instances.
 * @param {number} params.applicationId - Application ID.
 * @param {ApiListFunctionInstancesParams} [params.params] - Optional parameters for filtering and pagination.
 * @param {AzionClientOptions} [params.options] - Client options including debug mode.
 * @returns {Promise<AzionApplicationCollectionResponse<AzionFunctionInstance>>} A collection of function instances or an error.
 *
 * @example
 * const { error, data } = await getFunctionInstances({
 *   applicationId: 1234,
 *   params: { page: 1, page_size: 20, sort: 'name', order: 'asc' },
 *   options: { debug: true }
 * });
 * if (error) {
 *   console.error('Failed to get function instances:', error);
 * } else {
 *   console.log('Function instances:', data.results);
 * }
 */
export const getFunctionInstancesWrapper = ({
  applicationId,
  params,
  options,
}: {
  applicationId: number;
  params?: ApiListFunctionInstancesParams;
  options?: AzionClientOptions;
}): Promise<AzionApplicationCollectionResponse<AzionFunctionInstance>> =>
  getFunctionInstancesMethod(resolveToken(), applicationId, params, options);

/**
 * Update an existing function instance in a specific application.
 *
 * @param {Object} params - Parameters for updating a function instance.
 * @param {number} params.applicationId - Application ID.
 * @param {number} params.functionInstanceId - ID of the function instance to update.
 * @param {ApiUpdateFunctionInstancePayload} params.data - New data for the function instance.
 * @param {AzionClientOptions} [params.options] - Client options including debug mode.
 * @returns {Promise<AzionApplicationResponse<AzionFunctionInstance>>} The updated function instance or an error.
 *
 * @example
 * const { error, data } = await updateFunctionInstance({
 *   applicationId: 1234,
 *   functionInstanceId: 5678,
 *   data: {
 *     name: 'Updated Function Instance',
 *     args: { key: 'new value' }
 *   },
 *   options: { debug: true }
 * });
 * if (error) {
 *   console.error('Failed to update function instance:', error);
 * } else {
 *   console.log('Updated function instance:', data);
 * }
 */
export const updateFunctionInstanceWrapper = ({
  applicationId,
  functionInstanceId,
  data,
  options,
}: {
  applicationId: number;
  functionInstanceId: number;
  data: ApiUpdateFunctionInstancePayload;
  options?: AzionClientOptions;
}): Promise<AzionApplicationResponse<AzionFunctionInstance>> =>
  updateFunctionInstanceMethod(resolveToken(), applicationId, functionInstanceId, data, options);
