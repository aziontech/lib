import {
  createApplicationMethod,
  deleteApplicationMethod,
  getApplicationMethod,
  getApplicationsMethod,
  patchApplicationMethod,
  putApplicationMethod,
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
  AzionApplicationCollectionOptions,
  AzionApplicationsClient,
  AzionClientOptions,
  CreateAzionApplicationClient,
} from './types';

import { ApiCreateApplicationPayload, ApiUpdateApplicationPayload } from './main-settings/services/types';

import { resolveDebug, resolveToken } from './utils';

const createAzionApplicationClient: CreateAzionApplicationClient = (
  config?: Partial<{ token: string; options?: AzionClientOptions }>,
): AzionApplicationsClient => {
  const tokenValue = resolveToken(config?.token);
  const debugValue = resolveDebug(config?.options?.debug);

  const client: AzionApplicationsClient = {
    createApplication: async ({ data }: { data: ApiCreateApplicationPayload; options?: AzionClientOptions }) =>
      createApplicationMethod(tokenValue, data, { ...config, debug: debugValue }),
    deleteApplication: async ({ applicationId, options }: { applicationId: number; options?: AzionClientOptions }) =>
      deleteApplicationMethod(tokenValue, applicationId, {
        ...config?.options,
        ...options,
        debug: resolveDebug(config?.options?.debug ?? options?.debug),
      }),
    getApplication: async ({ applicationId, options }: { applicationId: number; options?: AzionClientOptions }) =>
      getApplicationMethod(tokenValue, applicationId, {
        ...config?.options,
        ...options,
        debug: resolveDebug(config?.options?.debug ?? options?.debug),
      }),
    getApplications: async ({
      params,
      options,
    }: {
      params?: AzionApplicationCollectionOptions;
      options?: AzionClientOptions;
    }) =>
      getApplicationsMethod(tokenValue, params, {
        ...config?.options,
        ...options,
        debug: resolveDebug(options?.debug),
      }),
    putApplication: async ({
      applicationId,
      data,
      options,
    }: {
      applicationId: number;
      data: ApiUpdateApplicationPayload;
      options?: AzionClientOptions;
    }) =>
      putApplicationMethod(tokenValue, applicationId, data, {
        ...config?.options,
        ...options,
        debug: resolveDebug(options?.debug),
      }),
    patchApplication: async ({
      applicationId,
      data,
      options,
    }: {
      applicationId: number;
      data: Partial<ApiUpdateApplicationPayload>;
      options?: AzionClientOptions;
    }) =>
      patchApplicationMethod(tokenValue, applicationId, data, {
        ...config?.options,
        ...options,
        debug: resolveDebug(options?.debug),
      }),
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
