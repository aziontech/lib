import {
  ApiCreateCacheSettingPayload,
  ApiListCacheSettingsParams,
  ApiUpdateCacheSettingPayload,
  CacheSetting,
} from './services/api/cache/types';
import {
  ApiCreateDeviceGroupPayload,
  ApiListDeviceGroupsParams,
  ApiUpdateDeviceGroupPayload,
  DeviceGroup,
} from './services/api/device-groups/types';
import {
  ApiCreateFunctionInstancePayload,
  ApiListFunctionInstancesParams,
  ApiUpdateFunctionInstancePayload,
  FunctionInstance,
} from './services/api/functions-instances/types';
import {
  ApiCreateApplicationPayload,
  ApiUpdateApplicationPayload,
  EdgeApplicationSettings,
} from './services/api/main-settings/types';
import {
  ApiCreateOriginPayload,
  ApiListOriginsParams,
  ApiUpdateOriginRequest,
  Origin,
} from './services/api/origins/types';
import { ApiCreateRulePayload, ApiListRulesParams, ApiUpdateRulePayload, Rule } from './services/api/rules/types';

export interface AzionClientOptions {
  debug?: boolean;
  force?: boolean;
}

export interface AzionEdgeApplicationCollectionOptions {
  order_by?: string;
  sort?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}

export interface AzionEdgeApplicationResponse<T> {
  results: T;
  schema_version: number;
}

export interface AzionEdgeApplicationCollectionResponse<T> {
  count: number;
  total_pages: number;
  schema_version: number;
  links: {
    previous: string | null;
    next: string | null;
  };
  results: T[];
}

export interface CacheOperations {
  create: (cacheSettingData: ApiCreateCacheSettingPayload) => Promise<AzionEdgeApplicationResponse<CacheSetting>>;
  get: (cacheSettingId: number) => Promise<AzionEdgeApplicationResponse<CacheSetting>>;
  getAll: (params?: ApiListCacheSettingsParams) => Promise<AzionEdgeApplicationCollectionResponse<CacheSetting>>;
  update: (
    cacheSettingId: number,
    cacheSettingData: ApiUpdateCacheSettingPayload,
  ) => Promise<AzionEdgeApplicationResponse<CacheSetting>>;
  delete: (cacheSettingId: number) => Promise<AzionEdgeApplicationResponse<void>>;
}

export interface OriginOperations {
  create: (originData: ApiCreateOriginPayload) => Promise<AzionEdgeApplicationResponse<Origin>>;
  get: (originKey: string) => Promise<AzionEdgeApplicationResponse<Origin>>;
  getAll: (params?: ApiListOriginsParams) => Promise<AzionEdgeApplicationCollectionResponse<Origin>>;
  update: (originKey: string, originData: ApiUpdateOriginRequest) => Promise<AzionEdgeApplicationResponse<Origin>>;
  delete: (originKey: string) => Promise<AzionEdgeApplicationResponse<void>>;
}

export interface RuleOperations {
  create: (ruleData: ApiCreateRulePayload) => Promise<AzionEdgeApplicationResponse<Rule>>;
  get: (ruleId: number) => Promise<AzionEdgeApplicationResponse<Rule>>;
  getAll: (params?: ApiListRulesParams) => Promise<AzionEdgeApplicationCollectionResponse<Rule>>;
  update: (ruleId: number, ruleData: ApiUpdateRulePayload) => Promise<AzionEdgeApplicationResponse<Rule>>;
  delete: (ruleId: number) => Promise<AzionEdgeApplicationResponse<void>>;
}

export interface DeviceGroupOperations {
  create: (deviceGroupData: ApiCreateDeviceGroupPayload) => Promise<AzionEdgeApplicationResponse<DeviceGroup>>;
  get: (deviceGroupId: number) => Promise<AzionEdgeApplicationResponse<DeviceGroup>>;
  getAll: (params?: ApiListDeviceGroupsParams) => Promise<AzionEdgeApplicationCollectionResponse<DeviceGroup>>;
  update: (
    deviceGroupId: number,
    deviceGroupData: ApiUpdateDeviceGroupPayload,
  ) => Promise<AzionEdgeApplicationResponse<DeviceGroup>>;
  delete: (deviceGroupId: number) => Promise<AzionEdgeApplicationResponse<void>>;
}

export interface FunctionOperations {
  create: (
    functionInstanceData: ApiCreateFunctionInstancePayload,
  ) => Promise<AzionEdgeApplicationResponse<FunctionInstance>>;
  get: (functionInstanceId: number) => Promise<AzionEdgeApplicationResponse<FunctionInstance>>;
  getAll: (
    params?: ApiListFunctionInstancesParams,
  ) => Promise<AzionEdgeApplicationCollectionResponse<FunctionInstance>>;
  update: (
    functionInstanceId: number,
    functionInstanceData: ApiUpdateFunctionInstancePayload,
  ) => Promise<AzionEdgeApplicationResponse<FunctionInstance>>;
  delete: (functionInstanceId: number) => Promise<AzionEdgeApplicationResponse<void>>;
}

export interface AzionEdgeApplication extends EdgeApplicationSettings {
  cache: CacheOperations;
  origins: OriginOperations;
  rules: {
    request: RuleOperations;
    response: RuleOperations;
  };
  devices: DeviceGroupOperations;
  functions: FunctionOperations;
}

export interface AzionEdgeApplicationClient {
  create: (applicationData: ApiCreateApplicationPayload) => Promise<AzionEdgeApplicationResponse<AzionEdgeApplication>>;
  get: (applicationId: number) => Promise<AzionEdgeApplicationResponse<AzionEdgeApplication>>;
  getAll: (
    params?: AzionEdgeApplicationCollectionOptions,
  ) => Promise<AzionEdgeApplicationCollectionResponse<AzionEdgeApplication>>;
  update: (
    applicationId: number,
    applicationData: ApiUpdateApplicationPayload,
  ) => Promise<AzionEdgeApplicationResponse<AzionEdgeApplication>>;
  delete: (applicationId: number) => Promise<AzionEdgeApplicationResponse<void>>;
  patch: (
    applicationId: number,
    applicationData: Partial<ApiUpdateApplicationPayload>,
  ) => Promise<AzionEdgeApplicationResponse<AzionEdgeApplication>>;
}

export type CreateAzionEdgeApplicationClient = (options: AzionClientOptions) => AzionEdgeApplicationClient;
