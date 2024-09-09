import {
  createCacheSettingMethod,
  deleteCacheSettingMethod,
  getCacheSettingMethod,
  getCacheSettingsMethod,
  updateCacheSettingMethod,
} from '../cache-settings/index';
import {
  createDeviceGroupMethod,
  deleteDeviceGroupMethod,
  getDeviceGroupMethod,
  getDeviceGroupsMethod,
  updateDeviceGroupMethod,
} from '../device-groups/index';
import {
  createFunctionInstanceMethod,
  deleteFunctionInstanceMethod,
  getFunctionInstanceMethod,
  getFunctionInstancesMethod,
  updateFunctionInstanceMethod,
} from '../functions-instances/index';
import {
  createOriginMethod,
  deleteOriginMethod,
  getOriginMethod,
  getOriginsMethod,
  updateOriginMethod,
} from '../origins/index';
import {
  createRuleMethod,
  deleteRuleMethod,
  getRuleMethod,
  getRulesMethod,
  updateRuleMethod,
} from '../rules-engine/index';
import {
  AzionApplication,
  AzionApplicationCollectionResponse,
  AzionApplicationResponse,
  AzionClientOptions,
} from '../types';
import { mapApiError, resolveDebug, resolveToken } from '../utils';
import {
  deleteApplication as deleteApplicationApi,
  getApplicationById as getApplicationByIdApi,
  getApplications as getApplicationsApi,
  patchApplication as patchApplicationApi,
  postApplication as postApplicationApi,
  putApplication as putApplicationApi,
} from './services/index';
import { ApiCreateApplicationPayload, ApiListApplicationsParams, ApiUpdateApplicationPayload } from './services/types';

/**
 * Creates a new Azion Edge Application.
 *
 * @async
 * @function createApplicationMethod
 * @param {string} token - The authentication token.
 * @param {ApiCreateApplicationPayload} applicationData - The data for the new application.
 * @param {AzionClientOptions} [options] - Optional client options.
 * @returns {Promise<AzionApplicationResponse<AzionApplication>>} A promise that resolves with the created application data or an error.
 */
export const createApplicationMethod = async (
  token: string,
  applicationData: ApiCreateApplicationPayload,
  options?: AzionClientOptions,
): Promise<AzionApplicationResponse<AzionApplication>> => {
  const apiResponse = await postApplicationApi(resolveToken(token), applicationData, resolveDebug(options?.debug));

  if (!apiResponse || !apiResponse.results) {
    return {
      error: mapApiError(apiResponse, 'post application', 'Failed to post application'),
    };
  }

  const appId = apiResponse.results?.id;

  const application: AzionApplication = {
    ...apiResponse.results,
    cache: {
      createCacheSetting: (params) =>
        createCacheSettingMethod(token, appId, params.data, { ...options, debug: resolveDebug(options?.debug) }),
      getCacheSetting: (params) =>
        getCacheSettingMethod(token, appId, params.cacheSettingId, {
          ...options,
          debug: resolveDebug(options?.debug),
        }),
      getCacheSettings: (params) =>
        getCacheSettingsMethod(token, appId, params.params, { ...options, debug: resolveDebug(options?.debug) }),
      updateCacheSetting: (params) =>
        updateCacheSettingMethod(token, appId, params.cacheSettingId, params.data, {
          ...options,
          debug: resolveDebug(options?.debug),
        }),
      deleteCacheSetting: (params) =>
        deleteCacheSettingMethod(token, appId, params.cacheSettingId, {
          ...options,
          debug: resolveDebug(options?.debug),
        }),
    },
    origins: {
      createOrigin: (params) =>
        createOriginMethod(token, appId, params.data, { ...options, debug: resolveDebug(options?.debug) }),
      getOrigin: (params) =>
        getOriginMethod(token, appId, params.originKey, { ...options, debug: resolveDebug(options?.debug) }),
      getOrigins: (params) =>
        getOriginsMethod(token, appId, params.params, { ...options, debug: resolveDebug(options?.debug) }),
      updateOrigin: (params) =>
        updateOriginMethod(token, appId, params.originKey, params.data, {
          ...options,
          debug: resolveDebug(options?.debug),
        }),
      deleteOrigin: (params) =>
        deleteOriginMethod(token, appId, params.originKey, { ...options, debug: resolveDebug(options?.debug) }),
    },
    rules: {
      request: {
        createRule: (params) =>
          createRuleMethod(token, appId, 'request', params.data, { ...options, debug: resolveDebug(options?.debug) }),
        getRule: (params) =>
          getRuleMethod(token, appId, 'request', params.ruleId, { ...options, debug: resolveDebug(options?.debug) }),
        getRules: (params) =>
          getRulesMethod(token, appId, 'request', params.params, { ...options, debug: resolveDebug(options?.debug) }),
        updateRule: (params) =>
          updateRuleMethod(token, appId, 'request', params.ruleId, params.data, {
            ...options,
            debug: resolveDebug(options?.debug),
          }),
        deleteRule: (params) =>
          deleteRuleMethod(token, appId, 'request', params.ruleId, {
            ...options,
            debug: resolveDebug(options?.debug),
          }),
      },
      response: {
        createRule: (params) =>
          createRuleMethod(token, appId, 'response', params.data, {
            ...options,
            debug: resolveDebug(options?.debug),
          }),
        getRule: (params) =>
          getRuleMethod(token, appId, 'response', params.ruleId, { ...options, debug: resolveDebug(options?.debug) }),
        getRules: (params) =>
          getRulesMethod(token, appId, 'response', params.params, {
            ...options,
            debug: resolveDebug(options?.debug),
          }),
        updateRule: (params) =>
          updateRuleMethod(token, appId, 'response', params.ruleId, params.data, {
            ...options,
            debug: resolveDebug(options?.debug),
          }),
        deleteRule: (params) =>
          deleteRuleMethod(token, appId, 'response', params.ruleId, {
            ...options,
            debug: resolveDebug(options?.debug),
          }),
      },
    },
    devices: {
      createDeviceGroup: (params) =>
        createDeviceGroupMethod(token, appId, params.data, { ...options, debug: resolveDebug(options?.debug) }),
      getDeviceGroup: (params) =>
        getDeviceGroupMethod(token, appId, params.deviceGroupId, { ...options, debug: resolveDebug(options?.debug) }),
      getDeviceGroups: (params) =>
        getDeviceGroupsMethod(token, appId, params.params, { ...options, debug: resolveDebug(options?.debug) }),
      updateDeviceGroup: (params) =>
        updateDeviceGroupMethod(token, appId, params.deviceGroupId, params.data, {
          ...options,
          debug: resolveDebug(options?.debug),
        }),
      deleteDeviceGroup: (params) =>
        deleteDeviceGroupMethod(token, appId, params.deviceGroupId, {
          ...options,
          debug: resolveDebug(options?.debug),
        }),
    },
    functions: {
      createFunctionInstance: (params) =>
        createFunctionInstanceMethod(token, appId, params.data, { ...options, debug: resolveDebug(options?.debug) }),
      getFunctionInstance: (params) =>
        getFunctionInstanceMethod(token, appId, params.functionInstanceId, {
          ...options,
          debug: resolveDebug(options?.debug),
        }),
      getFunctionInstances: (params) =>
        getFunctionInstancesMethod(token, appId, params.params, { ...options, debug: resolveDebug(options?.debug) }),
      updateFunctionInstance: (params) =>
        updateFunctionInstanceMethod(token, appId, params.functionInstanceId, params.data, {
          ...options,
          debug: resolveDebug(options?.debug),
        }),
      deleteFunctionInstance: (params) =>
        deleteFunctionInstanceMethod(token, appId, params.functionInstanceId, {
          ...options,
          debug: resolveDebug(options?.debug),
        }),
    },
  };

  return { data: application };
};

/**
 * Retrieves a specific Azion Edge Application by ID.
 *
 * @async
 * @function getApplicationMethod
 * @param {string} token - The authentication token.
 * @param {number} applicationId - The ID of the application to retrieve.
 * @param {AzionClientOptions} [options] - Optional client options.
 * @returns {Promise<AzionApplicationResponse<AzionApplication>>} A promise that resolves with the application data or an error.
 */
export const getApplicationMethod = async (
  token: string,
  applicationId: number,
  options?: AzionClientOptions,
): Promise<AzionApplicationResponse<AzionApplication>> => {
  const apiResponse = await getApplicationByIdApi(resolveToken(token), applicationId, resolveDebug(options?.debug));

  if (!apiResponse || !apiResponse.results) {
    return {
      error: mapApiError(apiResponse, 'get application', 'Failed to get application'),
    };
  }

  const appId = apiResponse.results.id;

  const application: AzionApplication = {
    ...apiResponse.results,
    cache: {
      createCacheSetting: (params) =>
        createCacheSettingMethod(token, appId, params.data, { ...options, debug: resolveDebug(options?.debug) }),
      getCacheSetting: (params) =>
        getCacheSettingMethod(token, appId, params.cacheSettingId, {
          ...options,
          debug: resolveDebug(options?.debug),
        }),
      getCacheSettings: (params) =>
        getCacheSettingsMethod(token, appId, params.params, { ...options, debug: resolveDebug(options?.debug) }),
      updateCacheSetting: (params) =>
        updateCacheSettingMethod(token, appId, params.cacheSettingId, params.data, {
          ...options,
          debug: resolveDebug(options?.debug),
        }),
      deleteCacheSetting: (params) =>
        deleteCacheSettingMethod(token, appId, params.cacheSettingId, {
          ...options,
          debug: resolveDebug(options?.debug),
        }),
    },
    origins: {
      createOrigin: (params) =>
        createOriginMethod(token, appId, params.data, { ...options, debug: resolveDebug(options?.debug) }),
      getOrigin: (params) =>
        getOriginMethod(token, appId, params.originKey, { ...options, debug: resolveDebug(options?.debug) }),
      getOrigins: (params) =>
        getOriginsMethod(token, appId, params.params, { ...options, debug: resolveDebug(options?.debug) }),
      updateOrigin: (params) =>
        updateOriginMethod(token, appId, params.originKey, params.data, {
          ...options,
          debug: resolveDebug(options?.debug),
        }),
      deleteOrigin: (params) =>
        deleteOriginMethod(token, appId, params.originKey, { ...options, debug: resolveDebug(options?.debug) }),
    },
    rules: {
      request: {
        createRule: (params) =>
          createRuleMethod(token, appId, 'request', params.data, { ...options, debug: resolveDebug(options?.debug) }),
        getRule: (params) =>
          getRuleMethod(token, appId, 'request', params.ruleId, { ...options, debug: resolveDebug(options?.debug) }),
        getRules: (params) =>
          getRulesMethod(token, appId, 'request', params.params, { ...options, debug: resolveDebug(options?.debug) }),
        updateRule: (params) =>
          updateRuleMethod(token, appId, 'request', params.ruleId, params.data, {
            ...options,
            debug: resolveDebug(options?.debug),
          }),
        deleteRule: (params) =>
          deleteRuleMethod(token, appId, 'request', params.ruleId, {
            ...options,
            debug: resolveDebug(options?.debug),
          }),
      },
      response: {
        createRule: (params) =>
          createRuleMethod(token, appId, 'response', params.data, {
            ...options,
            debug: resolveDebug(options?.debug),
          }),
        getRule: (params) =>
          getRuleMethod(token, appId, 'response', params.ruleId, { ...options, debug: resolveDebug(options?.debug) }),
        getRules: (params) =>
          getRulesMethod(token, appId, 'response', params.params, {
            ...options,
            debug: resolveDebug(options?.debug),
          }),
        updateRule: (params) =>
          updateRuleMethod(token, appId, 'response', params.ruleId, params.data, {
            ...options,
            debug: resolveDebug(options?.debug),
          }),
        deleteRule: (params) =>
          deleteRuleMethod(token, appId, 'response', params.ruleId, {
            ...options,
            debug: resolveDebug(options?.debug),
          }),
      },
    },
    devices: {
      createDeviceGroup: (params) =>
        createDeviceGroupMethod(token, appId, params.data, { ...options, debug: resolveDebug(options?.debug) }),
      getDeviceGroup: (params) =>
        getDeviceGroupMethod(token, appId, params.deviceGroupId, { ...options, debug: resolveDebug(options?.debug) }),
      getDeviceGroups: (params) =>
        getDeviceGroupsMethod(token, appId, params.params, { ...options, debug: resolveDebug(options?.debug) }),
      updateDeviceGroup: (params) =>
        updateDeviceGroupMethod(token, appId, params.deviceGroupId, params.data, {
          ...options,
          debug: resolveDebug(options?.debug),
        }),
      deleteDeviceGroup: (params) =>
        deleteDeviceGroupMethod(token, appId, params.deviceGroupId, {
          ...options,
          debug: resolveDebug(options?.debug),
        }),
    },
    functions: {
      createFunctionInstance: (params) =>
        createFunctionInstanceMethod(token, appId, params.data, { ...options, debug: resolveDebug(options?.debug) }),
      getFunctionInstance: (params) =>
        getFunctionInstanceMethod(token, appId, params.functionInstanceId, {
          ...options,
          debug: resolveDebug(options?.debug),
        }),
      getFunctionInstances: (params) =>
        getFunctionInstancesMethod(token, appId, params.params, { ...options, debug: resolveDebug(options?.debug) }),
      updateFunctionInstance: (params) =>
        updateFunctionInstanceMethod(token, appId, params.functionInstanceId, params.data, {
          ...options,
          debug: resolveDebug(options?.debug),
        }),
      deleteFunctionInstance: (params) =>
        deleteFunctionInstanceMethod(token, appId, params.functionInstanceId, {
          ...options,
          debug: resolveDebug(options?.debug),
        }),
    },
  };

  return { data: application };
};

/**
 * Retrieves a list of Azion Edge Applications.
 *
 * @async
 * @function getApplicationsMethod
 * @param {string} token - The authentication token.
 * @param {ApiListApplicationsParams} [params] - Optional parameters for filtering and pagination.
 * @param {AzionClientOptions} [options] - Optional client options.
 * @returns {Promise<AzionApplicationCollectionResponse<AzionApplication>>} A promise that resolves with a collection of applications or an error.
 */
export const getApplicationsMethod = async (
  token: string,
  params?: ApiListApplicationsParams,
  options?: AzionClientOptions,
): Promise<AzionApplicationCollectionResponse<AzionApplication>> => {
  try {
    const apiResponse = await getApplicationsApi(resolveToken(token), params, resolveDebug(options?.debug));

    const results: AzionApplication[] = apiResponse.results.map((application) => {
      const appId = application.id;
      return {
        ...application,
        cache: {
          createCacheSetting: (params) =>
            createCacheSettingMethod(token, appId, params.data, { ...options, debug: resolveDebug(options?.debug) }),
          getCacheSetting: (params) =>
            getCacheSettingMethod(token, appId, params.cacheSettingId, {
              ...options,
              debug: resolveDebug(options?.debug),
            }),
          getCacheSettings: (params) =>
            getCacheSettingsMethod(token, appId, params.params, { ...options, debug: resolveDebug(options?.debug) }),
          updateCacheSetting: (params) =>
            updateCacheSettingMethod(token, appId, params.cacheSettingId, params.data, {
              ...options,
              debug: resolveDebug(options?.debug),
            }),
          deleteCacheSetting: (params) =>
            deleteCacheSettingMethod(token, appId, params.cacheSettingId, {
              ...options,
              debug: resolveDebug(options?.debug),
            }),
        },
        origins: {
          createOrigin: (params) =>
            createOriginMethod(token, appId, params.data, { ...options, debug: resolveDebug(options?.debug) }),
          getOrigin: (params) =>
            getOriginMethod(token, appId, params.originKey, { ...options, debug: resolveDebug(options?.debug) }),
          getOrigins: (params) =>
            getOriginsMethod(token, appId, params.params, { ...options, debug: resolveDebug(options?.debug) }),
          updateOrigin: (params) =>
            updateOriginMethod(token, appId, params.originKey, params.data, {
              ...options,
              debug: resolveDebug(options?.debug),
            }),
          deleteOrigin: (params) =>
            deleteOriginMethod(token, appId, params.originKey, { ...options, debug: resolveDebug(options?.debug) }),
        },
        rules: {
          request: {
            createRule: (params) =>
              createRuleMethod(token, appId, 'request', params.data, {
                ...options,
                debug: resolveDebug(options?.debug),
              }),
            getRule: (params) =>
              getRuleMethod(token, appId, 'request', params.ruleId, {
                ...options,
                debug: resolveDebug(options?.debug),
              }),
            getRules: (params) =>
              getRulesMethod(token, appId, 'request', params.params, {
                ...options,
                debug: resolveDebug(options?.debug),
              }),
            updateRule: (params) =>
              updateRuleMethod(token, appId, 'request', params.ruleId, params.data, {
                ...options,
                debug: resolveDebug(options?.debug),
              }),
            deleteRule: (params) =>
              deleteRuleMethod(token, appId, 'request', params.ruleId, {
                ...options,
                debug: resolveDebug(options?.debug),
              }),
          },
          response: {
            createRule: (params) =>
              createRuleMethod(token, appId, 'response', params.data, {
                ...options,
                debug: resolveDebug(options?.debug),
              }),
            getRule: (params) =>
              getRuleMethod(token, appId, 'response', params.ruleId, {
                ...options,
                debug: resolveDebug(options?.debug),
              }),
            getRules: (params) =>
              getRulesMethod(token, appId, 'response', params.params, {
                ...options,
                debug: resolveDebug(options?.debug),
              }),
            updateRule: (params) =>
              updateRuleMethod(token, appId, 'response', params.ruleId, params.data, {
                ...options,
                debug: resolveDebug(options?.debug),
              }),
            deleteRule: (params) =>
              deleteRuleMethod(token, appId, 'response', params.ruleId, {
                ...options,
                debug: resolveDebug(options?.debug),
              }),
          },
        },
        devices: {
          createDeviceGroup: (params) =>
            createDeviceGroupMethod(token, appId, params.data, { ...options, debug: resolveDebug(options?.debug) }),
          getDeviceGroup: (params) =>
            getDeviceGroupMethod(token, appId, params.deviceGroupId, {
              ...options,
              debug: resolveDebug(options?.debug),
            }),
          getDeviceGroups: (params) =>
            getDeviceGroupsMethod(token, appId, params.params, { ...options, debug: resolveDebug(options?.debug) }),
          updateDeviceGroup: (params) =>
            updateDeviceGroupMethod(token, appId, params.deviceGroupId, params.data, {
              ...options,
              debug: resolveDebug(options?.debug),
            }),
          deleteDeviceGroup: (params) =>
            deleteDeviceGroupMethod(token, appId, params.deviceGroupId, {
              ...options,
              debug: resolveDebug(options?.debug),
            }),
        },
        functions: {
          createFunctionInstance: (params) =>
            createFunctionInstanceMethod(token, appId, params.data, {
              ...options,
              debug: resolveDebug(options?.debug),
            }),
          getFunctionInstance: (params) =>
            getFunctionInstanceMethod(token, appId, params.functionInstanceId, {
              ...options,
              debug: resolveDebug(options?.debug),
            }),
          getFunctionInstances: (params) =>
            getFunctionInstancesMethod(token, appId, params.params, {
              ...options,
              debug: resolveDebug(options?.debug),
            }),
          updateFunctionInstance: (params) =>
            updateFunctionInstanceMethod(token, appId, params.functionInstanceId, params.data, {
              ...options,
              debug: resolveDebug(options?.debug),
            }),
          deleteFunctionInstance: (params) =>
            deleteFunctionInstanceMethod(token, appId, params.functionInstanceId, {
              ...options,
              debug: resolveDebug(options?.debug),
            }),
        },
      };
    });

    return {
      data: {
        ...apiResponse,
        results,
      },
    };
  } catch (error) {
    return {
      error: mapApiError(error, 'get applications', 'Failed to get applications'),
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
 * @returns {Promise<AzionApplicationResponse<AzionApplication>>} A promise that resolves with the updated application data or an error.
 */
export const putApplicationMethod = async (
  token: string,
  applicationId: number,
  applicationData: ApiUpdateApplicationPayload,
  options?: AzionClientOptions,
): Promise<AzionApplicationResponse<AzionApplication>> => {
  const apiResponse = await putApplicationApi(
    resolveToken(token),
    applicationId,
    applicationData,
    resolveDebug(options?.debug),
  );

  if (!apiResponse || !apiResponse.results) {
    return {
      error: mapApiError(apiResponse, 'put application', 'Failed to put application'),
    };
  }

  const appId = apiResponse.results.id;

  const application: AzionApplication = {
    ...apiResponse.results,
    cache: {
      createCacheSetting: (params) =>
        createCacheSettingMethod(token, appId, params.data, { ...options, debug: resolveDebug(options?.debug) }),
      getCacheSetting: (params) =>
        getCacheSettingMethod(token, appId, params.cacheSettingId, {
          ...options,
          debug: resolveDebug(options?.debug),
        }),
      getCacheSettings: (params) =>
        getCacheSettingsMethod(token, appId, params.params, { ...options, debug: resolveDebug(options?.debug) }),
      updateCacheSetting: (params) =>
        updateCacheSettingMethod(token, appId, params.cacheSettingId, params.data, {
          ...options,
          debug: resolveDebug(options?.debug),
        }),
      deleteCacheSetting: (params) =>
        deleteCacheSettingMethod(token, appId, params.cacheSettingId, {
          ...options,
          debug: resolveDebug(options?.debug),
        }),
    },
    origins: {
      createOrigin: (params) =>
        createOriginMethod(token, appId, params.data, { ...options, debug: resolveDebug(options?.debug) }),
      getOrigin: (params) =>
        getOriginMethod(token, appId, params.originKey, { ...options, debug: resolveDebug(options?.debug) }),
      getOrigins: (params) =>
        getOriginsMethod(token, appId, params.params, { ...options, debug: resolveDebug(options?.debug) }),
      updateOrigin: (params) =>
        updateOriginMethod(token, appId, params.originKey, params.data, {
          ...options,
          debug: resolveDebug(options?.debug),
        }),
      deleteOrigin: (params) =>
        deleteOriginMethod(token, appId, params.originKey, { ...options, debug: resolveDebug(options?.debug) }),
    },
    rules: {
      request: {
        createRule: (params) =>
          createRuleMethod(token, appId, 'request', params.data, { ...options, debug: resolveDebug(options?.debug) }),
        getRule: (params) =>
          getRuleMethod(token, appId, 'request', params.ruleId, { ...options, debug: resolveDebug(options?.debug) }),
        getRules: (params) =>
          getRulesMethod(token, appId, 'request', params.params, { ...options, debug: resolveDebug(options?.debug) }),
        updateRule: (params) =>
          updateRuleMethod(token, appId, 'request', params.ruleId, params.data, {
            ...options,
            debug: resolveDebug(options?.debug),
          }),
        deleteRule: (params) =>
          deleteRuleMethod(token, appId, 'request', params.ruleId, {
            ...options,
            debug: resolveDebug(options?.debug),
          }),
      },
      response: {
        createRule: (params) =>
          createRuleMethod(token, appId, 'response', params.data, {
            ...options,
            debug: resolveDebug(options?.debug),
          }),
        getRule: (params) =>
          getRuleMethod(token, appId, 'response', params.ruleId, { ...options, debug: resolveDebug(options?.debug) }),
        getRules: (params) =>
          getRulesMethod(token, appId, 'response', params.params, {
            ...options,
            debug: resolveDebug(options?.debug),
          }),
        updateRule: (params) =>
          updateRuleMethod(token, appId, 'response', params.ruleId, params.data, {
            ...options,
            debug: resolveDebug(options?.debug),
          }),
        deleteRule: (params) =>
          deleteRuleMethod(token, appId, 'response', params.ruleId, {
            ...options,
            debug: resolveDebug(options?.debug),
          }),
      },
    },
    devices: {
      createDeviceGroup: (params) =>
        createDeviceGroupMethod(token, appId, params.data, { ...options, debug: resolveDebug(options?.debug) }),
      getDeviceGroup: (params) =>
        getDeviceGroupMethod(token, appId, params.deviceGroupId, { ...options, debug: resolveDebug(options?.debug) }),
      getDeviceGroups: (params) =>
        getDeviceGroupsMethod(token, appId, params.params, { ...options, debug: resolveDebug(options?.debug) }),
      updateDeviceGroup: (params) =>
        updateDeviceGroupMethod(token, appId, params.deviceGroupId, params.data, {
          ...options,
          debug: resolveDebug(options?.debug),
        }),
      deleteDeviceGroup: (params) =>
        deleteDeviceGroupMethod(token, appId, params.deviceGroupId, {
          ...options,
          debug: resolveDebug(options?.debug),
        }),
    },
    functions: {
      createFunctionInstance: (params) =>
        createFunctionInstanceMethod(token, appId, params.data, { ...options, debug: resolveDebug(options?.debug) }),
      getFunctionInstance: (params) =>
        getFunctionInstanceMethod(token, appId, params.functionInstanceId, {
          ...options,
          debug: resolveDebug(options?.debug),
        }),
      getFunctionInstances: (params) =>
        getFunctionInstancesMethod(token, appId, params.params, { ...options, debug: resolveDebug(options?.debug) }),
      updateFunctionInstance: (params) =>
        updateFunctionInstanceMethod(token, appId, params.functionInstanceId, params.data, {
          ...options,
          debug: resolveDebug(options?.debug),
        }),
      deleteFunctionInstance: (params) =>
        deleteFunctionInstanceMethod(token, appId, params.functionInstanceId, {
          ...options,
          debug: resolveDebug(options?.debug),
        }),
    },
  };

  return { data: application };
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
 * @returns {Promise<AzionApplicationResponse<AzionApplication>>} A promise that resolves with the patched application data or an error.
 */
export const patchApplicationMethod = async (
  token: string,
  applicationId: number,
  applicationData: Partial<ApiUpdateApplicationPayload>,
  options?: AzionClientOptions,
): Promise<AzionApplicationResponse<AzionApplication>> => {
  const apiResponse = await patchApplicationApi(
    resolveToken(token),
    applicationId,
    applicationData,
    resolveDebug(options?.debug),
  );

  if (!apiResponse || !apiResponse.results) {
    return {
      error: mapApiError(apiResponse, 'patch application', 'Failed to patch application'),
    };
  }

  const appId = apiResponse.results.id;

  const application: AzionApplication = {
    ...apiResponse.results,
    cache: {
      createCacheSetting: (params) =>
        createCacheSettingMethod(token, appId, params.data, { ...options, debug: resolveDebug(options?.debug) }),
      getCacheSetting: (params) =>
        getCacheSettingMethod(token, appId, params.cacheSettingId, {
          ...options,
          debug: resolveDebug(options?.debug),
        }),
      getCacheSettings: (params) =>
        getCacheSettingsMethod(token, appId, params.params, { ...options, debug: resolveDebug(options?.debug) }),
      updateCacheSetting: (params) =>
        updateCacheSettingMethod(token, appId, params.cacheSettingId, params.data, {
          ...options,
          debug: resolveDebug(options?.debug),
        }),
      deleteCacheSetting: (params) =>
        deleteCacheSettingMethod(token, appId, params.cacheSettingId, {
          ...options,
          debug: resolveDebug(options?.debug),
        }),
    },
    origins: {
      createOrigin: (params) =>
        createOriginMethod(token, appId, params.data, { ...options, debug: resolveDebug(options?.debug) }),
      getOrigin: (params) =>
        getOriginMethod(token, appId, params.originKey, { ...options, debug: resolveDebug(options?.debug) }),
      getOrigins: (params) =>
        getOriginsMethod(token, appId, params.params, { ...options, debug: resolveDebug(options?.debug) }),
      updateOrigin: (params) =>
        updateOriginMethod(token, appId, params.originKey, params.data, {
          ...options,
          debug: resolveDebug(options?.debug),
        }),
      deleteOrigin: (params) =>
        deleteOriginMethod(token, appId, params.originKey, { ...options, debug: resolveDebug(options?.debug) }),
    },
    rules: {
      request: {
        createRule: (params) =>
          createRuleMethod(token, appId, 'request', params.data, { ...options, debug: resolveDebug(options?.debug) }),
        getRule: (params) =>
          getRuleMethod(token, appId, 'request', params.ruleId, { ...options, debug: resolveDebug(options?.debug) }),
        getRules: (params) =>
          getRulesMethod(token, appId, 'request', params.params, { ...options, debug: resolveDebug(options?.debug) }),
        updateRule: (params) =>
          updateRuleMethod(token, appId, 'request', params.ruleId, params.data, {
            ...options,
            debug: resolveDebug(options?.debug),
          }),
        deleteRule: (params) =>
          deleteRuleMethod(token, appId, 'request', params.ruleId, {
            ...options,
            debug: resolveDebug(options?.debug),
          }),
      },
      response: {
        createRule: (params) =>
          createRuleMethod(token, appId, 'response', params.data, {
            ...options,
            debug: resolveDebug(options?.debug),
          }),
        getRule: (params) =>
          getRuleMethod(token, appId, 'response', params.ruleId, { ...options, debug: resolveDebug(options?.debug) }),
        getRules: (params) =>
          getRulesMethod(token, appId, 'response', params.params, {
            ...options,
            debug: resolveDebug(options?.debug),
          }),
        updateRule: (params) =>
          updateRuleMethod(token, appId, 'response', params.ruleId, params.data, {
            ...options,
            debug: resolveDebug(options?.debug),
          }),
        deleteRule: (params) =>
          deleteRuleMethod(token, appId, 'response', params.ruleId, {
            ...options,
            debug: resolveDebug(options?.debug),
          }),
      },
    },
    devices: {
      createDeviceGroup: (params) =>
        createDeviceGroupMethod(token, appId, params.data, { ...options, debug: resolveDebug(options?.debug) }),
      getDeviceGroup: (params) =>
        getDeviceGroupMethod(token, appId, params.deviceGroupId, { ...options, debug: resolveDebug(options?.debug) }),
      getDeviceGroups: (params) =>
        getDeviceGroupsMethod(token, appId, params.params, { ...options, debug: resolveDebug(options?.debug) }),
      updateDeviceGroup: (params) =>
        updateDeviceGroupMethod(token, appId, params.deviceGroupId, params.data, {
          ...options,
          debug: resolveDebug(options?.debug),
        }),
      deleteDeviceGroup: (params) =>
        deleteDeviceGroupMethod(token, appId, params.deviceGroupId, {
          ...options,
          debug: resolveDebug(options?.debug),
        }),
    },
    functions: {
      createFunctionInstance: (params) =>
        createFunctionInstanceMethod(token, appId, params.data, { ...options, debug: resolveDebug(options?.debug) }),
      getFunctionInstance: (params) =>
        getFunctionInstanceMethod(token, appId, params.functionInstanceId, {
          ...options,
          debug: resolveDebug(options?.debug),
        }),
      getFunctionInstances: (params) =>
        getFunctionInstancesMethod(token, appId, params.params, { ...options, debug: resolveDebug(options?.debug) }),
      updateFunctionInstance: (params) =>
        updateFunctionInstanceMethod(token, appId, params.functionInstanceId, params.data, {
          ...options,
          debug: resolveDebug(options?.debug),
        }),
      deleteFunctionInstance: (params) =>
        deleteFunctionInstanceMethod(token, appId, params.functionInstanceId, {
          ...options,
          debug: resolveDebug(options?.debug),
        }),
    },
  };

  return { data: application };
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
export const deleteApplicationMethod = async (
  token: string,
  applicationId: number,
  options?: AzionClientOptions,
): Promise<AzionApplicationResponse<void>> => {
  try {
    await deleteApplicationApi(resolveToken(token), applicationId, resolveDebug(options?.debug));
    return { data: undefined };
  } catch (error) {
    return {
      error: mapApiError(error, 'delete application', 'Failed to delete application'),
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
 * @returns {Promise<AzionApplicationResponse<AzionApplication>>} A promise that resolves with the created application data or an error.
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
}): Promise<AzionApplicationResponse<AzionApplication>> => createApplicationMethod(resolveToken(), data, options);

/**
 * Retrieves a specific Azion Edge Application by ID.
 *
 * @async
 * @function
 * @param {Object} params - The parameters for retrieving an application.
 * @param {number} params.applicationId - The ID of the application to retrieve.
 * @param {AzionClientOptions} [params.options] - Optional client options.
 * @returns {Promise<AzionApplicationResponse<AzionApplication>>} A promise that resolves with the application data or an error.
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
}): Promise<AzionApplicationResponse<AzionApplication>> => getApplicationMethod(resolveToken(), applicationId, options);

/**
 * Retrieves a list of Azion Edge Applications.
 *
 * @async
 * @function
 * @param {Object} params - The parameters for retrieving applications.
 * @param {ApiListApplicationsParams} [params.params] - Optional parameters for filtering and pagination.
 * @param {AzionClientOptions} [params.options] - Optional client options.
 * @returns {Promise<AzionApplicationCollectionResponse<AzionApplication>>} A promise that resolves with a collection of applications or an error.
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
}): Promise<AzionApplicationCollectionResponse<AzionApplication>> =>
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
 * @returns {Promise<AzionApplicationResponse<AzionApplication>>} A promise that resolves with the updated application data or an error.
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
}): Promise<AzionApplicationResponse<AzionApplication>> =>
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
 * @returns {Promise<AzionApplicationResponse<AzionApplication>>} A promise that resolves with the patched application data or an error.
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
}): Promise<AzionApplicationResponse<AzionApplication>> =>
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
