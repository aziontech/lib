import {
  createCacheSettingMethod,
  deleteCacheSettingMethod,
  getCacheSettingMethod,
  getCacheSettingsMethod,
  updateCacheSettingMethod,
} from './cache-settings/index';

import {
  createDeviceGroupMethod,
  deleteDeviceGroupMethod,
  getDeviceGroupMethod,
  getDeviceGroupsMethod,
  updateDeviceGroupMethod,
} from './device-groups/index';

import {
  createFunctionInstanceMethod,
  deleteFunctionInstanceMethod,
  getFunctionInstanceMethod,
  getFunctionInstancesMethod,
  updateFunctionInstanceMethod,
} from './functions-instances/index';

import {
  createOriginMethod,
  deleteOriginMethod,
  getOriginMethod,
  getOriginsMethod,
  updateOriginMethod,
} from './origins/index';

import {
  createRuleMethod,
  deleteRuleMethod,
  getRuleMethod,
  getRulesMethod,
  updateRuleMethod,
} from './rules-engine/index';

import {
  createApplicationMethod,
  deleteApplicationMethod,
  getApplicationMethod,
  getApplicationsMethod,
  patchApplicationMethod,
} from './main-settings/index';

import {
  createApplicationWrapper,
  deleteApplicationWrapper,
  getApplicationWrapper,
  getApplicationsWrapper,
  patchApplicationWrapper,
  putApplicationWrapper,
} from './main-settings/index';

import {
  createCacheSettingWrapper,
  deleteCacheSettingWrapper,
  getCacheSettingWrapper,
  getCacheSettingsWrapper,
  updateCacheSettingWrapper,
} from './cache-settings/index';

import {
  createDeviceGroupWrapper,
  deleteDeviceGroupWrapper,
  getDeviceGroupWrapper,
  getDeviceGroupsWrapper,
  updateDeviceGroupWrapper,
} from './device-groups/index';

import {
  createFunctionInstanceWrapper,
  deleteFunctionInstanceWrapper,
  getFunctionInstanceWrapper,
  getFunctionInstancesWrapper,
  updateFunctionInstanceWrapper,
} from './functions-instances/index';

import {
  createOriginWrapper,
  deleteOriginWrapper,
  getOriginWrapper,
  getOriginsWrapper,
  updateOriginWrapper,
} from './origins/index';

import {
  createRuleWrapper,
  deleteRuleWrapper,
  getRuleWrapper,
  getRulesWrapper,
  updateRuleWrapper,
} from './rules-engine/index';

import type {
  AzionApplication,
  AzionApplicationClient,
  AzionApplicationCollectionOptions,
  AzionApplicationCollectionResponse,
  AzionApplicationResponse,
  AzionClientOptions,
  CreateAzionApplicationClient,
} from './types';

import { ApiCreateApplicationPayload, ApiUpdateApplicationPayload } from './main-settings/services/types';

import { mapApiError, resolveDebug, resolveToken } from './utils';

const createAzionApplicationClient: CreateAzionApplicationClient = (
  config?: Partial<{ token: string; options?: AzionClientOptions }>,
): AzionApplicationClient => {
  const tokenValue = resolveToken(config?.token);
  const debugValue = resolveDebug(config?.options?.debug);

  const client: AzionApplicationClient = {
    createApplication: async ({ data }: { data: ApiCreateApplicationPayload; options?: AzionClientOptions }) => {
      try {
        const apiResponse = await createApplicationMethod(tokenValue, data, { ...config, debug: debugValue });

        if (apiResponse.error || !apiResponse.data) {
          return mapApiError(apiResponse, 'create application', 'Failed to create application');
        }

        const appId = apiResponse.data.id;

        const application: AzionApplication = {
          ...apiResponse.data,
          cache: {
            createCacheSetting: (params) =>
              createCacheSettingMethod(tokenValue, appId, params.data, { ...config, debug: debugValue }),
            getCacheSetting: (params) =>
              getCacheSettingMethod(tokenValue, appId, params.cacheSettingId, { ...config, debug: debugValue }),
            getCacheSettings: (params) =>
              getCacheSettingsMethod(tokenValue, appId, params.params, { ...config, debug: debugValue }),
            updateCacheSetting: (params) =>
              updateCacheSettingMethod(tokenValue, appId, params.cacheSettingId, params.data, {
                ...config,
                debug: debugValue,
              }),
            deleteCacheSetting: (params) =>
              deleteCacheSettingMethod(tokenValue, appId, params.cacheSettingId, { ...config, debug: debugValue }),
          },
          origins: {
            createOrigin: (params) =>
              createOriginMethod(tokenValue, appId, params.data, { ...config, debug: debugValue }),
            getOrigin: (params) =>
              getOriginMethod(tokenValue, appId, params.originKey, { ...config, debug: debugValue }),
            getOrigins: (params) =>
              getOriginsMethod(tokenValue, appId, params.params, { ...config, debug: debugValue }),
            updateOrigin: (params) =>
              updateOriginMethod(tokenValue, appId, params.originKey, params.data, { ...config, debug: debugValue }),
            deleteOrigin: (params) =>
              deleteOriginMethod(tokenValue, appId, params.originKey, { ...config, debug: debugValue }),
          },
          rules: {
            request: {
              createRule: (params) =>
                createRuleMethod(tokenValue, appId, 'request', params.data, { ...config, debug: debugValue }),
              getRule: (params) =>
                getRuleMethod(tokenValue, appId, 'request', params.ruleId, { ...config, debug: debugValue }),
              getRules: (params) =>
                getRulesMethod(tokenValue, appId, 'request', params.params, { ...config, debug: debugValue }),
              updateRule: (params) =>
                updateRuleMethod(tokenValue, appId, 'request', params.ruleId, params.data, {
                  ...config,
                  debug: debugValue,
                }),
              deleteRule: (params) =>
                deleteRuleMethod(tokenValue, appId, 'request', params.ruleId, { ...config, debug: debugValue }),
            },
            response: {
              createRule: (params) =>
                createRuleMethod(tokenValue, appId, 'response', params.data, { ...config, debug: debugValue }),
              getRule: (params) =>
                getRuleMethod(tokenValue, appId, 'response', params.ruleId, { ...config, debug: debugValue }),
              getRules: (params) =>
                getRulesMethod(tokenValue, appId, 'response', params.params, { ...config, debug: debugValue }),
              updateRule: (params) =>
                updateRuleMethod(tokenValue, appId, 'response', params.ruleId, params.data, {
                  ...config,
                  debug: debugValue,
                }),
              deleteRule: (params) =>
                deleteRuleMethod(tokenValue, appId, 'response', params.ruleId, { ...config, debug: debugValue }),
            },
          },
          devices: {
            createDeviceGroup: (params) =>
              createDeviceGroupMethod(tokenValue, appId, params.data, { ...config, debug: debugValue }),
            getDeviceGroup: (params) =>
              getDeviceGroupMethod(tokenValue, appId, params.deviceGroupId, { ...config, debug: debugValue }),
            getDeviceGroups: (params) =>
              getDeviceGroupsMethod(tokenValue, appId, params.params, { ...config, debug: debugValue }),
            updateDeviceGroup: (params) =>
              updateDeviceGroupMethod(tokenValue, appId, params.deviceGroupId, params.data, {
                ...config,
                debug: debugValue,
              }),
            deleteDeviceGroup: (params) =>
              deleteDeviceGroupMethod(tokenValue, appId, params.deviceGroupId, { ...config, debug: debugValue }),
          },
          functions: {
            createFunctionInstance: (params) =>
              createFunctionInstanceMethod(tokenValue, appId, params.data, { ...config, debug: debugValue }),
            getFunctionInstance: (params) =>
              getFunctionInstanceMethod(tokenValue, appId, params.functionInstanceId, { ...config, debug: debugValue }),
            getFunctionInstances: (params) =>
              getFunctionInstancesMethod(tokenValue, appId, params.params, { ...config, debug: debugValue }),
            updateFunctionInstance: (params) =>
              updateFunctionInstanceMethod(tokenValue, appId, params.functionInstanceId, params.data, {
                ...config,
                debug: debugValue,
              }),
            deleteFunctionInstance: (params) =>
              deleteFunctionInstanceMethod(tokenValue, appId, params.functionInstanceId, {
                ...config,
                debug: debugValue,
              }),
          },
        };

        return { data: application };
      } catch (error) {
        return {
          error: {
            message: error instanceof Error ? error.message : 'Failed to create edge application',
            operation: 'create edge application',
          },
        };
      }
    },
    deleteApplication: async ({ applicationId, options }: { applicationId: number; options?: AzionClientOptions }) =>
      deleteApplicationMethod(tokenValue, applicationId, {
        ...config?.options,
        ...options,
        debug: resolveDebug(config?.options?.debug ?? options?.debug),
      }),
    getApplication: async ({ applicationId, options }: { applicationId: number; options?: AzionClientOptions }) => {
      const response = await getApplicationMethod(tokenValue, applicationId, {
        ...config?.options,
        ...options,
        debug: resolveDebug(config?.options?.debug ?? options?.debug),
      });
      if (response.data) {
        const appId = response.data.id;
        const application: AzionApplication = {
          ...response.data,
          cache: {
            createCacheSetting: (params) =>
              createCacheSettingMethod(tokenValue, appId, params.data, { ...config, debug: debugValue }),
            getCacheSetting: (params) =>
              getCacheSettingMethod(tokenValue, appId, params.cacheSettingId, { ...config, debug: debugValue }),
            getCacheSettings: (params) =>
              getCacheSettingsMethod(tokenValue, appId, params.params, { ...config, debug: debugValue }),
            updateCacheSetting: (params) =>
              updateCacheSettingMethod(tokenValue, appId, params.cacheSettingId, params.data, {
                ...config,
                debug: debugValue,
              }),
            deleteCacheSetting: (params) =>
              deleteCacheSettingMethod(tokenValue, appId, params.cacheSettingId, { ...config, debug: debugValue }),
          },
          origins: {
            createOrigin: (params) =>
              createOriginMethod(tokenValue, appId, params.data, { ...config, debug: debugValue }),
            getOrigin: (params) =>
              getOriginMethod(tokenValue, appId, params.originKey, { ...config, debug: debugValue }),
            getOrigins: (params) =>
              getOriginsMethod(tokenValue, appId, params.params, { ...config, debug: debugValue }),
            updateOrigin: (params) =>
              updateOriginMethod(tokenValue, appId, params.originKey, params.data, { ...config, debug: debugValue }),
            deleteOrigin: (params) =>
              deleteOriginMethod(tokenValue, appId, params.originKey, { ...config, debug: debugValue }),
          },
          rules: {
            request: {
              createRule: (params) =>
                createRuleMethod(tokenValue, appId, 'request', params.data, { ...config, debug: debugValue }),
              getRule: (params) =>
                getRuleMethod(tokenValue, appId, 'request', params.ruleId, { ...config, debug: debugValue }),
              getRules: (params) =>
                getRulesMethod(tokenValue, appId, 'request', params.params, { ...config, debug: debugValue }),
              updateRule: (params) =>
                updateRuleMethod(tokenValue, appId, 'request', params.ruleId, params.data, {
                  ...config,
                  debug: debugValue,
                }),
              deleteRule: (params) =>
                deleteRuleMethod(tokenValue, appId, 'request', params.ruleId, { ...config, debug: debugValue }),
            },
            response: {
              createRule: (params) =>
                createRuleMethod(tokenValue, appId, 'response', params.data, { ...config, debug: debugValue }),
              getRule: (params) =>
                getRuleMethod(tokenValue, appId, 'response', params.ruleId, { ...config, debug: debugValue }),
              getRules: (params) =>
                getRulesMethod(tokenValue, appId, 'response', params.params, { ...config, debug: debugValue }),
              updateRule: (params) =>
                updateRuleMethod(tokenValue, appId, 'response', params.ruleId, params.data, {
                  ...config,
                  debug: debugValue,
                }),
              deleteRule: (params) =>
                deleteRuleMethod(tokenValue, appId, 'response', params.ruleId, { ...config, debug: debugValue }),
            },
          },
          devices: {
            createDeviceGroup: (params) =>
              createDeviceGroupMethod(tokenValue, appId, params.data, { ...config, debug: debugValue }),
            getDeviceGroup: (params) =>
              getDeviceGroupMethod(tokenValue, appId, params.deviceGroupId, { ...config, debug: debugValue }),
            getDeviceGroups: (params) =>
              getDeviceGroupsMethod(tokenValue, appId, params.params, { ...config, debug: debugValue }),
            updateDeviceGroup: (params) =>
              updateDeviceGroupMethod(tokenValue, appId, params.deviceGroupId, params.data, {
                ...config,
                debug: debugValue,
              }),
            deleteDeviceGroup: (params) =>
              deleteDeviceGroupMethod(tokenValue, appId, params.deviceGroupId, { ...config, debug: debugValue }),
          },
          functions: {
            createFunctionInstance: (params) =>
              createFunctionInstanceMethod(tokenValue, appId, params.data, { ...config, debug: debugValue }),
            getFunctionInstance: (params) =>
              getFunctionInstanceMethod(tokenValue, appId, params.functionInstanceId, { ...config, debug: debugValue }),
            getFunctionInstances: (params) =>
              getFunctionInstancesMethod(tokenValue, appId, params.params, { ...config, debug: debugValue }),
            updateFunctionInstance: (params) =>
              updateFunctionInstanceMethod(tokenValue, appId, params.functionInstanceId, params.data, {
                ...config,
                debug: debugValue,
              }),
            deleteFunctionInstance: (params) =>
              deleteFunctionInstanceMethod(tokenValue, appId, params.functionInstanceId, {
                ...config,
                debug: debugValue,
              }),
          },
        };
        return { data: application } as AzionApplicationResponse<AzionApplication>;
      }
      return response as AzionApplicationResponse<AzionApplication>;
    },
    getApplications: async ({
      params,
      options,
    }: {
      params?: AzionApplicationCollectionOptions;
      options?: AzionClientOptions;
    }) => {
      const response = await getApplicationsMethod(tokenValue, params, {
        ...config?.options,
        ...options,
        debug: resolveDebug(options?.debug),
      });
      if (response.data) {
        const applications: AzionApplication[] = response.data.results.map((app) => ({
          ...app,
          cache: {
            createCacheSetting: (params) =>
              createCacheSettingMethod(tokenValue, app.id, params.data, { ...config, debug: debugValue }),
            getCacheSetting: (params) =>
              getCacheSettingMethod(tokenValue, app.id, params.cacheSettingId, { ...config, debug: debugValue }),
            getCacheSettings: (params) =>
              getCacheSettingsMethod(tokenValue, app.id, params.params, { ...config, debug: debugValue }),
            updateCacheSetting: (params) =>
              updateCacheSettingMethod(tokenValue, app.id, params.cacheSettingId, params.data, {
                ...config,
                debug: debugValue,
              }),
            deleteCacheSetting: (params) =>
              deleteCacheSettingMethod(tokenValue, app.id, params.cacheSettingId, { ...config, debug: debugValue }),
          },
          origins: {
            createOrigin: (params) =>
              createOriginMethod(tokenValue, app.id, params.data, { ...config, debug: debugValue }),
            getOrigin: (params) =>
              getOriginMethod(tokenValue, app.id, params.originKey, { ...config, debug: debugValue }),
            getOrigins: (params) =>
              getOriginsMethod(tokenValue, app.id, params.params, { ...config, debug: debugValue }),
            updateOrigin: (params) =>
              updateOriginMethod(tokenValue, app.id, params.originKey, params.data, { ...config, debug: debugValue }),
            deleteOrigin: (params) =>
              deleteOriginMethod(tokenValue, app.id, params.originKey, { ...config, debug: debugValue }),
          },
          rules: {
            request: {
              createRule: (params) =>
                createRuleMethod(tokenValue, app.id, 'request', params.data, { ...config, debug: debugValue }),
              getRule: (params) =>
                getRuleMethod(tokenValue, app.id, 'request', params.ruleId, { ...config, debug: debugValue }),
              getRules: (params) =>
                getRulesMethod(tokenValue, app.id, 'request', params.params, { ...config, debug: debugValue }),
              updateRule: (params) =>
                updateRuleMethod(tokenValue, app.id, 'request', params.ruleId, params.data, {
                  ...config,
                  debug: debugValue,
                }),
              deleteRule: (params) =>
                deleteRuleMethod(tokenValue, app.id, 'request', params.ruleId, { ...config, debug: debugValue }),
            },
            response: {
              createRule: (params) =>
                createRuleMethod(tokenValue, app.id, 'response', params.data, { ...config, debug: debugValue }),
              getRule: (params) =>
                getRuleMethod(tokenValue, app.id, 'response', params.ruleId, { ...config, debug: debugValue }),
              getRules: (params) =>
                getRulesMethod(tokenValue, app.id, 'response', params.params, { ...config, debug: debugValue }),
              updateRule: (params) =>
                updateRuleMethod(tokenValue, app.id, 'response', params.ruleId, params.data, {
                  ...config,
                  debug: debugValue,
                }),
              deleteRule: (params) =>
                deleteRuleMethod(tokenValue, app.id, 'response', params.ruleId, { ...config, debug: debugValue }),
            },
          },
          devices: {
            createDeviceGroup: (params) =>
              createDeviceGroupMethod(tokenValue, app.id, params.data, { ...config, debug: debugValue }),
            getDeviceGroup: (params) =>
              getDeviceGroupMethod(tokenValue, app.id, params.deviceGroupId, { ...config, debug: debugValue }),
            getDeviceGroups: (params) =>
              getDeviceGroupsMethod(tokenValue, app.id, params.params, { ...config, debug: debugValue }),
            updateDeviceGroup: (params) =>
              updateDeviceGroupMethod(tokenValue, app.id, params.deviceGroupId, params.data, {
                ...config,
                debug: debugValue,
              }),
            deleteDeviceGroup: (params) =>
              deleteDeviceGroupMethod(tokenValue, app.id, params.deviceGroupId, { ...config, debug: debugValue }),
          },
          functions: {
            createFunctionInstance: (params) =>
              createFunctionInstanceMethod(tokenValue, app.id, params.data, { ...config, debug: debugValue }),
            getFunctionInstance: (params) =>
              getFunctionInstanceMethod(tokenValue, app.id, params.functionInstanceId, {
                ...config,
                debug: debugValue,
              }),
            getFunctionInstances: (params) =>
              getFunctionInstancesMethod(tokenValue, app.id, params.params, { ...config, debug: debugValue }),
            updateFunctionInstance: (params) =>
              updateFunctionInstanceMethod(tokenValue, app.id, params.functionInstanceId, params.data, {
                ...config,
                debug: debugValue,
              }),
            deleteFunctionInstance: (params) =>
              deleteFunctionInstanceMethod(tokenValue, app.id, params.functionInstanceId, {
                ...config,
                debug: debugValue,
              }),
          },
        }));
        return {
          ...response,
          data: { ...response.data, results: applications },
        } as AzionApplicationCollectionResponse<AzionApplication>;
      }
      return response as AzionApplicationCollectionResponse<AzionApplication>;
    },
    updateApplication: async ({
      applicationId,
      data,
      options,
    }: {
      applicationId: number;
      data: ApiUpdateApplicationPayload;
      options?: AzionClientOptions;
    }) => {
      const response = await patchApplicationMethod(tokenValue, applicationId, data, {
        ...config?.options,
        ...options,
        debug: resolveDebug(options?.debug),
      });
      if (response.data) {
        const appId = response.data.id;
        const application: AzionApplication = {
          ...response.data,
          cache: {
            createCacheSetting: (params) =>
              createCacheSettingMethod(tokenValue, appId, params.data, { ...config, debug: debugValue }),
            getCacheSetting: (params) =>
              getCacheSettingMethod(tokenValue, appId, params.cacheSettingId, { ...config, debug: debugValue }),
            getCacheSettings: (params) =>
              getCacheSettingsMethod(tokenValue, appId, params.params, { ...config, debug: debugValue }),
            updateCacheSetting: (params) =>
              updateCacheSettingMethod(tokenValue, appId, params.cacheSettingId, params.data, {
                ...config,
                debug: debugValue,
              }),
            deleteCacheSetting: (params) =>
              deleteCacheSettingMethod(tokenValue, appId, params.cacheSettingId, { ...config, debug: debugValue }),
          },
          origins: {
            createOrigin: (params) =>
              createOriginMethod(tokenValue, appId, params.data, { ...config, debug: debugValue }),
            getOrigin: (params) =>
              getOriginMethod(tokenValue, appId, params.originKey, { ...config, debug: debugValue }),
            getOrigins: (params) =>
              getOriginsMethod(tokenValue, appId, params.params, { ...config, debug: debugValue }),
            updateOrigin: (params) =>
              updateOriginMethod(tokenValue, appId, params.originKey, params.data, { ...config, debug: debugValue }),
            deleteOrigin: (params) =>
              deleteOriginMethod(tokenValue, appId, params.originKey, { ...config, debug: debugValue }),
          },
          rules: {
            request: {
              createRule: (params) =>
                createRuleMethod(tokenValue, appId, 'request', params.data, { ...config, debug: debugValue }),
              getRule: (params) =>
                getRuleMethod(tokenValue, appId, 'request', params.ruleId, { ...config, debug: debugValue }),
              getRules: (params) =>
                getRulesMethod(tokenValue, appId, 'request', params.params, { ...config, debug: debugValue }),
              updateRule: (params) =>
                updateRuleMethod(tokenValue, appId, 'request', params.ruleId, params.data, {
                  ...config,
                  debug: debugValue,
                }),
              deleteRule: (params) =>
                deleteRuleMethod(tokenValue, appId, 'request', params.ruleId, { ...config, debug: debugValue }),
            },
            response: {
              createRule: (params) =>
                createRuleMethod(tokenValue, appId, 'response', params.data, { ...config, debug: debugValue }),
              getRule: (params) =>
                getRuleMethod(tokenValue, appId, 'response', params.ruleId, { ...config, debug: debugValue }),
              getRules: (params) =>
                getRulesMethod(tokenValue, appId, 'response', params.params, { ...config, debug: debugValue }),
              updateRule: (params) =>
                updateRuleMethod(tokenValue, appId, 'response', params.ruleId, params.data, {
                  ...config,
                  debug: debugValue,
                }),
              deleteRule: (params) =>
                deleteRuleMethod(tokenValue, appId, 'response', params.ruleId, { ...config, debug: debugValue }),
            },
          },
          devices: {
            createDeviceGroup: (params) =>
              createDeviceGroupMethod(tokenValue, appId, params.data, { ...config, debug: debugValue }),
            getDeviceGroup: (params) =>
              getDeviceGroupMethod(tokenValue, appId, params.deviceGroupId, { ...config, debug: debugValue }),
            getDeviceGroups: (params) =>
              getDeviceGroupsMethod(tokenValue, appId, params.params, { ...config, debug: debugValue }),
            updateDeviceGroup: (params) =>
              updateDeviceGroupMethod(tokenValue, appId, params.deviceGroupId, params.data, {
                ...config,
                debug: debugValue,
              }),
            deleteDeviceGroup: (params) =>
              deleteDeviceGroupMethod(tokenValue, appId, params.deviceGroupId, { ...config, debug: debugValue }),
          },
          functions: {
            createFunctionInstance: (params) =>
              createFunctionInstanceMethod(tokenValue, appId, params.data, { ...config, debug: debugValue }),
            getFunctionInstance: (params) =>
              getFunctionInstanceMethod(tokenValue, appId, params.functionInstanceId, { ...config, debug: debugValue }),
            getFunctionInstances: (params) =>
              getFunctionInstancesMethod(tokenValue, appId, params.params, { ...config, debug: debugValue }),
            updateFunctionInstance: (params) =>
              updateFunctionInstanceMethod(tokenValue, appId, params.functionInstanceId, params.data, {
                ...config,
                debug: debugValue,
              }),
            deleteFunctionInstance: (params) =>
              deleteFunctionInstanceMethod(tokenValue, appId, params.functionInstanceId, {
                ...config,
                debug: debugValue,
              }),
          },
        };
        return { data: application } as AzionApplicationResponse<AzionApplication>;
      }
      return response as AzionApplicationResponse<AzionApplication>;
    },
    patchApplication: async ({
      applicationId,
      data,
      options,
    }: {
      applicationId: number;
      data: Partial<ApiUpdateApplicationPayload>;
      options?: AzionClientOptions;
    }) => {
      const response = await patchApplicationMethod(tokenValue, applicationId, data, {
        ...config?.options,
        ...options,
        debug: resolveDebug(options?.debug),
      });
      if (response.data) {
        const appId = response.data.id;
        const application: AzionApplication = {
          ...response.data,
          cache: {
            createCacheSetting: (params) =>
              createCacheSettingMethod(tokenValue, appId, params.data, { ...config, debug: debugValue }),
            getCacheSetting: (params) =>
              getCacheSettingMethod(tokenValue, appId, params.cacheSettingId, { ...config, debug: debugValue }),
            getCacheSettings: (params) =>
              getCacheSettingsMethod(tokenValue, appId, params.params, { ...config, debug: debugValue }),
            updateCacheSetting: (params) =>
              updateCacheSettingMethod(tokenValue, appId, params.cacheSettingId, params.data, {
                ...config,
                debug: debugValue,
              }),
            deleteCacheSetting: (params) =>
              deleteCacheSettingMethod(tokenValue, appId, params.cacheSettingId, { ...config, debug: debugValue }),
          },
          origins: {
            createOrigin: (params) =>
              createOriginMethod(tokenValue, appId, params.data, { ...config, debug: debugValue }),
            getOrigin: (params) =>
              getOriginMethod(tokenValue, appId, params.originKey, { ...config, debug: debugValue }),
            getOrigins: (params) =>
              getOriginsMethod(tokenValue, appId, params.params, { ...config, debug: debugValue }),
            updateOrigin: (params) =>
              updateOriginMethod(tokenValue, appId, params.originKey, params.data, { ...config, debug: debugValue }),
            deleteOrigin: (params) =>
              deleteOriginMethod(tokenValue, appId, params.originKey, { ...config, debug: debugValue }),
          },
          rules: {
            request: {
              createRule: (params) =>
                createRuleMethod(tokenValue, appId, 'request', params.data, { ...config, debug: debugValue }),
              getRule: (params) =>
                getRuleMethod(tokenValue, appId, 'request', params.ruleId, { ...config, debug: debugValue }),
              getRules: (params) =>
                getRulesMethod(tokenValue, appId, 'request', params.params, { ...config, debug: debugValue }),
              updateRule: (params) =>
                updateRuleMethod(tokenValue, appId, 'request', params.ruleId, params.data, {
                  ...config,
                  debug: debugValue,
                }),
              deleteRule: (params) =>
                deleteRuleMethod(tokenValue, appId, 'request', params.ruleId, { ...config, debug: debugValue }),
            },
            response: {
              createRule: (params) =>
                createRuleMethod(tokenValue, appId, 'response', params.data, { ...config, debug: debugValue }),
              getRule: (params) =>
                getRuleMethod(tokenValue, appId, 'response', params.ruleId, { ...config, debug: debugValue }),
              getRules: (params) =>
                getRulesMethod(tokenValue, appId, 'response', params.params, { ...config, debug: debugValue }),
              updateRule: (params) =>
                updateRuleMethod(tokenValue, appId, 'response', params.ruleId, params.data, {
                  ...config,
                  debug: debugValue,
                }),
              deleteRule: (params) =>
                deleteRuleMethod(tokenValue, appId, 'response', params.ruleId, { ...config, debug: debugValue }),
            },
          },
          devices: {
            createDeviceGroup: (params) =>
              createDeviceGroupMethod(tokenValue, appId, params.data, { ...config, debug: debugValue }),
            getDeviceGroup: (params) =>
              getDeviceGroupMethod(tokenValue, appId, params.deviceGroupId, { ...config, debug: debugValue }),
            getDeviceGroups: (params) =>
              getDeviceGroupsMethod(tokenValue, appId, params.params, { ...config, debug: debugValue }),
            updateDeviceGroup: (params) =>
              updateDeviceGroupMethod(tokenValue, appId, params.deviceGroupId, params.data, {
                ...config,
                debug: debugValue,
              }),
            deleteDeviceGroup: (params) =>
              deleteDeviceGroupMethod(tokenValue, appId, params.deviceGroupId, { ...config, debug: debugValue }),
          },
          functions: {
            createFunctionInstance: (params) =>
              createFunctionInstanceMethod(tokenValue, appId, params.data, { ...config, debug: debugValue }),
            getFunctionInstance: (params) =>
              getFunctionInstanceMethod(tokenValue, appId, params.functionInstanceId, { ...config, debug: debugValue }),
            getFunctionInstances: (params) =>
              getFunctionInstancesMethod(tokenValue, appId, params.params, { ...config, debug: debugValue }),
            updateFunctionInstance: (params) =>
              updateFunctionInstanceMethod(tokenValue, appId, params.functionInstanceId, params.data, {
                ...config,
                debug: debugValue,
              }),
            deleteFunctionInstance: (params) =>
              deleteFunctionInstanceMethod(tokenValue, appId, params.functionInstanceId, {
                ...config,
                debug: debugValue,
              }),
          },
        };
        return { data: application } as AzionApplicationResponse<AzionApplication>;
      }
      return response as AzionApplicationResponse<AzionApplication>;
    },
  };

  return client;
};

export * from './cache-settings/types';
export * from './device-groups/types';
export * from './functions-instances/types';
export * from './main-settings/types';
export * from './origins/types';
export * from './rules-engine/types';
export * from './types';

export {
  createApplicationWrapper as createApplication,
  createAzionApplicationClient,
  createCacheSettingWrapper as createCacheSetting,
  createDeviceGroupWrapper as createDeviceGroup,
  createFunctionInstanceWrapper as createFunctionInstance,
  createOriginWrapper as createOrigin,
  createRuleWrapper as createRule,
  deleteApplicationWrapper as deleteApplication,
  deleteCacheSettingWrapper as deleteCacheSetting,
  deleteDeviceGroupWrapper as deleteDeviceGroup,
  deleteFunctionInstanceWrapper as deleteFunctionInstance,
  deleteOriginWrapper as deleteOrigin,
  deleteRuleWrapper as deleteRule,
  getApplicationWrapper as getApplication,
  getApplicationsWrapper as getApplications,
  getCacheSettingWrapper as getCacheSetting,
  getCacheSettingsWrapper as getCacheSettings,
  getDeviceGroupWrapper as getDeviceGroup,
  getDeviceGroupsWrapper as getDeviceGroups,
  getFunctionInstanceWrapper as getFunctionInstance,
  getFunctionInstancesWrapper as getFunctionInstances,
  getOriginWrapper as getOrigin,
  getOriginsWrapper as getOrigins,
  getRuleWrapper as getRule,
  getRulesWrapper as getRules,
  patchApplicationWrapper as patchApplication,
  putApplicationWrapper as putApplication,
  updateCacheSettingWrapper as updateCacheSetting,
  updateDeviceGroupWrapper as updateDeviceGroup,
  updateFunctionInstanceWrapper as updateFunctionInstance,
  updateOriginWrapper as updateOrigin,
  updateRuleWrapper as updateRule,
};
export default createAzionApplicationClient;
