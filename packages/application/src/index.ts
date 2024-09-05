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
  AzionClientOptions,
  AzionEdgeApplication,
  AzionEdgeApplicationClient,
  AzionEdgeApplicationCollectionOptions,
  AzionEdgeApplicationCollectionResponse,
  AzionEdgeApplicationResponse,
  CreateAzionEdgeApplicationClient,
} from './types';

import {
  createApplicationWrapper,
  deleteApplicationWrapper,
  getApplicationWrapper,
  getApplicationsWrapper,
  patchApplicationWrapper,
  updateApplicationWrapper,
} from './main-settings/index';
import { ApiCreateApplicationPayload, ApiUpdateApplicationPayload } from './main-settings/services/types';

const createAzionEdgeApplicationClient: CreateAzionEdgeApplicationClient = (
  config?: Partial<{ token: string; options?: AzionClientOptions }>,
): AzionEdgeApplicationClient => {
  const client: AzionEdgeApplicationClient = {
    create: async ({ data, options }: { data: ApiCreateApplicationPayload; options?: AzionClientOptions }) => {
      try {
        const apiResponse = await createApplicationWrapper({ data, options: { ...config?.options, ...options } });
        if (apiResponse.error || !apiResponse.data) {
          return apiResponse as AzionEdgeApplicationResponse<AzionEdgeApplication>;
        }
        const appId = apiResponse.data.id;

        const edgeApplication: AzionEdgeApplication = {
          ...apiResponse.data,
          cache: {
            create: (params) => createCacheSettingWrapper({ applicationId: appId, ...params }),
            get: (params) => getCacheSettingWrapper({ applicationId: appId, ...params }),
            getAll: (params) => getCacheSettingsWrapper({ applicationId: appId, ...params }),
            update: (params) => updateCacheSettingWrapper({ applicationId: appId, ...params }),
            delete: (params) => deleteCacheSettingWrapper({ applicationId: appId, ...params }),
          },
          origins: {
            create: (params) => createOriginWrapper({ applicationId: appId, ...params }),
            get: (params) => getOriginWrapper({ applicationId: appId, ...params }),
            getAll: (params) => getOriginsWrapper({ applicationId: appId, ...params }),
            update: (params) => updateOriginWrapper({ applicationId: appId, ...params }),
            delete: (params) => deleteOriginWrapper({ applicationId: appId, ...params }),
          },
          rules: {
            request: {
              create: (params) => createRuleWrapper({ applicationId: appId, phase: 'request', ...params }),
              get: (params) => getRuleWrapper({ applicationId: appId, phase: 'request', ...params }),
              getAll: (params) => getRulesWrapper({ applicationId: appId, phase: 'request', ...params }),
              update: (params) => updateRuleWrapper({ applicationId: appId, phase: 'request', ...params }),
              delete: (params) => deleteRuleWrapper({ applicationId: appId, phase: 'request', ...params }),
            },
            response: {
              create: (params) => createRuleWrapper({ applicationId: appId, phase: 'response', ...params }),
              get: (params) => getRuleWrapper({ applicationId: appId, phase: 'response', ...params }),
              getAll: (params) => getRulesWrapper({ applicationId: appId, phase: 'response', ...params }),
              update: (params) => updateRuleWrapper({ applicationId: appId, phase: 'response', ...params }),
              delete: (params) => deleteRuleWrapper({ applicationId: appId, phase: 'response', ...params }),
            },
          },
          devices: {
            create: (params) => createDeviceGroupWrapper({ applicationId: appId, ...params }),
            get: (params) => getDeviceGroupWrapper({ applicationId: appId, ...params }),
            getAll: (params) => getDeviceGroupsWrapper({ applicationId: appId, ...params }),
            update: (params) => updateDeviceGroupWrapper({ applicationId: appId, ...params }),
            delete: (params) => deleteDeviceGroupWrapper({ applicationId: appId, ...params }),
          },
          functions: {
            create: (params) => createFunctionInstanceWrapper({ applicationId: appId, ...params }),
            get: (params) => getFunctionInstanceWrapper({ applicationId: appId, ...params }),
            getAll: (params) => getFunctionInstancesWrapper({ applicationId: appId, ...params }),
            update: (params) => updateFunctionInstanceWrapper({ applicationId: appId, ...params }),
            delete: (params) => deleteFunctionInstanceWrapper({ applicationId: appId, ...params }),
          },
        };

        return { data: edgeApplication };
      } catch (error) {
        return {
          error: {
            message: error instanceof Error ? error.message : 'Falha ao criar aplicação de borda',
            operation: 'criar aplicação de borda',
          },
        };
      }
    },
    delete: async ({ applicationId, options }: { applicationId: number; options?: AzionClientOptions }) =>
      deleteApplicationWrapper({ applicationId, options: { ...config?.options, ...options } }),
    get: async ({ applicationId, options }: { applicationId: number; options?: AzionClientOptions }) => {
      const response = await getApplicationWrapper({ applicationId, options: { ...config?.options, ...options } });
      if (response.data) {
        const appId = response.data.id;
        const edgeApplication: AzionEdgeApplication = {
          ...response.data,
          cache: {
            create: (params) => createCacheSettingWrapper({ applicationId: appId, ...params }),
            get: (params) => getCacheSettingWrapper({ applicationId: appId, ...params }),
            getAll: (params) => getCacheSettingsWrapper({ applicationId: appId, ...params }),
            update: (params) => updateCacheSettingWrapper({ applicationId: appId, ...params }),
            delete: (params) => deleteCacheSettingWrapper({ applicationId: appId, ...params }),
          },
          origins: {
            create: (params) => createOriginWrapper({ applicationId: appId, ...params }),
            get: (params) => getOriginWrapper({ applicationId: appId, ...params }),
            getAll: (params) => getOriginsWrapper({ applicationId: appId, ...params }),
            update: (params) => updateOriginWrapper({ applicationId: appId, ...params }),
            delete: (params) => deleteOriginWrapper({ applicationId: appId, ...params }),
          },
          rules: {
            request: {
              create: (params) => createRuleWrapper({ applicationId: appId, phase: 'request', ...params }),
              get: (params) => getRuleWrapper({ applicationId: appId, phase: 'request', ...params }),
              getAll: (params) => getRulesWrapper({ applicationId: appId, phase: 'request', ...params }),
              update: (params) => updateRuleWrapper({ applicationId: appId, phase: 'request', ...params }),
              delete: (params) => deleteRuleWrapper({ applicationId: appId, phase: 'request', ...params }),
            },
            response: {
              create: (params) => createRuleWrapper({ applicationId: appId, phase: 'response', ...params }),
              get: (params) => getRuleWrapper({ applicationId: appId, phase: 'response', ...params }),
              getAll: (params) => getRulesWrapper({ applicationId: appId, phase: 'response', ...params }),
              update: (params) => updateRuleWrapper({ applicationId: appId, phase: 'response', ...params }),
              delete: (params) => deleteRuleWrapper({ applicationId: appId, phase: 'response', ...params }),
            },
          },
          devices: {
            create: (params) => createDeviceGroupWrapper({ applicationId: appId, ...params }),
            get: (params) => getDeviceGroupWrapper({ applicationId: appId, ...params }),
            getAll: (params) => getDeviceGroupsWrapper({ applicationId: appId, ...params }),
            update: (params) => updateDeviceGroupWrapper({ applicationId: appId, ...params }),
            delete: (params) => deleteDeviceGroupWrapper({ applicationId: appId, ...params }),
          },
          functions: {
            create: (params) => createFunctionInstanceWrapper({ applicationId: appId, ...params }),
            get: (params) => getFunctionInstanceWrapper({ applicationId: appId, ...params }),
            getAll: (params) => getFunctionInstancesWrapper({ applicationId: appId, ...params }),
            update: (params) => updateFunctionInstanceWrapper({ applicationId: appId, ...params }),
            delete: (params) => deleteFunctionInstanceWrapper({ applicationId: appId, ...params }),
          },
        };
        return { data: edgeApplication } as AzionEdgeApplicationResponse<AzionEdgeApplication>;
      }
      return response as AzionEdgeApplicationResponse<AzionEdgeApplication>;
    },
    getAll: async ({
      params,
      options,
    }: {
      params?: AzionEdgeApplicationCollectionOptions;
      options?: AzionClientOptions;
    }) => {
      const response = await getApplicationsWrapper({ params, options: { ...config?.options, ...options } });
      if (response.data) {
        const edgeApplications: AzionEdgeApplication[] = response.data.results.map((app) => ({
          ...app,
          cache: {
            create: (params) => createCacheSettingWrapper({ applicationId: app.id, ...params }),
            get: (params) => getCacheSettingWrapper({ applicationId: app.id, ...params }),
            getAll: (params) => getCacheSettingsWrapper({ applicationId: app.id, ...params }),
            update: (params) => updateCacheSettingWrapper({ applicationId: app.id, ...params }),
            delete: (params) => deleteCacheSettingWrapper({ applicationId: app.id, ...params }),
          },
          origins: {
            create: (params) => createOriginWrapper({ applicationId: app.id, ...params }),
            get: (params) => getOriginWrapper({ applicationId: app.id, ...params }),
            getAll: (params) => getOriginsWrapper({ applicationId: app.id, ...params }),
            update: (params) => updateOriginWrapper({ applicationId: app.id, ...params }),
            delete: (params) => deleteOriginWrapper({ applicationId: app.id, ...params }),
          },
          rules: {
            request: {
              create: (params) => createRuleWrapper({ applicationId: app.id, phase: 'request', ...params }),
              get: (params) => getRuleWrapper({ applicationId: app.id, phase: 'request', ...params }),
              getAll: (params) => getRulesWrapper({ applicationId: app.id, phase: 'request', ...params }),
              update: (params) => updateRuleWrapper({ applicationId: app.id, phase: 'request', ...params }),
              delete: (params) => deleteRuleWrapper({ applicationId: app.id, phase: 'request', ...params }),
            },
            response: {
              create: (params) => createRuleWrapper({ applicationId: app.id, phase: 'response', ...params }),
              get: (params) => getRuleWrapper({ applicationId: app.id, phase: 'response', ...params }),
              getAll: (params) => getRulesWrapper({ applicationId: app.id, phase: 'response', ...params }),
              update: (params) => updateRuleWrapper({ applicationId: app.id, phase: 'response', ...params }),
              delete: (params) => deleteRuleWrapper({ applicationId: app.id, phase: 'response', ...params }),
            },
          },
          devices: {
            create: (params) => createDeviceGroupWrapper({ applicationId: app.id, ...params }),
            get: (params) => getDeviceGroupWrapper({ applicationId: app.id, ...params }),
            getAll: (params) => getDeviceGroupsWrapper({ applicationId: app.id, ...params }),
            update: (params) => updateDeviceGroupWrapper({ applicationId: app.id, ...params }),
            delete: (params) => deleteDeviceGroupWrapper({ applicationId: app.id, ...params }),
          },
          functions: {
            create: (params) => createFunctionInstanceWrapper({ applicationId: app.id, ...params }),
            get: (params) => getFunctionInstanceWrapper({ applicationId: app.id, ...params }),
            getAll: (params) => getFunctionInstancesWrapper({ applicationId: app.id, ...params }),
            update: (params) => updateFunctionInstanceWrapper({ applicationId: app.id, ...params }),
            delete: (params) => deleteFunctionInstanceWrapper({ applicationId: app.id, ...params }),
          },
        }));
        return {
          ...response,
          data: { ...response.data, results: edgeApplications },
        } as AzionEdgeApplicationCollectionResponse<AzionEdgeApplication>;
      }
      return response as AzionEdgeApplicationCollectionResponse<AzionEdgeApplication>;
    },
    update: async ({
      applicationId,
      data,
      options,
    }: {
      applicationId: number;
      data: ApiUpdateApplicationPayload;
      options?: AzionClientOptions;
    }) => {
      const response = await updateApplicationWrapper({
        applicationId,
        data,
        options: { ...config?.options, ...options },
      });
      if (response.data) {
        const appId = response.data.id;
        const edgeApplication: AzionEdgeApplication = {
          ...response.data,
          cache: {
            create: (params) => createCacheSettingWrapper({ applicationId: appId, ...params }),
            get: (params) => getCacheSettingWrapper({ applicationId: appId, ...params }),
            getAll: (params) => getCacheSettingsWrapper({ applicationId: appId, ...params }),
            update: (params) => updateCacheSettingWrapper({ applicationId: appId, ...params }),
            delete: (params) => deleteCacheSettingWrapper({ applicationId: appId, ...params }),
          },
          origins: {
            create: (params) => createOriginWrapper({ applicationId: appId, ...params }),
            get: (params) => getOriginWrapper({ applicationId: appId, ...params }),
            getAll: (params) => getOriginsWrapper({ applicationId: appId, ...params }),
            update: (params) => updateOriginWrapper({ applicationId: appId, ...params }),
            delete: (params) => deleteOriginWrapper({ applicationId: appId, ...params }),
          },
          rules: {
            request: {
              create: (params) => createRuleWrapper({ applicationId: appId, phase: 'request', ...params }),
              get: (params) => getRuleWrapper({ applicationId: appId, phase: 'request', ...params }),
              getAll: (params) => getRulesWrapper({ applicationId: appId, phase: 'request', ...params }),
              update: (params) => updateRuleWrapper({ applicationId: appId, phase: 'request', ...params }),
              delete: (params) => deleteRuleWrapper({ applicationId: appId, phase: 'request', ...params }),
            },
            response: {
              create: (params) => createRuleWrapper({ applicationId: appId, phase: 'response', ...params }),
              get: (params) => getRuleWrapper({ applicationId: appId, phase: 'response', ...params }),
              getAll: (params) => getRulesWrapper({ applicationId: appId, phase: 'response', ...params }),
              update: (params) => updateRuleWrapper({ applicationId: appId, phase: 'response', ...params }),
              delete: (params) => deleteRuleWrapper({ applicationId: appId, phase: 'response', ...params }),
            },
          },
          devices: {
            create: (params) => createDeviceGroupWrapper({ applicationId: appId, ...params }),
            get: (params) => getDeviceGroupWrapper({ applicationId: appId, ...params }),
            getAll: (params) => getDeviceGroupsWrapper({ applicationId: appId, ...params }),
            update: (params) => updateDeviceGroupWrapper({ applicationId: appId, ...params }),
            delete: (params) => deleteDeviceGroupWrapper({ applicationId: appId, ...params }),
          },
          functions: {
            create: (params) => createFunctionInstanceWrapper({ applicationId: appId, ...params }),
            get: (params) => getFunctionInstanceWrapper({ applicationId: appId, ...params }),
            getAll: (params) => getFunctionInstancesWrapper({ applicationId: appId, ...params }),
            update: (params) => updateFunctionInstanceWrapper({ applicationId: appId, ...params }),
            delete: (params) => deleteFunctionInstanceWrapper({ applicationId: appId, ...params }),
          },
        };
        return { data: edgeApplication } as AzionEdgeApplicationResponse<AzionEdgeApplication>;
      }
      return response as AzionEdgeApplicationResponse<AzionEdgeApplication>;
    },
    patch: async ({
      applicationId,
      data,
      options,
    }: {
      applicationId: number;
      data: Partial<ApiUpdateApplicationPayload>;
      options?: AzionClientOptions;
    }) => {
      const response = await patchApplicationWrapper({
        applicationId,
        data,
        options: { ...config?.options, ...options },
      });
      if (response.data) {
        const appId = response.data.id;
        const edgeApplication: AzionEdgeApplication = {
          ...response.data,
          cache: {
            create: (params) => createCacheSettingWrapper({ applicationId: appId, ...params }),
            get: (params) => getCacheSettingWrapper({ applicationId: appId, ...params }),
            getAll: (params) => getCacheSettingsWrapper({ applicationId: appId, ...params }),
            update: (params) => updateCacheSettingWrapper({ applicationId: appId, ...params }),
            delete: (params) => deleteCacheSettingWrapper({ applicationId: appId, ...params }),
          },
          origins: {
            create: (params) => createOriginWrapper({ applicationId: appId, ...params }),
            get: (params) => getOriginWrapper({ applicationId: appId, ...params }),
            getAll: (params) => getOriginsWrapper({ applicationId: appId, ...params }),
            update: (params) => updateOriginWrapper({ applicationId: appId, ...params }),
            delete: (params) => deleteOriginWrapper({ applicationId: appId, ...params }),
          },
          rules: {
            request: {
              create: (params) => createRuleWrapper({ applicationId: appId, phase: 'request', ...params }),
              get: (params) => getRuleWrapper({ applicationId: appId, phase: 'request', ...params }),
              getAll: (params) => getRulesWrapper({ applicationId: appId, phase: 'request', ...params }),
              update: (params) => updateRuleWrapper({ applicationId: appId, phase: 'request', ...params }),
              delete: (params) => deleteRuleWrapper({ applicationId: appId, phase: 'request', ...params }),
            },
            response: {
              create: (params) => createRuleWrapper({ applicationId: appId, phase: 'response', ...params }),
              get: (params) => getRuleWrapper({ applicationId: appId, phase: 'response', ...params }),
              getAll: (params) => getRulesWrapper({ applicationId: appId, phase: 'response', ...params }),
              update: (params) => updateRuleWrapper({ applicationId: appId, phase: 'response', ...params }),
              delete: (params) => deleteRuleWrapper({ applicationId: appId, phase: 'response', ...params }),
            },
          },
          devices: {
            create: (params) => createDeviceGroupWrapper({ applicationId: appId, ...params }),
            get: (params) => getDeviceGroupWrapper({ applicationId: appId, ...params }),
            getAll: (params) => getDeviceGroupsWrapper({ applicationId: appId, ...params }),
            update: (params) => updateDeviceGroupWrapper({ applicationId: appId, ...params }),
            delete: (params) => deleteDeviceGroupWrapper({ applicationId: appId, ...params }),
          },
          functions: {
            create: (params) => createFunctionInstanceWrapper({ applicationId: appId, ...params }),
            get: (params) => getFunctionInstanceWrapper({ applicationId: appId, ...params }),
            getAll: (params) => getFunctionInstancesWrapper({ applicationId: appId, ...params }),
            update: (params) => updateFunctionInstanceWrapper({ applicationId: appId, ...params }),
            delete: (params) => deleteFunctionInstanceWrapper({ applicationId: appId, ...params }),
          },
        };
        return { data: edgeApplication } as AzionEdgeApplicationResponse<AzionEdgeApplication>;
      }
      return response as AzionEdgeApplicationResponse<AzionEdgeApplication>;
    },
  };

  return client;
};

export default createAzionEdgeApplicationClient;

export * from './cache-settings/types';
export * from './device-groups/types';
export * from './functions-instances/types';
export * from './main-settings/types';
export * from './origins/types';
export * from './rules-engine/types';
export * from './types';
export {
  createApplicationWrapper as createApplication,
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
  updateApplicationWrapper as updateApplication,
  updateCacheSettingWrapper as updateCacheSetting,
  updateDeviceGroupWrapper as updateDeviceGroup,
  updateFunctionInstanceWrapper as updateFunctionInstance,
  updateOriginWrapper as updateOrigin,
  updateRuleWrapper as updateRule,
};
