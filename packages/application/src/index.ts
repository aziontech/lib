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

import {
  createApplicationWrapper,
  deleteApplicationWrapper,
  getApplicationWrapper,
  getApplicationsWrapper,
  patchApplicationWrapper,
  putApplicationWrapper,
} from './main-settings/index';
import { ApiCreateApplicationPayload, ApiUpdateApplicationPayload } from './main-settings/services/types';

/**
 * Creates an Azion Application client with methods to interact with various application resources.
 *
 * @param {Partial<{ token: string; options?: AzionClientOptions }>} [config] - Configuration options for the Application client.
 * @returns {AzionApplicationClient} An object with methods to interact with Azion Application resources.
 *
 * @example
 * const applicationClient = createClient({ token: 'your-api-token', options: { debug: true } });
 *
 * // Create a new edge application
 * const newApplication = await applicationClient.createApplication({
 *   data: {
 *     name: 'My Edge Application',
 *     delivery_protocol: 'http',
 *     origin_type: 'single_origin',
 *     address: 'example.com'
 *   }
 * });
 *
 * // Get an existing edge application
 * const application = await applicationClient.getApplication({
 *   applicationId: 1234
 * });
 *
 * // Update an edge application
 * const updatedApplication = await applicationClient.updateApplication({
 *   applicationId: 1234,
 *   data: {
 *     name: 'Updated Edge Application Name'
 *   }
 * });
 *
 * // Delete an edge application
 * const deletedApplication = await applicationClient.deleteApplication({
 *   applicationId: 1234
 * });
 *
 * // List all edge applications
 * const applications = await applicationClient.getApplications({
 *   params: { page: 1, page_size: 20 }
 * });
 */
const createAzionApplicationClient: CreateAzionApplicationClient = (
  config?: Partial<{ token: string; options?: AzionClientOptions }>,
): AzionApplicationClient => {
  const client: AzionApplicationClient = {
    createApplication: async ({
      data,
      options,
    }: {
      data: ApiCreateApplicationPayload;
      options?: AzionClientOptions;
    }) => {
      try {
        const apiResponse = await createApplicationWrapper({ data, options: { ...config?.options, ...options } });
        if (apiResponse.error || !apiResponse.data) {
          return apiResponse as AzionApplicationResponse<AzionApplication>;
        }
        const appId = apiResponse.data.id;

        const application: AzionApplication = {
          ...apiResponse.data,
          cache: {
            createCacheSetting: (params) => createCacheSettingWrapper({ applicationId: appId, ...params }),
            getCacheSetting: (params) => getCacheSettingWrapper({ applicationId: appId, ...params }),
            getCacheSettings: (params) => getCacheSettingsWrapper({ applicationId: appId, ...params }),
            updateCacheSetting: (params) => updateCacheSettingWrapper({ applicationId: appId, ...params }),
            deleteCacheSetting: (params) => deleteCacheSettingWrapper({ applicationId: appId, ...params }),
          },
          origins: {
            createOrigin: (params) => createOriginWrapper({ applicationId: appId, ...params }),
            getOrigin: (params) => getOriginWrapper({ applicationId: appId, ...params }),
            getOrigins: (params) => getOriginsWrapper({ applicationId: appId, ...params }),
            updateOrigin: (params) => updateOriginWrapper({ applicationId: appId, ...params }),
            deleteOrigin: (params) => deleteOriginWrapper({ applicationId: appId, ...params }),
          },
          rules: {
            request: {
              createRule: (params) => createRuleWrapper({ applicationId: appId, phase: 'request', ...params }),
              getRule: (params) => getRuleWrapper({ applicationId: appId, phase: 'request', ...params }),
              getRules: (params) => getRulesWrapper({ applicationId: appId, phase: 'request', ...params }),
              updateRule: (params) => updateRuleWrapper({ applicationId: appId, phase: 'request', ...params }),
              deleteRule: (params) => deleteRuleWrapper({ applicationId: appId, phase: 'request', ...params }),
            },
            response: {
              createRule: (params) => createRuleWrapper({ applicationId: appId, phase: 'response', ...params }),
              getRule: (params) => getRuleWrapper({ applicationId: appId, phase: 'response', ...params }),
              getRules: (params) => getRulesWrapper({ applicationId: appId, phase: 'response', ...params }),
              updateRule: (params) => updateRuleWrapper({ applicationId: appId, phase: 'response', ...params }),
              deleteRule: (params) => deleteRuleWrapper({ applicationId: appId, phase: 'response', ...params }),
            },
          },
          devices: {
            createDeviceGroup: (params) => createDeviceGroupWrapper({ applicationId: appId, ...params }),
            getDeviceGroup: (params) => getDeviceGroupWrapper({ applicationId: appId, ...params }),
            getDeviceGroups: (params) => getDeviceGroupsWrapper({ applicationId: appId, ...params }),
            updateDeviceGroup: (params) => updateDeviceGroupWrapper({ applicationId: appId, ...params }),
            deleteDeviceGroup: (params) => deleteDeviceGroupWrapper({ applicationId: appId, ...params }),
          },
          functions: {
            createFunctionInstance: (params) => createFunctionInstanceWrapper({ applicationId: appId, ...params }),
            getFunctionInstance: (params) => getFunctionInstanceWrapper({ applicationId: appId, ...params }),
            getFunctionInstances: (params) => getFunctionInstancesWrapper({ applicationId: appId, ...params }),
            updateFunctionInstance: (params) => updateFunctionInstanceWrapper({ applicationId: appId, ...params }),
            deleteFunctionInstance: (params) => deleteFunctionInstanceWrapper({ applicationId: appId, ...params }),
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
      deleteApplicationWrapper({ applicationId, options: { ...config?.options, ...options } }),
    getApplication: async ({ applicationId, options }: { applicationId: number; options?: AzionClientOptions }) => {
      const response = await getApplicationWrapper({ applicationId, options: { ...config?.options, ...options } });
      if (response.data) {
        const appId = response.data.id;
        const application: AzionApplication = {
          ...response.data,
          cache: {
            createCacheSetting: (params) => createCacheSettingWrapper({ applicationId: appId, ...params }),
            getCacheSetting: (params) => getCacheSettingWrapper({ applicationId: appId, ...params }),
            getCacheSettings: (params) => getCacheSettingsWrapper({ applicationId: appId, ...params }),
            updateCacheSetting: (params) => updateCacheSettingWrapper({ applicationId: appId, ...params }),
            deleteCacheSetting: (params) => deleteCacheSettingWrapper({ applicationId: appId, ...params }),
          },
          origins: {
            createOrigin: (params) => createOriginWrapper({ applicationId: appId, ...params }),
            getOrigin: (params) => getOriginWrapper({ applicationId: appId, ...params }),
            getOrigins: (params) => getOriginsWrapper({ applicationId: appId, ...params }),
            updateOrigin: (params) => updateOriginWrapper({ applicationId: appId, ...params }),
            deleteOrigin: (params) => deleteOriginWrapper({ applicationId: appId, ...params }),
          },
          rules: {
            request: {
              createRule: (params) => createRuleWrapper({ applicationId: appId, phase: 'request', ...params }),
              getRule: (params) => getRuleWrapper({ applicationId: appId, phase: 'request', ...params }),
              getRules: (params) => getRulesWrapper({ applicationId: appId, phase: 'request', ...params }),
              updateRule: (params) => updateRuleWrapper({ applicationId: appId, phase: 'request', ...params }),
              deleteRule: (params) => deleteRuleWrapper({ applicationId: appId, phase: 'request', ...params }),
            },
            response: {
              createRule: (params) => createRuleWrapper({ applicationId: appId, phase: 'response', ...params }),
              getRule: (params) => getRuleWrapper({ applicationId: appId, phase: 'response', ...params }),
              getRules: (params) => getRulesWrapper({ applicationId: appId, phase: 'response', ...params }),
              updateRule: (params) => updateRuleWrapper({ applicationId: appId, phase: 'response', ...params }),
              deleteRule: (params) => deleteRuleWrapper({ applicationId: appId, phase: 'response', ...params }),
            },
          },
          devices: {
            createDeviceGroup: (params) => createDeviceGroupWrapper({ applicationId: appId, ...params }),
            getDeviceGroup: (params) => getDeviceGroupWrapper({ applicationId: appId, ...params }),
            getDeviceGroups: (params) => getDeviceGroupsWrapper({ applicationId: appId, ...params }),
            updateDeviceGroup: (params) => updateDeviceGroupWrapper({ applicationId: appId, ...params }),
            deleteDeviceGroup: (params) => deleteDeviceGroupWrapper({ applicationId: appId, ...params }),
          },
          functions: {
            createFunctionInstance: (params) => createFunctionInstanceWrapper({ applicationId: appId, ...params }),
            getFunctionInstance: (params) => getFunctionInstanceWrapper({ applicationId: appId, ...params }),
            getFunctionInstances: (params) => getFunctionInstancesWrapper({ applicationId: appId, ...params }),
            updateFunctionInstance: (params) => updateFunctionInstanceWrapper({ applicationId: appId, ...params }),
            deleteFunctionInstance: (params) => deleteFunctionInstanceWrapper({ applicationId: appId, ...params }),
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
      const response = await getApplicationsWrapper({ params, options: { ...config?.options, ...options } });
      if (response.data) {
        const applications: AzionApplication[] = response.data.results.map((app) => ({
          ...app,
          cache: {
            createCacheSetting: (params) => createCacheSettingWrapper({ applicationId: app.id, ...params }),
            getCacheSetting: (params) => getCacheSettingWrapper({ applicationId: app.id, ...params }),
            getCacheSettings: (params) => getCacheSettingsWrapper({ applicationId: app.id, ...params }),
            updateCacheSetting: (params) => updateCacheSettingWrapper({ applicationId: app.id, ...params }),
            deleteCacheSetting: (params) => deleteCacheSettingWrapper({ applicationId: app.id, ...params }),
          },
          origins: {
            createOrigin: (params) => createOriginWrapper({ applicationId: app.id, ...params }),
            getOrigin: (params) => getOriginWrapper({ applicationId: app.id, ...params }),
            getOrigins: (params) => getOriginsWrapper({ applicationId: app.id, ...params }),
            updateOrigin: (params) => updateOriginWrapper({ applicationId: app.id, ...params }),
            deleteOrigin: (params) => deleteOriginWrapper({ applicationId: app.id, ...params }),
          },
          rules: {
            request: {
              createRule: (params) => createRuleWrapper({ applicationId: app.id, phase: 'request', ...params }),
              getRule: (params) => getRuleWrapper({ applicationId: app.id, phase: 'request', ...params }),
              getRules: (params) => getRulesWrapper({ applicationId: app.id, phase: 'request', ...params }),
              updateRule: (params) => updateRuleWrapper({ applicationId: app.id, phase: 'request', ...params }),
              deleteRule: (params) => deleteRuleWrapper({ applicationId: app.id, phase: 'request', ...params }),
            },
            response: {
              createRule: (params) => createRuleWrapper({ applicationId: app.id, phase: 'response', ...params }),
              getRule: (params) => getRuleWrapper({ applicationId: app.id, phase: 'response', ...params }),
              getRules: (params) => getRulesWrapper({ applicationId: app.id, phase: 'response', ...params }),
              updateRule: (params) => updateRuleWrapper({ applicationId: app.id, phase: 'response', ...params }),
              deleteRule: (params) => deleteRuleWrapper({ applicationId: app.id, phase: 'response', ...params }),
            },
          },
          devices: {
            createDeviceGroup: (params) => createDeviceGroupWrapper({ applicationId: app.id, ...params }),
            getDeviceGroup: (params) => getDeviceGroupWrapper({ applicationId: app.id, ...params }),
            getDeviceGroups: (params) => getDeviceGroupsWrapper({ applicationId: app.id, ...params }),
            updateDeviceGroup: (params) => updateDeviceGroupWrapper({ applicationId: app.id, ...params }),
            deleteDeviceGroup: (params) => deleteDeviceGroupWrapper({ applicationId: app.id, ...params }),
          },
          functions: {
            createFunctionInstance: (params) => createFunctionInstanceWrapper({ applicationId: app.id, ...params }),
            getFunctionInstance: (params) => getFunctionInstanceWrapper({ applicationId: app.id, ...params }),
            getFunctionInstances: (params) => getFunctionInstancesWrapper({ applicationId: app.id, ...params }),
            updateFunctionInstance: (params) => updateFunctionInstanceWrapper({ applicationId: app.id, ...params }),
            deleteFunctionInstance: (params) => deleteFunctionInstanceWrapper({ applicationId: app.id, ...params }),
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
      const response = await patchApplicationWrapper({
        applicationId,
        data,
        options: { ...config?.options, ...options },
      });
      if (response.data) {
        const appId = response.data.id;
        const application: AzionApplication = {
          ...response.data,
          cache: {
            createCacheSetting: (params) => createCacheSettingWrapper({ applicationId: appId, ...params }),
            getCacheSetting: (params) => getCacheSettingWrapper({ applicationId: appId, ...params }),
            getCacheSettings: (params) => getCacheSettingsWrapper({ applicationId: appId, ...params }),
            updateCacheSetting: (params) => updateCacheSettingWrapper({ applicationId: appId, ...params }),
            deleteCacheSetting: (params) => deleteCacheSettingWrapper({ applicationId: appId, ...params }),
          },
          origins: {
            createOrigin: (params) => createOriginWrapper({ applicationId: appId, ...params }),
            getOrigin: (params) => getOriginWrapper({ applicationId: appId, ...params }),
            getOrigins: (params) => getOriginsWrapper({ applicationId: appId, ...params }),
            updateOrigin: (params) => updateOriginWrapper({ applicationId: appId, ...params }),
            deleteOrigin: (params) => deleteOriginWrapper({ applicationId: appId, ...params }),
          },
          rules: {
            request: {
              createRule: (params) => createRuleWrapper({ applicationId: appId, phase: 'request', ...params }),
              getRule: (params) => getRuleWrapper({ applicationId: appId, phase: 'request', ...params }),
              getRules: (params) => getRulesWrapper({ applicationId: appId, phase: 'request', ...params }),
              updateRule: (params) => updateRuleWrapper({ applicationId: appId, phase: 'request', ...params }),
              deleteRule: (params) => deleteRuleWrapper({ applicationId: appId, phase: 'request', ...params }),
            },
            response: {
              createRule: (params) => createRuleWrapper({ applicationId: appId, phase: 'response', ...params }),
              getRule: (params) => getRuleWrapper({ applicationId: appId, phase: 'response', ...params }),
              getRules: (params) => getRulesWrapper({ applicationId: appId, phase: 'response', ...params }),
              updateRule: (params) => updateRuleWrapper({ applicationId: appId, phase: 'response', ...params }),
              deleteRule: (params) => deleteRuleWrapper({ applicationId: appId, phase: 'response', ...params }),
            },
          },
          devices: {
            createDeviceGroup: (params) => createDeviceGroupWrapper({ applicationId: appId, ...params }),
            getDeviceGroup: (params) => getDeviceGroupWrapper({ applicationId: appId, ...params }),
            getDeviceGroups: (params) => getDeviceGroupsWrapper({ applicationId: appId, ...params }),
            updateDeviceGroup: (params) => updateDeviceGroupWrapper({ applicationId: appId, ...params }),
            deleteDeviceGroup: (params) => deleteDeviceGroupWrapper({ applicationId: appId, ...params }),
          },
          functions: {
            createFunctionInstance: (params) => createFunctionInstanceWrapper({ applicationId: appId, ...params }),
            getFunctionInstance: (params) => getFunctionInstanceWrapper({ applicationId: appId, ...params }),
            getFunctionInstances: (params) => getFunctionInstancesWrapper({ applicationId: appId, ...params }),
            updateFunctionInstance: (params) => updateFunctionInstanceWrapper({ applicationId: appId, ...params }),
            deleteFunctionInstance: (params) => deleteFunctionInstanceWrapper({ applicationId: appId, ...params }),
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
      const response = await patchApplicationWrapper({
        applicationId,
        data,
        options: { ...config?.options, ...options },
      });
      if (response.data) {
        const appId = response.data.id;
        const application: AzionApplication = {
          ...response.data,
          cache: {
            createCacheSetting: (params) => createCacheSettingWrapper({ applicationId: appId, ...params }),
            getCacheSetting: (params) => getCacheSettingWrapper({ applicationId: appId, ...params }),
            getCacheSettings: (params) => getCacheSettingsWrapper({ applicationId: appId, ...params }),
            updateCacheSetting: (params) => updateCacheSettingWrapper({ applicationId: appId, ...params }),
            deleteCacheSetting: (params) => deleteCacheSettingWrapper({ applicationId: appId, ...params }),
          },
          origins: {
            createOrigin: (params) => createOriginWrapper({ applicationId: appId, ...params }),
            getOrigin: (params) => getOriginWrapper({ applicationId: appId, ...params }),
            getOrigins: (params) => getOriginsWrapper({ applicationId: appId, ...params }),
            updateOrigin: (params) => updateOriginWrapper({ applicationId: appId, ...params }),
            deleteOrigin: (params) => deleteOriginWrapper({ applicationId: appId, ...params }),
          },
          rules: {
            request: {
              createRule: (params) => createRuleWrapper({ applicationId: appId, phase: 'request', ...params }),
              getRule: (params) => getRuleWrapper({ applicationId: appId, phase: 'request', ...params }),
              getRules: (params) => getRulesWrapper({ applicationId: appId, phase: 'request', ...params }),
              updateRule: (params) => updateRuleWrapper({ applicationId: appId, phase: 'request', ...params }),
              deleteRule: (params) => deleteRuleWrapper({ applicationId: appId, phase: 'request', ...params }),
            },
            response: {
              createRule: (params) => createRuleWrapper({ applicationId: appId, phase: 'response', ...params }),
              getRule: (params) => getRuleWrapper({ applicationId: appId, phase: 'response', ...params }),
              getRules: (params) => getRulesWrapper({ applicationId: appId, phase: 'response', ...params }),
              updateRule: (params) => updateRuleWrapper({ applicationId: appId, phase: 'response', ...params }),
              deleteRule: (params) => deleteRuleWrapper({ applicationId: appId, phase: 'response', ...params }),
            },
          },
          devices: {
            createDeviceGroup: (params) => createDeviceGroupWrapper({ applicationId: appId, ...params }),
            getDeviceGroup: (params) => getDeviceGroupWrapper({ applicationId: appId, ...params }),
            getDeviceGroups: (params) => getDeviceGroupsWrapper({ applicationId: appId, ...params }),
            updateDeviceGroup: (params) => updateDeviceGroupWrapper({ applicationId: appId, ...params }),
            deleteDeviceGroup: (params) => deleteDeviceGroupWrapper({ applicationId: appId, ...params }),
          },
          functions: {
            createFunctionInstance: (params) => createFunctionInstanceWrapper({ applicationId: appId, ...params }),
            getFunctionInstance: (params) => getFunctionInstanceWrapper({ applicationId: appId, ...params }),
            getFunctionInstances: (params) => getFunctionInstancesWrapper({ applicationId: appId, ...params }),
            updateFunctionInstance: (params) => updateFunctionInstanceWrapper({ applicationId: appId, ...params }),
            deleteFunctionInstance: (params) => deleteFunctionInstanceWrapper({ applicationId: appId, ...params }),
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
