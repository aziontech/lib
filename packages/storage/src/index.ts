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
  AzionBucketCollectionOptions,
  AzionBucketObject,
  AzionClientOptions,
  AzionDeletedBucket,
  AzionDeletedBucketObject,
  AzionStorageClient,
  CreateAzionStorageClient,
} from './types';

import { InternalStorageClient, isInternalStorageAvailable } from './services/runtime/index';

const resolveToken = (token?: string) => {
  return token ?? process.env.AZION_TOKEN ?? '';
};
const resolveDebug = (debug?: boolean) => debug ?? !!process.env.AZION_DEBUG;

/**
 * Creates a method that can be executed internally or externally.
 * @template T The type of the function being created.
 * @param {T} internalMethod The method to be executed internally.
 * @param {T} externalMethod The method to be executed externally.
 * @param {string} token The token for API authentication.
 * @param {AzionClientOptions} [options] Additional options, including debug mode.
 * @returns {T} A function that executes either the internal or external method, depending on availability.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createInternalOrExternalMethod = <T extends (...args: any[]) => Promise<any>>(
  internalMethod: T,
  externalMethod: T,
  token: string,
  options?: AzionClientOptions,
): T => {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    if (isInternalStorageAvailable()) {
      return internalMethod(token, ...args, options);
    }
    return externalMethod(token, ...args, options);
  }) as T;
};

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
      getObjects: (): Promise<AzionBucketObject[] | null> => getObjectsMethod(token, name, options),
      getObjectByKey: (objectKey: string): Promise<AzionBucketObject | null> =>
        getObjectByKeyMethod(token, name, objectKey, options),
      createObject: (objectKey: string, file: string): Promise<AzionBucketObject | null> =>
        createObjectMethod(token, name, objectKey, file, options),
      updateObject: (objectKey: string, file: string): Promise<AzionBucketObject | null> =>
        updateObjectMethod(token, name, objectKey, file, options),
      deleteObject: (objectKey: string): Promise<AzionDeletedBucketObject | null> =>
        deleteObjectMethod(token, name, objectKey, options),
    };
  }
  return null;
};

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

export const getBucketsMethod = async (
  token: string,
  options?: AzionBucketCollectionOptions,
  clientOptions?: AzionClientOptions,
): Promise<AzionBucket[] | null> => {
  const apiResponse = await getBuckets(resolveToken(token), options, resolveDebug(clientOptions?.debug));
  if (apiResponse) {
    return apiResponse.results.map((bucket) => ({
      ...bucket,
      getObjects: (): Promise<AzionBucketObject[] | null> => getObjectsMethod(token, bucket.name, clientOptions),
      getObjectByKey: (objectKey: string): Promise<AzionBucketObject | null> =>
        getObjectByKeyMethod(token, bucket.name, objectKey, clientOptions),
      createObject: (objectKey: string, file: string): Promise<AzionBucketObject | null> =>
        createObjectMethod(token, bucket.name, objectKey, file, clientOptions),
      updateObject: (objectKey: string, file: string): Promise<AzionBucketObject | null> =>
        updateObjectMethod(token, bucket.name, objectKey, file, clientOptions),
      deleteObject: (objectKey: string): Promise<AzionDeletedBucketObject | null> =>
        deleteObjectMethod(token, bucket.name, objectKey, clientOptions),
    }));
  }
  return null;
};

const getBucketMethod = createInternalOrExternalMethod(
  async (token: string, name: string, options?: AzionClientOptions): Promise<AzionBucket | null> => {
    const internalClient = new InternalStorageClient(token, options?.debug);
    return internalClient.getBucket(name);
  },
  async (token: string, name: string, options?: AzionClientOptions): Promise<AzionBucket | null> => {
    const PAGE_SIZE_TEMP = 100000;
    const apiResponse = await getBuckets(
      resolveToken(token),
      { page_size: PAGE_SIZE_TEMP },
      resolveDebug(options?.debug),
    );
    const buckets = apiResponse.results;
    if (!buckets) return null;

    const bucket = buckets.find((b) => b.name === name);
    if (!bucket) return null;

    return {
      ...bucket,
      getObjects: (): Promise<AzionBucketObject[] | null> => getObjectsMethod(token, name, options),
      getObjectByKey: (objectKey: string): Promise<AzionBucketObject | null> =>
        getObjectByKeyMethod(token, name, objectKey, options),
      createObject: (objectKey: string, file: string): Promise<AzionBucketObject | null> =>
        createObjectMethod(token, name, objectKey, file, options),
      updateObject: (objectKey: string, file: string): Promise<AzionBucketObject | null> =>
        updateObjectMethod(token, name, objectKey, file, options),
      deleteObject: (objectKey: string): Promise<AzionDeletedBucketObject | null> =>
        deleteObjectMethod(token, name, objectKey, options),
    };
  },
  resolveToken(),
  { debug: resolveDebug() },
);

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
      getObjects: (): Promise<AzionBucketObject[] | null> => getObjectsMethod(token, name, options),
      getObjectByKey: (objectKey: string): Promise<AzionBucketObject | null> =>
        getObjectByKeyMethod(token, name, objectKey, options),
      createObject: (objectKey: string, file: string): Promise<AzionBucketObject | null> =>
        createObjectMethod(token, name, objectKey, file, options),
      updateObject: (objectKey: string, file: string): Promise<AzionBucketObject | null> =>
        updateObjectMethod(token, name, objectKey, file, options),
      deleteObject: (objectKey: string): Promise<AzionDeletedBucketObject | null> =>
        deleteObjectMethod(token, name, objectKey, options),
    };
  }
  return null;
};

const getObjectsMethod = createInternalOrExternalMethod(
  async (token: string, bucketName: string, options?: AzionClientOptions): Promise<AzionBucketObject[] | null> => {
    const internalClient = new InternalStorageClient(token, options?.debug);
    return internalClient.getObjects(bucketName);
  },
  async (token: string, bucketName: string, options?: AzionClientOptions): Promise<AzionBucketObject[] | null> => {
    const apiResponse = await getObjects(resolveToken(token), bucketName, resolveDebug(options?.debug));
    return apiResponse?.results ?? null;
  },
  resolveToken(),
  { debug: resolveDebug() },
);

const getObjectByKeyMethod = createInternalOrExternalMethod(
  async (
    token: string,
    bucketName: string,
    objectKey: string,
    options?: AzionClientOptions,
  ): Promise<AzionBucketObject | null> => {
    const internalClient = new InternalStorageClient(token, options?.debug);
    return internalClient.getObjectByKey(bucketName, objectKey);
  },
  async (
    token: string,
    bucketName: string,
    objectKey: string,
    options?: AzionClientOptions,
  ): Promise<AzionBucketObject | null> => {
    const apiResponse = await getObjectByKey(resolveToken(token), bucketName, objectKey, resolveDebug(options?.debug));
    return apiResponse ? { key: objectKey, content: apiResponse } : null;
  },
  resolveToken(),
  { debug: resolveDebug() },
);

const createObjectMethod = createInternalOrExternalMethod(
  async (
    token: string,
    bucketName: string,
    objectKey: string,
    file: string,
    options?: AzionClientOptions,
  ): Promise<AzionBucketObject | null> => {
    const internalClient = new InternalStorageClient(token, options?.debug);
    return internalClient.createObject(bucketName, objectKey, file);
  },
  async (
    token: string,
    bucketName: string,
    objectKey: string,
    file: string,
    options?: AzionClientOptions,
  ): Promise<AzionBucketObject | null> => {
    const apiResponse = await postObject(
      resolveToken(token),
      bucketName,
      objectKey,
      file,
      resolveDebug(options?.debug),
    );
    return apiResponse ? { key: apiResponse.data.object_key, content: file, state: apiResponse.state } : null;
  },
  resolveToken(),
  { debug: resolveDebug() },
);

const updateObjectMethod = createInternalOrExternalMethod(
  async (
    token: string,
    bucketName: string,
    objectKey: string,
    file: string,
    options?: AzionClientOptions,
  ): Promise<AzionBucketObject | null> => {
    const internalClient = new InternalStorageClient(token, options?.debug);
    return internalClient.updateObject(bucketName, objectKey, file);
  },
  async (
    token: string,
    bucketName: string,
    objectKey: string,
    file: string,
    options?: AzionClientOptions,
  ): Promise<AzionBucketObject | null> => {
    const apiResponse = await putObject(resolveToken(token), bucketName, objectKey, file, resolveDebug(options?.debug));
    return apiResponse ? { key: apiResponse.data.object_key, content: file, state: apiResponse.state } : null;
  },
  resolveToken(),
  { debug: resolveDebug() },
);

const deleteObjectMethod = createInternalOrExternalMethod(
  async (
    token: string,
    bucketName: string,
    objectKey: string,
    options?: AzionClientOptions,
  ): Promise<AzionDeletedBucketObject | null> => {
    const internalClient = new InternalStorageClient(token, options?.debug);
    return internalClient.deleteObject(bucketName, objectKey);
  },
  async (
    token: string,
    bucketName: string,
    objectKey: string,
    options?: AzionClientOptions,
  ): Promise<AzionDeletedBucketObject | null> => {
    const apiResponse = await deleteObject(resolveToken(token), bucketName, objectKey, resolveDebug(options?.debug));
    return apiResponse ? { key: objectKey, state: apiResponse.state } : null;
  },
  resolveToken(),
  { debug: resolveDebug() },
);

/**
 * Creates a new bucket.
 *
 * @param {string} name - Name of the bucket to create.
 * @param {string} edge_access - Edge access configuration for the bucket.
 * @param {boolean} [debug=false] - Enable debug mode for detailed logging.
 * @returns {Promise<Bucket | null>} The created bucket object or null if creation failed.
 *
 * @example
 * const bucket = await createBucket('my-new-bucket', 'public', true);
 * if (bucket) {
 *   console.log(`Bucket created with name: ${bucket.name}`);
 * } else {
 *   console.error('Failed to create bucket');
 * }
 */
const createBucketWrapper = (
  name: string,
  edge_access: string,
  options?: AzionClientOptions,
): Promise<AzionBucket | null> =>
  createBucketMethod(resolveToken(), name, edge_access, { ...options, debug: resolveDebug(options?.debug) });

/**
 * Deletes a bucket by its name.
 *
 * @param {string} name - Name of the bucket to delete.
 * @param {boolean} [debug=false] - Enable debug mode for detailed logging.
 * @returns {Promise<DeletedBucket | null>} Object confirming deletion or null if deletion failed.
 *
 * @example
 * const result = await deleteBucket('my-bucket', true);
 * if (result) {
 *   console.log(`Bucket ${result.name} deleted successfully`);
 * } else {
 *   console.error('Failed to delete bucket');
 * }
 */
const deleteBucketWrapper = (name: string, options?: AzionClientOptions): Promise<AzionDeletedBucket | null> =>
  deleteBucketMethod(resolveToken(), name, { ...options, debug: resolveDebug(options?.debug) });

/**
 * Retrieves a list of buckets with optional filtering and pagination.
 *
 * @param {BucketCollectionOptions} [options] - Optional parameters for filtering and pagination.
 * @param {boolean} [debug=false] - Enable debug mode for detailed logging.
 * @returns {Promise<Bucket[] | null>} Array of bucket objects or null if retrieval failed.
 *
 * @example
 * const buckets = await getBuckets({ page: 1, page_size: 10 }, true);
 * if (buckets) {
 *   console.log(`Retrieved ${buckets.length} buckets`);
 * } else {
 *   console.error('Failed to retrieve buckets');
 * }
 */
const getBucketsWrapper = (
  options?: AzionBucketCollectionOptions,
  clientOptions?: AzionClientOptions,
): Promise<AzionBucket[] | null> =>
  getBucketsMethod(resolveToken(), options, { ...clientOptions, debug: resolveDebug(clientOptions?.debug) });

/**
 * Retrieves a bucket by its name.
 *
 * @param {string} name - Name of the bucket to retrieve.
 * @param {boolean} [debug=false] - Enable debug mode for detailed logging.
 * @returns {Promise<Bucket | null>} The retrieved bucket or null if not found.
 *
 * @example
 * const bucket = await getBucket('my-bucket', true);
 * if (bucket) {
 *   console.log(`Retrieved bucket: ${bucket.name}`);
 * } else {
 *   console.error('Bucket not found');
 * }
 */
const getBucketWrapper = (name: string, options?: AzionClientOptions): Promise<AzionBucket | null> =>
  getBucketMethod(resolveToken(), name, { ...options, debug: resolveDebug(options?.debug) });

/**
 * Updates an existing bucket.
 *
 * @param {string} name - Name of the bucket to update.
 * @param {string} edge_access - New edge access configuration for the bucket.
 * @param {boolean} [debug=false] - Enable debug mode for detailed logging.
 * @returns {Promise<Bucket | null>} The updated bucket or null if update failed.
 *
 * @example
 * const updatedBucket = await updateBucket('my-bucket', 'private', true);
 * if (updatedBucket) {
 *   console.log(`Bucket updated: ${updatedBucket.name}`);
 * } else {
 *   console.error('Failed to update bucket');
 * }
 */
const updateBucketWrapper = (
  name: string,
  edge_access: string,
  options?: AzionClientOptions,
): Promise<AzionBucket | null> =>
  updateBucketMethod(resolveToken(), name, edge_access, { ...options, debug: resolveDebug(options?.debug) });

/**
 * Retrieves a list of objects in a specific bucket.
 *
 * @param {string} bucketName - Name of the bucket to retrieve objects from.
 * @param {boolean} [debug=false] - Enable debug mode for detailed logging.
 * @returns {Promise<BucketObject[] | null>} Array of bucket objects or null if retrieval failed.
 *
 * @example
 * const objects = await getObjects('my-bucket', true);
 * if (objects) {
 *   console.log(`Retrieved ${objects.length} objects from the bucket`);
 * } else {
 *   console.error('Failed to retrieve objects');
 * }
 */
const getObjectsWrapper = (bucketName: string, options?: AzionClientOptions): Promise<AzionBucketObject[] | null> =>
  getObjectsMethod(resolveToken(), bucketName, { ...options, debug: resolveDebug(options?.debug) });

/**
 * Creates a new object in a specific bucket.
 *
 * @param {string} bucketName - Name of the bucket to create the object in.
 * @param {string} objectKey - Key (name) of the object to create.
 * @param {string} file - Content of the file to upload.
 * @param {boolean} [debug=false] - Enable debug mode for detailed logging.
 * @returns {Promise<BucketObject | null>} The created object or null if creation failed.
 *
 * @example
 * const newObject = await createObject('my-bucket', 'new-file.txt', 'File content', true);
 * if (newObject) {
 *   console.log(`Object created with key: ${newObject.key}`);
 *   console.log(`Object content: ${newObject.content}`);
 * } else {
 *   console.error('Failed to create object');
 * }
 */
const createObjectWrapper = (
  bucketName: string,
  objectKey: string,
  file: string,
  options?: AzionClientOptions,
): Promise<AzionBucketObject | null> =>
  createObjectMethod(resolveToken(), bucketName, objectKey, file, { ...options, debug: resolveDebug(options?.debug) });

/**
 * Retrieves an object from a specific bucket by its key.
 *
 * @param {string} bucketName - Name of the bucket containing the object.
 * @param {string} objectKey - Key of the object to retrieve.
 * @param {boolean} [debug=false] - Enable debug mode for detailed logging.
 * @returns {Promise<BucketObject | null>} The retrieved object or null if not found.
 *
 * @example
 * const object = await getObjectByKey('my-bucket', 'file.txt', true);
 * if (object) {
 *   console.log(`Retrieved object: ${object.key}`);
 * } else {
 *   console.error('Object not found');
 * }
 */
const getObjectByKeyWrapper = (
  bucketName: string,
  objectKey: string,
  options?: AzionClientOptions,
): Promise<AzionBucketObject | null> =>
  getObjectByKeyMethod(resolveToken(), bucketName, objectKey, {
    ...options,
    debug: resolveDebug(options?.debug),
  });

/**
 * Updates an existing object in a specific bucket.
 *
 * @param {string} bucketName - Name of the bucket containing the object.
 * @param {string} objectKey - Key of the object to update.
 * @param {string} file - New content of the file.
 * @param {boolean} [debug=false] - Enable debug mode for detailed logging.
 * @returns {Promise<BucketObject | null>} The updated object or null if update failed.
 *
 * @example
 * const updatedObject = await updateObject('my-bucket', 'file.txt', 'Updated content', true);
 * if (updatedObject) {
 *   console.log(`Object updated: ${updatedObject.key}`);
 *   console.log(`New content: ${updatedObject.content}`);
 * } else {
 *   console.error('Failed to update object');
 * }
 */
const updateObjectWrapper = (
  bucketName: string,
  objectKey: string,
  file: string,
  options?: AzionClientOptions,
): Promise<AzionBucketObject | null> =>
  updateObjectMethod(resolveToken(), bucketName, objectKey, file, {
    ...options,
    debug: resolveDebug(options?.debug),
  });

/**
 * Deletes an object from a specific bucket.
 *
 * @param {string} bucketName - Name of the bucket containing the object.
 * @param {string} objectKey - Key of the object to delete.
 * @param {boolean} [debug=false] - Enable debug mode for detailed logging.
 * @returns {Promise<DeletedBucketObject | null>} Confirmation of deletion or null if deletion failed.
 *
 * @example
 * const result = await deleteObject('my-bucket', 'file.txt', true);
 * if (result) {
 *   console.log(`Object ${result.key} deleted successfully`);
 * } else {
 *   console.error('Failed to delete object');
 * }
 */
const deleteObjectWrapper = (
  bucketName: string,
  objectKey: string,
  options?: AzionClientOptions,
): Promise<AzionDeletedBucketObject | null> =>
  deleteObjectMethod(resolveToken(), bucketName, objectKey, {
    ...options,
    debug: resolveDebug(options?.debug),
  });

/**
 * Creates a Storage client with methods to interact with Azion Edge Storage.
 *
 * @param {Partial<{ token: string; debug: boolean }>} [config] - Configuration options for the Storage client.
 * @returns {StorageClient} An object with methods to interact with Storage.
 *
 * @example
 * const storageClient = createClient({ token: 'your-api-token', debug: true });
 *
 * // Create a new bucket
 * const newBucket = await storageClient.createBucket('my-new-bucket', 'public');
 *
 * // Get all buckets
 * const allBuckets = await storageClient.getBuckets();
 *
 * // Delete a bucket
 * const deletedBucket = await storageClient.deleteBucket('my-bucket');
 */
const client: CreateAzionStorageClient = (
  config?: Partial<{ token: string; options?: AzionClientOptions }>,
): AzionStorageClient => {
  const tokenValue = resolveToken(config?.token);
  const debugValue = resolveDebug(config?.options?.debug);

  const client: AzionStorageClient = {
    /**
     * Retrieves a list of buckets with optional filtering and pagination.
     * @param {BucketCollectionOptions} [options] - Optional parameters for filtering and pagination.
     * @returns {Promise<Bucket[] | null>} Array of buckets or null if retrieval failed.
     */
    getBuckets: (options?: AzionBucketCollectionOptions): Promise<AzionBucket[] | null> =>
      getBucketsMethod(tokenValue, options, { ...config, debug: debugValue }),

    /**
     * Creates a new bucket.
     * @param {string} name - Name of the new bucket.
     * @param {string} edge_access - Edge access configuration for the bucket.
     * @returns {Promise<Bucket | null>} The created bucket or null if creation failed.
     */
    createBucket: (name: string, edge_access: string): Promise<AzionBucket | null> =>
      createBucketMethod(tokenValue, name, edge_access, { ...config, debug: debugValue }),

    /**
     * Updates an existing bucket.
     * @param {string} name - Name of the bucket to update.
     * @param {string} edge_access - New edge access configuration for the bucket.
     * @returns {Promise<Bucket | null>} The updated bucket or null if update failed.
     */
    updateBucket: (name: string, edge_access: string): Promise<AzionBucket | null> =>
      updateBucketMethod(tokenValue, name, edge_access, { ...config, debug: debugValue }),

    /**
     * Deletes a bucket by its name.
     * @param {string} name - Name of the bucket to delete.
     * @returns {Promise<DeletedBucket | null>} Confirmation of deletion or null if deletion failed.
     */
    deleteBucket: (name: string): Promise<AzionDeletedBucket | null> =>
      deleteBucketMethod(tokenValue, name, { ...config, debug: debugValue }),

    /**
     * Retrieves a bucket by its name.
     * @param {string} name - Name of the bucket to retrieve.
     * @returns {Promise<Bucket | null>} The retrieved bucket or null if not found.
     */
    getBucket: (name: string): Promise<AzionBucket | null> =>
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
