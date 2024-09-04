import { AzionClientOptions, AzionEdgeApplicationCollectionResponse, AzionEdgeApplicationResponse } from '../types';
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

const createDeviceGroupMethod = async (
  token: string,
  edgeApplicationId: number,
  deviceGroupData: ApiCreateDeviceGroupPayload,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse<AzionDeviceGroup>> => {
  try {
    const { results } = await createDeviceGroup(
      resolveToken(token),
      edgeApplicationId,
      deviceGroupData,
      resolveDebug(options?.debug),
    );
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

const deleteDeviceGroupMethod = async (
  token: string,
  edgeApplicationId: number,
  deviceGroupId: number,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse<void>> => {
  try {
    await deleteDeviceGroup(resolveToken(token), edgeApplicationId, deviceGroupId, resolveDebug(options?.debug));
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

const getDeviceGroupMethod = async (
  token: string,
  edgeApplicationId: number,
  deviceGroupId: number,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse<AzionDeviceGroup>> => {
  try {
    const { results } = await getDeviceGroupById(
      resolveToken(token),
      edgeApplicationId,
      deviceGroupId,
      resolveDebug(options?.debug),
    );
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

const getDeviceGroupsMethod = async (
  token: string,
  edgeApplicationId: number,
  params?: ApiListDeviceGroupsParams,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationCollectionResponse<AzionDeviceGroup>> => {
  try {
    const data = await getDeviceGroups(resolveToken(token), edgeApplicationId, params, resolveDebug(options?.debug));
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

const updateDeviceGroupMethod = async (
  token: string,
  edgeApplicationId: number,
  deviceGroupId: number,
  deviceGroupData: ApiUpdateDeviceGroupPayload,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse<AzionDeviceGroup>> => {
  try {
    const { results } = await updateDeviceGroup(
      resolveToken(token),
      edgeApplicationId,
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

export const createDeviceGroupWrapper = ({
  edgeApplicationId,
  deviceGroupData,
  options,
}: {
  edgeApplicationId: number;
  deviceGroupData: ApiCreateDeviceGroupPayload;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationResponse<AzionDeviceGroup>> =>
  createDeviceGroupMethod(resolveToken(), edgeApplicationId, deviceGroupData, options);

export const deleteDeviceGroupWrapper = ({
  edgeApplicationId,
  deviceGroupId,
  options,
}: {
  edgeApplicationId: number;
  deviceGroupId: number;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationResponse<void>> =>
  deleteDeviceGroupMethod(resolveToken(), edgeApplicationId, deviceGroupId, options);

export const getDeviceGroupWrapper = ({
  edgeApplicationId,
  deviceGroupId,
  options,
}: {
  edgeApplicationId: number;
  deviceGroupId: number;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationResponse<AzionDeviceGroup>> =>
  getDeviceGroupMethod(resolveToken(), edgeApplicationId, deviceGroupId, options);

export const getDeviceGroupsWrapper = ({
  edgeApplicationId,
  params,
  options,
}: {
  edgeApplicationId: number;
  params?: ApiListDeviceGroupsParams;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationCollectionResponse<AzionDeviceGroup>> =>
  getDeviceGroupsMethod(resolveToken(), edgeApplicationId, params, options);

export const updateDeviceGroupWrapper = ({
  edgeApplicationId,
  deviceGroupId,
  deviceGroupData,
  options,
}: {
  edgeApplicationId: number;
  deviceGroupId: number;
  deviceGroupData: ApiUpdateDeviceGroupPayload;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationResponse<AzionDeviceGroup>> =>
  updateDeviceGroupMethod(resolveToken(), edgeApplicationId, deviceGroupId, deviceGroupData, options);

export {
  createDeviceGroupWrapper as createDeviceGroup,
  deleteDeviceGroupWrapper as deleteDeviceGroup,
  getDeviceGroupWrapper as getDeviceGroup,
  getDeviceGroupsWrapper as getDeviceGroups,
  updateDeviceGroupWrapper as updateDeviceGroup,
};
