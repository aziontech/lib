import { AzionClientOptions, AzionEdgeApplicationCollectionResponse, AzionEdgeApplicationResponse } from '../types';
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

const createFunctionInstanceMethod = async (
  token: string,
  edgeApplicationId: number,
  functionInstanceData: ApiCreateFunctionInstancePayload,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse<AzionFunctionInstance>> => {
  try {
    const { results } = await createFunctionInstance(
      resolveToken(token),
      edgeApplicationId,
      functionInstanceData,
      resolveDebug(options?.debug),
    );
    return { data: results };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to create function instance',
        operation: 'create function instance',
      },
    };
  }
};

const deleteFunctionInstanceMethod = async (
  token: string,
  edgeApplicationId: number,
  functionInstanceId: number,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse<void>> => {
  try {
    await deleteFunctionInstance(
      resolveToken(token),
      edgeApplicationId,
      functionInstanceId,
      resolveDebug(options?.debug),
    );
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

const getFunctionInstanceMethod = async (
  token: string,
  edgeApplicationId: number,
  functionInstanceId: number,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse<AzionFunctionInstance>> => {
  try {
    const { results } = await getFunctionInstanceById(
      resolveToken(token),
      edgeApplicationId,
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

const getFunctionInstancesMethod = async (
  token: string,
  edgeApplicationId: number,
  params?: ApiListFunctionInstancesParams,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationCollectionResponse<AzionFunctionInstance>> => {
  try {
    const data = await listFunctionInstances(
      resolveToken(token),
      edgeApplicationId,
      params,
      resolveDebug(options?.debug),
    );
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

const updateFunctionInstanceMethod = async (
  token: string,
  edgeApplicationId: number,
  functionInstanceId: number,
  functionInstanceData: ApiUpdateFunctionInstancePayload,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse<AzionFunctionInstance>> => {
  try {
    const { results } = await updateFunctionInstance(
      resolveToken(token),
      edgeApplicationId,
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

export const createFunctionInstanceWrapper = ({
  edgeApplicationId,
  functionInstanceData,
  options,
}: {
  edgeApplicationId: number;
  functionInstanceData: ApiCreateFunctionInstancePayload;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationResponse<AzionFunctionInstance>> =>
  createFunctionInstanceMethod(resolveToken(), edgeApplicationId, functionInstanceData, options);

export const deleteFunctionInstanceWrapper = ({
  edgeApplicationId,
  functionInstanceId,
  options,
}: {
  edgeApplicationId: number;
  functionInstanceId: number;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationResponse<void>> =>
  deleteFunctionInstanceMethod(resolveToken(), edgeApplicationId, functionInstanceId, options);

export const getFunctionInstanceWrapper = ({
  edgeApplicationId,
  functionInstanceId,
  options,
}: {
  edgeApplicationId: number;
  functionInstanceId: number;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationResponse<AzionFunctionInstance>> =>
  getFunctionInstanceMethod(resolveToken(), edgeApplicationId, functionInstanceId, options);

export const getFunctionInstancesWrapper = ({
  edgeApplicationId,
  params,
  options,
}: {
  edgeApplicationId: number;
  params?: ApiListFunctionInstancesParams;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationCollectionResponse<AzionFunctionInstance>> =>
  getFunctionInstancesMethod(resolveToken(), edgeApplicationId, params, options);

export const updateFunctionInstanceWrapper = ({
  edgeApplicationId,
  functionInstanceId,
  functionInstanceData,
  options,
}: {
  edgeApplicationId: number;
  functionInstanceId: number;
  functionInstanceData: ApiUpdateFunctionInstancePayload;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationResponse<AzionFunctionInstance>> =>
  updateFunctionInstanceMethod(resolveToken(), edgeApplicationId, functionInstanceId, functionInstanceData, options);

export {
  createFunctionInstanceWrapper as createFunctionInstance,
  deleteFunctionInstanceWrapper as deleteFunctionInstance,
  getFunctionInstanceWrapper as getFunctionInstance,
  getFunctionInstancesWrapper as getFunctionInstances,
  updateFunctionInstanceWrapper as updateFunctionInstance,
};
