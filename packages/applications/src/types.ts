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

/**
 * @fileoverview This module defines the types and interfaces used throughout the Azion Application SDK.
 * It includes definitions for client options, response structures, and operation interfaces for various
 * Azion Edge Application features such as cache settings, origins, rules, device groups, and functions.
 * @module application/types
 */

/**
 * Options for configuring the Azion client behavior.
 *
 * @interface AzionClientOptions
 * @property {boolean} [debug] - Enable debug mode for detailed logging.
 * @property {boolean} [force] - Force the operation even if it might be destructive.
 */
export interface AzionClientOptions {
  debug?: boolean;
  force?: boolean;
}

/**
 * Options for retrieving a collection of Azion applications.
 *
 * @interface AzionApplicationCollectionOptions
 * @property {number} [page] - The page number for pagination.
 * @property {number} [page_size] - The number of items per page.
 * @property {'name' | 'id'} [sort] - The field to sort the results by.
 * @property {string} [order_by] - The order of the sorting (e.g., 'asc' or 'desc').
 */
export interface AzionApplicationCollectionOptions {
  page?: number;
  page_size?: number;
  sort?: 'name' | 'id';
  order_by?: string;
}

/**
 * Generic response structure for Azion API calls.
 *
 * @interface AzionApplicationResponse
 * @template T - The type of data returned in the response.
 * @property {T} [data] - The response data.
 * @property {{ message: string; operation: string }} [error] - Error information if the call failed.
 */
export interface AzionApplicationResponse<T> {
  data?: T;
  error?: {
    message: string;
    operation: string;
  };
}

/**
 * Generic response structure for Azion API calls returning collections.
 *
 * @interface AzionApplicationCollectionResponse
 * @template T - The type of items in the collection.
 * @property {{ count: number; total_pages: number; schema_version: number; links: { previous: string | null; next: string | null }; results: T[] }} [data] - The collection data.
 * @property {{ message: string; operation: string }} [error] - Error information if the call failed.
 */
export interface AzionApplicationCollectionResponse<T> {
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

/**
 * Interface for cache setting operations.
 *
 * @interface CacheOperations
 */
export interface CacheOperations {
  /**
   * Creates a new cache setting.
   *
   * @function
   * @name CacheOperations.createCacheSetting
   * @param {Object} params - The parameters for creating a cache setting.
   * @param {ApiCreateCacheSettingPayload} params.data - The data for the new cache setting.
   * @returns {Promise<AzionApplicationResponse<AzionCacheSetting>>} A promise that resolves with the created cache setting data or an error.
   *
   * @example
   * const { error, data } = await cacheOperations.createCacheSetting({
   *   data: {
   *     name: 'My Cache Setting',
   *     browser_cache_settings: 'override',
   *     cdn_cache_settings: 'override',
   *     cache_by_query_string: 'ignore',
   *     cookie_names: ['session_id'],
   *     enable_stale_cache: true
   *   },
   *   options: { debug: true }
   * });
   * if (error) {
   *   console.error('Error:', error);
   * } else {
   *   console.log('Created cache setting:', data);
   * }
   */
  createCacheSetting: (params: {
    data: ApiCreateCacheSettingPayload;
    options?: AzionClientOptions;
  }) => Promise<AzionApplicationResponse<AzionCacheSetting>>;

  /**
   * Retrieves a specific cache setting.
   *
   * @function
   * @name CacheOperations.getCacheSetting
   * @param {Object} params - The parameters for retrieving a cache setting.
   * @param {number} params.cacheSettingId - The ID of the cache setting to retrieve.

   * @returns {Promise<AzionApplicationResponse<AzionCacheSetting>>} A promise that resolves with the cache setting data or an error.
   *
   * @example
   * const { error, data } = await cacheOperations.getCacheSetting({
   *   cacheSettingId: 123,
   *   options: { debug: true }
   * });
   * if (error) {
   *   console.error('Error:', error);
   * } else {
   *   console.log('Retrieved cache setting:', data);
   * }
   */
  getCacheSetting: (params: {
    cacheSettingId: number;
    options?: AzionClientOptions;
  }) => Promise<AzionApplicationResponse<AzionCacheSetting>>;

  /**
   * Retrieves a list of cache settings.
   *
   * @function
   * @name CacheOperations.getCacheSettings
   * @param {Object} params - The parameters for retrieving cache settings.
   * @param {ApiListCacheSettingsParams} [params.params] - Optional parameters for filtering and pagination.

   * @returns {Promise<AzionApplicationCollectionResponse<AzionCacheSetting>>} A promise that resolves with a collection of cache settings or an error.
   *
   * @example
   * const { error, data } = await cacheOperations.getCacheSettings({
   *   params: { page: 1, page_size: 20 },
   *   options: { debug: true }
   * });
   * if (error) {
   *   console.error('Error:', error);
   * } else {
   *   console.log('Retrieved cache settings:', data.results);
   * }
   */
  getCacheSettings: (params: {
    params?: ApiListCacheSettingsParams;
    options?: AzionClientOptions;
  }) => Promise<AzionApplicationCollectionResponse<AzionCacheSetting>>;

  /**
   * Updates an existing cache setting.
   *
   * @function
   * @name CacheOperations.updateCacheSetting
   * @param {Object} params - The parameters for updating a cache setting.
   * @param {number} params.cacheSettingId - The ID of the cache setting to update.
   * @param {ApiUpdateCacheSettingPayload} params.data - The updated data for the cache setting.

   * @returns {Promise<AzionApplicationResponse<AzionCacheSetting>>} A promise that resolves with the updated cache setting data or an error.
   *
   * @example
   * const { error, data } = await cacheOperations.updateCacheSetting({
   *   cacheSettingId: 123,
   *   data: {
   *     name: 'Updated Cache Setting',
   *     browser_cache_settings: 'honor',
   *     cdn_cache_settings: 'honor'
   *   },
   *   options: { debug: true }
   * });
   * if (error) {
   *   console.error('Error:', error);
   * } else {
   *   console.log('Updated cache setting:', data);
   * }
   */
  updateCacheSetting: (params: {
    cacheSettingId: number;
    data: ApiUpdateCacheSettingPayload;
    options?: AzionClientOptions;
  }) => Promise<AzionApplicationResponse<AzionCacheSetting>>;

  /**
   * Deletes a cache setting.
   *
   * @function
   * @name CacheOperations.deleteCacheSetting
   * @param {Object} params - The parameters for deleting a cache setting.
   * @param {number} params.cacheSettingId - The ID of the cache setting to delete.

   * @returns {Promise<AzionApplicationResponse<void>>} A promise that resolves when the cache setting is deleted or rejects with an error.
   *
   * @example
   * const { error, data } = await cacheOperations.deleteCacheSetting({
   *   cacheSettingId: 123,
   *   options: { debug: true }
   * });
   * if (error) {
   *   console.error('Error:', error);
   * } else {
   *   console.log('Cache setting deleted successfully');
   * }
   */
  deleteCacheSetting: (params: {
    cacheSettingId: number;
    options?: AzionClientOptions;
  }) => Promise<AzionApplicationResponse<void>>;
}

/**
 * Interface for origin operations.
 *
 * @interface OriginOperations
 */
export interface OriginOperations {
  /**
   * Creates a new origin.
   *
   * @function
   * @name OriginOperations.createOrigin
   * @param {Object} params - The parameters for creating an origin.
   * @param {ApiCreateOriginPayload} params.data - The data for the new origin.

   * @returns {Promise<AzionApplicationResponse<AzionOrigin>>} A promise that resolves with the created origin data or an error.
   *
   * @example
   * const { error, data } = await originOperations.createOrigin({
   *   data: {
   *     name: 'My Origin',
   *     origin_type: 'single_origin',
   *     addresses: [{ address: 'example.com' }],
   *     host_header: 'example.com'
   *   },
   *   options: { debug: true }
   * });
   * if (error) {
   *   console.error('Error:', error);
   * } else {
   *   console.log('Created origin:', data);
   * }
   */
  createOrigin: (params: {
    data: ApiCreateOriginPayload;
    options?: AzionClientOptions;
  }) => Promise<AzionApplicationResponse<AzionOrigin>>;

  /**
   * Retrieves a specific origin.
   *
   * @function
   * @name OriginOperations.getOrigin
   * @param {Object} params - The parameters for retrieving an origin.
   * @param {string} params.originKey - The key of the origin to retrieve.

   * @returns {Promise<AzionApplicationResponse<AzionOrigin>>} A promise that resolves with the origin data or an error.
   *
   * @example
   * const { error, data } = await originOperations.getOrigin({
   *   originKey: 'abc123',
   *   options: { debug: true }
   * });
   * if (error) {
   *   console.error('Error:', error);
   * } else {
   *   console.log('Retrieved origin:', data);
   * }
   */
  getOrigin: (params: {
    originKey: string;
    options?: AzionClientOptions;
  }) => Promise<AzionApplicationResponse<AzionOrigin>>;

  /**
   * Retrieves a list of origins.
   *
   * @function
   * @name OriginOperations.getOrigins
   * @param {Object} params - The parameters for retrieving origins.
   * @param {ApiListOriginsParams} [params.params] - Optional parameters for filtering and pagination.

   * @returns {Promise<AzionApplicationCollectionResponse<AzionOrigin>>} A promise that resolves with a collection of origins or an error.
   *
   * @example
   * const { error, data } = await originOperations.getOrigins({
   *   params: { page: 1, page_size: 20 },
   *   options: { debug: true }
   * });
   * if (error) {
   *   console.error('Error:', error);
   * } else {
   *   console.log('Retrieved origins:', data.results);
   * }
   */
  getOrigins: (params: {
    params?: ApiListOriginsParams;
    options?: AzionClientOptions;
  }) => Promise<AzionApplicationCollectionResponse<AzionOrigin>>;

  /**
   * Updates an existing origin.
   *
   * @function
   * @name OriginOperations.updateOrigin
   * @param {Object} params - The parameters for updating an origin.
   * @param {string} params.originKey - The key of the origin to update.
   * @param {ApiUpdateOriginRequest} params.data - The updated data for the origin.

   * @returns {Promise<AzionApplicationResponse<AzionOrigin>>} A promise that resolves with the updated origin data or an error.
   *
   * @example
   * const { error, data } = await originOperations.updateOrigin({
   *   originKey: 'abc123',
   *   data: {
   *     name: 'Updated Origin',
   *     host_header: 'updated-example.com'
   *   },
   *   options: { debug: true }
   * });
   * if (error) {
   *   console.error('Error:', error);
   * } else {
   *   console.log('Updated origin:', data);
   * }
   */
  updateOrigin: (params: {
    originKey: string;
    data: ApiUpdateOriginRequest;
    options?: AzionClientOptions;
  }) => Promise<AzionApplicationResponse<AzionOrigin>>;

  /**
   * Deletes an origin.
   *
   * @function
   * @name OriginOperations.deleteOrigin
   * @param {Object} params - The parameters for deleting an origin.
   * @param {string} params.originKey - The key of the origin to delete.

   * @returns {Promise<AzionApplicationResponse<void>>} A promise that resolves when the origin is deleted or rejects with an error.
   *
   * @example
   * const { error, data } = await originOperations.deleteOrigin({
   *   originKey: 'abc123',
   *   options: { debug: true }
   * });
   * if (error) {
   *   console.error('Error:', error);
   * } else {
   *   console.log('Origin deleted successfully');
   * }
   */
  deleteOrigin: (params: {
    originKey: string;
    options?: AzionClientOptions;
  }) => Promise<AzionApplicationResponse<void>>;
}

/**
 * Interface for rule operations.
 *
 * @interface RuleOperations
 */
export interface RuleOperations {
  /**
   * Creates a new rule.
   *
   * @function
   * @name RuleOperations.createRule
   * @param {Object} params - The parameters for creating a rule.
   * @param {ApiCreateRulePayload} params.data - The data for the new rule.

   * @returns {Promise<AzionApplicationResponse<AzionRule>>} A promise that resolves with the created rule data or an error.
   *
   * @example
   * const { error, data } = await ruleOperations.createRule({
   *   data: {
   *     name: 'My Rule',
   *     phase: 'request',
   *     behaviors: [{ name: 'set_origin', target: 'origin1' }],
   *     criteria: [[{ conditional: 'if', input: '${uri}', operator: 'starts_with', value: '/api' }]]
   *   },
   *   options: { debug: true }
   * });
   * if (error) {
   *   console.error('Error:', error);
   * } else {
   *   console.log('Created rule:', data);
   * }
   */
  createRule: (params: {
    data: ApiCreateRulePayload;
    options?: AzionClientOptions;
  }) => Promise<AzionApplicationResponse<AzionRule>>;

  /**
   * Retrieves a specific rule.
   *
   * @function
   * @name RuleOperations.getRule
   * @param {Object} params - The parameters for retrieving a rule.
   * @param {number} params.ruleId - The ID of the rule to retrieve.

   * @returns {Promise<AzionApplicationResponse<AzionRule>>} A promise that resolves with the rule data or an error.
   *
   * @example
   * const { error, data } = await ruleOperations.getRule({
   *   ruleId: 123,
   *   options: { debug: true }
   * });
   * if (error) {
   *   console.error('Error:', error);
   * } else {
   *   console.log('Retrieved rule:', data);
   * }
   */
  getRule: (params: { ruleId: number; options?: AzionClientOptions }) => Promise<AzionApplicationResponse<AzionRule>>;

  /**
   * Retrieves a list of rules.
   *
   * @function
   * @name RuleOperations.getRules
   * @param {Object} params - The parameters for retrieving rules.
   * @param {ApiListRulesParams} [params.params] - Optional parameters for filtering and pagination.

   * @returns {Promise<AzionApplicationCollectionResponse<AzionRule>>} A promise that resolves with a collection of rules or an error.
   *
   * @example
   * const { error, data } = await ruleOperations.getRules({
   *   params: { page: 1, page_size: 20 },
   *   options: { debug: true }
   * });
   * if (error) {
   *   console.error('Error:', error);
   * } else {
   *   console.log('Retrieved rules:', data.results);
   * }
   */
  getRules: (params: {
    params?: ApiListRulesParams;
    options?: AzionClientOptions;
  }) => Promise<AzionApplicationCollectionResponse<AzionRule>>;

  /**
   * Updates an existing rule.
   *
   * @function
   * @name RuleOperations.updateRule
   * @param {Object} params - The parameters for updating a rule.
   * @param {number} params.ruleId - The ID of the rule to update.
   * @param {ApiUpdateRulePayload} params.data - The updated data for the rule.

   * @returns {Promise<AzionApplicationResponse<AzionRule>>} A promise that resolves with the updated rule data or an error.
   *
   * @example
   * const { error, data } = await ruleOperations.updateRule({
   *   ruleId: 123,
   *   data: {
   *     name: 'Updated Rule',
   *     behaviors: [{ name: 'set_origin', target: 'origin2' }]
   *   },
   *   options: { debug: true }
   * });
   * if (error) {
   *   console.error('Error:', error);
   * } else {
   *   console.log('Updated rule:', data);
   * }
   */
  updateRule: (params: {
    ruleId: number;
    data: ApiUpdateRulePayload;
    options?: AzionClientOptions;
  }) => Promise<AzionApplicationResponse<AzionRule>>;

  /**
   * Deletes a rule.
   *
   * @function
   * @name RuleOperations.deleteRule
   * @param {Object} params - The parameters for deleting a rule.
   * @param {number} params.ruleId - The ID of the rule to delete.

   * @returns {Promise<AzionApplicationResponse<void>>} A promise that resolves when the rule is deleted or rejects with an error.
   *
   * @example
   * const { error, data } = await ruleOperations.deleteRule({
   *   ruleId: 123,
   *   options: { debug: true }
   * });
   * if (error) {
   *   console.error('Error:', error);
   * } else {
   *   console.log('Rule deleted successfully');
   * }
   */
  deleteRule: (params: { ruleId: number; options?: AzionClientOptions }) => Promise<AzionApplicationResponse<void>>;
}

/**
 * Interface for device group operations.
 *
 * @interface DeviceGroupOperations
 */
export interface DeviceGroupOperations {
  /**
   * Creates a new device group.
   *
   * @function
   * @name DeviceGroupOperations.createDeviceGroup
   * @param {Object} params - The parameters for creating a device group.
   * @param {ApiCreateDeviceGroupPayload} params.data - The data for the new device group.

   * @returns {Promise<AzionApplicationResponse<AzionDeviceGroup>>} A promise that resolves with the created device group data or an error.
   *
   * @example
   * const { error, data } = await deviceGroupOperations.createDeviceGroup({
   *   data: {
   *     name: 'Mobile Devices',
   *     user_agent: 'Mobile|Android|iPhone|iPad|iPod'
   *   },
   *   options: { debug: true }
   * });
   * if (error) {
   *   console.error('Error:', error);
   * } else {
   *   console.log('Created device group:', data);
   * }
   */
  createDeviceGroup: (params: {
    data: ApiCreateDeviceGroupPayload;
    options?: AzionClientOptions;
  }) => Promise<AzionApplicationResponse<AzionDeviceGroup>>;

  /**
   * Retrieves a specific device group.
   *
   * @function
   * @name DeviceGroupOperations.getDeviceGroup
   * @param {Object} params - The parameters for retrieving a device group.
   * @param {number} params.deviceGroupId - The ID of the device group to retrieve.

   * @returns {Promise<AzionApplicationResponse<AzionDeviceGroup>>} A promise that resolves with the device group data or an error.
   *
   * @example
   * const { error, data } = await deviceGroupOperations.getDeviceGroup({
   *   deviceGroupId: 123,
   *   options: { debug: true }
   * });
   * if (error) {
   *   console.error('Error:', error);
   * } else {
   *   console.log('Retrieved device group:', data);
   * }
   */
  getDeviceGroup: (params: {
    deviceGroupId: number;
    options?: AzionClientOptions;
  }) => Promise<AzionApplicationResponse<AzionDeviceGroup>>;

  /**
   * Retrieves a list of device groups.
   *
   * @function
   * @name DeviceGroupOperations.getDeviceGroups
   * @param {Object} params - The parameters for retrieving device groups.
   * @param {ApiListDeviceGroupsParams} [params.params] - Optional parameters for filtering and pagination.

   * @returns {Promise<AzionApplicationCollectionResponse<AzionDeviceGroup>>} A promise that resolves with a collection of device groups or an error.
   *
   * @example
   * const { error, data } = await deviceGroupOperations.getDeviceGroups({
   *   params: { page: 1, page_size: 20 },
   *   options: { debug: true }
   * });
   * if (error) {
   *   console.error('Error:', error);
   * } else {
   *   console.log('Retrieved device groups:', data.results);
   * }
   */
  getDeviceGroups: (params: {
    params?: ApiListDeviceGroupsParams;
    options?: AzionClientOptions;
  }) => Promise<AzionApplicationCollectionResponse<AzionDeviceGroup>>;

  /**
   * Updates an existing device group.
   *
   * @function
   * @name DeviceGroupOperations.updateDeviceGroup
   * @param {Object} params - The parameters for updating a device group.
   * @param {number} params.deviceGroupId - The ID of the device group to update.
   * @param {ApiUpdateDeviceGroupPayload} params.data - The updated data for the device group.

   * @returns {Promise<AzionApplicationResponse<AzionDeviceGroup>>} A promise that resolves with the updated device group data or an error.
   *
   * @example
   * const { error, data } = await deviceGroupOperations.updateDeviceGroup({
   *   deviceGroupId: 123,
   *   data: {
   *     name: 'Updated Mobile Devices',
   *     user_agent: 'Mobile|Android|iPhone|iPad|iPod|BlackBerry'
   *   },
   *   options: { debug: true }
   * });
   * if (error) {
   *   console.error('Error:', error);
   * } else {
   *   console.log('Updated device group:', data);
   * }
   */
  updateDeviceGroup: (params: {
    deviceGroupId: number;
    data: ApiUpdateDeviceGroupPayload;
    options?: AzionClientOptions;
  }) => Promise<AzionApplicationResponse<AzionDeviceGroup>>;

  /**
   * Deletes a device group.
   *
   * @function
   * @name DeviceGroupOperations.deleteDeviceGroup
   * @param {Object} params - The parameters for deleting a device group.
   * @param {number} params.deviceGroupId - The ID of the device group to delete.

   * @returns {Promise<AzionApplicationResponse<void>>} A promise that resolves when the device group is deleted or rejects with an error.
   *
   * @example
   * const { error, data } = await deviceGroupOperations.deleteDeviceGroup({
   *   deviceGroupId: 123,
   *   options: { debug: true }
   * });
   * if (error) {
   *   console.error('Error:', error);
   * } else {
   *   console.log('Device group deleted successfully');
   * }
   */
  deleteDeviceGroup: (params: {
    deviceGroupId: number;
    options?: AzionClientOptions;
  }) => Promise<AzionApplicationResponse<void>>;
}

/**
 * Interface for function operations.
 *
 * @interface FunctionOperations
 */
export interface FunctionOperations {
  /**
   * Creates a new function instance.
   *
   * @function
   * @name FunctionOperations.createFunctionInstance
   * @param {Object} params - The parameters for creating a function instance.
   * @param {ApiCreateFunctionInstancePayload} params.data - The data for the new function instance.

   * @returns {Promise<AzionApplicationResponse<AzionFunctionInstance>>} A promise that resolves with the created function instance data or an error.
   *
   * @example
   * const { error, data } = await functionOperations.createFunctionInstance({
   *   data: {
   *     name: 'My Function',
   *     code: 'async function handleRequest(request) { return new Response("Hello, World!"); }',
   *     language: 'javascript'
   *   },
   *   options: { debug: true }
   * });
   * if (error) {
   *   console.error('Error:', error);
   * } else {
   *   console.log('Created function instance:', data);
   * }
   */
  createFunctionInstance: (params: {
    data: ApiCreateFunctionInstancePayload;
    options?: AzionClientOptions;
  }) => Promise<AzionApplicationResponse<AzionFunctionInstance>>;

  /**
   * Retrieves a specific function instance.
   *
   * @function
   * @name FunctionOperations.getFunctionInstance
   * @param {Object} params - The parameters for retrieving a function instance.
   * @param {number} params.functionInstanceId - The ID of the function instance to retrieve.

   * @returns {Promise<AzionApplicationResponse<AzionFunctionInstance>>} A promise that resolves with the function instance data or an error.
   *
   * @example
   * const { error, data } = await functionOperations.getFunctionInstance({
   *   functionInstanceId: 123,
   *   options: { debug: true }
   * });
   * if (error) {
   *   console.error('Error:', error);
   * } else {
   *   console.log('Retrieved function instance:', data);
   * }
   */
  getFunctionInstance: (params: {
    functionInstanceId: number;
    options?: AzionClientOptions;
  }) => Promise<AzionApplicationResponse<AzionFunctionInstance>>;

  /**
   * Retrieves a list of function instances.
   *
   * @function
   * @name FunctionOperations.getFunctionInstances
   * @param {Object} params - The parameters for retrieving function instances.
   * @param {ApiListFunctionInstancesParams} [params.params] - Optional parameters for filtering and pagination.

   * @returns {Promise<AzionApplicationCollectionResponse<AzionFunctionInstance>>} A promise that resolves with a collection of function instances or an error.
   *
   * @example
   * const { error, data } = await functionOperations.getFunctionInstances({
   *   params: { page: 1, page_size: 20 },
   *   options: { debug: true }
   * });
   * if (error) {
   *   console.error('Error:', error);
   * } else {
   *   console.log('Retrieved function instances:', data.results);
   * }
   */
  getFunctionInstances: (params: {
    params?: ApiListFunctionInstancesParams;
    options?: AzionClientOptions;
  }) => Promise<AzionApplicationCollectionResponse<AzionFunctionInstance>>;

  /**
   * Updates an existing function instance.
   *
   * @function
   * @name FunctionOperations.updateFunctionInstance
   * @param {Object} params - The parameters for updating a function instance.
   * @param {number} params.functionInstanceId - The ID of the function instance to update.
   * @param {ApiUpdateFunctionInstancePayload} params.data - The updated data for the function instance.

   * @returns {Promise<AzionApplicationResponse<AzionFunctionInstance>>} A promise that resolves with the updated function instance data or an error.
   *
   * @example
   * const { error, data } = await functionOperations.updateFunctionInstance({
   *   functionInstanceId: 123,
   *   data: {
   *     name: 'Updated Function',
   *     code: 'async function handleRequest(request) { return new Response("Hello, Updated World!"); }'
   *   },
   *   options: { debug: true }
   * });
   * if (error) {
   *   console.error('Error:', error);
   * } else {
   *   console.log('Updated function instance:', data);
   * }
   */
  updateFunctionInstance: (params: {
    functionInstanceId: number;
    data: ApiUpdateFunctionInstancePayload;
    options?: AzionClientOptions;
  }) => Promise<AzionApplicationResponse<AzionFunctionInstance>>;

  /**
   * Deletes a function instance.
   *
   * @function
   * @name FunctionOperations.deleteFunctionInstance
   * @param {Object} params - The parameters for deleting a function instance.
   * @param {number} params.functionInstanceId - The ID of the function instance to delete.

   * @returns {Promise<AzionApplicationResponse<void>>} A promise that resolves when the function instance is deleted or rejects with an error.
   *
   * @example
   * const { error, data } = await functionOperations.deleteFunctionInstance({
   *   functionInstanceId: 123,
   *   options: { debug: true }
   * });
   * if (error) {
   *   console.error('Error:', error);
   * } else {
   *   console.log('Function instance deleted successfully');
   * }
   */
  deleteFunctionInstance: (params: {
    functionInstanceId: number;
    options?: AzionClientOptions;
  }) => Promise<AzionApplicationResponse<void>>;
}

/**
 * Interface representing an Azion Application with all its associated operations.
 *
 * @interface AzionApplication
 * @extends ApiApplication
 */
export interface AzionApplication extends ApiApplication {
  /**
   * Operations related to cache settings for the application.
   * @type {CacheOperations}
   *
   * @example
   * // Creating a new cache setting
   * const { error, data } = await application.cache.createCacheSetting({
   *   data: {
   *     name: 'My Cache Setting',
   *     browser_cache_settings: 'override',
   *     cdn_cache_settings: 'override',
   *     cache_by_query_string: 'ignore'
   *   }
   * });
   * if (error) {
   *   console.error('Error:', error);
   * } else {
   *   console.log('Created cache setting:', data);
   * }
   */
  cache: CacheOperations;

  /**
   * Operations related to origins for the application.
   * @type {OriginOperations}
   *
   * @example
   * // Creating a new origin
   * const { error, data } = await application.origins.createOrigin({
   *   data: {
   *     name: 'My Origin',
   *     addresses: [{ address: 'example.com' }],
   *     origin_type: 'single_origin',
   *     host_header: 'example.com'
   *   }
   * });
   * if (error) {
   *   console.error('Error:', error);
   * } else {
   *   console.log('Created origin:', data);
   * }
   */
  origins: OriginOperations;

  /**
   * Operations related to rules for the application.
   * @type {{ request: RuleOperations; response: RuleOperations }}
   */
  rules: {
    /**
     * Operations for request rules.
     * @type {RuleOperations}
     *
     * @example
     * // Creating a new request rule
     * const { error, data } = await application.rules.request.createRule({
     *   data: {
     *     name: 'My Request Rule',
     *     phase: 'request',
     *     behaviors: [{ name: 'set_origin', target: 'origin1' }],
     *     criteria: [[{ conditional: 'if', input: '${uri}', operator: 'starts_with', value: '/api' }]]
     *   }
     * });
     * if (error) {
     *   console.error('Error:', error);
     * } else {
     *   console.log('Created request rule:', data);
     * }
     */
    request: RuleOperations;

    /**
     * Operations for response rules.
     * @type {RuleOperations}
     *
     * @example
     * // Creating a new response rule
     * const { error, data } = await application.rules.response.createRule({
     *   data: {
     *     name: 'My Response Rule',
     *     phase: 'response',
     *     behaviors: [{ name: 'add_response_header', target: 'X-Custom-Header', value: 'CustomValue' }],
     *     criteria: [[{ conditional: 'if', input: '${status}', operator: 'is_equal', value: '200' }]]
     *   }
     * });
     * if (error) {
     *   console.error('Error:', error);
     * } else {
     *   console.log('Created response rule:', data);
     * }
     */
    response: RuleOperations;
  };

  /**
   * Operations related to device groups for the application.
   * @type {DeviceGroupOperations}
   *
   * @example
   * // Creating a new device group
   * const { error, data } = await application.devices.createDeviceGroup({
   *   data: {
   *     name: 'Mobile Devices',
   *     user_agent: 'Mobile|Android|iPhone|iPad|iPod'
   *   }
   * });
   * if (error) {
   *   console.error('Error:', error);
   * } else {
   *   console.log('Created device group:', data);
   * }
   */
  devices: DeviceGroupOperations;

  /**
   * Operations related to functions for the application.
   * @type {FunctionOperations}
   *
   * @example
   * // Creating a new function instance
   * const { error, data } = await application.functions.createFunctionInstance({
   *   data: {
   *     name: 'My Function',
   *     edge_function_id: 5678,
   *     args: {}
   *   }
   * });
   * if (error) {
   *   console.error('Error:', error);
   * } else {
   *   console.log('Created function instance:', data);
   * }
   */
  functions: FunctionOperations;
}

/**
 * Interface for the Azion Application Client, providing methods to interact with Azion Edge Applications.
 *
 * @interface AzionApplicationClient
 */
export interface AzionApplicationClient {
  /**
   * Creates a new Azion Edge Application.
   *
   * @function
   * @name AzionApplicationClient.createApplication
   * @param {Object} params - The parameters for creating an application.
   * @param {ApiCreateApplicationPayload} params.data - The data for the new application.

   * @returns {Promise<AzionApplicationResponse<AzionApplication>>} A promise that resolves with the created application data or an error.
   *
   * @example
   * const { error, data } = await applicationClient.createApplication({
   *   data: {
   *     name: 'My New Application',
   *     delivery_protocol: 'http',
   *     origin_type: 'single_origin',
   *     address: 'example.com'
   *   },
   *   options: { debug: true }
   * });
   * if (error) {
   *   console.error('Error:', error);
   * } else {
   *   console.log('Created application:', data);
   * }
   */
  createApplication: (params: {
    data: ApiCreateApplicationPayload;
    options?: AzionClientOptions;
  }) => Promise<AzionApplicationResponse<AzionApplication>>;

  /**
   * Retrieves a specific Azion Edge Application.
   *
   * @function
   * @name AzionApplicationClient.getApplication
   * @param {Object} params - The parameters for retrieving an application.
   * @param {number} params.applicationId - The ID of the application to retrieve.

   * @returns {Promise<AzionApplicationResponse<AzionApplication>>} A promise that resolves with the application data or an error.
   *
   * @example
   * const { error, data } = await applicationClient.getApplication({
   *   applicationId: 123,
   *   options: { debug: true }
   * });
   * if (error) {
   *   console.error('Error:', error);
   * } else {
   *   console.log('Retrieved application:', data);
   * }
   */
  getApplication: (params: {
    applicationId: number;
    options?: AzionClientOptions;
  }) => Promise<AzionApplicationResponse<AzionApplication>>;

  /**
   * Retrieves a list of Azion Edge Applications.
   *
   * @function
   * @name AzionApplicationClient.getApplications
   * @param {Object} params - The parameters for retrieving applications.
   * @param {AzionApplicationCollectionOptions} [params.params] - Optional parameters for filtering and pagination.

   * @returns {Promise<AzionApplicationCollectionResponse<AzionApplication>>} A promise that resolves with a collection of applications or an error.
   *
   * @example
   * const { error, data } = await applicationClient.getApplications({
   *   params: { page: 1, page_size: 20 },
   *   options: { debug: true }
   * });
   * if (error) {
   *   console.error('Error:', error);
   * } else {
   *   console.log('Retrieved applications:', data.results);
   * }
   */
  getApplications: (params: {
    params?: AzionApplicationCollectionOptions;
    options?: AzionClientOptions;
  }) => Promise<AzionApplicationCollectionResponse<AzionApplication>>;

  /**
   * Updates an existing Azion Edge Application.
   *
   * @function
   * @name AzionApplicationClient.putApplication
   * @param {Object} params - The parameters for updating an application.
   * @param {number} params.applicationId - The ID of the application to update.
   * @param {ApiUpdateApplicationPayload} params.data - The updated data for the application.

   * @returns {Promise<AzionApplicationResponse<AzionApplication>>} A promise that resolves with the updated application data or an error.
   *
   * @example
   * const { error, data } = await applicationClient.putApplication({
   *   applicationId: 123,
   *   data: {
   *     name: 'Updated Application',
   *     delivery_protocol: 'https'
   *   },
   *   options: { debug: true }
   * });
   * if (error) {
   *   console.error('Error:', error);
   * } else {
   *   console.log('Updated application:', data);
   * }
   */
  putApplication: (params: {
    applicationId: number;
    data: ApiUpdateApplicationPayload;
    options?: AzionClientOptions;
  }) => Promise<AzionApplicationResponse<AzionApplication>>;

  /**
   * Deletes an Azion Edge Application.
   *
   * @function
   * @name AzionApplicationClient.deleteApplication
   * @param {Object} params - The parameters for deleting an application.
   * @param {number} params.applicationId - The ID of the application to delete.

   * @returns {Promise<AzionApplicationResponse<void>>} A promise that resolves when the application is deleted or rejects with an error.
   *
   * @example
   * const { error, data } = await applicationClient.deleteApplication({
   *   applicationId: 123,
   *   options: { debug: true }
   * });
   * if (error) {
   *   console.error('Error:', error);
   * } else {
   *   console.log('Application deleted successfully');
   * }
   */
  deleteApplication: (params: {
    applicationId: number;
    options?: AzionClientOptions;
  }) => Promise<AzionApplicationResponse<void>>;

  /**
   * Partially updates an existing Azion Edge Application.
   *
   * @function
   * @name AzionApplicationClient.patchApplication
   * @param {Object} params - The parameters for partially updating an application.
   * @param {number} params.applicationId - The ID of the application to update.
   * @param {Partial<ApiUpdateApplicationPayload>} params.data - The partial data for updating the application.

   * @returns {Promise<AzionApplicationResponse<AzionApplication>>} A promise that resolves with the updated application data or an error.
   *
   * @example
   * const { error, data } = await applicationClient.patchApplication({
   *   applicationId: 123,
   *   data: { name: 'Partially Updated Application' },
   *   options: { debug: true }
   * });
   * if (error) {
   *   console.error('Error:', error);
   * } else {
   *   console.log('Partially updated application:', data);
   * }
   */
  patchApplication: (params: {
    applicationId: number;
    data: Partial<ApiUpdateApplicationPayload>;
    options?: AzionClientOptions;
  }) => Promise<AzionApplicationResponse<AzionApplication>>;
}

/**
 * Function type for creating an Azion Application Client.
 *
 * @param {Object} [config] - Configuration options for the application client.
 * @param {string} [config.token] - Authentication token for Azion API. If not provided,
 * the client will attempt to use the AZION_TOKEN environment variable.
 * @param {AzionClientOptions} [config.options] - Additional client options.
 *
 * @returns {AzionApplicationClient} An instance of the Azion Application Client.
 *
 * @example
 * // Create an application client with a token and debug mode enabled
 * const appClient = createAzionApplicationClient({
 *   token: 'your-api-token',
 *   options: { debug: true }
 * });
 *
 * @example
 * // Create an application client using environment variables for token
 * const appClient = createAzionApplicationClient();
 */
export type CreateAzionApplicationClient = (
  config?: Partial<{ token: string; options?: AzionClientOptions }>,
) => AzionApplicationClient;
