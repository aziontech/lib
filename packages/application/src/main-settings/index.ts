import { AzionClientOptions, AzionEdgeApplicationCollectionResponse, AzionEdgeApplicationResponse } from '../types';
import { resolveDebug, resolveToken } from '../utils';
import {
  deleteApplication as deleteApplicationApi,
  getApplicationById as getApplicationByIdApi,
  getApplications as getApplicationsApi,
  patchApplication as patchApplicationApi,
  postApplication as postApplicationApi,
  putApplication as putApplicationApi,
} from './services/index';
import { ApiCreateApplicationPayload, ApiListApplicationsParams, ApiUpdateApplicationPayload } from './services/types';
import { AzionApplication } from './types';

const createApplicationMethod = async (
  token: string,
  applicationData: ApiCreateApplicationPayload,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse<AzionApplication>> => {
  try {
    const apiResponse = await postApplicationApi(resolveToken(token), applicationData, resolveDebug(options?.debug));
    return { data: apiResponse.results };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to create application',
        operation: 'create application',
      },
    };
  }
};

const getApplicationMethod = async (
  token: string,
  applicationId: number,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse<AzionApplication>> => {
  try {
    const apiResponse = await getApplicationByIdApi(resolveToken(token), applicationId, resolveDebug(options?.debug));
    return { data: apiResponse.results };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to get application',
        operation: 'get application',
      },
    };
  }
};

const getApplicationsMethod = async (
  token: string,
  params?: ApiListApplicationsParams,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationCollectionResponse<AzionApplication>> => {
  try {
    const apiResponse = await getApplicationsApi(resolveToken(token), params, resolveDebug(options?.debug));

    const results: AzionApplication[] = apiResponse.results.map((application) => ({
      ...application,
    }));

    return {
      data: {
        count: apiResponse.count,
        total_pages: apiResponse.total_pages,
        schema_version: apiResponse.schema_version,
        links: apiResponse.links,
        results,
      },
    };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to get applications',
        operation: 'get applications',
      },
    };
  }
};

const updateApplicationMethod = async (
  token: string,
  applicationId: number,
  applicationData: ApiUpdateApplicationPayload,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse<AzionApplication>> => {
  try {
    const apiResponse = await putApplicationApi(
      resolveToken(token),
      applicationId,
      applicationData,
      resolveDebug(options?.debug),
    );
    return { data: apiResponse.results };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to update application',
        operation: 'update application',
      },
    };
  }
};

const patchApplicationMethod = async (
  token: string,
  applicationId: number,
  applicationData: Partial<ApiUpdateApplicationPayload>,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse<AzionApplication>> => {
  try {
    const apiResponse = await patchApplicationApi(
      resolveToken(token),
      applicationId,
      applicationData,
      resolveDebug(options?.debug),
    );
    return { data: apiResponse.results };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to patch application',
        operation: 'patch application',
      },
    };
  }
};

const deleteApplicationMethod = async (
  token: string,
  applicationId: number,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse<void>> => {
  try {
    await deleteApplicationApi(resolveToken(token), applicationId, resolveDebug(options?.debug));
    return { data: undefined };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to delete application',
        operation: 'delete application',
      },
    };
  }
};

export const createApplicationWrapper = ({
  data,
  options,
}: {
  data: ApiCreateApplicationPayload;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationResponse<AzionApplication>> => createApplicationMethod(resolveToken(), data, options);

export const getApplicationWrapper = ({
  applicationId,
  options,
}: {
  applicationId: number;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationResponse<AzionApplication>> =>
  getApplicationMethod(resolveToken(), applicationId, options);

export const getApplicationsWrapper = ({
  params,
  options,
}: {
  params?: ApiListApplicationsParams;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationCollectionResponse<AzionApplication>> =>
  getApplicationsMethod(resolveToken(), params, options);

export const updateApplicationWrapper = ({
  applicationId,
  data,
  options,
}: {
  applicationId: number;
  data: ApiUpdateApplicationPayload;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationResponse<AzionApplication>> =>
  updateApplicationMethod(resolveToken(), applicationId, data, options);

export const patchApplicationWrapper = ({
  applicationId,
  data,
  options,
}: {
  applicationId: number;
  data: Partial<ApiUpdateApplicationPayload>;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationResponse<AzionApplication>> =>
  patchApplicationMethod(resolveToken(), applicationId, data, options);

export const deleteApplicationWrapper = ({
  applicationId,
  options,
}: {
  applicationId: number;
  options?: AzionClientOptions;
}): Promise<AzionEdgeApplicationResponse<void>> => deleteApplicationMethod(resolveToken(), applicationId, options);
