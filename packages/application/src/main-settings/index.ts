import { AzionApplicationCollectionResponse, AzionApplicationResponse, AzionClientOptions } from '../types';
import { resolveDebug, resolveToken } from '../utils';
import {
  deleteApplication as deleteApplicationApi,
  getApplicationById as getApplicationByIdApi,
  getApplications as getApplicationsApi,
  patchApplication as patchApplicationApi,
  postApplication as postApplicationApi,
  putApplication as putApplicationApi,
} from './services/index';
import { ApiCreateApplicationPayload, ApiListApplicationsParams, ApiUpdateApplicationPayload } from './services/types';
import { AzionApplicationSettings } from './types';

/**
 * Creates a new Azion Edge Application.
 *
 * @async
 * @function createApplicationMethod
 * @param {string} token - The authentication token.
 * @param {ApiCreateApplicationPayload} applicationData - The data for the new application.
 * @param {AzionClientOptions} [options] - Optional client options.
 * @returns {Promise<AzionApplicationResponse<AzionApplicationSettings>>} A promise that resolves with the created application data or an error.
 */
const createApplicationMethod = async (
  token: string,
  applicationData: ApiCreateApplicationPayload,
  options?: AzionClientOptions,
): Promise<AzionApplicationResponse<AzionApplicationSettings>> => {
  try {
    const apiResponse = await postApplicationApi(resolveToken(token), applicationData, resolveDebug(options?.debug));
    return { data: apiResponse.results };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to create edge application',
        operation: 'create edge application',
      },
    };
  }
};

/**
 * Retrieves a specific Azion Edge Application by ID.
 *
 * @async
 * @function getApplicationMethod
 * @param {string} token - The authentication token.
 * @param {number} applicationId - The ID of the application to retrieve.
 * @param {AzionClientOptions} [options] - Optional client options.
 * @returns {Promise<AzionApplicationResponse<AzionApplicationSettings>>} A promise that resolves with the application data or an error.
 */
const getApplicationMethod = async (
  token: string,
  applicationId: number,
  options?: AzionClientOptions,
): Promise<AzionApplicationResponse<AzionApplicationSettings>> => {
  try {
    const apiResponse = await getApplicationByIdApi(resolveToken(token), applicationId, resolveDebug(options?.debug));
    return { data: apiResponse.results };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to get application',
        operation: 'get application',
      },
    };
  }
};

/**
 * Retrieves a list of Azion Edge Applications.
 *
 * @async
 * @function getApplicationsMethod
 * @param {string} token - The authentication token.
 * @param {ApiListApplicationsParams} [params] - Optional parameters for filtering and pagination.
 * @param {AzionClientOptions} [options] - Optional client options.
 * @returns {Promise<AzionApplicationCollectionResponse<AzionApplicationSettings>>} A promise that resolves with a collection of applications or an error.
 */
const getApplicationsMethod = async (
  token: string,
  params?: ApiListApplicationsParams,
  options?: AzionClientOptions,
): Promise<AzionApplicationCollectionResponse<AzionApplicationSettings>> => {
  try {
    const apiResponse = await getApplicationsApi(resolveToken(token), params, resolveDebug(options?.debug));

    const results: AzionApplicationSettings[] = apiResponse.results.map((application) => ({
      ...application,
    }));

    return {
      data: {
        count: apiResponse.count,
        total_pages: apiResponse.total_pages,
        schema_version: apiResponse.schema_version,
        links: apiResponse.links,
        results,
      },
    };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to get applications',
        operation: 'get applications',
      },
    };
  }
};

/**
 * Updates an existing Azion Edge Application.
 *
 * @async
 * @function putApplicationMethod
 * @param {string} token - The authentication token.
 * @param {number} applicationId - The ID of the application to update.
 * @param {ApiUpdateApplicationPayload} applicationData - The updated data for the application.
 * @param {AzionClientOptions} [options] - Optional client options.
 * @returns {Promise<AzionApplicationResponse<AzionApplicationSettings>>} A promise that resolves with the updated application data or an error.
 */
const putApplicationMethod = async (
  token: string,
  applicationId: number,
  applicationData: ApiUpdateApplicationPayload,
  options?: AzionClientOptions,
): Promise<AzionApplicationResponse<AzionApplicationSettings>> => {
  try {
    const apiResponse = await putApplicationApi(
      resolveToken(token),
      applicationId,
      applicationData,
      resolveDebug(options?.debug),
    );
    return { data: apiResponse.results };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to update application',
        operation: 'update application',
      },
    };
  }
};

/**
 * Partially updates an existing Azion Edge Application.
 *
 * @async
 * @function patchApplicationMethod
 * @param {string} token - The authentication token.
 * @param {number} applicationId - The ID of the application to patch.
 * @param {Partial<ApiUpdateApplicationPayload>} applicationData - The partial data to update in the application.
 * @param {AzionClientOptions} [options] - Optional client options.
 * @returns {Promise<AzionApplicationResponse<AzionApplicationSettings>>} A promise that resolves with the patched application data or an error.
 */
const patchApplicationMethod = async (
  token: string,
  applicationId: number,
  applicationData: Partial<ApiUpdateApplicationPayload>,
  options?: AzionClientOptions,
): Promise<AzionApplicationResponse<AzionApplicationSettings>> => {
  try {
    const apiResponse = await patchApplicationApi(
      resolveToken(token),
      applicationId,
      applicationData,
      resolveDebug(options?.debug),
    );
    return { data: apiResponse.results };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to patch application',
        operation: 'patch application',
      },
    };
  }
};

/**
 * Deletes an Azion Edge Application.
 *
 * @async
 * @function deleteApplicationMethod
 * @param {string} token - The authentication token.
 * @param {number} applicationId - The ID of the application to delete.
 * @param {AzionClientOptions} [options] - Optional client options.
 * @returns {Promise<AzionApplicationResponse<void>>} A promise that resolves when the application is deleted or rejects with an error.
 */
const deleteApplicationMethod = async (
  token: string,
  applicationId: number,
  options?: AzionClientOptions,
): Promise<AzionApplicationResponse<void>> => {
  try {
    await deleteApplicationApi(resolveToken(token), applicationId, resolveDebug(options?.debug));
    return { data: undefined };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to delete application',
        operation: 'delete application',
      },
    };
  }
};

/**
 * Creates a new Azion Edge Application.
 *
 * @async
 * @function
 * @param {Object} params - The parameters for creating an application.
 * @param {ApiCreateApplicationPayload} params.data - The data for the new application.
 * @param {AzionClientOptions} [params.options] - Optional client options.
 * @returns {Promise<AzionApplicationResponse<AzionApplicationSettings>>} A promise that resolves with the created application data or an error.
 *
 * @example
 * const result = await createApplication({
 *   data: { name: 'My New App', delivery_protocol: 'http' },
 *   options: { debug: true }
 * });
 * if (result.data) {
 *   console.log('Application created:', result.data);
 * } else {
 *   console.error('Error:', result.error);
 * }
 */
export const createApplicationWrapper = ({
  data,
  options,
}: {
  data: ApiCreateApplicationPayload;
  options?: AzionClientOptions;
}): Promise<AzionApplicationResponse<AzionApplicationSettings>> =>
  createApplicationMethod(resolveToken(), data, options);

/**
 * Retrieves a specific Azion Edge Application by ID.
 *
 * @async
 * @function
 * @param {Object} params - The parameters for retrieving an application.
 * @param {number} params.applicationId - The ID of the application to retrieve.
 * @param {AzionClientOptions} [params.options] - Optional client options.
 * @returns {Promise<AzionApplicationResponse<AzionApplicationSettings>>} A promise that resolves with the application data or an error.
 *
 * @example
 * const result = await getApplication({
 *   applicationId: 123,
 *   options: { debug: true }
 * });
 * if (result.data) {
 *   console.log('Application retrieved:', result.data);
 * } else {
 *   console.error('Error:', result.error);
 * }
 */
export const getApplicationWrapper = ({
  applicationId,
  options,
}: {
  applicationId: number;
  options?: AzionClientOptions;
}): Promise<AzionApplicationResponse<AzionApplicationSettings>> =>
  getApplicationMethod(resolveToken(), applicationId, options);

/**
 * Retrieves a list of Azion Edge Applications.
 *
 * @async
 * @function
 * @param {Object} params - The parameters for retrieving applications.
 * @param {ApiListApplicationsParams} [params.params] - Optional parameters for filtering and pagination.
 * @param {AzionClientOptions} [params.options] - Optional client options.
 * @returns {Promise<AzionApplicationCollectionResponse<AzionApplicationSettings>>} A promise that resolves with a collection of applications or an error.
 *
 * @example
 * const result = await getApplications({
 *   params: { page: 1, page_size: 20 },
 *   options: { debug: true }
 * });
 * if (result.data) {
 *   console.log('Applications retrieved:', result.data.results);
 * } else {
 *   console.error('Error:', result.error);
 * }
 */
export const getApplicationsWrapper = ({
  params,
  options,
}: {
  params?: ApiListApplicationsParams;
  options?: AzionClientOptions;
}): Promise<AzionApplicationCollectionResponse<AzionApplicationSettings>> =>
  getApplicationsMethod(resolveToken(), params, options);

/**
 * Updates an existing Azion Edge Application.
 *
 * @async
 * @function
 * @param {Object} params - The parameters for updating an application.
 * @param {number} params.applicationId - The ID of the application to update.
 * @param {ApiUpdateApplicationPayload} params.data - The updated data for the application.
 * @param {AzionClientOptions} [params.options] - Optional client options.
 * @returns {Promise<AzionApplicationResponse<AzionApplicationSettings>>} A promise that resolves with the updated application data or an error.
 *
 * @example
 * const result = await putApplication({
 *   applicationId: 123,
 *   data: { name: 'Updated App Name' },
 *   options: { debug: true }
 * });
 * if (result.data) {
 *   console.log('Application updated:', result.data);
 * } else {
 *   console.error('Error:', result.error);
 * }
 */
export const putApplicationWrapper = ({
  applicationId,
  data,
  options,
}: {
  applicationId: number;
  data: ApiUpdateApplicationPayload;
  options?: AzionClientOptions;
}): Promise<AzionApplicationResponse<AzionApplicationSettings>> =>
  putApplicationMethod(resolveToken(), applicationId, data, options);

/**
 * Partially updates an existing Azion Edge Application.
 *
 * @async
 * @function
 * @param {Object} params - The parameters for patching an application.
 * @param {number} params.applicationId - The ID of the application to patch.
 * @param {Partial<ApiUpdateApplicationPayload>} params.data - The partial data to update in the application.
 * @param {AzionClientOptions} [params.options] - Optional client options.
 * @returns {Promise<AzionApplicationResponse<AzionApplicationSettings>>} A promise that resolves with the patched application data or an error.
 *
 * @example
 * const result = await patchApplication({
 *   applicationId: 123,
 *   data: { delivery_protocol: 'https' },
 *   options: { debug: true }
 * });
 * if (result.data) {
 *   console.log('Application patched:', result.data);
 * } else {
 *   console.error('Error:', result.error);
 * }
 */
export const patchApplicationWrapper = ({
  applicationId,
  data,
  options,
}: {
  applicationId: number;
  data: Partial<ApiUpdateApplicationPayload>;
  options?: AzionClientOptions;
}): Promise<AzionApplicationResponse<AzionApplicationSettings>> =>
  patchApplicationMethod(resolveToken(), applicationId, data, options);

/**
 * Deletes an Azion Edge Application.
 *
 * @async
 * @function
 * @param {Object} params - The parameters for deleting an application.
 * @param {number} params.applicationId - The ID of the application to delete.
 * @param {AzionClientOptions} [params.options] - Optional client options.
 * @returns {Promise<AzionApplicationResponse<void>>} A promise that resolves when the application is deleted or rejects with an error.
 *
 * @example
 * const result = await deleteApplication({
 *   applicationId: 123,
 *   options: { debug: true }
 * });
 * if (result.data !== undefined) {
 *   console.log('Application deleted successfully');
 * } else {
 *   console.error('Error:', result.error);
 * }
 */
export const deleteApplicationWrapper = ({
  applicationId,
  options,
}: {
  applicationId: number;
  options?: AzionClientOptions;
}): Promise<AzionApplicationResponse<void>> => deleteApplicationMethod(resolveToken(), applicationId, options);
