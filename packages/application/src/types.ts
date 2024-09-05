import {
  ApiCreateCacheSettingPayload,
  ApiListCacheSettingsParams,
  ApiUpdateCacheSettingPayload,
} from './cache-settings/services/types';
import { AzionCacheSetting } from './cache-settings/types';
import {
  ApiCreateDeviceGroupPayload,
  ApiListDeviceGroupsParams,
  ApiUpdateDeviceGroupPayload,
} from './device-groups/services/types';
import { AzionDeviceGroup } from './device-groups/types';
import {
  ApiCreateFunctionInstancePayload,
  ApiListFunctionInstancesParams,
  ApiUpdateFunctionInstancePayload,
} from './functions-instances/services/types';
import { AzionFunctionInstance } from './functions-instances/types';
import {
  ApiApplication,
  ApiCreateApplicationPayload,
  ApiUpdateApplicationPayload,
} from './main-settings/services/types';
import { ApiCreateOriginPayload, ApiListOriginsParams, ApiUpdateOriginRequest } from './origins/services/types';
import { AzionOrigin } from './origins/types';
import { ApiCreateRulePayload, ApiListRulesParams, ApiUpdateRulePayload } from './rules-engine/services/types';
import { AzionRule } from './rules-engine/types';

export interface AzionClientOptions {
  debug?: boolean;
  force?: boolean;
}

export interface AzionEdgeApplicationCollectionOptions {
  page?: number;
  page_size?: number;
  sort?: 'name' | 'id';
  order_by?: string;
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
  create: (params: {
    data: ApiCreateCacheSettingPayload;
    options?: AzionClientOptions;
  }) => Promise<AzionEdgeApplicationResponse<AzionCacheSetting>>;
  get: (params: {
    cacheSettingId: number;
    options?: AzionClientOptions;
  }) => Promise<AzionEdgeApplicationResponse<AzionCacheSetting>>;
  getAll: (params: {
    params?: ApiListCacheSettingsParams;
    options?: AzionClientOptions;
  }) => Promise<AzionEdgeApplicationCollectionResponse<AzionCacheSetting>>;
  update: (params: {
    cacheSettingId: number;
    data: ApiUpdateCacheSettingPayload;
    options?: AzionClientOptions;
  }) => Promise<AzionEdgeApplicationResponse<AzionCacheSetting>>;
  delete: (params: {
    cacheSettingId: number;
    options?: AzionClientOptions;
  }) => Promise<AzionEdgeApplicationResponse<void>>;
}

export interface OriginOperations {
  create: (params: {
    data: ApiCreateOriginPayload;
    options?: AzionClientOptions;
  }) => Promise<AzionEdgeApplicationResponse<AzionOrigin>>;
  get: (params: {
    originKey: string;
    options?: AzionClientOptions;
  }) => Promise<AzionEdgeApplicationResponse<AzionOrigin>>;
  getAll: (params: {
    params?: ApiListOriginsParams;
    options?: AzionClientOptions;
  }) => Promise<AzionEdgeApplicationCollectionResponse<AzionOrigin>>;
  update: (params: {
    originKey: string;
    data: ApiUpdateOriginRequest;
    options?: AzionClientOptions;
  }) => Promise<AzionEdgeApplicationResponse<AzionOrigin>>;
  delete: (params: { originKey: string; options?: AzionClientOptions }) => Promise<AzionEdgeApplicationResponse<void>>;
}

export interface RuleOperations {
  create: (params: {
    data: ApiCreateRulePayload;
    options?: AzionClientOptions;
  }) => Promise<AzionEdgeApplicationResponse<AzionRule>>;
  get: (params: { ruleId: number; options?: AzionClientOptions }) => Promise<AzionEdgeApplicationResponse<AzionRule>>;
  getAll: (params: {
    params?: ApiListRulesParams;
    options?: AzionClientOptions;
  }) => Promise<AzionEdgeApplicationCollectionResponse<AzionRule>>;
  update: (params: {
    ruleId: number;
    data: ApiUpdateRulePayload;
    options?: AzionClientOptions;
  }) => Promise<AzionEdgeApplicationResponse<AzionRule>>;
  delete: (params: { ruleId: number; options?: AzionClientOptions }) => Promise<AzionEdgeApplicationResponse<void>>;
}

export interface DeviceGroupOperations {
  create: (params: {
    data: ApiCreateDeviceGroupPayload;
    options?: AzionClientOptions;
  }) => Promise<AzionEdgeApplicationResponse<AzionDeviceGroup>>;
  get: (params: {
    deviceGroupId: number;
    options?: AzionClientOptions;
  }) => Promise<AzionEdgeApplicationResponse<AzionDeviceGroup>>;
  getAll: (params: {
    params?: ApiListDeviceGroupsParams;
    options?: AzionClientOptions;
  }) => Promise<AzionEdgeApplicationCollectionResponse<AzionDeviceGroup>>;
  update: (params: {
    deviceGroupId: number;
    data: ApiUpdateDeviceGroupPayload;
    options?: AzionClientOptions;
  }) => Promise<AzionEdgeApplicationResponse<AzionDeviceGroup>>;
  delete: (params: {
    deviceGroupId: number;
    options?: AzionClientOptions;
  }) => Promise<AzionEdgeApplicationResponse<void>>;
}

export interface FunctionOperations {
  create: (params: {
    data: ApiCreateFunctionInstancePayload;
    options?: AzionClientOptions;
  }) => Promise<AzionEdgeApplicationResponse<AzionFunctionInstance>>;
  get: (params: {
    functionInstanceId: number;
    options?: AzionClientOptions;
  }) => Promise<AzionEdgeApplicationResponse<AzionFunctionInstance>>;
  getAll: (params: {
    params?: ApiListFunctionInstancesParams;
    options?: AzionClientOptions;
  }) => Promise<AzionEdgeApplicationCollectionResponse<AzionFunctionInstance>>;
  update: (params: {
    functionInstanceId: number;
    data: ApiUpdateFunctionInstancePayload;
    options?: AzionClientOptions;
  }) => Promise<AzionEdgeApplicationResponse<AzionFunctionInstance>>;
  delete: (params: {
    functionInstanceId: number;
    options?: AzionClientOptions;
  }) => Promise<AzionEdgeApplicationResponse<void>>;
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
  create: (params: {
    data: ApiCreateApplicationPayload;
    options?: AzionClientOptions;
  }) => Promise<AzionEdgeApplicationResponse<AzionEdgeApplication>>;
  get: (params: {
    applicationId: number;
    options?: AzionClientOptions;
  }) => Promise<AzionEdgeApplicationResponse<AzionEdgeApplication>>;
  getAll: (params: {
    params?: AzionEdgeApplicationCollectionOptions;
    options?: AzionClientOptions;
  }) => Promise<AzionEdgeApplicationCollectionResponse<AzionEdgeApplication>>;
  update: (params: {
    applicationId: number;
    data: ApiUpdateApplicationPayload;
    options?: AzionClientOptions;
  }) => Promise<AzionEdgeApplicationResponse<AzionEdgeApplication>>;
  delete: (params: {
    applicationId: number;
    options?: AzionClientOptions;
  }) => Promise<AzionEdgeApplicationResponse<void>>;
  patch: (params: {
    applicationId: number;
    data: Partial<ApiUpdateApplicationPayload>;
    options?: AzionClientOptions;
  }) => Promise<AzionEdgeApplicationResponse<AzionEdgeApplication>>;
}
export type CreateAzionEdgeApplicationClient = (
  config?: Partial<{ token: string; options?: AzionClientOptions }>,
) => AzionEdgeApplicationClient;
