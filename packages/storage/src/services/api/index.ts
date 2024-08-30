import {
  ApiCreateBucketResponse,
  ApiCreateObjectResponse,
  ApiDeleteBucketResponse,
  ApiDeleteObjectResponse,
  ApiEditBucketResponse,
  ApiListBucketsParams,
  ApiListBucketsResponse,
  ApiListObjectsParams,
  ApiListObjectsResponse,
} from './types';

const BASE_URL = 'https://api.azion.com/v4/storage/buckets';

/**
 * Retrieves a list of buckets with optional filtering and pagination.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {ApiListBucketsParams} [params] - Optional parameters for filtering and pagination.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @returns {Promise<ApiListBucketsResponse>} Array of buckets or an error if retrieval failed.
 */
const getBuckets = async (
  token: string,
  params?: ApiListBucketsParams,
  debug?: boolean,
): Promise<ApiListBucketsResponse> => {
  try {
    const { page_size = 10, page = 1 } = params || {};
    const queryParams = new URLSearchParams({ page_size: String(page_size), page: String(page) });
    const response = await fetch(`${BASE_URL}?${queryParams.toString()}`, {
      method: 'GET',
      headers: { Accept: 'application/json; version=3', Authorization: `Token ${token}` },
    });
    const data = await response.json();
    if (debug) console.log('Response:', data);
    return data;
  } catch (error) {
    if (debug) console.error('Error getting all buckets:', error);
    throw error;
  }
};

/**
 * Creates a new bucket.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {string} name - Name of the bucket to create.
 * @param {string} edge_access - Edge access configuration for the bucket.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @returns {Promise<ApiCreateBucketResponse>} The created bucket or an error if creation failed.
 */
const postBucket = async (
  token: string,
  name: string,
  edge_access: string,
  debug?: boolean,
): Promise<ApiCreateBucketResponse> => {
  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Token ${token}` },
      body: JSON.stringify({ name, edge_access }),
    });
    const data = await response.json();
    if (debug) console.log('Response:', data);
    return data;
  } catch (error) {
    if (debug) console.error('Error creating bucket:', error);
    throw error;
  }
};

/**
 * Updates an existing bucket.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {string} name - Name of the bucket to update.
 * @param {string} edge_access - New edge access configuration for the bucket.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @returns {Promise<ApiEditBucketResponse>} The updated bucket or an error if update failed.
 */
const patchBucket = async (
  token: string,
  name: string,
  edge_access: string,
  debug?: boolean,
): Promise<ApiEditBucketResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/${name}`, {
      method: 'PATCH',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Token ${token}` },
      body: JSON.stringify({ edge_access }),
    });
    const data = await response.json();
    if (debug) console.log('Response:', data);
    return data;
  } catch (error) {
    if (debug) console.error('Error updating bucket:', error);
    throw error;
  }
};

/**
 * Deletes a bucket by its name.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {string} name - Name of the bucket to delete.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @returns {Promise<ApiDeleteBucketResponse>} Confirmation of deletion or an error if deletion failed.
 */
const deleteBucket = async (token: string, name: string, debug?: boolean): Promise<ApiDeleteBucketResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/${name}`, {
      method: 'DELETE',
      headers: { Accept: 'application/json', Authorization: `Token ${token}` },
    });
    const data = await response.json();
    if (debug) console.log('Response:', data);
    return data;
  } catch (error) {
    if (debug) console.error('Error deleting bucket:', error);
    throw error;
  }
};

/**
 * Retrieves a list of objects in a bucket with optional filtering.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {string} bucketName - Name of the bucket.
 * @param {ApiListObjectsParams} [params] - Optional parameters for filtering.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @returns {Promise<ApiListObjectsResponse>} Array of objects or an error if retrieval failed.
 */
const getObjects = async (
  token: string,
  bucketName: string,
  params?: ApiListObjectsParams,
  debug?: boolean,
): Promise<ApiListObjectsResponse> => {
  try {
    const { max_object_count = 10000 } = params || {};
    const queryParams = new URLSearchParams({ max_object_count: String(max_object_count) });
    const response = await fetch(`${BASE_URL}/${bucketName}/objects?${queryParams.toString()}`, {
      method: 'GET',
      headers: { Accept: 'application/json', Authorization: `Token ${token}` },
    });
    const data = await response.json();
    if (debug) console.log('Response:', data);
    return data;
  } catch (error) {
    if (debug) console.error('Error getting all objects:', error);
    throw error;
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
 * @returns {Promise<ApiCreateObjectResponse>} The created object or an error if creation failed.
 */
const postObject = async (
  token: string,
  bucketName: string,
  key: string,
  file: string,
  debug?: boolean,
): Promise<ApiCreateObjectResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/${bucketName}/objects/${key}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/octet-stream',
        Authorization: `Token ${token}`,
      },
      body: file,
    });
    const data = await response.json();
    if (debug) console.log('Response:', data);
    return data;
  } catch (error) {
    if (debug) console.error('Error posting object:', error);
    throw error;
  }
};

/**
 * Retrieves an object by its key.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {string} bucketName - Name of the bucket.
 * @param {string} key - Key of the object to retrieve.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @returns {Promise<string>} The content of the object or an error if retrieval failed.
 */
const getObjectByKey = async (token: string, bucketName: string, key: string, debug?: boolean): Promise<string> => {
  try {
    const response = await fetch(`${BASE_URL}/${bucketName}/objects/${key}`, {
      method: 'GET',
      headers: { Accept: 'application/json', Authorization: `Token ${token}` },
    });
    const data = await response.text();
    if (debug) console.log('Response:', data);
    return data;
  } catch (error) {
    if (debug) console.error('Error getting object by name:', error);
    throw error;
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
 * @returns {Promise<ApiCreateObjectResponse>} The updated object or an error if update failed.
 */
const putObject = async (
  token: string,
  bucketName: string,
  key: string,
  file: string,
  debug?: boolean,
): Promise<ApiCreateObjectResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/${bucketName}/objects/${key}`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/octet-stream',
        Authorization: `Token ${token}`,
      },
      body: file,
    });
    const data = await response.json();
    if (debug) console.log('Response:', data);
    return data;
  } catch (error) {
    if (debug) console.error('Error putting object:', error);
    throw error;
  }
};

/**
 * Deletes an object from a bucket.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {string} bucketName - Name of the bucket.
 * @param {string} key - Key of the object to delete.
 * @param {boolean} [debug] - Enable debug mode for detailed logging.
 * @returns {Promise<ApiDeleteObjectResponse>} Confirmation of deletion or an error if deletion failed.
 */
const deleteObject = async (
  token: string,
  bucketName: string,
  key: string,
  debug?: boolean,
): Promise<ApiDeleteObjectResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/${bucketName}/objects/${key}`, {
      method: 'DELETE',
      headers: { Accept: 'application/json', Authorization: `Token ${token}` },
    });
    const data = await response.json();
    if (debug) console.log('Response:', data);
    return data;
  } catch (error) {
    if (debug) console.error('Error deleting object:', error);
    throw error;
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
