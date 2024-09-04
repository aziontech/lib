import {
  ApiCreateCacheSettingPayload,
  ApiListCacheSettingsParams,
  ApiUpdateCacheSettingPayload,
} from './cache-settings/services/types';
import {
  ApiCreateDeviceGroupPayload,
  ApiListDeviceGroupsParams,
  ApiUpdateDeviceGroupPayload,
} from './device-groups/services/types';
import {
  ApiCreateFunctionInstancePayload,
  ApiListFunctionInstancesParams,
  ApiUpdateFunctionInstancePayload,
} from './functions-instances/services/types';
import {
  ApiApplication,
  ApiCreateApplicationPayload,
  ApiUpdateApplicationPayload,
} from './main-settings/services/types';
import {
  ApiCreateOriginPayload,
  ApiCreateOriginResponse,
  ApiGetOriginResponse,
  ApiListOriginsParams,
  ApiListOriginsResponse,
  ApiUpdateOriginRequest,
  ApiUpdateOriginResponse,
} from './origins/services/types';
import {
  ApiCreateRulePayload,
  ApiListRulesParams,
  ApiRuleResponse,
  ApiUpdateRulePayload,
} from './rules-engine/services/types';

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
  data?: T;
  error?: {
    message: string;
    operation: string;
  };
}

export interface AzionEdgeApplicationCollectionResponse<T> {
  data?: {
    count: number;
    total_pages: number;
    schema_version: number;
    links: {
      previous: string | null;
      next: string | null;
    };
    results: T[];
  };
  error?: {
    message: string;
    operation: string;
  };
}

export interface CacheOperations {
  create: (cacheSettingData: ApiCreateCacheSettingPayload) => Promise<AzionEdgeApplicationResponse<AzionCacheSetting>>;
  get: (cacheSettingId: number) => Promise<AzionEdgeApplicationResponse<AzionCacheSetting>>;
  getAll: (
    params?: ApiListCacheSettingsParams,
  ) => Promise<AzionEdgeApplicationCollectionResponse<AzionCacheSettingsCollection>>;
  update: (
    cacheSettingId: number,
    cacheSettingData: ApiUpdateCacheSettingPayload,
  ) => Promise<AzionEdgeApplicationResponse<AzionCacheSetting>>;
  delete: (cacheSettingId: number) => Promise<AzionEdgeApplicationResponse<void>>;
}

export interface OriginOperations {
  create: (originData: ApiCreateOriginPayload) => Promise<AzionEdgeApplicationResponse<ApiCreateOriginResponse>>;
  get: (originKey: string) => Promise<AzionEdgeApplicationResponse<ApiGetOriginResponse>>;
  getAll: (params?: ApiListOriginsParams) => Promise<AzionEdgeApplicationCollectionResponse<ApiListOriginsResponse>>;
  update: (
    originKey: string,
    originData: ApiUpdateOriginRequest,
  ) => Promise<AzionEdgeApplicationResponse<ApiUpdateOriginResponse>>;
  delete: (originKey: string) => Promise<AzionEdgeApplicationResponse<void>>;
}

export interface RuleOperations {
  create: (ruleData: ApiCreateRulePayload) => Promise<AzionEdgeApplicationResponse<ApiRuleResponse>>;
  get: (ruleId: number) => Promise<AzionEdgeApplicationResponse<ApiRuleResponse>>;
  getAll: (params?: ApiListRulesParams) => Promise<AzionEdgeApplicationCollectionResponse<ApiRuleResponse>>;
  update: (ruleId: number, ruleData: ApiUpdateRulePayload) => Promise<AzionEdgeApplicationResponse<ApiRuleResponse>>;
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

export interface AzionEdgeApplication extends ApiApplication {
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
