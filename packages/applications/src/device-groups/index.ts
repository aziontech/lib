import { AzionApplicationCollectionResponse, AzionApplicationResponse, AzionClientOptions } from '../types';
import { resolveDebug, resolveToken } from '../utils';
import {
  createDeviceGroup,
  deleteDeviceGroup,
  getDeviceGroupById,
  getDeviceGroups,
  updateDeviceGroup,
} from './services/index';
import { ApiCreateDeviceGroupPayload, ApiListDeviceGroupsParams, ApiUpdateDeviceGroupPayload } from './services/types';
import { AzionDeviceGroup } from './types';

/**
 * Creates a new device group for a specific application.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {number} Id - Application ID.
 * @param {ApiCreateDeviceGroupPayload} deviceGroupData - Data for the device group to be created.
 * @param {AzionClientOptions} [options] - Client options including debug mode.
 * @returns {Promise<AzionApplicationResponse<AzionDeviceGroup>>} The created device group or an error.
 */
export const createDeviceGroupMethod = async (
  token: string,
  Id: number,
  deviceGroupData: ApiCreateDeviceGroupPayload,
  options?: AzionClientOptions,
): Promise<AzionApplicationResponse<AzionDeviceGroup>> => {
  try {
    const { results } = await createDeviceGroup(resolveToken(token), Id, deviceGroupData, resolveDebug(options?.debug));
    return { data: results };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to create device group',
        operation: 'create device group',
      },
    };
  }
};

/**
 * Deletes a specific device group from an application.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {number} Id - Application ID.
 * @param {number} deviceGroupId - Device group ID to delete.
 * @param {AzionClientOptions} [options] - Client options including debug mode.
 * @returns {Promise<AzionApplicationResponse<void>>} A response indicating success or an error.
 */
export const deleteDeviceGroupMethod = async (
  token: string,
  Id: number,
  deviceGroupId: number,
  options?: AzionClientOptions,
): Promise<AzionApplicationResponse<void>> => {
  try {
    await deleteDeviceGroup(resolveToken(token), Id, deviceGroupId, resolveDebug(options?.debug));
    return { data: undefined };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to delete device group',
        operation: 'delete device group',
      },
    };
  }
};

/**
 * Retrieves a specific device group from an application.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {number} Id - Application ID.
 * @param {number} deviceGroupId - Device group ID.
 * @param {AzionClientOptions} [options] - Client options including debug mode.
 * @returns {Promise<AzionApplicationResponse<AzionDeviceGroup>>} The retrieved device group or an error.
 */
export const getDeviceGroupMethod = async (
  token: string,
  Id: number,
  deviceGroupId: number,
  options?: AzionClientOptions,
): Promise<AzionApplicationResponse<AzionDeviceGroup>> => {
  try {
    const { results } = await getDeviceGroupById(resolveToken(token), Id, deviceGroupId, resolveDebug(options?.debug));
    return { data: results };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to get device group',
        operation: 'get device group',
      },
    };
  }
};

/**
 * Retrieves a list of device groups for a specific application.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {number} Id - Application ID.
 * @param {ApiListDeviceGroupsParams} [params] - Parameters for listing device groups.
 * @param {AzionClientOptions} [options] - Client options including debug mode.
 * @returns {Promise<AzionApplicationCollectionResponse<AzionDeviceGroup>>} A collection of device groups or an error.
 */
export const getDeviceGroupsMethod = async (
  token: string,
  Id: number,
  params?: ApiListDeviceGroupsParams,
  options?: AzionClientOptions,
): Promise<AzionApplicationCollectionResponse<AzionDeviceGroup>> => {
  try {
    const data = await getDeviceGroups(resolveToken(token), Id, params, resolveDebug(options?.debug));
    return { data };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to get device groups',
        operation: 'get device groups',
      },
    };
  }
};

/**
 * Updates an existing device group for a specific application.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {number} Id - Application ID.
 * @param {number} deviceGroupId - Device group ID to update.
 * @param {ApiUpdateDeviceGroupPayload} deviceGroupData - Updated data for the device group.
 * @param {AzionClientOptions} [options] - Client options including debug mode.
 * @returns {Promise<AzionApplicationResponse<AzionDeviceGroup>>} The updated device group or an error.
 */
export const updateDeviceGroupMethod = async (
  token: string,
  Id: number,
  deviceGroupId: number,
  deviceGroupData: ApiUpdateDeviceGroupPayload,
  options?: AzionClientOptions,
): Promise<AzionApplicationResponse<AzionDeviceGroup>> => {
  try {
    const { results } = await updateDeviceGroup(
      resolveToken(token),
      Id,
      deviceGroupId,
      deviceGroupData,
      resolveDebug(options?.debug),
    );
    return { data: results };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to update device group',
        operation: 'update device group',
      },
    };
  }
};

/**
 * Function to create a new device group for a specific application.
 *
 * @param {Object} params - Parameters for creating a device group.
 * @param {number} params.applicationId - Application ID.
 * @param {ApiCreateDeviceGroupPayload} params.data - Data for the device group to be created.
 * @param {AzionClientOptions} [params.options] - Client options including debug mode.
 * @returns {Promise<AzionApplicationResponse<AzionDeviceGroup>>} The created device group or an error.
 *
 * @example
 * const { error, data } = await createDeviceGroup({
 *   applicationId: 1234,
 *   data: { name: 'My Device Group', user_agent: 'Mozilla/5.0' },
 *   options: { debug: true }
 * });
 * if (error) {
 *   console.error('Failed to create device group:', error);
 * } else {
 *   console.log('Device group created:', data.name);
 * }
 */
export const createDeviceGroupWrapper = ({
  applicationId,
  data,
  options,
}: {
  applicationId: number;
  data: ApiCreateDeviceGroupPayload;
  options?: AzionClientOptions;
}): Promise<AzionApplicationResponse<AzionDeviceGroup>> =>
  createDeviceGroupMethod(resolveToken(), applicationId, data, options);

/**
 * Function to delete a specific device group from an application.
 *
 * @param {Object} params - Parameters for deleting a device group.
 * @param {number} params.applicationId - Application ID.
 * @param {number} params.deviceGroupId - Device group ID to delete.
 * @param {AzionClientOptions} [params.options] - Client options including debug mode.
 * @returns {Promise<AzionApplicationResponse<void>>} A response indicating success or an error.
 *
 * @example
 * const { error, data } = await deleteDeviceGroup({
 *   applicationId: 1234,
 *   deviceGroupId: 5678,
 *   options: { debug: true }
 * });
 * if (error) {
 *   console.error('Failed to delete device group:', error);
 * } else {
 *   console.log('Device group deleted successfully');
 * }
 */
export const deleteDeviceGroupWrapper = ({
  applicationId,
  deviceGroupId,
  options,
}: {
  applicationId: number;
  deviceGroupId: number;
  options?: AzionClientOptions;
}): Promise<AzionApplicationResponse<void>> =>
  deleteDeviceGroupMethod(resolveToken(), applicationId, deviceGroupId, options);

/**
 * Function to retrieve a specific device group from an application.
 *
 * @param {Object} params - Parameters for retrieving a device group.
 * @param {number} params.applicationId - Application ID.
 * @param {number} params.deviceGroupId - Device group ID.
 * @param {AzionClientOptions} [params.options] - Client options including debug mode.
 * @returns {Promise<AzionApplicationResponse<AzionDeviceGroup>>} The retrieved device group or an error.
 *
 * @example
 * const { error, data } = await getDeviceGroup({
 *   applicationId: 1234,
 *   deviceGroupId: 5678,
 *   options: { debug: true }
 * });
 * if (error) {
 *   console.error('Failed to get device group:', error);
 * } else {
 *   console.log('Retrieved device group:', data.name);
 * }
 */
export const getDeviceGroupWrapper = ({
  applicationId,
  deviceGroupId,
  options,
}: {
  applicationId: number;
  deviceGroupId: number;
  options?: AzionClientOptions;
}): Promise<AzionApplicationResponse<AzionDeviceGroup>> =>
  getDeviceGroupMethod(resolveToken(), applicationId, deviceGroupId, options);

/**
 * Function to retrieve a list of device groups for a specific application.
 *
 * @param {Object} params - Parameters for listing device groups.
 * @param {number} params.applicationId - Application ID.
 * @param {ApiListDeviceGroupsParams} [params.params] - Parameters for filtering and pagination.
 * @param {AzionClientOptions} [params.options] - Client options including debug mode.
 * @returns {Promise<AzionApplicationCollectionResponse<AzionDeviceGroup>>} A collection of device groups or an error.
 *
 * @example
 * const { error, data } = await getDeviceGroups({
 *   applicationId: 1234,
 *   params: { page: 1, page_size: 20 },
 *   options: { debug: true }
 * });
 * if (error) {
 *   console.error('Failed to get device groups:', error);
 * } else {
 *   console.log(`Retrieved ${data.results.length} device groups`);
 * }
 */
export const getDeviceGroupsWrapper = ({
  applicationId,
  params,
  options,
}: {
  applicationId: number;
  params?: ApiListDeviceGroupsParams;
  options?: AzionClientOptions;
}): Promise<AzionApplicationCollectionResponse<AzionDeviceGroup>> =>
  getDeviceGroupsMethod(resolveToken(), applicationId, params, options);

/**
 * Function to update an existing device group for a specific application.
 *
 * @param {Object} params - Parameters for updating a device group.
 * @param {number} params.applicationId - Application ID.
 * @param {number} params.deviceGroupId - Device group ID to update.
 * @param {ApiUpdateDeviceGroupPayload} params.data - Updated data for the device group.
 * @param {AzionClientOptions} [params.options] - Client options including debug mode.
 * @returns {Promise<AzionApplicationResponse<AzionDeviceGroup>>} The updated device group or an error.
 *
 * @example
 * const { error, data } = await updateDeviceGroup({
 *   applicationId: 1234,
 *   deviceGroupId: 5678,
 *   data: { name: 'Updated Device Group' },
 *   options: { debug: true }
 * });
 * if (error) {
 *   console.error('Failed to update device group:', error);
 * } else {
 *   console.log('Updated device group:', data.name);
 * }
 */
export const updateDeviceGroupWrapper = ({
  applicationId,
  deviceGroupId,
  data,
  options,
}: {
  applicationId: number;
  deviceGroupId: number;
  data: ApiUpdateDeviceGroupPayload;
  options?: AzionClientOptions;
}): Promise<AzionApplicationResponse<AzionDeviceGroup>> =>
  updateDeviceGroupMethod(resolveToken(), applicationId, deviceGroupId, data, options);
