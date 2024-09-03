import {
  createCacheSetting,
  deleteCacheSetting,
  getCacheSettingById,
  getCacheSettings,
  updateCacheSetting,
} from './services/api/cache/index';
import {
  ApiCreateCacheSettingPayload,
  ApiListCacheSettingsParams,
  ApiUpdateCacheSettingPayload,
} from './services/api/cache/types';
import {
  createDeviceGroup,
  deleteDeviceGroup,
  getDeviceGroupById,
  getDeviceGroups,
  updateDeviceGroup,
} from './services/api/device-groups/intex';
import {
  ApiCreateDeviceGroupPayload,
  ApiListDeviceGroupsParams,
  ApiUpdateDeviceGroupPayload,
} from './services/api/device-groups/types';
import {
  createApplication,
  deleteApplication,
  getApplicationById,
  getApplications,
  patchApplication,
  updateApplication,
} from './services/api/main-settings/index';
import { ApiCreateApplicationPayload, ApiUpdateApplicationPayload } from './services/api/main-settings/types';
import { createOrigin, deleteOrigin, getOriginByKey, listOrigins, updateOrigin } from './services/api/origins/index';
import { ApiCreateOriginPayload, ApiListOriginsParams, ApiUpdateOriginRequest } from './services/api/origins/types';
import { createRule, deleteRule, getRuleById, listRules, updateRule } from './services/api/rules/index';
import { ApiCreateRulePayload, ApiListRulesParams, ApiUpdateRulePayload } from './services/api/rules/types';
import type {
  AzionClientOptions,
  AzionEdgeApplicationClient,
  AzionEdgeApplicationCollectionOptions,
  AzionEdgeApplicationResponse,
  CreateAzionEdgeApplicationClient,
} from './types';

import {
  createFunctionInstance,
  deleteFunctionInstance,
  getFunctionInstanceById,
  listFunctionInstances,
  updateFunctionInstance,
} from './services/api/functions-instances/index';
import {
  ApiCreateFunctionInstanceRequest,
  ApiListFunctionInstancesParams,
  ApiUpdateFunctionInstanceRequest,
} from './services/api/functions-instances/types';

const envDebugFlag = process.env.AZION_DEBUG && process.env.AZION_DEBUG === 'true';
const resolveToken = (token?: string) => token ?? process.env.AZION_TOKEN ?? '';
const resolveDebug = (debug?: boolean) => debug ?? !!envDebugFlag;

// Main Edge Application Methods

/**
 * Creates a new edge application.
 */
const createEdgeApplicationMethod = async (
  token: string,
  applicationData: ApiCreateApplicationPayload,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse> => {
  try {
    const apiResponse = await createApplication(resolveToken(token), applicationData, resolveDebug(options?.debug));
    const appId = apiResponse.results.id;
    return {
      data: {
        ...apiResponse.results,
        cache: {
          create: (cacheSettingData: ApiCreateCacheSettingPayload) =>
            createCacheSettingMethod(token, appId, cacheSettingData, options),
          get: (cacheSettingId: number) => getCacheSettingMethod(token, appId, cacheSettingId, options),
          getAll: (params?: ApiListCacheSettingsParams) => getCacheSettingsMethod(token, appId, params, options),
          update: (cacheSettingId: number, cacheSettingData: ApiUpdateCacheSettingPayload) =>
            updateCacheSettingMethod(token, appId, cacheSettingId, cacheSettingData, options),
          delete: (cacheSettingId: number) => deleteCacheSettingMethod(token, appId, cacheSettingId, options),
        },
        origins: {
          create: (originData: ApiCreateOriginPayload) => createOriginMethod(token, appId, originData, options),
          get: (originKey: string) => getOriginMethod(token, appId, originKey, options),
          getAll: (params?: ApiListOriginsParams) => getOriginsMethod(token, appId, params, options),
          update: (originKey: string, originData: ApiUpdateOriginRequest) =>
            updateOriginMethod(token, appId, originKey, originData, options),
          delete: (originKey: string) => deleteOriginMethod(token, appId, originKey, options),
        },
        rules: {
          request: {
            create: (ruleData: ApiCreateRulePayload) => createRuleMethod(token, appId, 'request', ruleData, options),
            get: (ruleId: number) => getRuleMethod(token, appId, 'request', ruleId, options),
            getAll: (params?: ApiListRulesParams) => getRulesMethod(token, appId, 'request', params, options),
            update: (ruleId: number, ruleData: ApiUpdateRulePayload) =>
              updateRuleMethod(token, appId, 'request', ruleId, ruleData, options),
            delete: (ruleId: number) => deleteRuleMethod(token, appId, 'request', ruleId, options),
          },
          response: {
            create: (ruleData: ApiCreateRulePayload) => createRuleMethod(token, appId, 'response', ruleData, options),
            get: (ruleId: number) => getRuleMethod(token, appId, 'response', ruleId, options),
            getAll: (params?: ApiListRulesParams) => getRulesMethod(token, appId, 'response', params, options),
            update: (ruleId: number, ruleData: ApiUpdateRulePayload) =>
              updateRuleMethod(token, appId, 'response', ruleId, ruleData, options),
            delete: (ruleId: number) => deleteRuleMethod(token, appId, 'response', ruleId, options),
          },
        },
        devices: {
          create: (deviceGroupData: ApiCreateDeviceGroupPayload) =>
            createDeviceGroupMethod(token, appId, deviceGroupData, options),
          get: (deviceGroupId: number) => getDeviceGroupMethod(token, appId, deviceGroupId, options),
          getAll: (params?: ApiListDeviceGroupsParams) => getDeviceGroupsMethod(token, appId, params, options),
          update: (deviceGroupId: number, deviceGroupData: ApiUpdateDeviceGroupPayload) =>
            updateDeviceGroupMethod(token, appId, deviceGroupId, deviceGroupData, options),
          delete: (deviceGroupId: number) => deleteDeviceGroupMethod(token, appId, deviceGroupId, options),
        },
        functions: {
          create: (functionInstanceData: ApiCreateFunctionInstanceRequest) =>
            createFunctionInstanceMethod(token, appId, functionInstanceData, options),
          get: (functionInstanceId: number) => getFunctionInstanceMethod(token, appId, functionInstanceId, options),
          getAll: (params?: ApiListFunctionInstancesParams) =>
            getFunctionInstancesMethod(token, appId, params, options),
          update: (functionInstanceId: number, functionInstanceData: ApiUpdateFunctionInstanceRequest) =>
            updateFunctionInstanceMethod(token, appId, functionInstanceId, functionInstanceData, options),
          delete: (functionInstanceId: number) =>
            deleteFunctionInstanceMethod(token, appId, functionInstanceId, options),
        },
      },
    };
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
 * Deletes an edge application.
 */
const deleteEdgeApplicationMethod = async (
  token: string,
  id: number,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse> => {
  try {
    const data = await deleteApplication(resolveToken(token), id, resolveDebug(options?.debug));
    return { data };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to delete edge application',
        operation: 'delete edge application',
      },
    };
  }
};

/**
 * Retrieves an edge application by ID.
 */
const getEdgeApplicationMethod = async (
  token: string,
  id: number,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse> => {
  try {
    const data = await getApplicationById(resolveToken(token), id, resolveDebug(options?.debug));
    return { data };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to get edge application',
        operation: 'get edge application',
      },
    };
  }
};

/**
 * Retrieves a list of edge applications.
 */
const getEdgeApplicationsMethod = async (
  token: string,
  params?: AzionEdgeApplicationCollectionOptions,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse> => {
  try {
    const data = await getApplications(resolveToken(token), params, resolveDebug(options?.debug));
    return { data };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to get edge applications',
        operation: 'get edge applications',
      },
    };
  }
};

/**
 * Updates an edge application.
 */
const updateEdgeApplicationMethod = async (
  token: string,
  id: number,
  applicationData: ApiUpdateApplicationPayload,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse> => {
  try {
    const data = await updateApplication(resolveToken(token), id, applicationData, resolveDebug(options?.debug));
    return { data };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to update edge application',
        operation: 'update edge application',
      },
    };
  }
};

/**
 * Partially updates an edge application.
 */
const patchEdgeApplicationMethod = async (
  token: string,
  id: number,
  applicationData: Partial<ApiUpdateApplicationPayload>,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse> => {
  try {
    const data = await patchApplication(resolveToken(token), id, applicationData, resolveDebug(options?.debug));
    return { data };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to patch edge application',
        operation: 'patch edge application',
      },
    };
  }
};

const createFunctionInstanceMethod = async (
  token: string,
  edgeApplicationId: number,
  functionInstanceData: ApiCreateFunctionInstanceRequest,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse> => {
  try {
    const data = await createFunctionInstance(
      resolveToken(token),
      edgeApplicationId,
      functionInstanceData,
      resolveDebug(options?.debug),
    );
    return { data };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to create function instance',
        operation: 'create function instance',
      },
    };
  }
};

const getFunctionInstanceMethod = async (
  token: string,
  edgeApplicationId: number,
  functionInstanceId: number,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse> => {
  try {
    const data = await getFunctionInstanceById(
      resolveToken(token),
      edgeApplicationId,
      functionInstanceId,
      resolveDebug(options?.debug),
    );
    return { data };
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
): Promise<AzionEdgeApplicationResponse> => {
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
  functionInstanceData: ApiUpdateFunctionInstanceRequest,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse> => {
  try {
    const data = await updateFunctionInstance(
      resolveToken(token),
      edgeApplicationId,
      functionInstanceId,
      functionInstanceData,
      resolveDebug(options?.debug),
    );
    return { data };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to update function instance',
        operation: 'update function instance',
      },
    };
  }
};

const deleteFunctionInstanceMethod = async (
  token: string,
  edgeApplicationId: number,
  functionInstanceId: number,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse> => {
  try {
    const data = await deleteFunctionInstance(
      resolveToken(token),
      edgeApplicationId,
      functionInstanceId,
      resolveDebug(options?.debug),
    );
    return { data };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to delete function instance',
        operation: 'delete function instance',
      },
    };
  }
};

// Cache Settings Methods

/**
 * Creates a new cache setting for an edge application.
 */
const createCacheSettingMethod = async (
  token: string,
  edgeApplicationId: number,
  cacheSettingData: ApiCreateCacheSettingPayload,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse> => {
  try {
    const data = await createCacheSetting(
      resolveToken(token),
      edgeApplicationId,
      cacheSettingData,
      resolveDebug(options?.debug),
    );
    return { data };
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
 * Deletes a cache setting from an edge application.
 */
const deleteCacheSettingMethod = async (
  token: string,
  edgeApplicationId: number,
  cacheSettingId: number,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse> => {
  try {
    const data = await deleteCacheSetting(
      resolveToken(token),
      edgeApplicationId,
      cacheSettingId,
      resolveDebug(options?.debug),
    );
    return { data };
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
 * Retrieves a cache setting by ID from an edge application.
 */
const getCacheSettingMethod = async (
  token: string,
  edgeApplicationId: number,
  cacheSettingId: number,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse> => {
  try {
    const data = await getCacheSettingById(
      resolveToken(token),
      edgeApplicationId,
      cacheSettingId,
      resolveDebug(options?.debug),
    );
    return { data };
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
 * Retrieves all cache settings for an edge application.
 */
const getCacheSettingsMethod = async (
  token: string,
  edgeApplicationId: number,
  params?: ApiListCacheSettingsParams,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse> => {
  try {
    const data = await getCacheSettings(resolveToken(token), edgeApplicationId, params, resolveDebug(options?.debug));
    return { data };
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
 * Updates a cache setting for an edge application.
 */
const updateCacheSettingMethod = async (
  token: string,
  edgeApplicationId: number,
  cacheSettingId: number,
  cacheSettingData: ApiUpdateCacheSettingPayload,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse> => {
  try {
    const data = await updateCacheSetting(
      resolveToken(token),
      edgeApplicationId,
      cacheSettingId,
      cacheSettingData,
      resolveDebug(options?.debug),
    );
    return { data };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to update cache setting',
        operation: 'update cache setting',
      },
    };
  }
};

// Rules Methods

/**
 * Creates a new rule for an edge application.
 */
const createRuleMethod = async (
  token: string,
  edgeApplicationId: number,
  phase: 'request' | 'response',
  ruleData: ApiCreateRulePayload,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse> => {
  try {
    const data = await createRule(
      resolveToken(token),
      edgeApplicationId,
      phase,
      ruleData,
      resolveDebug(options?.debug),
    );
    return { data };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to create rule',
        operation: 'create rule',
      },
    };
  }
};

/**
 * Deletes a rule from an edge application.
 */
const deleteRuleMethod = async (
  token: string,
  edgeApplicationId: number,
  phase: 'request' | 'response',
  ruleId: number,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse> => {
  try {
    const data = await deleteRule(resolveToken(token), edgeApplicationId, phase, ruleId, resolveDebug(options?.debug));
    return { data };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to delete rule',
        operation: 'delete rule',
      },
    };
  }
};

/**
 * Retrieves a rule by ID from an edge application.
 */
const getRuleMethod = async (
  token: string,
  edgeApplicationId: number,
  phase: 'request' | 'response',
  ruleId: number,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse> => {
  try {
    const data = await getRuleById(resolveToken(token), edgeApplicationId, phase, ruleId, resolveDebug(options?.debug));
    return { data };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to get rule',
        operation: 'get rule',
      },
    };
  }
};

/**
 * Retrieves all rules for an edge application.
 */
const getRulesMethod = async (
  token: string,
  edgeApplicationId: number,
  phase: 'request' | 'response',
  params?: ApiListRulesParams,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse> => {
  try {
    const data = await listRules(resolveToken(token), edgeApplicationId, phase, params, resolveDebug(options?.debug));
    return { data };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to get rules',
        operation: 'get rules',
      },
    };
  }
};

/**
 * Updates a rule for an edge application.
 */
const updateRuleMethod = async (
  token: string,
  edgeApplicationId: number,
  phase: 'request' | 'response',
  ruleId: number,
  ruleData: ApiUpdateRulePayload,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse> => {
  try {
    const data = await updateRule(
      resolveToken(token),
      edgeApplicationId,
      phase,
      ruleId,
      ruleData,
      resolveDebug(options?.debug),
    );
    return { data };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to update rule',
        operation: 'update rule',
      },
    };
  }
};

// Origins Methods

/**
 * Creates a new origin for an edge application.
 */
const createOriginMethod = async (
  token: string,
  edgeApplicationId: number,
  originData: ApiCreateOriginPayload,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse> => {
  try {
    const data = await createOrigin(resolveToken(token), edgeApplicationId, originData, resolveDebug(options?.debug));
    return { data };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to create origin',
        operation: 'create origin',
      },
    };
  }
};

/**
 * Deletes an origin from an edge application.
 */
const deleteOriginMethod = async (
  token: string,
  edgeApplicationId: number,
  originKey: string,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse> => {
  try {
    const data = await deleteOrigin(resolveToken(token), edgeApplicationId, originKey, resolveDebug(options?.debug));
    return { data };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to delete origin',
        operation: 'delete origin',
      },
    };
  }
};

/**
 * Retrieves an origin by key from an edge application.
 */
const getOriginMethod = async (
  token: string,
  edgeApplicationId: number,
  originKey: string,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse> => {
  try {
    const data = await getOriginByKey(resolveToken(token), edgeApplicationId, originKey, resolveDebug(options?.debug));
    return { data };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to get origin',
        operation: 'get origin',
      },
    };
  }
};

/**
 * Retrieves all origins for an edge application.
 */
const getOriginsMethod = async (
  token: string,
  edgeApplicationId: number,
  params?: ApiListOriginsParams,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse> => {
  try {
    const data = await listOrigins(resolveToken(token), edgeApplicationId, params, resolveDebug(options?.debug));
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
): Promise<AzionEdgeApplicationResponse> => {
  try {
    const data = await updateOrigin(
      resolveToken(token),
      edgeApplicationId,
      originKey,
      originData,
      resolveDebug(options?.debug),
    );
    return { data };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to update origin',
        operation: 'update origin',
      },
    };
  }
};

// Device Groups Methods

const createDeviceGroupMethod = async (
  token: string,
  edgeApplicationId: number,
  deviceGroupData: ApiCreateDeviceGroupPayload,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse> => {
  try {
    const data = await createDeviceGroup(
      resolveToken(token),
      edgeApplicationId,
      deviceGroupData,
      resolveDebug(options?.debug),
    );
    return { data };
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
): Promise<AzionEdgeApplicationResponse> => {
  try {
    const data = await deleteDeviceGroup(
      resolveToken(token),
      edgeApplicationId,
      deviceGroupId,
      resolveDebug(options?.debug),
    );
    return { data };
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
): Promise<AzionEdgeApplicationResponse> => {
  try {
    const data = await getDeviceGroupById(
      resolveToken(token),
      edgeApplicationId,
      deviceGroupId,
      resolveDebug(options?.debug),
    );
    return { data };
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
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse> => {
  try {
    const data = await getDeviceGroups(resolveToken(token), edgeApplicationId, undefined, resolveDebug(options?.debug));
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
): Promise<AzionEdgeApplicationResponse> => {
  try {
    const data = await updateDeviceGroup(
      resolveToken(token),
      edgeApplicationId,
      deviceGroupId,
      deviceGroupData,
      resolveDebug(options?.debug),
    );
    return { data };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to update device group',
        operation: 'update device group',
      },
    };
  }
};

// Wrapper methods for all new functionalities

const createEdgeApplicationWrapper = ({
  applicationData,
  options,
}: {
  applicationData: ApiCreateApplicationPayload;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationResponse> => createEdgeApplicationMethod(resolveToken(), applicationData, options);

const deleteEdgeApplicationWrapper = ({
  id,
  options,
}: {
  id: number;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationResponse> => deleteEdgeApplicationMethod(resolveToken(), id, options);

const getEdgeApplicationWrapper = ({
  id,
  options,
}: {
  id: number;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationResponse> => getEdgeApplicationMethod(resolveToken(), id, options);

const getEdgeApplicationsWrapper = ({
  params,
  options,
}: {
  params?: ApiListApplicationsParams;
  options?: AzionClientOptions;
} = {}): Promise<AzionEdgeApplicationResponse> => getEdgeApplicationsMethod(resolveToken(), params, options);

const updateEdgeApplicationWrapper = ({
  id,
  applicationData,
  options,
}: {
  id: number;
  applicationData: ApiUpdateApplicationPayload;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationResponse> => updateEdgeApplicationMethod(resolveToken(), id, applicationData, options);

const patchEdgeApplicationWrapper = ({
  id,
  applicationData,
  options,
}: {
  id: number;
  applicationData: Partial<ApiUpdateApplicationPayload>;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationResponse> => patchEdgeApplicationMethod(resolveToken(), id, applicationData, options);

const createCacheSettingWrapper = ({
  edgeApplicationId,
  cacheSettingData,
  options,
}: {
  edgeApplicationId: number;
  cacheSettingData: ApiCreateCacheSettingPayload;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationResponse> =>
  createCacheSettingMethod(resolveToken(), edgeApplicationId, cacheSettingData, options);

const deleteCacheSettingWrapper = ({
  edgeApplicationId,
  cacheSettingId,
  options,
}: {
  edgeApplicationId: number;
  cacheSettingId: number;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationResponse> =>
  deleteCacheSettingMethod(resolveToken(), edgeApplicationId, cacheSettingId, options);

const getCacheSettingWrapper = ({
  edgeApplicationId,
  cacheSettingId,
  options,
}: {
  edgeApplicationId: number;
  cacheSettingId: number;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationResponse> =>
  getCacheSettingMethod(resolveToken(), edgeApplicationId, cacheSettingId, options);

const getCacheSettingsWrapper = ({
  edgeApplicationId,
  params,
  options,
}: {
  edgeApplicationId: number;
  params?: ApiListCacheSettingsParams;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationResponse> => getCacheSettingsMethod(resolveToken(), edgeApplicationId, params, options);

const updateCacheSettingWrapper = ({
  edgeApplicationId,
  cacheSettingId,
  cacheSettingData,
  options,
}: {
  edgeApplicationId: number;
  cacheSettingId: number;
  cacheSettingData: ApiUpdateCacheSettingPayload;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationResponse> =>
  updateCacheSettingMethod(resolveToken(), edgeApplicationId, cacheSettingId, cacheSettingData, options);

const createRuleWrapper = ({
  edgeApplicationId,
  phase,
  ruleData,
  options,
}: {
  edgeApplicationId: number;
  phase: 'request' | 'response';
  ruleData: ApiCreateRulePayload;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationResponse> =>
  createRuleMethod(resolveToken(), edgeApplicationId, phase, ruleData, options);

const deleteRuleWrapper = ({
  edgeApplicationId,
  phase,
  ruleId,
  options,
}: {
  edgeApplicationId: number;
  phase: 'request' | 'response';
  ruleId: number;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationResponse> =>
  deleteRuleMethod(resolveToken(), edgeApplicationId, phase, ruleId, options);

const getRuleWrapper = ({
  edgeApplicationId,
  phase,
  ruleId,
  options,
}: {
  edgeApplicationId: number;
  phase: 'request' | 'response';
  ruleId: number;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationResponse> => getRuleMethod(resolveToken(), edgeApplicationId, phase, ruleId, options);

const getRulesWrapper = ({
  edgeApplicationId,
  phase,
  params,
  options,
}: {
  edgeApplicationId: number;
  phase: 'request' | 'response';
  params?: ApiListRulesParams;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationResponse> => getRulesMethod(resolveToken(), edgeApplicationId, phase, params, options);

const updateRuleWrapper = ({
  edgeApplicationId,
  phase,
  ruleId,
  ruleData,
  options,
}: {
  edgeApplicationId: number;
  phase: 'request' | 'response';
  ruleId: number;
  ruleData: ApiUpdateRulePayload;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationResponse> =>
  updateRuleMethod(resolveToken(), edgeApplicationId, phase, ruleId, ruleData, options);

const createOriginWrapper = ({
  edgeApplicationId,
  originData,
  options,
}: {
  edgeApplicationId: number;
  originData: ApiCreateOriginPayload;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationResponse> => createOriginMethod(resolveToken(), edgeApplicationId, originData, options);

const deleteOriginWrapper = ({
  edgeApplicationId,
  originKey,
  options,
}: {
  edgeApplicationId: number;
  originKey: string;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationResponse> => deleteOriginMethod(resolveToken(), edgeApplicationId, originKey, options);

const getOriginWrapper = ({
  edgeApplicationId,
  originKey,
  options,
}: {
  edgeApplicationId: number;
  originKey: string;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationResponse> => getOriginMethod(resolveToken(), edgeApplicationId, originKey, options);

const getOriginsWrapper = ({
  edgeApplicationId,
  params,
  options,
}: {
  edgeApplicationId: number;
  params?: ApiListOriginsParams;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationResponse> => getOriginsMethod(resolveToken(), edgeApplicationId, params, options);

const updateOriginWrapper = ({
  edgeApplicationId,
  originKey,
  originData,
  options,
}: {
  edgeApplicationId: number;
  originKey: string;
  originData: ApiUpdateOriginRequest;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationResponse> =>
  updateOriginMethod(resolveToken(), edgeApplicationId, originKey, originData, options);

const createDeviceGroupWrapper = ({
  edgeApplicationId,
  deviceGroupData,
  options,
}: {
  edgeApplicationId: number;
  deviceGroupData: ApiCreateDeviceGroupPayload;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationResponse> =>
  createDeviceGroupMethod(resolveToken(), edgeApplicationId, deviceGroupData, options);

const deleteDeviceGroupWrapper = ({
  edgeApplicationId,
  deviceGroupId,
  options,
}: {
  edgeApplicationId: number;
  deviceGroupId: number;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationResponse> =>
  deleteDeviceGroupMethod(resolveToken(), edgeApplicationId, deviceGroupId, options);

const getDeviceGroupWrapper = ({
  edgeApplicationId,
  deviceGroupId,
  options,
}: {
  edgeApplicationId: number;
  deviceGroupId: number;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationResponse> =>
  getDeviceGroupMethod(resolveToken(), edgeApplicationId, deviceGroupId, options);

const getDeviceGroupsWrapper = ({
  edgeApplicationId,
  options,
}: {
  edgeApplicationId: number;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationResponse> => getDeviceGroupsMethod(resolveToken(), edgeApplicationId, options);

const updateDeviceGroupWrapper = ({
  edgeApplicationId,
  deviceGroupId,
  deviceGroupData,
  options,
}: {
  edgeApplicationId: number;
  deviceGroupId: number;
  deviceGroupData: ApiUpdateDeviceGroupPayload;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationResponse> =>
  updateDeviceGroupMethod(resolveToken(), edgeApplicationId, deviceGroupId, deviceGroupData, options);

const createFunctionInstanceWrapper = ({
  edgeApplicationId,
  functionInstanceData,
  options,
}: {
  edgeApplicationId: number;
  functionInstanceData: ApiCreateFunctionInstanceRequest;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationResponse> =>
  createFunctionInstanceMethod(resolveToken(), edgeApplicationId, functionInstanceData, options);

const getFunctionInstanceWrapper = ({
  edgeApplicationId,
  functionInstanceId,
  options,
}: {
  edgeApplicationId: number;
  functionInstanceId: number;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationResponse> =>
  getFunctionInstanceMethod(resolveToken(), edgeApplicationId, functionInstanceId, options);

const getFunctionInstancesWrapper = ({
  edgeApplicationId,
  params,
  options,
}: {
  edgeApplicationId: number;
  params?: ApiListFunctionInstancesParams;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationResponse> =>
  getFunctionInstancesMethod(resolveToken(), edgeApplicationId, params, options);

const updateFunctionInstanceWrapper = ({
  edgeApplicationId,
  functionInstanceId,
  functionInstanceData,
  options,
}: {
  edgeApplicationId: number;
  functionInstanceId: number;
  functionInstanceData: ApiUpdateFunctionInstanceRequest;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationResponse> =>
  updateFunctionInstanceMethod(resolveToken(), edgeApplicationId, functionInstanceId, functionInstanceData, options);

const deleteFunctionInstanceWrapper = ({
  edgeApplicationId,
  functionInstanceId,
  options,
}: {
  edgeApplicationId: number;
  functionInstanceId: number;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationResponse> =>
  deleteFunctionInstanceMethod(resolveToken(), edgeApplicationId, functionInstanceId, options);

// Update the client object to include new methods
const client: CreateAzionEdgeApplicationClient = (
  config?: Partial<{ token?: string; options?: AzionClientOptions }>,
): AzionEdgeApplicationClient => {
  const tokenValue = resolveToken(config?.token);
  const debugValue = resolveDebug(config?.options?.debug);

  const client: AzionEdgeApplicationClient = {
    createEdgeApplication: ({ applicationData: createEdgeApplicationPayload }) =>
      createEdgeApplicationMethod(tokenValue, applicationData, { ...config?.options, debug: debugValue }),
    deleteEdgeApplication: ({ id }) =>
      deleteEdgeApplicationMethod(tokenValue, id, { ...config?.options, debug: debugValue }),
    getEdgeApplication: ({ id }) => getEdgeApplicationMethod(tokenValue, id, { ...config?.options, debug: debugValue }),
    getEdgeApplications: ({ params } = {}) =>
      getEdgeApplicationsMethod(tokenValue, params, { ...config?.options, debug: debugValue }),
    updateEdgeApplication: ({ id, applicationData }) =>
      updateEdgeApplicationMethod(tokenValue, id, applicationData, { ...config?.options, debug: debugValue }),
    patchEdgeApplication: ({ id, applicationData }) =>
      patchEdgeApplicationMethod(tokenValue, id, applicationData, { ...config?.options, debug: debugValue }),
  };

  return client;
};

export {
  // Cache Settings
  createCacheSettingWrapper as createCacheSetting,
  client as createClient,
  // Device Groups
  createDeviceGroupWrapper as createDeviceGroup,
  // Edge Application
  createEdgeApplicationWrapper as createEdgeApplication,
  // Function Instances
  createFunctionInstanceWrapper as createFunctionInstance,
  // Origins
  createOriginWrapper as createOrigin,
  // Rules
  createRuleWrapper as createRule,
  deleteCacheSettingWrapper as deleteCacheSetting,
  deleteDeviceGroupWrapper as deleteDeviceGroup,
  deleteEdgeApplicationWrapper as deleteEdgeApplication,
  deleteFunctionInstanceWrapper as deleteFunctionInstance,
  deleteOriginWrapper as deleteOrigin,
  deleteRuleWrapper as deleteRule,
  getCacheSettingWrapper as getCacheSetting,
  getCacheSettingsWrapper as getCacheSettings,
  getDeviceGroupWrapper as getDeviceGroup,
  getDeviceGroupsWrapper as getDeviceGroups,
  getEdgeApplicationWrapper as getEdgeApplication,
  getEdgeApplicationsWrapper as getEdgeApplications,
  getFunctionInstanceWrapper as getFunctionInstance,
  getFunctionInstancesWrapper as getFunctionInstances,
  getOriginWrapper as getOrigin,
  getOriginsWrapper as getOrigins,
  getRuleWrapper as getRule,
  getRulesWrapper as getRules,
  patchEdgeApplicationWrapper as patchEdgeApplication,
  updateCacheSettingWrapper as updateCacheSetting,
  updateDeviceGroupWrapper as updateDeviceGroup,
  updateEdgeApplicationWrapper as updateEdgeApplication,
  updateFunctionInstanceWrapper as updateFunctionInstance,
  updateOriginWrapper as updateOrigin,
  updateRuleWrapper as updateRule,
};

export default client;

export type * from './types';
