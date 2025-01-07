/* eslint-disable @typescript-eslint/no-explicit-any */
import { fetchWithErrorHandling } from '../../utils/index';
import {
  ApiCreateBucketResponse,
  ApiCreateObjectResponse,
  ApiDeleteBucketResponse,
  ApiDeleteObjectResponse,
  ApiEditBucketResponse,
  ApiError,
  ApiListBucketsParams,
  ApiListBucketsResponse,
  ApiListObjectsParams,
  ApiListObjectsResponse,
} from './types';

import { AzionEnvironment } from '../../types';

/**
 * Gets base URL based on environment
 */
const getBaseUrl = (env: AzionEnvironment = 'production'): string => {
  const urls: Record<AzionEnvironment, string> = {
    production: 'https://api.azion.com/v4/storage/buckets',
    development: '/v4/storage/buckets',
    staging: 'https://stage-api.azion.com/v4/storage/buckets',
  };
  return urls[env];
};

/**
 * Builds request headers based on token and additional headers
 * @param token Optional authentication token
 * @param additionalHeaders Additional request-specific headers
 */
const buildHeaders = (token?: string, additionalHeaders = {}) => {
  const baseHeaders = {
    Accept: 'application/json',
    ...additionalHeaders,
  };

  if (token) {
    return {
      ...baseHeaders,
      Authorization: `Token ${token}`,
    };
  }

  return baseHeaders;
};

/**
 * Builds fetch request options
 */
const buildFetchOptions = (method: string, headers: Record<string, string>, body?: string) => {
  const options: RequestInit = {
    method,
    headers,
    credentials: 'include',
  };

  if (body) {
    options.body = body;
  }

  return options;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleApiError = (fields: string[], data: any, operation: string) => {
  let error = { message: 'Error unknown', operation: operation };
  fields.forEach((field: string) => {
    if (data[field]) {
      const message = Array.isArray(data[field]) ? data[field].join(', ') : data[field];
      error = {
        message: message,
        operation: operation,
      };
    }
  });
  return error;
};

/**
 * Retrieves a list of buckets with optional filtering and pagination.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {ApiListBucketsParams} [params] - Optional parameters for filtering and pagination.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @param {AzionEnvironment} [env='production'] - Environment to use for the API call.
 * @returns {Promise<ApiListBucketsResponse>} Array of buckets or an error if retrieval failed.
 */
const getBuckets = async (
  token?: string,
  params?: ApiListBucketsParams,
  debug?: boolean,
  env: AzionEnvironment = 'production',
): Promise<ApiListBucketsResponse> => {
  try {
    const { page_size = 10, page = 1 } = params || {};
    const queryParams = new URLSearchParams({ page_size: String(page_size), page: String(page) });
    const headers = buildHeaders(token, { Accept: 'application/json; version=3' });
    const options = buildFetchOptions('GET', headers);
    const baseUrl = getBaseUrl(env);
    const data = await fetchWithErrorHandling(`${baseUrl}?${queryParams.toString()}`, options, debug);

    if (!data.results) {
      data.error = handleApiError(['detail'], data, 'get all buckets');
      return {
        error: data.error ?? JSON.stringify(data),
      };
    }
    if (debug) console.log('Response:', data);
    return data;
  } catch (error: any) {
    if (debug) console.error('Error getting all buckets:', error);
    return {
      error: { message: error.toString(), operation: 'get all buckets' },
    };
  }
};

/**
 * Creates a new bucket.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {string} name - Name of the bucket to create.
 * @param {string} edge_access - Edge access configuration for the bucket.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @param {AzionEnvironment} [env='production'] - Environment to use for the API call.
 * @returns {Promise<ApiCreateBucketResponse>} The created bucket or an error if creation failed.
 */
const postBucket = async (
  token: string,
  name: string,
  edge_access: string,
  debug?: boolean,
  env: AzionEnvironment = 'production',
): Promise<ApiCreateBucketResponse> => {
  try {
    const baseUrl = getBaseUrl(env);
    const data = await fetchWithErrorHandling(
      baseUrl,
      {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Token ${token}` },
        body: JSON.stringify({ name, edge_access }),
      },
      debug,
    );
    if (!data?.state) {
      data.error = handleApiError(['name', 'edge_access', 'detail'], data, 'create bucket');
      return {
        error: data.error ?? JSON.stringify(data),
      };
    }
    if (debug) console.log('Response:', data);
    return data;
  } catch (error: any) {
    if (debug) console.error('Error creating bucket:', error);
    return {
      error: { message: error.toString(), operation: 'create bucket' },
    };
  }
};

/**
 * Updates an existing bucket.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {string} name - Name of the bucket to update.
 * @param {string} edge_access - New edge access configuration for the bucket.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @param {AzionEnvironment} [env='production'] - Environment to use for the API call.
 * @returns {Promise<ApiEditBucketResponse>} The updated bucket or an error if update failed.
 */
const patchBucket = async (
  token: string,
  name: string,
  edge_access: string,
  debug?: boolean,
  env: AzionEnvironment = 'production',
): Promise<ApiEditBucketResponse> => {
  try {
    const baseUrl = getBaseUrl(env);
    const data = await fetchWithErrorHandling(
      `${baseUrl}/${name}`,
      {
        method: 'PATCH',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Token ${token}` },
        body: JSON.stringify({ edge_access }),
      },
      debug,
    );
    if (!data?.state) {
      data.error = handleApiError(['name', 'edge_access', 'detail'], data, 'update bucket');
      return {
        error: data.error ?? JSON.stringify(data),
      };
    }
    if (debug) console.log('Response:', data);
    return data;
  } catch (error: any) {
    if (debug) console.error('Error updating bucket:', error);
    return {
      error: { message: error.toString(), operation: 'update bucket' },
    };
  }
};

/**
 * Deletes a bucket by its name.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {string} name - Name of the bucket to delete.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @param {AzionEnvironment} [env='production'] - Environment to use for the API call.
 * @returns {Promise<ApiDeleteBucketResponse>} Confirmation of deletion or an error if deletion failed.
 */
const deleteBucket = async (
  token: string,
  name: string,
  debug?: boolean,
  env: AzionEnvironment = 'production',
): Promise<ApiDeleteBucketResponse> => {
  try {
    const baseUrl = getBaseUrl(env);
    const data = await fetchWithErrorHandling(
      `${baseUrl}/${name}`,
      {
        method: 'DELETE',
        headers: { Accept: 'application/json', Authorization: `Token ${token}` },
      },
      debug,
    );
    if (!data?.state) {
      data.error = handleApiError(['detail'], data, 'delete bucket');
      return {
        error: data.error ?? JSON.stringify(data),
      };
    }
    if (debug) console.log('Response Delete Bucket:', data);
    return data;
  } catch (error: any) {
    if (debug) console.error('Error deleting bucket:', error);
    return {
      error: { message: error.toString(), operation: 'delete bucket' },
    };
  }
};

/**
 * Retrieves a list of objects in a bucket with optional filtering.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {string} bucketName - Name of the bucket.
 * @param {ApiListObjectsParams} [params] - Optional parameters for filtering.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @param {AzionEnvironment} [env='production'] - Environment to use for the API call.
 * @returns {Promise<ApiListObjectsResponse>} Array of objects or an error if retrieval failed.
 */
const getObjects = async (
  token: string,
  bucketName: string,
  params?: ApiListObjectsParams,
  debug?: boolean,
  env: AzionEnvironment = 'production',
): Promise<ApiListObjectsResponse> => {
  try {
    const { max_object_count = 10000 } = params || {};
    const queryParams = new URLSearchParams({ max_object_count: String(max_object_count) });
    const baseUrl = getBaseUrl(env);
    const data = await fetchWithErrorHandling(
      `${baseUrl}/${bucketName}/objects?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: { Accept: 'application/json', Authorization: `Token ${token}` },
      },
      debug,
    );
    if (!data.results) {
      data.error = handleApiError(['detail'], data, 'get all objects');
      return {
        error: data.error ?? JSON.stringify(data),
      };
    }
    if (debug) console.log('Response:', data);
    return data;
  } catch (error: any) {
    if (debug) console.error('Error getting all objects:', error);
    return {
      error: { message: error.toString(), operation: 'get all objects' },
    };
  }
};

/**
 * Creates a new object in a bucket.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {string} bucketName - Name of the bucket.
 * @param {string} key - Key of the object to create.
 * @param {string} file - Content of the object.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @param {AzionEnvironment} [env='production'] - Environment to use for the API call.
 * @returns {Promise<ApiCreateObjectResponse>} The created object or an error if creation failed.
 */
const postObject = async (
  token: string,
  bucketName: string,
  key: string,
  file: string,
  debug?: boolean,
  env: AzionEnvironment = 'production',
): Promise<ApiCreateObjectResponse> => {
  try {
    const baseUrl = getBaseUrl(env);
    const data = await fetchWithErrorHandling(
      `${baseUrl}/${bucketName}/objects/${key}`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/octet-stream',
          Authorization: `Token ${token}`,
        },
        body: file,
      },
      debug,
    );
    if (!data?.state) {
      data.error = handleApiError(['detail'], data, 'create object');
      return {
        error: data.error ?? JSON.stringify(data),
      };
    }
    if (debug) console.log('Response:', data);
    return data;
  } catch (error: any) {
    if (debug) console.error('Error posting object:', error);
    return {
      error: { message: error.toString(), operation: 'create object' },
    };
  }
};

/**
 * Retrieves an object by its key.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {string} bucketName - Name of the bucket containing the object.
 * @param {string} key - Key of the object to retrieve.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @param {AzionEnvironment} [env='production'] - Environment to use for the API call.
 * @returns {Promise<{ data?: string; error?: ApiError }>} The retrieved object or an error if retrieval failed.
 */
const getObjectByKey = async (
  token: string,
  bucketName: string,
  key: string,
  debug?: boolean,
  env: AzionEnvironment = 'production',
): Promise<{ data?: string; error?: ApiError }> => {
  try {
    const baseUrl = getBaseUrl(env);
    const headers = buildHeaders(token);
    const options = buildFetchOptions('GET', headers);

    const data = await fetchWithErrorHandling(`${baseUrl}/${bucketName}/objects/${key}`, options, debug);

    if (data.error) {
      const error = handleApiError(['detail'], data, 'get object by key');
      return { error };
    }

    if (debug) console.log('Response:', data);
    return { data };
  } catch (error: any) {
    if (debug) console.error('Error getting object by name:', error);
    return {
      error: { message: error.toString(), operation: 'get object by key' },
    };
  }
};

/**
 * Updates an existing object in a bucket.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {string} bucketName - Name of the bucket.
 * @param {string} key - Key of the object to update.
 * @param {string} file - New content of the object.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @param {AzionEnvironment} [env='production'] - Environment to use for the API call.
 * @returns {Promise<ApiCreateObjectResponse>} The updated object or an error if update failed.
 */
const putObject = async (
  token: string,
  bucketName: string,
  key: string,
  file: string,
  debug?: boolean,
  env: AzionEnvironment = 'production',
): Promise<ApiCreateObjectResponse> => {
  try {
    const baseUrl = getBaseUrl(env);
    const data = await fetchWithErrorHandling(
      `${baseUrl}/${bucketName}/objects/${key}`,
      {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/octet-stream',
          Authorization: `Token ${token}`,
        },
        body: file,
      },
      debug,
    );
    if (debug) console.log('Response:', data);
    return data;
  } catch (error: any) {
    if (debug) console.error('Error putting object:', error);
    return {
      error: { message: error.toString(), operation: 'put object' },
    };
  }
};

/**
 * Deletes an object from a bucket.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {string} bucketName - Name of the bucket.
 * @param {string} key - Key of the object to delete.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @param {AzionEnvironment} [env='production'] - Environment to use for the API call.
 * @returns {Promise<ApiDeleteObjectResponse>} Confirmation of deletion or an error if deletion failed.
 */
const deleteObject = async (
  token: string,
  bucketName: string,
  key: string,
  debug?: boolean,
  env: AzionEnvironment = 'production',
): Promise<ApiDeleteObjectResponse> => {
  try {
    const baseUrl = getBaseUrl(env);
    const data = await fetchWithErrorHandling(
      `${baseUrl}/${bucketName}/objects/${key}`,
      {
        method: 'DELETE',
        headers: { Accept: 'application/json', Authorization: `Token ${token}` },
      },
      debug,
    );
    if (!data?.state) {
      data.error = handleApiError(['detail'], data, 'delete object');
      return {
        error: data.error ?? JSON.stringify(data),
      };
    }
    if (debug) console.log('Response:', data);
    return data;
  } catch (error: any) {
    if (debug) console.error('Error deleting object:', error);
    return {
      error: { message: error.toString(), operation: 'delete object' },
    };
  }
};

export {
  deleteBucket,
  deleteObject,
  getBuckets,
  getObjectByKey,
  getObjects,
  patchBucket,
  postBucket,
  postObject,
  putObject,
};
