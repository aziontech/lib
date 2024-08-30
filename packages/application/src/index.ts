import {
  createApplication,
  deleteApplication,
  getApplicationById,
  getApplications,
  patchApplication,
  updateApplication,
} from './services/api/main-settings/index';
import { ApiCreateApplicationRequest, ApiUpdateApplicationRequest } from './services/api/main-settings/types';
import type {
  AzionClientOptions,
  AzionEdgeApplicationClient,
  AzionEdgeApplicationCollectionOptions,
  AzionEdgeApplicationResponse,
  CreateAzionEdgeApplicationClient,
} from './types';

const envDebugFlag = process.env.AZION_DEBUG && process.env.AZION_DEBUG === 'true';
const resolveToken = (token?: string) => token ?? process.env.AZION_TOKEN ?? '';
const resolveDebug = (debug?: boolean) => debug ?? !!envDebugFlag;

const createEdgeApplicationWrapper = async (
  token: string,
  applicationData: ApiCreateApplicationRequest,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse> => {
  try {
    const data = await createApplication(resolveToken(token), applicationData, resolveDebug(options?.debug));
    return { data };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to create edge application',
        operation: 'create edge application',
      },
    };
  }
};

const deleteEdgeApplicationWrapper = async (
  token: string,
  id: number,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse> => {
  try {
    const data = await deleteApplication(resolveToken(token), id, resolveDebug(options?.debug));
    return { data };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to delete edge application',
        operation: 'delete edge application',
      },
    };
  }
};

const getEdgeApplicationWrapper = async (
  token: string,
  id: number,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse> => {
  try {
    const data = await getApplicationById(resolveToken(token), id, resolveDebug(options?.debug));
    return { data };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to get edge application',
        operation: 'get edge application',
      },
    };
  }
};

const getEdgeApplicationsWrapper = async (
  token: string,
  params?: AzionEdgeApplicationCollectionOptions,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse> => {
  try {
    const data = await getApplications(resolveToken(token), params, resolveDebug(options?.debug));
    return { data };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to get edge applications',
        operation: 'get edge applications',
      },
    };
  }
};

const updateEdgeApplicationWrapper = async (
  token: string,
  id: number,
  applicationData: ApiUpdateApplicationRequest,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse> => {
  try {
    const data = await updateApplication(resolveToken(token), id, applicationData, resolveDebug(options?.debug));
    return { data };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to update edge application',
        operation: 'update edge application',
      },
    };
  }
};

const patchEdgeApplicationWrapper = async (
  token: string,
  id: number,
  applicationData: Partial<ApiUpdateApplicationRequest>,
  options?: AzionClientOptions,
): Promise<AzionEdgeApplicationResponse> => {
  try {
    const data = await patchApplication(resolveToken(token), id, applicationData, resolveDebug(options?.debug));
    return { data };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Failed to patch edge application',
        operation: 'patch edge application',
      },
    };
  }
};

const client: CreateAzionEdgeApplicationClient = (
  config?: Partial<{ token?: string; options?: AzionClientOptions }>,
): AzionEdgeApplicationClient => {
  const tokenValue = resolveToken(config?.token);
  const debugValue = resolveDebug(config?.options?.debug);

  const client: AzionEdgeApplicationClient = {
    createEdgeApplication: (applicationData: ApiCreateApplicationRequest): Promise<AzionEdgeApplicationResponse> =>
      createEdgeApplicationWrapper(tokenValue, applicationData, { ...config, debug: debugValue }),
    deleteEdgeApplication: (id: number): Promise<AzionEdgeApplicationResponse> =>
      deleteEdgeApplicationWrapper(tokenValue, id, { ...config, debug: debugValue }),
    getEdgeApplication: (id: number): Promise<AzionEdgeApplicationResponse> =>
      getEdgeApplicationWrapper(tokenValue, id, { ...config, debug: debugValue }),
    getEdgeApplications: (params?: AzionEdgeApplicationCollectionOptions): Promise<AzionEdgeApplicationResponse> =>
      getEdgeApplicationsWrapper(tokenValue, params, { ...config, debug: debugValue }),
    updateEdgeApplication: (
      id: number,
      applicationData: ApiUpdateApplicationRequest,
    ): Promise<AzionEdgeApplicationResponse> =>
      updateEdgeApplicationWrapper(tokenValue, id, applicationData, { ...config, debug: debugValue }),
    patchEdgeApplication: (
      id: number,
      applicationData: Partial<ApiUpdateApplicationRequest>,
    ): Promise<AzionEdgeApplicationResponse> =>
      patchEdgeApplicationWrapper(tokenValue, id, applicationData, { ...config, debug: debugValue }),
  } as const;

  return client;
};

export {
  client as createClient,
  createEdgeApplicationWrapper as createEdgeApplication,
  deleteEdgeApplicationWrapper as deleteEdgeApplication,
  getEdgeApplicationWrapper as getEdgeApplication,
  getEdgeApplicationsWrapper as getEdgeApplications,
  patchEdgeApplicationWrapper as patchEdgeApplication,
  updateEdgeApplicationWrapper as updateEdgeApplication,
};

export default client;

export type * from './types';
