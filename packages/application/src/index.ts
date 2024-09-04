import {
  createCacheSetting,
  deleteCacheSetting,
  getCacheSettingById,
  getCacheSettings,
  updateCacheSetting,
} from './cache-settings/services/index';
import {
  ApiCreateCacheSettingPayload,
  ApiListCacheSettingsParams,
  ApiUpdateCacheSettingPayload,
} from './cache-settings/services/types';
import {
  createDeviceGroup,
  deleteDeviceGroup,
  getDeviceGroupById,
  getDeviceGroups,
  updateDeviceGroup,
} from './device-groups/services/intex';
import {
  ApiCreateDeviceGroupPayload,
  ApiListDeviceGroupsParams,
  ApiUpdateDeviceGroupPayload,
} from './device-groups/services/types';
import {
  createFunctionInstance,
  deleteFunctionInstance,
  getFunctionInstanceById,
  listFunctionInstances,
  updateFunctionInstance,
} from './functions-instances/services/index';
import {
  ApiCreateFunctionInstancePayload,
  ApiListFunctionInstancesParams,
  ApiUpdateFunctionInstancePayload,
} from './functions-instances/services/types';
import {
  createApplication,
  deleteApplication,
  getApplicationById,
  getApplications,
  patchApplication,
  updateApplication,
} from './main-settings/services/index';
import { createOrigin, deleteOrigin, getOriginByKey, listOrigins, updateOrigin } from './origins/services/index';
import { ApiCreateOriginPayload, ApiListOriginsParams, ApiUpdateOriginRequest } from './origins/services/types';
import { createRule, deleteRule, getRuleById, listRules, updateRule } from './rules-engine/services/index';
import { ApiCreateRulePayload, ApiListRulesParams, ApiUpdateRulePayload } from './rules-engine/services/types';
import type { AzionClientOptions, AzionEdgeApplicationClient, CreateAzionEdgeApplicationClient } from './types';

const envDebugFlag = process.env.AZION_DEBUG && process.env.AZION_DEBUG === 'true';
const resolveToken = (token?: string) => token ?? process.env.AZION_TOKEN ?? '';
const resolveDebug = (debug?: boolean) => debug ?? !!envDebugFlag;

const createAzionEdgeApplicationClient: CreateAzionEdgeApplicationClient = (
  config?: Partial<{ token?: string; options?: AzionClientOptions }>,
): AzionEdgeApplicationClient => {
  const tokenValue = resolveToken(config?.token);
  const debugValue = resolveDebug(config?.options?.debug);

  const client: AzionEdgeApplicationClient = {
    createEdgeApplication: async ({ applicationData }) => {
      try {
        const apiResponse = await createApplication(tokenValue, applicationData, debugValue);
        const appId = apiResponse.results.id;
        return {
          data: {
            ...apiResponse.results,
            cache: {
              create: (cacheSettingData: ApiCreateCacheSettingPayload) =>
                createCacheSetting(tokenValue, appId, cacheSettingData, debugValue),
              get: (cacheSettingId: number) => getCacheSettingById(tokenValue, appId, cacheSettingId, debugValue),
              getAll: (params?: ApiListCacheSettingsParams) => getCacheSettings(tokenValue, appId, params, debugValue),
              update: (cacheSettingId: number, cacheSettingData: ApiUpdateCacheSettingPayload) =>
                updateCacheSetting(tokenValue, appId, cacheSettingId, cacheSettingData, debugValue),
              delete: (cacheSettingId: number) => deleteCacheSetting(tokenValue, appId, cacheSettingId, debugValue),
            },
            origins: {
              create: (originData: ApiCreateOriginPayload) => createOrigin(tokenValue, appId, originData, debugValue),
              get: (originKey: string) => getOriginByKey(tokenValue, appId, originKey, debugValue),
              getAll: (params?: ApiListOriginsParams) => listOrigins(tokenValue, appId, params, debugValue),
              update: (originKey: string, originData: ApiUpdateOriginRequest) =>
                updateOrigin(tokenValue, appId, originKey, originData, debugValue),
              delete: (originKey: string) => deleteOrigin(tokenValue, appId, originKey, debugValue),
            },
            rules: {
              request: {
                create: (ruleData: ApiCreateRulePayload) =>
                  createRule(tokenValue, appId, 'request', ruleData, debugValue),
                get: (ruleId: number) => getRuleById(tokenValue, appId, 'request', ruleId, debugValue),
                getAll: (params?: ApiListRulesParams) => listRules(tokenValue, appId, 'request', params, debugValue),
                update: (ruleId: number, ruleData: ApiUpdateRulePayload) =>
                  updateRule(tokenValue, appId, 'request', ruleId, ruleData, debugValue),
                delete: (ruleId: number) => deleteRule(tokenValue, appId, 'request', ruleId, debugValue),
              },
              response: {
                create: (ruleData: ApiCreateRulePayload) =>
                  createRule(tokenValue, appId, 'response', ruleData, debugValue),
                get: (ruleId: number) => getRuleById(tokenValue, appId, 'response', ruleId, debugValue),
                getAll: (params?: ApiListRulesParams) => listRules(tokenValue, appId, 'response', params, debugValue),
                update: (ruleId: number, ruleData: ApiUpdateRulePayload) =>
                  updateRule(tokenValue, appId, 'response', ruleId, ruleData, debugValue),
                delete: (ruleId: number) => deleteRule(tokenValue, appId, 'response', ruleId, debugValue),
              },
            },
            devices: {
              create: (deviceGroupData: ApiCreateDeviceGroupPayload) =>
                createDeviceGroup(tokenValue, appId, deviceGroupData, debugValue),
              get: (deviceGroupId: number) => getDeviceGroupById(tokenValue, appId, deviceGroupId, debugValue),
              getAll: (params?: ApiListDeviceGroupsParams) => getDeviceGroups(tokenValue, appId, params, debugValue),
              update: (deviceGroupId: number, deviceGroupData: ApiUpdateDeviceGroupPayload) =>
                updateDeviceGroup(tokenValue, appId, deviceGroupId, deviceGroupData, debugValue),
              delete: (deviceGroupId: number) => deleteDeviceGroup(tokenValue, appId, deviceGroupId, debugValue),
            },
            functions: {
              create: (functionInstanceData: ApiCreateFunctionInstancePayload) =>
                createFunctionInstance(tokenValue, appId, functionInstanceData, debugValue),
              get: (functionInstanceId: number) =>
                getFunctionInstanceById(tokenValue, appId, functionInstanceId, debugValue),
              getAll: (params?: ApiListFunctionInstancesParams) =>
                listFunctionInstances(tokenValue, appId, params, debugValue),
              update: (functionInstanceId: number, functionInstanceData: ApiUpdateFunctionInstancePayload) =>
                updateFunctionInstance(tokenValue, appId, functionInstanceId, functionInstanceData, debugValue),
              delete: (functionInstanceId: number) =>
                deleteFunctionInstance(tokenValue, appId, functionInstanceId, debugValue),
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
    },
    deleteEdgeApplication: async ({ id }) => {
      try {
        const data = await deleteApplication(tokenValue, id, debugValue);
        return { data };
      } catch (error) {
        return {
          error: {
            message: error instanceof Error ? error.message : 'Failed to delete edge application',
            operation: 'delete edge application',
          },
        };
      }
    },
    getEdgeApplication: async ({ id }) => {
      try {
        const data = await getApplicationById(tokenValue, id, debugValue);
        return { data };
      } catch (error) {
        return {
          error: {
            message: error instanceof Error ? error.message : 'Failed to get edge application',
            operation: 'get edge application',
          },
        };
      }
    },
    getEdgeApplications: async ({ params } = {}) => {
      try {
        const data = await getApplications(tokenValue, params, debugValue);
        return { data };
      } catch (error) {
        return {
          error: {
            message: error instanceof Error ? error.message : 'Failed to get edge applications',
            operation: 'get edge applications',
          },
        };
      }
    },
    updateEdgeApplication: async ({ id, applicationData }) => {
      try {
        const data = await updateApplication(tokenValue, id, applicationData, debugValue);
        return { data };
      } catch (error) {
        return {
          error: {
            message: error instanceof Error ? error.message : 'Failed to update edge application',
            operation: 'update edge application',
          },
        };
      }
    },
    patchEdgeApplication: async ({ id, applicationData }) => {
      try {
        const data = await patchApplication(tokenValue, id, applicationData, debugValue);
        return { data };
      } catch (error) {
        return {
          error: {
            message: error instanceof Error ? error.message : 'Failed to patch edge application',
            operation: 'patch edge application',
          },
        };
      }
    },
  };

  return client;
};

export default createAzionEdgeApplicationClient;
