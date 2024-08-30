import {
  ApiCreateApplicationRequest,
  ApiCreateApplicationResponse,
  ApiDeleteApplicationResponse,
  ApiGetApplicationResponse,
  ApiListApplicationsResponse,
  ApiUpdateApplicationRequest,
  ApiUpdateApplicationResponse,
} from './services/api/main-settings/types';

export type AzionEdgeApplicationResponse = {
  data?:
    | ApiCreateApplicationResponse
    | ApiGetApplicationResponse
    | ApiListApplicationsResponse
    | ApiUpdateApplicationResponse
    | ApiDeleteApplicationResponse;
  error?: {
    message: string;
    operation: string;
  };
};

export type AzionEdgeApplicationCollectionOptions = {
  order_by?: string;
  sort?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
};

export type AzionClientOptions = {
  debug?: boolean;
  force?: boolean;
};

export interface AzionEdgeApplicationClient {
  createEdgeApplication: (applicationData: ApiCreateApplicationRequest) => Promise<AzionEdgeApplicationResponse>;
  deleteEdgeApplication: (id: number) => Promise<AzionEdgeApplicationResponse>;
  getEdgeApplication: (id: number) => Promise<AzionEdgeApplicationResponse>;
  getEdgeApplications: (params?: AzionEdgeApplicationCollectionOptions) => Promise<AzionEdgeApplicationResponse>;
  updateEdgeApplication: (
    id: number,
    applicationData: ApiUpdateApplicationRequest,
  ) => Promise<AzionEdgeApplicationResponse>;
  patchEdgeApplication: (
    id: number,
    applicationData: Partial<ApiUpdateApplicationRequest>,
  ) => Promise<AzionEdgeApplicationResponse>;
}

export type CreateAzionEdgeApplicationClient = (
  config?: Partial<{ token?: string; options?: AzionClientOptions }>,
) => AzionEdgeApplicationClient;
