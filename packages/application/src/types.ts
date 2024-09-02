import {
  ApiCreateApplicationRequest,
  ApiCreateApplicationResponse,
  ApiDeleteApplicationResponse,
  ApiGetApplicationResponse,
  ApiListApplicationsResponse,
  ApiUpdateApplicationRequest,
  ApiUpdateApplicationResponse,
} from './services/api/main-settings/types';

import {
  ApiCreateDeviceGroupRequest,
  ApiListDeviceGroupsParams,
  ApiUpdateDeviceGroupRequest,
} from './services/api/device-groups/types';

import { ApiCreateOriginRequest, ApiListOriginsParams, ApiUpdateOriginRequest } from './services/api/origins/types';

import { ApiCreateRuleRequest, ApiListRulesParams, ApiUpdateRuleRequest } from './services/api/rules/types';

import {
  ApiCreateCacheSettingRequest,
  ApiListCacheSettingsParams,
  ApiUpdateCacheSettingRequest,
} from './services/api/cache/types';
import {
  ApiCreateFunctionInstanceRequest,
  ApiListFunctionInstancesParams,
  ApiUpdateFunctionInstanceRequest,
} from './services/api/functions-instances/types';
/**
 * Response type for Azion Edge Application operations
 */
export type AzionEdgeApplicationResponse = {
  data?:
    | ApiCreateApplicationResponse
    | ApiGetApplicationResponse
    | ApiListApplicationsResponse
    | ApiUpdateApplicationResponse
    | ApiDeleteApplicationResponse
    | AzionEdgeApplication;
  error?: {
    message: string;
    operation: string;
  };
};

/**
 * Options for collection-based operations on Azion Edge Applications
 */
export type AzionEdgeApplicationCollectionOptions = {
  order_by?: string;
  sort?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
};

/**
 * Client options for Azion API operations
 */
export type AzionClientOptions = {
  debug?: boolean;
  force?: boolean;
};

/**
 * Interface for cache settings operations
 */
export interface AzionEdgeApplicationCacheSettings {
  create: (cacheSettingData: ApiCreateCacheSettingRequest) => Promise<AzionEdgeApplicationResponse>;
  get: (cacheSettingId: number) => Promise<AzionEdgeApplicationResponse>;
  getAll: (params?: ApiListCacheSettingsParams) => Promise<AzionEdgeApplicationResponse>;
  update: (
    cacheSettingId: number,
    cacheSettingData: ApiUpdateCacheSettingRequest,
  ) => Promise<AzionEdgeApplicationResponse>;
  delete: (cacheSettingId: number) => Promise<AzionEdgeApplicationResponse>;
}

/**
 * Interface for origins operations
 */
export interface AzionEdgeApplicationOrigins {
  create: (originData: ApiCreateOriginRequest) => Promise<AzionEdgeApplicationResponse>;
  get: (originKey: string) => Promise<AzionEdgeApplicationResponse>;
  getAll: (params?: ApiListOriginsParams) => Promise<AzionEdgeApplicationResponse>;
  update: (originKey: string, originData: ApiUpdateOriginRequest) => Promise<AzionEdgeApplicationResponse>;
  delete: (originKey: string) => Promise<AzionEdgeApplicationResponse>;
}

/**
 * Interface for rules operations
 */
export interface AzionEdgeApplicationRules {
  request: {
    create: (ruleData: ApiCreateRuleRequest) => Promise<AzionEdgeApplicationResponse>;
    get: (ruleId: number) => Promise<AzionEdgeApplicationResponse>;
    getAll: (params?: ApiListRulesParams) => Promise<AzionEdgeApplicationResponse>;
    update: (ruleId: number, ruleData: ApiUpdateRuleRequest) => Promise<AzionEdgeApplicationResponse>;
    delete: (ruleId: number) => Promise<AzionEdgeApplicationResponse>;
  };
  response: {
    create: (ruleData: ApiCreateRuleRequest) => Promise<AzionEdgeApplicationResponse>;
    get: (ruleId: number) => Promise<AzionEdgeApplicationResponse>;
    getAll: (params?: ApiListRulesParams) => Promise<AzionEdgeApplicationResponse>;
    update: (ruleId: number, ruleData: ApiUpdateRuleRequest) => Promise<AzionEdgeApplicationResponse>;
    delete: (ruleId: number) => Promise<AzionEdgeApplicationResponse>;
  };
}

/**
 * Interface for device groups operations
 */
export interface AzionEdgeApplicationDevices {
  create: (deviceGroupData: ApiCreateDeviceGroupRequest) => Promise<AzionEdgeApplicationResponse>;
  get: (deviceGroupId: number) => Promise<AzionEdgeApplicationResponse>;
  getAll: (params?: ApiListDeviceGroupsParams) => Promise<AzionEdgeApplicationResponse>;
  update: (
    deviceGroupId: number,
    deviceGroupData: ApiUpdateDeviceGroupRequest,
  ) => Promise<AzionEdgeApplicationResponse>;
  delete: (deviceGroupId: number) => Promise<AzionEdgeApplicationResponse>;
}

export interface AzionEdgeApplicationFunctionInstances {
  create: (functionInstanceData: ApiCreateFunctionInstanceRequest) => Promise<AzionEdgeApplicationResponse>;
  get: (functionInstanceId: number) => Promise<AzionEdgeApplicationResponse>;
  getAll: (params?: ApiListFunctionInstancesParams) => Promise<AzionEdgeApplicationResponse>;
  update: (
    functionInstanceId: number,
    functionInstanceData: ApiUpdateFunctionInstanceRequest,
  ) => Promise<AzionEdgeApplicationResponse>;
  delete: (functionInstanceId: number) => Promise<AzionEdgeApplicationResponse>;
}

/**
 * Extended interface for Edge Application details including sub-resources
 */
export interface AzionEdgeApplication extends ApiGetApplicationResponse {
  cache: AzionEdgeApplicationCacheSettings;
  origins: AzionEdgeApplicationOrigins;
  rules: AzionEdgeApplicationRules;
  devices: AzionEdgeApplicationDevices;
  functionInstances: AzionEdgeApplicationFunctionInstances;
}
/**
 * Interface for Azion Edge Application Client
 */
export interface AzionEdgeApplicationClient {
  /**
   * Creates a new edge application.
   * @param {Object} params - Parameters for creating an edge application.
   * @param {ApiCreateApplicationRequest} params.applicationData - Data for the new edge application.
   * @returns {Promise<AzionEdgeApplicationResponse>} The created edge application or error response.
   */
  createEdgeApplication: (params: {
    applicationData: ApiCreateApplicationRequest;
  }) => Promise<AzionEdgeApplicationResponse>;

  /**
   * Deletes an edge application by its ID.
   * @param {Object} params - Parameters for deleting an edge application.
   * @param {number} params.id - ID of the edge application to delete.
   * @returns {Promise<AzionEdgeApplicationResponse>} Confirmation of deletion or error response.
   */
  deleteEdgeApplication: (params: { id: number }) => Promise<AzionEdgeApplicationResponse>;

  /**
   * Retrieves an edge application by its ID.
   * @param {Object} params - Parameters for retrieving an edge application.
   * @param {number} params.id - ID of the edge application to retrieve.
   * @returns {Promise<AzionEdgeApplicationResponse>} The retrieved edge application or error response.
   */
  getEdgeApplication: (params: { id: number }) => Promise<AzionEdgeApplicationResponse>;

  /**
   * Retrieves a list of edge applications with optional filtering and pagination.
   * @param {Object} params - Parameters for retrieving edge applications.
   * @param {AzionEdgeApplicationCollectionOptions} [params.params] - Optional parameters for filtering and pagination.
   * @returns {Promise<AzionEdgeApplicationResponse>} Array of edge applications or error response.
   */
  getEdgeApplications: (params?: {
    params?: AzionEdgeApplicationCollectionOptions;
  }) => Promise<AzionEdgeApplicationResponse>;

  /**
   * Updates an existing edge application.
   * @param {Object} params - Parameters for updating an edge application.
   * @param {number} params.id - ID of the edge application to update.
   * @param {ApiUpdateApplicationRequest} params.applicationData - Updated data for the edge application.
   * @returns {Promise<AzionEdgeApplicationResponse>} The updated edge application or error response.
   */
  updateEdgeApplication: (params: {
    id: number;
    applicationData: ApiUpdateApplicationRequest;
  }) => Promise<AzionEdgeApplicationResponse>;

  /**
   * Partially updates an existing edge application.
   * @param {Object} params - Parameters for patching an edge application.
   * @param {number} params.id - ID of the edge application to patch.
   * @param {Partial<ApiUpdateApplicationRequest>} params.applicationData - Partial data for updating the edge application.
   * @returns {Promise<AzionEdgeApplicationResponse>} The patched edge application or error response.
   */
  patchEdgeApplication: (params: {
    id: number;
    applicationData: Partial<ApiUpdateApplicationRequest>;
  }) => Promise<AzionEdgeApplicationResponse>;
}

/**
 * Function type for creating an Azion Edge Application Client.
 *
 * @param {Object} [config] - Configuration options for the Edge Application client.
 * @param {string} [config.token] - Authentication token for Azion API. If not provided,
 * the client will attempt to use the AZION_TOKEN environment variable.
 * @param {AzionClientOptions} [config.options] - Additional client options.
 *
 * @returns {AzionEdgeApplicationClient} An instance of the Azion Edge Application Client.
 *
 * @example
 * // Create an Edge Application client with a token and debug mode enabled
 * const edgeApplicationClient = createAzionEdgeApplicationClient({
 *   token: 'your-api-token',
 *   options: { debug: true }
 * });
 *
 * @example
 * // Create an Edge Application client using environment variables for token
 * const edgeApplicationClient = createAzionEdgeApplicationClient();
 *
 * @example
 * // Use the Edge Application client to create an application
 * const newApplication = await edgeApplicationClient.createEdgeApplication({
 *   applicationData: {
 *     name: 'My New Application',
 *     // ... other application data
 *   }
 * });
 */
export type CreateAzionEdgeApplicationClient = (
  config?: Partial<{ token?: string; options?: AzionClientOptions }>,
) => AzionEdgeApplicationClient;
