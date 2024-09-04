import { AzionClientOptions, AzionEdgeApplicationCollectionResponse, AzionEdgeApplicationResponse } from '../types';
import { resolveDebug, resolveToken } from '../utils';
import { createOrigin, deleteOrigin, getOriginByKey, listOrigins, updateOrigin } from './services/index';
import { ApiCreateOriginPayload, ApiListOriginsParams, ApiUpdateOriginRequest } from './services/types';
import { AzionOrigin } from './types';

const createOriginMethod = async (
  token: string,
  edgeApplicationId: number,
  originData: ApiCreateOriginPayload,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse<AzionOrigin>> => {
  try {
    const { results } = await createOrigin(token, edgeApplicationId, originData, resolveDebug(options?.debug));
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
  edgeApplicationId: number,
  originKey: string,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse<void>> => {
  try {
    await deleteOrigin(token, edgeApplicationId, originKey, resolveDebug(options?.debug));
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
  edgeApplicationId: number,
  originKey: string,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse<AzionOrigin>> => {
  try {
    const { results } = await getOriginByKey(token, edgeApplicationId, originKey, resolveDebug(options?.debug));
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
  edgeApplicationId: number,
  params?: ApiListOriginsParams,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationCollectionResponse<AzionOrigin>> => {
  try {
    const data = await listOrigins(token, edgeApplicationId, params, resolveDebug(options?.debug));
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
  edgeApplicationId: number,
  originKey: string,
  originData: ApiUpdateOriginRequest,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse<AzionOrigin>> => {
  try {
    const { results } = await updateOrigin(
      token,
      edgeApplicationId,
      originKey,
      originData,
      resolveDebug(options?.debug),
    );
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

export const createOriginWrapper = ({
  edgeApplicationId,
  originData,
  options,
}: {
  edgeApplicationId: number;
  originData: ApiCreateOriginPayload;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationResponse<AzionOrigin>> =>
  createOriginMethod(resolveToken(), edgeApplicationId, originData, options);

export const deleteOriginWrapper = ({
  edgeApplicationId,
  originKey,
  options,
}: {
  edgeApplicationId: number;
  originKey: string;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationResponse<void>> =>
  deleteOriginMethod(resolveToken(), edgeApplicationId, originKey, options);

export const getOriginWrapper = ({
  edgeApplicationId,
  originKey,
  options,
}: {
  edgeApplicationId: number;
  originKey: string;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationResponse<AzionOrigin>> =>
  getOriginMethod(resolveToken(), edgeApplicationId, originKey, options);

export const getOriginsWrapper = ({
  edgeApplicationId,
  params,
  options,
}: {
  edgeApplicationId: number;
  params?: ApiListOriginsParams;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationCollectionResponse<AzionOrigin>> =>
  getOriginsMethod(resolveToken(), edgeApplicationId, params, options);

export const updateOriginWrapper = ({
  edgeApplicationId,
  originKey,
  originData,
  options,
}: {
  edgeApplicationId: number;
  originKey: string;
  originData: ApiUpdateOriginRequest;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationResponse<AzionOrigin>> =>
  updateOriginMethod(resolveToken(), edgeApplicationId, originKey, originData, options);

export {
  createOriginWrapper as createOrigin,
  deleteOriginWrapper as deleteOrigin,
  getOriginWrapper as getOrigin,
  getOriginsWrapper as getOrigins,
  updateOriginWrapper as updateOrigin,
};
