import {
  deleteBucket,
  deleteObject,
  getBuckets,
  getObjectByKey,
  getObjects,
  patchBucket,
  postBucket,
  postObject,
  putObject,
} from './services//api/index';
import {
  AzionBucket,
  AzionBucketCollectionParams,
  AzionBucketObject,
  AzionClientOptions,
  AzionDeletedBucket,
  AzionDeletedBucketObject,
  AzionObjectCollectionParams,
  AzionStorageClient,
  CreateAzionStorageClient,
} from './types';

import { InternalStorageClient, isInternalStorageAvailable } from './services/runtime/index';

import { findBucketByName } from './utils/index';

const envDebugFlag = process.env.AZION_DEBUG && process.env.AZION_DEBUG === 'true';
const resolveToken = (token?: string) => {
  return token ?? process.env.AZION_TOKEN ?? '';
};
const resolveDebug = (debug?: boolean) => debug ?? !!envDebugFlag;

/**
 * Creates a method that can be executed internally or externally.
 * @template T The type of the function being created.
 * @param {T} internalMethod The method to be executed internally.
 * @param {T} externalMethod The method to be executed externally.
 * @returns {T} A function that executes either the internal or external method, depending on availability.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createInternalOrExternalMethod = <T extends (...args: any[]) => any>(internalMethod: T, externalMethod: T): T => {
  return ((...args: Parameters<T>): ReturnType<T> => {
    if (isInternalStorageAvailable()) {
      return internalMethod(...args);
    }
    return externalMethod(...args);
  }) as T;
};

/**
 * Creates a new bucket.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {string} name - Name of the bucket to create.
 * @param {string} edge_access - Edge access configuration for the bucket.
 * @param {AzionClientOptions} [options] - Client options including debug mode.
 * @returns {Promise<AzionBucket | null>} The created bucket object or null if creation failed.
 */
export const createBucketMethod = async (
  token: string,
  name: string,
  edge_access: string,
  options?: AzionClientOptions,
): Promise<AzionBucket | null> => {
  const apiResponse = await postBucket(resolveToken(token), name, edge_access, resolveDebug(options?.debug));
  if (apiResponse) {
    return {
      ...apiResponse.data,
      getObjects: ({ params }: { params: AzionObjectCollectionParams }): Promise<AzionBucketObject[] | null> =>
        getObjectsMethod(token, name, params),
      getObjectByKey: ({ key }: { key: string }): Promise<AzionBucketObject | null> =>
        getObjectByKeyMethod(token, name, key),
      createObject: ({ key, content }: { key: string; content: string }): Promise<AzionBucketObject | null> =>
        createObjectMethod(token, name, key, content),
      updateObject: ({ key, content }: { key: string; content: string }): Promise<AzionBucketObject | null> =>
        updateObjectMethod(token, name, key, content),
      deleteObject: ({ key }: { key: string }): Promise<AzionDeletedBucketObject | null> =>
        deleteObjectMethod(token, name, key),
    };
  }
  return null;
};

/**
 * Deletes a bucket by its name.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {string} name - Name of the bucket to delete.
 * @param {AzionClientOptions} [options] - Client options including debug mode.
 * @returns {Promise<AzionDeletedBucket | null>} Confirmation of deletion or null if deletion failed.
 */
export const deleteBucketMethod = async (
  token: string,
  name: string,
  options?: AzionClientOptions,
): Promise<AzionDeletedBucket | null> => {
  const apiResponse = await deleteBucket(resolveToken(token), name, resolveDebug(options?.debug));
  if (apiResponse) {
    return { name: apiResponse.data.name, state: apiResponse.state };
  }
  return null;
};

/**
 * Retrieves a list of buckets with optional filtering and pagination.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {AzionBucketCollectionParams} [params] - Optional parameters for filtering and pagination.
 * @param {AzionClientOptions} [options] - Client options including debug mode.
 * @returns {Promise<AzionBucket[] | null>} Array of bucket objects or null if retrieval failed.
 */
export const getBucketsMethod = async (
  token: string,
  params?: AzionBucketCollectionParams,
  options?: AzionClientOptions,
): Promise<AzionBucket[] | null> => {
  const apiResponse = await getBuckets(resolveToken(token), params, resolveDebug(options?.debug));
  if (apiResponse) {
    return apiResponse.results?.map((bucket) => ({
      ...bucket,
      getObjects: ({ params }: { params: AzionObjectCollectionParams }): Promise<AzionBucketObject[] | null> =>
        getObjectsMethod(token, bucket.name, params),
      getObjectByKey: ({ key }: { key: string }): Promise<AzionBucketObject | null> =>
        getObjectByKeyMethod(token, bucket.name, key),
      createObject: ({ key, content }: { key: string; content: string }): Promise<AzionBucketObject | null> =>
        createObjectMethod(token, bucket.name, key, content),
      updateObject: ({ key, content }: { key: string; content: string }): Promise<AzionBucketObject | null> =>
        updateObjectMethod(token, bucket.name, key, content),
      deleteObject: ({ key }: { key: string }): Promise<AzionDeletedBucketObject | null> =>
        deleteObjectMethod(token, bucket.name, key),
    }));
  }
  return null;
};

/**
 * Get a bucket by its name.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {string} name - Name of the bucket to get.
 * @param {AzionClientOptions} [options] - Client options including debug mode.
 * @returns {Promise<AziondBucket | null>} - Bucket object or null if retrieval failed.
 */
const getBucketMethod = createInternalOrExternalMethod(
  async (token: string, name: string, options?: AzionClientOptions): Promise<AzionBucket | null> => {
    // NOTE: This is a temporary solution because the API does not provide an endpoint
    // to search for a single bucket by name. When available, it must be replaced
    // by a direct API call.
    const bucket = await findBucketByName(token, name, options);
    if (!bucket) return null;

    const internalClient = new InternalStorageClient(token, options?.debug);
    return internalClient.getBucket({ name });
  },
  async (token: string, name: string, options?: AzionClientOptions): Promise<AzionBucket | null> => {
    // NOTE: This is a temporary solution because the API does not provide an endpoint
    // to search for a single bucket by name. When available, it must be replaced
    // by a direct API call.
    const bucket = await findBucketByName(token, name, options);
    if (!bucket) return null;

    return {
      ...bucket,
      getObjects: ({ params }: { params: AzionObjectCollectionParams }): Promise<AzionBucketObject[] | null> =>
        getObjectsMethod(token, name, params),
      getObjectByKey: ({ key }: { key: string }): Promise<AzionBucketObject | null> =>
        getObjectByKeyMethod(token, name, key),
      createObject: ({ key, content }: { key: string; content: string }): Promise<AzionBucketObject | null> =>
        createObjectMethod(token, name, key, content),
      updateObject: ({ key, content }: { key: string; content: string }): Promise<AzionBucketObject | null> =>
        updateObjectMethod(token, name, key, content),
      deleteObject: ({ key }: { key: string }): Promise<AzionDeletedBucketObject | null> =>
        deleteObjectMethod(token, name, key),
    };
  },
);

/**
 * Updates an existing bucket.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {string} name - Name of the bucket to update.
 * @param {string} edge_access - New edge access configuration for the bucket.
 * @param {AzionClientOptions} [options] - Client options including debug mode.
 * @returns {Promise<AzionBucket | null>} The updated bucket or null if update failed.
 */
export const updateBucketMethod = async (
  token: string,
  name: string,
  edge_access: string,
  options?: AzionClientOptions,
): Promise<AzionBucket | null> => {
  const apiResponse = await patchBucket(resolveToken(token), name, edge_access, resolveDebug(options?.debug));
  if (apiResponse) {
    return {
      ...apiResponse.data,
      getObjects: ({ params }: { params: AzionObjectCollectionParams }): Promise<AzionBucketObject[] | null> =>
        getObjectsMethod(token, name, params),
      getObjectByKey: ({ key }: { key: string }): Promise<AzionBucketObject | null> =>
        getObjectByKeyMethod(token, name, key),
      createObject: ({ key, content }: { key: string; content: string }): Promise<AzionBucketObject | null> =>
        createObjectMethod(token, name, key, content),
      updateObject: ({ key, content }: { key: string; content: string }): Promise<AzionBucketObject | null> =>
        updateObjectMethod(token, name, key, content),
      deleteObject: ({ key }: { key: string }): Promise<AzionDeletedBucketObject | null> =>
        deleteObjectMethod(token, name, key),
    };
  }
  return null;
};

/**
 * Retrieves a list of objects in a specific bucket.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {string} bucket - Name of the bucket to retrieve objects from.
 * @param {AzionObjectCollectionParams} [params] - Optional parameters for object collection.
 * @param {AzionClientOptions} [options] - Client options including debug mode.
 * @returns {Promise<AzionBucketObject[] | null>} Array of bucket objects or null if retrieval failed.
 */
const getObjectsMethod = createInternalOrExternalMethod(
  async (
    token: string,
    bucket: string,
    params?: AzionObjectCollectionParams,
    options?: AzionClientOptions,
  ): Promise<AzionBucketObject[] | null> => {
    const internalClient = new InternalStorageClient(token, options?.debug);
    internalClient.name = bucket;
    return internalClient.getObjects({ params });
  },
  async (
    token: string,
    bucket: string,
    params?: AzionObjectCollectionParams,
    options?: AzionClientOptions,
  ): Promise<AzionBucketObject[] | null> => {
    const apiResponse = await getObjects(resolveToken(token), bucket, params, options?.debug);
    return apiResponse?.results ?? null;
  },
);

/**
 * Retrieves an object from a specific bucket by its key.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {string} bucket - Name of the bucket containing the object.
 * @param {string} key - Key of the object to retrieve.
 * @param {AzionClientOptions} [options] - Client options including debug mode.
 * @returns {Promise<AzionBucketObject | null>} The retrieved object or null if not found.
 */
const getObjectByKeyMethod = createInternalOrExternalMethod(
  async (
    token: string,
    bucket: string,
    key: string,
    options?: AzionClientOptions,
  ): Promise<AzionBucketObject | null> => {
    const internalClient = new InternalStorageClient(token, options?.debug);
    internalClient.name = bucket;
    return internalClient.getObjectByKey({ key });
  },
  async (
    token: string,
    bucket: string,
    key: string,
    options?: AzionClientOptions,
  ): Promise<AzionBucketObject | null> => {
    const apiResponse = await getObjectByKey(resolveToken(token), bucket, key, resolveDebug(options?.debug));
    return apiResponse ? { key: key, content: apiResponse } : null;
  },
);

/**
 * Creates a new object in a specific bucket.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {string} bucket - Name of the bucket to create the object in.
 * @param {string} key - Key (name) of the object to create.
 * @param {string} content - Content of the content to upload.
 * @param {AzionClientOptions} [options] - Client options including debug mode.
 * @returns {Promise<AzionBucketObject | null>} The created object or null if creation failed.
 */
const createObjectMethod = createInternalOrExternalMethod(
  async (
    token: string,
    bucket: string,
    key: string,
    content: string,
    options?: AzionClientOptions,
  ): Promise<AzionBucketObject | null> => {
    const internalClient = new InternalStorageClient(token, options?.debug);
    internalClient.name = bucket;
    return internalClient.createObject({ key, content });
  },
  async (
    token: string,
    bucket: string,
    key: string,
    content: string,
    options?: AzionClientOptions,
  ): Promise<AzionBucketObject | null> => {
    const apiResponse = await postObject(resolveToken(token), bucket, key, content, resolveDebug(options?.debug));
    return apiResponse ? { key: apiResponse.data.object_key, content: content, state: apiResponse.state } : null;
  },
);

/**
 * Updates an existing object in a specific bucket.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {string} bucket - Name of the bucket containing the object.
 * @param {string} key - Key of the object to update.
 * @param {string} content - New content of the content.
 * @param {AzionClientOptions} [options] - Client options including debug mode.
 * @returns {Promise<AzionBucketObject | null>} The updated object or null if update failed.
 */
const updateObjectMethod = createInternalOrExternalMethod(
  async (
    token: string,
    bucket: string,
    key: string,
    content: string,
    options?: AzionClientOptions,
  ): Promise<AzionBucketObject | null> => {
    const internalClient = new InternalStorageClient(token, options?.debug);
    internalClient.name = bucket;
    return internalClient.updateObject({ key, content });
  },
  async (
    token: string,
    bucket: string,
    key: string,
    content: string,
    options?: AzionClientOptions,
  ): Promise<AzionBucketObject | null> => {
    const apiResponse = await putObject(resolveToken(token), bucket, key, content, resolveDebug(options?.debug));
    return apiResponse ? { key: apiResponse.data.object_key, content: content, state: apiResponse.state } : null;
  },
);

/**
 * Deletes an object from a specific bucket.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {string} bucket - Name of the bucket containing the object.
 * @param {string} key - Key of the object to delete.
 * @param {AzionClientOptions} [options] - Client options including debug mode.
 * @returns {Promise<AzionDeletedBucketObject | null>} Confirmation of deletion or null if deletion failed.
 */
const deleteObjectMethod = createInternalOrExternalMethod(
  async (
    token: string,
    bucket: string,
    key: string,
    options?: AzionClientOptions,
  ): Promise<AzionDeletedBucketObject | null> => {
    const internalClient = new InternalStorageClient(token, options?.debug);
    internalClient.name = bucket;
    return internalClient.deleteObject({ key });
  },
  async (
    token: string,
    bucket: string,
    key: string,
    options?: AzionClientOptions,
  ): Promise<AzionDeletedBucketObject | null> => {
    const apiResponse = await deleteObject(resolveToken(token), bucket, key, resolveDebug(options?.debug));
    return apiResponse ? { key: key, state: apiResponse.state } : null;
  },
);

/**
 * Creates a new bucket.
 *
 * @param {Object} params - Parameters for creating a bucket.
 * @param {string} params.name - Name of the new bucket.
 * @param {string} params.edge_access - Edge access configuration for the bucket.
 * @param {AzionClientOptions} [params.options] - Client options including debug mode.
 * @returns {Promise<AzionBucket | null>} The created bucket or null if creation failed.
 *
 * @example
 * const newBucket = await createBucket({ name: 'my-new-bucket', edge_access: 'public', options: { debug: true } });
 * if (newBucket) {
 *   console.log(`Bucket created with name: ${newBucket.name}`);
 * } else {
 *   console.error('Failed to create bucket');
 * }
 */
const createBucketWrapper = ({
  name,
  edge_access,
  options,
}: {
  name: string;
  edge_access: string;
  options?: AzionClientOptions;
}): Promise<AzionBucket | null> =>
  createBucketMethod(resolveToken(), name, edge_access, { ...options, debug: resolveDebug(options?.debug) });

/**
 * Deletes a bucket by its name.
 *
 * @param {Object} params - Parameters for deleting a bucket.
 * @param {string} params.name - Name of the bucket to delete.
 * @param {AzionClientOptions} [params.options] - Client options including debug mode.
 * @returns {Promise<AzionDeletedBucket | null>} Confirmation of deletion or null if deletion failed.
 *
 * @example
 * const result = await deleteBucket({ name: 'my-bucket', options: { debug: true } });
 * if (result) {
 *   console.log(`Bucket ${result.name} deleted successfully`);
 * } else {
 *   console.error('Failed to delete bucket');
 * }
 */
const deleteBucketWrapper = ({
  name,
  options,
}: {
  name: string;
  options?: AzionClientOptions;
}): Promise<AzionDeletedBucket | null> =>
  deleteBucketMethod(resolveToken(), name, { ...options, debug: resolveDebug(options?.debug) });

/**
 * Retrieves a list of buckets with optional filtering and pagination.
 *
 * @param {Object} params - Parameters for retrieving buckets.
 * @param {AzionBucketCollectionParams} [params.params] - Optional parameters for filtering and pagination.
 * @param {AzionClientOptions} [params.options] - Client options including debug mode.
 * @returns {Promise<AzionBucket[] | null>} Array of bucket objects or null if retrieval failed.
 *
 * @example
 * const buckets = await getBuckets({ params: { limit: 10, offset: 0 }, options: { debug: true } });
 * if (buckets) {
 *   console.log(`Retrieved ${buckets.length} buckets`);
 * } else {
 *   console.error('Failed to retrieve buckets');
 * }
 */
const getBucketsWrapper = ({
  params,
  options,
}: {
  params?: AzionBucketCollectionParams;
  options?: AzionClientOptions;
}): Promise<AzionBucket[] | null> =>
  getBucketsMethod(resolveToken(), params, { ...options, debug: resolveDebug(options?.debug) });

/**
 * Retrieves a bucket by its name.
 *
 * @param {Object} params - Parameters for retrieving a bucket.
 * @param {string} params.name - Name of the bucket to retrieve.
 * @param {AzionClientOptions} [params.options] - Client options including debug mode.
 * @returns {Promise<AzionBucket | null>} The retrieved bucket or null if not found.
 *
 * @example
 * const bucket = await getBucket({ name: 'my-bucket', options: { debug: true } });
 * if (bucket) {
 *   console.log(`Retrieved bucket: ${bucket.name}`);
 * } else {
 *   console.error('Bucket not found');
 * }
 */
const getBucketWrapper = ({
  name,
  options,
}: {
  name: string;
  options?: AzionClientOptions;
}): Promise<AzionBucket | null> =>
  getBucketMethod(resolveToken(), name, { ...options, debug: resolveDebug(options?.debug) });

/**
 * Updates an existing bucket.
 *
 * @param {Object} params - Parameters for updating a bucket.
 * @param {string} params.name - Name of the bucket to update.
 * @param {string} params.edge_access - New edge access configuration for the bucket.
 * @param {AzionClientOptions} [params.options] - Client options including debug mode.
 * @returns {Promise<AzionBucket | null>} The updated bucket or null if update failed.
 *
 * @example
 * const updatedBucket = await updateBucket({ name: 'my-bucket', edge_access: 'private', options: { debug: true } });
 * if (updatedBucket) {
 *   console.log(`Bucket updated: ${updatedBucket.name}`);
 * } else {
 *   console.error('Failed to update bucket');
 * }
 */
const updateBucketWrapper = ({
  name,
  edge_access,
  options,
}: {
  name: string;
  edge_access: string;
  options?: AzionClientOptions;
}): Promise<AzionBucket | null> =>
  updateBucketMethod(resolveToken(), name, edge_access, { ...options, debug: resolveDebug(options?.debug) });

/**
 * Retrieves a list of objects in a specific bucket.
 *
 * @param {Object} params - Parameters for retrieving objects.
 * @param {string} params.bucket - Name of the bucket to retrieve objects from.
 * @param {AzionObjectCollectionParams} [params.params] - Optional parameters for object collection.
 * @param {number} [params.params.max_object_count=10000] - Maximum number of objects to retrieve.
 * @param {AzionClientOptions} [params.options] - Client options including debug mode.
 * @returns {Promise<AzionBucketObject[] | null>} Array of bucket objects or null if retrieval failed.
 *
 * @example
 * const objects = await getObjects({ bucket: 'my-bucket', params: { max_object_count: 50 }, options: { debug: true } });
 * if (objects) {
 *   console.log(`Retrieved ${objects.length} objects from the bucket`);
 * } else {
 *   console.error('Failed to retrieve objects');
 * }
 */
const getObjectsWrapper = ({
  bucket,
  params,
  options,
}: {
  bucket: string;
  params?: AzionObjectCollectionParams;
  options?: AzionClientOptions;
}): Promise<AzionBucketObject[] | null> => getObjectsMethod(resolveToken(), bucket, params, options);

/**
 * Creates a new object in a specific bucket.
 *
 * @param {Object} params - Parameters for creating an object.
 * @param {string} params.bucket - Name of the bucket to create the object in.
 * @param {string} params.key - Key (name) of the object to create.
 * @param {string} params.content - Content of the content to upload.
 * @param {AzionClientOptions} [params.options] - Client options including debug mode.
 * @returns {Promise<AzionBucketObject | null>} The created object or null if creation failed.
 *
 * @example
 * const newObject = await createObject({ bucket: 'my-bucket', key: 'new-content.txt', content: 'content content', options: { debug: true } });
 * if (newObject) {
 *   console.log(`Object created with key: ${newObject.key}`);
 *   console.log(`Object content: ${newObject.content}`);
 * } else {
 *   console.error('Failed to create object');
 * }
 */
const createObjectWrapper = ({
  bucket,
  key,
  content,
  options,
}: {
  bucket: string;
  key: string;
  content: string;
  options?: AzionClientOptions;
}): Promise<AzionBucketObject | null> =>
  createObjectMethod(resolveToken(), bucket, key, content, { ...options, debug: resolveDebug(options?.debug) });

/**
 * Retrieves an object from a specific bucket by its key.
 *
 * @param {Object} params - Parameters for retrieving an object.
 * @param {string} params.bucket - Name of the bucket containing the object.
 * @param {string} params.key - Key of the object to retrieve.
 * @param {AzionClientOptions} [params.options] - Client options including debug mode.
 * @returns {Promise<AzionBucketObject | null>} The retrieved object or null if not found.
 *
 * @example
 * const object = await getObjectByKey({ bucket: 'my-bucket', key: 'content.txt', options: { debug: true } });
 * if (object) {
 *   console.log(`Retrieved object: ${object.key}`);
 * } else {
 *   console.error('Object not found');
 * }
 */
const getObjectByKeyWrapper = ({
  bucket,
  key,
  options,
}: {
  bucket: string;
  key: string;
  options?: AzionClientOptions;
}): Promise<AzionBucketObject | null> =>
  getObjectByKeyMethod(resolveToken(), bucket, key, {
    ...options,
    debug: resolveDebug(options?.debug),
  });

/**
 * Updates an existing object in a specific bucket.
 *
 * @param {Object} params - Parameters for updating an object.
 * @param {string} params.bucket - Name of the bucket containing the object.
 * @param {string} params.key - Key of the object to update.
 * @param {string} params.content - New content of the content.
 * @param {AzionClientOptions} [params.options] - Client options including debug mode.
 * @returns {Promise<AzionBucketObject | null>} The updated object or null if update failed.
 *
 * @example
 * const updatedObject = await updateObject({ bucket: 'my-bucket', key: 'content.txt', content: 'Updated content', options: { debug: true } });
 * if (updatedObject) {
 *   console.log(`Object updated: ${updatedObject.key}`);
 *   console.log(`New content: ${updatedObject.content}`);
 * } else {
 *   console.error('Failed to update object');
 * }
 */
const updateObjectWrapper = ({
  bucket,
  key,
  content,
  options,
}: {
  bucket: string;
  key: string;
  content: string;
  options?: AzionClientOptions;
}): Promise<AzionBucketObject | null> =>
  updateObjectMethod(resolveToken(), bucket, key, content, {
    ...options,
    debug: resolveDebug(options?.debug),
  });

/**
 * Deletes an object from a specific bucket.
 *
 * @param {Object} params - Parameters for deleting an object.
 * @param {string} params.bucket - Name of the bucket containing the object.
 * @param {string} params.key - Key of the object to delete.
 * @param {AzionClientOptions} [params.options] - Client options including debug mode.
 * @returns {Promise<AzionDeletedBucketObject | null>} Confirmation of deletion or null if deletion failed.
 *
 * @example
 * const result = await deleteObject({ bucket: 'my-bucket', key: 'content.txt', options: { debug: true } });
 * if (result) {
 *   console.log(`Object ${result.key} deleted successfully`);
 * } else {
 *   console.error('Failed to delete object');
 * }
 */
const deleteObjectWrapper = ({
  bucket,
  key,
  options,
}: {
  bucket: string;
  key: string;
  options?: AzionClientOptions;
}): Promise<AzionDeletedBucketObject | null> =>
  deleteObjectMethod(resolveToken(), bucket, key, {
    ...options,
    debug: resolveDebug(options?.debug),
  });

/**
 * Creates a Storage client with methods to interact with Azion Edge Storage.
 *
 * @param {Partial<{ token: string; options?: AzionClientOptions }>} [config] - Configuration options for the Storage client.
 * @returns {AzionStorageClient} An object with methods to interact with Storage.
 *
 * @example
 * const storageClient = createClient({ token: 'your-api-token', options: { debug: true } });
 *
 * // Create a new bucket
 * const newBucket = await storageClient.createBucket({ name: 'my-new-bucket', edge_access: 'public' });
 *
 * // Get all buckets
 * const allBuckets = await storageClient.getBuckets({ params: { page: 1, page_size: 10 } });
 *
 * // Delete a bucket
 * const deletedBucket = await storageClient.deleteBucket({ name: 'my-bucket' });
 */
const client: CreateAzionStorageClient = (
  config?: Partial<{ token: string; options?: AzionClientOptions }>,
): AzionStorageClient => {
  const tokenValue = resolveToken(config?.token);
  const debugValue = resolveDebug(config?.options?.debug);

  const client: AzionStorageClient = {
    /**
     * Retrieves a list of buckets with optional filtering and pagination.
     * @param {Object} params - Parameters for retrieving buckets.
     * @param {AzionBucketCollectionParams} [params.params] - Optional parameters for filtering and pagination.
     * @returns {Promise<AzionBucket[] | null>} Array of buckets or null if retrieval failed.
     */
    getBuckets: (params?: { params?: AzionBucketCollectionParams }): Promise<AzionBucket[] | null> =>
      getBucketsMethod(tokenValue, params?.params, { ...config, debug: debugValue }),

    /**
     * Creates a new bucket.
     * @param {Object} params - Parameters for creating a bucket.
     * @param {string} params.name - Name of the new bucket.
     * @param {string} params.edge_access - Edge access configuration for the bucket.
     * @returns {Promise<AzionBucket | null>} The created bucket or null if creation failed.
     */
    createBucket: ({ name, edge_access }: { name: string; edge_access: string }): Promise<AzionBucket | null> =>
      createBucketMethod(tokenValue, name, edge_access, { ...config, debug: debugValue }),

    /**
     * Updates an existing bucket.
     * @param {Object} params - Parameters for updating a bucket.
     * @param {string} params.name - Name of the bucket to update.
     * @param {string} params.edge_access - New edge access configuration for the bucket.
     * @returns {Promise<AzionBucket | null>} The updated bucket or null if update failed.
     */
    updateBucket: ({ name, edge_access }: { name: string; edge_access: string }): Promise<AzionBucket | null> =>
      updateBucketMethod(tokenValue, name, edge_access, { ...config, debug: debugValue }),

    /**
     * Deletes a bucket by its name.
     * @param {Object} params - Parameters for deleting a bucket.
     * @param {string} params.name - Name of the bucket to delete.
     * @returns {Promise<AzionDeletedBucket | null>} Confirmation of deletion or null if deletion failed.
     */
    deleteBucket: ({ name }: { name: string }): Promise<AzionDeletedBucket | null> =>
      deleteBucketMethod(tokenValue, name, { ...config, debug: debugValue }),

    /**
     * Retrieves a bucket by its name.
     * @param {Object} params - Parameters for retrieving a bucket.
     * @param {string} params.name - Name of the bucket to retrieve.
     * @returns {Promise<AzionBucket | null>} The retrieved bucket or null if not found.
     */
    getBucket: ({ name }: { name: string }): Promise<AzionBucket | null> =>
      getBucketMethod(tokenValue, name, { ...config, debug: debugValue }),
  } as const;

  return client;
};

export {
  createBucketWrapper as createBucket,
  client as createClient,
  createObjectWrapper as createObject,
  deleteBucketWrapper as deleteBucket,
  deleteObjectWrapper as deleteObject,
  getBucketWrapper as getBucket,
  getBucketsWrapper as getBuckets,
  getObjectByKeyWrapper as getObjectByKey,
  getObjectsWrapper as getObjects,
  updateBucketWrapper as updateBucket,
  updateObjectWrapper as updateObject,
};

export default client;

export type * from './types';
