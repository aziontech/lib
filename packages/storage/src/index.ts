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
} from './services/api/index';
import {
  AzionBucket,
  AzionBucketCollection,
  AzionBucketCollectionParams,
  AzionBucketObject,
  AzionBucketObjects,
  AzionClientOptions,
  AzionDeletedBucket,
  AzionDeletedBucketObject,
  AzionEnvironment,
  AzionObjectCollectionParams,
  AzionStorageClient,
  AzionStorageResponse,
  ContentObjectStorage,
  CreateAzionStorageClient,
  EdgeAccessType,
} from './types';

import { InternalStorageClient, isInternalStorageAvailable } from './services/runtime/index';

import { findBucketByName } from './utils/index';

/**
 * Determines if the code is running in a browser environment.
 *
 * @returns {boolean} True if running in a browser, false otherwise.
 *
 * @example
 * if (isBrowserEnvironment()) {
 *   console.log('Running in browser');
 * } else {
 *   console.log('Running in Node.js');
 * }
 */
const isBrowserEnvironment = (): boolean => {
  return typeof window !== 'undefined' && typeof window.document !== 'undefined';
};

const envDebugFlag = !isBrowserEnvironment() && process?.env.AZION_DEBUG === 'true';

const resolveToken = (token?: string) => {
  if (isBrowserEnvironment()) {
    return token ?? '';
  }
  return token ?? process?.env.AZION_TOKEN ?? '';
};

const resolveDebug = (debug?: boolean) => debug ?? !!envDebugFlag;

const resolveEnv = (env?: AzionEnvironment): AzionEnvironment => {
  if (isBrowserEnvironment()) {
    return env ?? 'production';
  }
  return env ?? (process?.env.AZION_ENV as AzionEnvironment) ?? 'production';
};

/**
 * Resolves client options by applying default values for debug and environment settings
 *
 * @param {AzionClientOptions} [options] - Raw client options
 * @returns {AzionClientOptions} Resolved options with defaults applied
 */
const resolveClientOptions = (options?: AzionClientOptions): AzionClientOptions => ({
  ...options,
  debug: resolveDebug(options?.debug),
  env: resolveEnv(options?.env),
});

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
    const options = args[args.length - 1] as AzionClientOptions;
    const resolvedOptions = resolveClientOptions(options);

    if (resolvedOptions.external || !isInternalStorageAvailable()) {
      return externalMethod(...args);
    }
    return internalMethod(...args);
  }) as T;
};

/**
 * Creates a new bucket.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {string} name - Name of the bucket to create.
 * @param {string} edge_access - Edge access configuration for the bucket.
 * @param {AzionClientOptions} [options] - Client options including debug mode.
 * @returns {Promise<AzionStorageResponse>} The created bucket object or error message.
 */
export const createBucketMethod = async (
  token: string,
  name: string,
  edge_access: EdgeAccessType,
  options?: AzionClientOptions,
): Promise<AzionStorageResponse<AzionBucket>> => {
  const resolvedOptions = resolveClientOptions(options);
  const apiResponse = await postBucket(
    resolveToken(token),
    name,
    edge_access,
    resolvedOptions.debug,
    resolvedOptions.env,
  );
  if (apiResponse.data) {
    return {
      data: {
        ...apiResponse.data,
        edge_access: apiResponse.data.edge_access as EdgeAccessType,
        getObjects: ({
          params,
        }: {
          params: AzionObjectCollectionParams;
        }): Promise<AzionStorageResponse<AzionBucketObjects>> => getObjectsMethod(token, name, params, resolvedOptions),
        getObjectByKey: ({ key }: { key: string }): Promise<AzionStorageResponse<AzionBucketObject>> =>
          getObjectByKeyMethod(token, name, key, resolvedOptions),
        createObject: ({
          key,
          content,
        }: {
          key: string;
          content: ContentObjectStorage;
        }): Promise<AzionStorageResponse<AzionBucketObject>> =>
          createObjectMethod(token, name, key, content, resolvedOptions),
        updateObject: ({
          key,
          content,
        }: {
          key: string;
          content: ContentObjectStorage;
        }): Promise<AzionStorageResponse<AzionBucketObject>> =>
          updateObjectMethod(token, name, key, content, resolvedOptions),
        deleteObject: ({ key }: { key: string }): Promise<AzionStorageResponse<AzionDeletedBucketObject>> =>
          deleteObjectMethod(token, name, key, resolvedOptions),
      },
    };
  }
  return {
    error: apiResponse.error,
  };
};

/**
 * Deletes a bucket by its name.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {string} name - Name of the bucket to delete.
 * @param {AzionClientOptions} [options] - Client options including debug mode.
 * @returns {Promise<AzionStorageResponse<AzionDeletedBucket>>} Confirmation of deletion or error message.
 */
export const deleteBucketMethod = async (
  token: string,
  name: string,
  options?: AzionClientOptions,
): Promise<AzionStorageResponse<AzionDeletedBucket>> => {
  const resolvedOptions = resolveClientOptions(options);
  const apiResponse = await deleteBucket(resolveToken(token), name, resolvedOptions.debug, resolvedOptions.env);
  if (apiResponse.data) {
    return { data: { name: apiResponse.data.name, state: apiResponse.state } };
  }
  return {
    error: apiResponse.error,
  };
};

/**
 * Retrieves a list of buckets with optional filtering and pagination.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {AzionBucketCollectionParams} [params] - Optional parameters for filtering and pagination.
 * @param {AzionClientOptions} [options] - Client options including debug mode.
 * @returns {Promise<AzionStorageResponse<AzionBucketCollection>>} Array of bucket objects or error message.
 */
export const getBucketsMethod = async (
  token: string,
  params?: AzionBucketCollectionParams,
  options?: AzionClientOptions,
): Promise<AzionStorageResponse<AzionBucketCollection>> => {
  const resolvedOptions = resolveClientOptions(options);

  const apiResponse = await getBuckets(resolveToken(token), params, resolvedOptions.debug, resolvedOptions.env);
  if (apiResponse?.results && apiResponse.results.length > 0) {
    const buckets = apiResponse.results?.map((bucket) => ({
      ...bucket,
      edge_access: bucket.edge_access as EdgeAccessType,
      getObjects: ({
        params,
      }: {
        params: AzionObjectCollectionParams;
      }): Promise<AzionStorageResponse<AzionBucketObjects>> =>
        getObjectsMethod(token, bucket.name, params, resolvedOptions),
      getObjectByKey: ({ key }: { key: string }): Promise<AzionStorageResponse<AzionBucketObject>> =>
        getObjectByKeyMethod(token, bucket.name, key, resolvedOptions),
      createObject: ({
        key,
        content,
      }: {
        key: string;
        content: ContentObjectStorage;
      }): Promise<AzionStorageResponse<AzionBucketObject>> =>
        createObjectMethod(token, bucket.name, key, content, resolvedOptions),
      updateObject: ({
        key,
        content,
      }: {
        key: string;
        content: ContentObjectStorage;
      }): Promise<AzionStorageResponse<AzionBucketObject>> =>
        updateObjectMethod(token, bucket.name, key, content, resolvedOptions),
      deleteObject: ({ key }: { key: string }): Promise<AzionStorageResponse<AzionDeletedBucketObject>> =>
        deleteObjectMethod(token, bucket.name, key, resolvedOptions),
    }));
    return {
      data: {
        buckets,
        count: apiResponse.count ?? buckets.length,
      },
    };
  }
  return {
    error: apiResponse.error,
  };
};

/**
 * Get a bucket by its name.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {string} name - Name of the bucket to get.
 * @param {AzionClientOptions} [options] - Client options including debug mode.
 * @returns {Promise<AzionStorageResponse<AzionBucket>>} - Bucket object or error message.
 */
const getBucketMethod = createInternalOrExternalMethod(
  async (token: string, name: string, options?: AzionClientOptions): Promise<AzionStorageResponse<AzionBucket>> => {
    const resolvedOptions = resolveClientOptions(options);
    const bucket = await findBucketByName(token, name, resolvedOptions);
    if (bucket.error || !bucket.data?.name) {
      return {
        error: {
          message: bucket.error?.message ?? 'Bucket not found',
          operation: 'get bucket',
        },
      };
    }

    const internalClient = new InternalStorageClient(token, resolvedOptions.debug);
    const internalResult = await internalClient.getBucket({ name });
    if (internalResult) {
      return {
        data: {
          ...internalResult,
          getObjects: ({
            params,
          }: {
            params: AzionObjectCollectionParams;
          }): Promise<AzionStorageResponse<AzionBucketObjects>> =>
            getObjectsMethod(token, name, params, resolvedOptions),
          getObjectByKey: ({ key }: { key: string }): Promise<AzionStorageResponse<AzionBucketObject>> =>
            getObjectByKeyMethod(token, name, key, resolvedOptions),
          createObject: ({
            key,
            content,
          }: {
            key: string;
            content: ContentObjectStorage;
          }): Promise<AzionStorageResponse<AzionBucketObject>> =>
            createObjectMethod(token, name, key, content, resolvedOptions),
          updateObject: ({
            key,
            content,
          }: {
            key: string;
            content: ContentObjectStorage;
          }): Promise<AzionStorageResponse<AzionBucketObject>> =>
            updateObjectMethod(token, name, key, content, resolvedOptions),
          deleteObject: ({ key }: { key: string }): Promise<AzionStorageResponse<AzionDeletedBucketObject>> =>
            deleteObjectMethod(token, name, key, resolvedOptions),
        },
      };
    }
    return {
      error: {
        message: 'Failed to retrieve bucket',
        operation: 'get bucket',
      },
    };
  },
  async (token: string, name: string, options?: AzionClientOptions): Promise<AzionStorageResponse<AzionBucket>> => {
    const resolvedOptions = resolveClientOptions(options);
    const bucket = await findBucketByName(token, name, resolvedOptions);

    if (bucket.error || !bucket.data?.name) {
      return {
        error: {
          message: bucket.error?.message ?? 'Bucket not found',
          operation: 'get bucket',
        },
      };
    }
    return {
      data: {
        name: bucket.data.name,
        edge_access: bucket.data?.edge_access as EdgeAccessType,
        getObjects: ({
          params,
        }: {
          params: AzionObjectCollectionParams;
        }): Promise<AzionStorageResponse<AzionBucketObjects>> => getObjectsMethod(token, name, params, resolvedOptions),
        getObjectByKey: ({ key }: { key: string }): Promise<AzionStorageResponse<AzionBucketObject>> =>
          getObjectByKeyMethod(token, name, key, resolvedOptions),
        createObject: ({
          key,
          content,
        }: {
          key: string;
          content: ContentObjectStorage;
        }): Promise<AzionStorageResponse<AzionBucketObject>> =>
          createObjectMethod(token, name, key, content, resolvedOptions),
        updateObject: ({
          key,
          content,
        }: {
          key: string;
          content: ContentObjectStorage;
        }): Promise<AzionStorageResponse<AzionBucketObject>> =>
          updateObjectMethod(token, name, key, content, resolvedOptions),
        deleteObject: ({ key }: { key: string }): Promise<AzionStorageResponse<AzionDeletedBucketObject>> =>
          deleteObjectMethod(token, name, key, resolvedOptions),
      },
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
 * @returns {Promise<AzionStorageResponse<AzionBucket>>} The updated bucket or error message.
 */
export const updateBucketMethod = async (
  token: string,
  name: string,
  edge_access: EdgeAccessType,
  options?: AzionClientOptions,
): Promise<AzionStorageResponse<AzionBucket>> => {
  const resolvedOptions = resolveClientOptions(options);
  const apiResponse = await patchBucket(
    resolveToken(token),
    name,
    edge_access,
    resolvedOptions.debug,
    resolvedOptions.env,
  );
  if (apiResponse?.data) {
    return {
      data: {
        ...apiResponse.data,
        edge_access: apiResponse.data.edge_access as EdgeAccessType,
        getObjects: ({
          params,
        }: {
          params: AzionObjectCollectionParams;
        }): Promise<AzionStorageResponse<AzionBucketObjects>> => getObjectsMethod(token, name, params, resolvedOptions),
        getObjectByKey: ({ key }: { key: string }): Promise<AzionStorageResponse<AzionBucketObject>> =>
          getObjectByKeyMethod(token, name, key, resolvedOptions),
        createObject: ({
          key,
          content,
        }: {
          key: string;
          content: ContentObjectStorage;
        }): Promise<AzionStorageResponse<AzionBucketObject>> =>
          createObjectMethod(token, name, key, content, resolvedOptions),
        updateObject: ({
          key,
          content,
        }: {
          key: string;
          content: ContentObjectStorage;
        }): Promise<AzionStorageResponse<AzionBucketObject>> =>
          updateObjectMethod(token, name, key, content, resolvedOptions),
        deleteObject: ({ key }: { key: string }): Promise<AzionStorageResponse<AzionDeletedBucketObject>> =>
          deleteObjectMethod(token, name, key, resolvedOptions),
      },
    };
  }
  return {
    error: apiResponse.error,
  };
};

/**
 * Retrieves a list of objects in a specific bucket.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {string} bucket - Name of the bucket to retrieve objects from.
 * @param {AzionObjectCollectionParams} [params] - Optional parameters for object collection.
 * @param {AzionClientOptions} [options] - Client options including debug mode.
 * @returns {Promise<AzionStorageResponse<AzionBucketObjects>>} Array of bucket objects or null if retrieval failed.
 */
const getObjectsMethod = createInternalOrExternalMethod(
  async (
    token: string,
    bucket: string,
    params?: AzionObjectCollectionParams,
    options?: AzionClientOptions,
  ): Promise<AzionStorageResponse<AzionBucketObjects>> => {
    const internalClient = new InternalStorageClient(token, options?.debug);
    internalClient.name = bucket;
    const internalResult = await internalClient.getObjects({ params });
    if (internalResult.data) {
      return {
        data: internalResult.data,
      };
    }
    return {
      error: {
        message: 'Failed to retrieve objects',
        operation: 'get objects',
      },
    };
  },
  async (
    token: string,
    bucket: string,
    params?: AzionObjectCollectionParams,
    options?: AzionClientOptions,
  ): Promise<AzionStorageResponse<AzionBucketObjects>> => {
    const apiResponse = await getObjects(resolveToken(token), bucket, params, options?.debug, options?.env);
    if (apiResponse.results) {
      return {
        data: {
          objects: apiResponse.results,
          count: apiResponse.results.length,
        },
      };
    }
    return {
      error: apiResponse?.error,
    };
  },
);

/**
 * Retrieves an object from a specific bucket by its key.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {string} bucket - Name of the bucket containing the object.
 * @param {string} key - Key of the object to retrieve.
 * @param {AzionClientOptions} [options] - Client options including debug mode.
 * @returns {Promise<AzionStorageResponse<AzionBucketObject>>} The retrieved object or error message.
 */
const getObjectByKeyMethod = createInternalOrExternalMethod(
  async (
    token: string,
    bucket: string,
    key: string,
    options?: AzionClientOptions,
  ): Promise<AzionStorageResponse<AzionBucketObject>> => {
    const internalClient = new InternalStorageClient(token, options?.debug);
    internalClient.name = bucket;
    const internalResult = await internalClient.getObjectByKey({ key });
    if (internalResult.data) {
      return {
        data: internalResult.data,
      };
    }
    return {
      error: {
        message: 'Failed to retrieve object',
        operation: 'get object by key',
      },
    };
  },
  async (
    token: string,
    bucket: string,
    key: string,
    options?: AzionClientOptions,
  ): Promise<AzionStorageResponse<AzionBucketObject>> => {
    const apiResponse = await getObjectByKey(
      resolveToken(token),
      bucket,
      key,
      resolveDebug(options?.debug),
      resolveEnv(options?.env),
    );
    if (apiResponse.data) {
      return {
        data: {
          key,
          content: apiResponse.data,
        },
      };
    }
    return {
      error: apiResponse.error,
    };
  },
);

/**
 * Creates a new object in a specific bucket.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {string} bucket - Name of the bucket to create the object in.
 * @param {string} key - Key (name) of the object to create.
 * @param {ContentObjectStorage} content - Content of the content to upload.
 * @param {AzionClientOptions} [options] - Client options including debug mode.
 * @returns {Promise<AzionStorageResponse<AzionBucketObject>>} The created object or error message
 */
const createObjectMethod = createInternalOrExternalMethod(
  async (
    token: string,
    bucket: string,
    key: string,
    content: ContentObjectStorage,
    options?: AzionClientOptions,
  ): Promise<AzionStorageResponse<AzionBucketObject>> => {
    const internalClient = new InternalStorageClient(token, options?.debug);
    internalClient.name = bucket;
    const internalResult = await internalClient.createObject({ key, content });
    if (internalResult?.data) {
      return {
        data: internalResult.data,
      };
    }
    return {
      error: {
        message: 'Failed to create object',
        operation: 'create object',
      },
    };
  },
  async (
    token: string,
    bucket: string,
    key: string,
    content: ContentObjectStorage,
    options?: AzionClientOptions,
  ): Promise<AzionStorageResponse<AzionBucketObject>> => {
    const apiResponse = await postObject(
      resolveToken(token),
      bucket,
      key,
      content,
      resolveDebug(options?.debug),
      resolveEnv(options?.env),
    );
    if (apiResponse.data) {
      return {
        data: {
          key: apiResponse.data.object_key,
          content,
          state: apiResponse.state,
        },
      };
    }
    return {
      error: apiResponse.error,
    };
  },
);

/**
 * Updates an existing object in a specific bucket.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {string} bucket - Name of the bucket containing the object.
 * @param {string} key - Key of the object to update.
 * @param {ContentObjectStorage} content - New content of the content.
 * @param {AzionClientOptions} [options] - Client options including debug mode.
 * @returns {Promise<AzionStorageResponse<AzionBucketObject>>} The updated object or error message.
 */
const updateObjectMethod = createInternalOrExternalMethod(
  async (
    token: string,
    bucket: string,
    key: string,
    content: ContentObjectStorage,
    options?: AzionClientOptions,
  ): Promise<AzionStorageResponse<AzionBucketObject>> => {
    const internalClient = new InternalStorageClient(token, options?.debug);
    internalClient.name = bucket;
    const internalResult = await internalClient.updateObject({ key, content });
    if (internalResult?.data) {
      return {
        data: internalResult.data,
      };
    }
    return {
      error: internalResult.error,
    };
  },
  async (
    token: string,
    bucket: string,
    key: string,
    content: ContentObjectStorage,
    options?: AzionClientOptions,
  ): Promise<AzionStorageResponse<AzionBucketObject>> => {
    const apiResponse = await putObject(
      resolveToken(token),
      bucket,
      key,
      content,
      resolveDebug(options?.debug),
      resolveEnv(options?.env),
    );
    if (apiResponse.data) {
      return {
        data: {
          key: apiResponse.data.object_key,
          content,
          state: apiResponse.state,
        },
      };
    }
    return {
      error: apiResponse.error,
    };
  },
);

/**
 * Deletes an object from a specific bucket.
 *
 * @param {string} token - Authentication token for Azion API.
 * @param {string} bucket - Name of the bucket containing the object.
 * @param {string} key - Key of the object to delete.
 * @param {AzionClientOptions} [options] - Client options including debug mode.
 * @returns {Promise<AzionStorageResponse<AzionDeletedBucketObject>>} Confirmation of deletion or error if deletion failed.
 */
const deleteObjectMethod = createInternalOrExternalMethod(
  async (
    token: string,
    bucket: string,
    key: string,
    options?: AzionClientOptions,
  ): Promise<AzionStorageResponse<AzionDeletedBucketObject>> => {
    const internalClient = new InternalStorageClient(token, options?.debug);
    internalClient.name = bucket;
    const internalResult = await internalClient.deleteObject({ key });
    if (internalResult.data) {
      return {
        data: internalResult.data,
      };
    }
    return {
      error: internalResult.error,
    };
  },
  async (
    token: string,
    bucket: string,
    key: string,
    options?: AzionClientOptions,
  ): Promise<AzionStorageResponse<AzionDeletedBucketObject>> => {
    const apiResponse = await deleteObject(
      resolveToken(token),
      bucket,
      key,
      resolveDebug(options?.debug),
      resolveEnv(options?.env),
    );
    if (apiResponse.data) {
      return {
        data: {
          key,
          state: apiResponse.state,
        },
      };
    }
    return {
      error: apiResponse.error,
    };
  },
);

/**
 * Creates a new bucket.
 *
 * @param {Object} params - Parameters for creating a bucket.
 * @param {string} params.name - Name of the new bucket.
 * @param {string} params.edge_access - Edge access configuration for the bucket.
 * @param {AzionClientOptions} [params.options] - Client options including debug mode.
 * @returns {Promise<AzionStorageResponse>} The created bucket or error message.
 *
 * @example
 * const { data, error } = await createBucket({ name: 'my-new-bucket', edge_access: 'public', options: { debug: true } });
 * if (data) {
 *   console.log(`Bucket created with name: ${data.name}`);
 * } else {
 *   console.error('Failed to create bucket', error);
 * }
 */
const createBucketWrapper = ({
  name,
  edge_access,
  options,
}: {
  name: string;
  edge_access: EdgeAccessType;
  options?: AzionClientOptions;
}): Promise<AzionStorageResponse<AzionBucket>> =>
  createBucketMethod(resolveToken(), name, edge_access, resolveClientOptions(options));

/**
 * Deletes a bucket by its name.
 *
 * @param {Object} params - Parameters for deleting a bucket.
 * @param {string} params.name - Name of the bucket to delete.
 * @param {AzionClientOptions} [params.options] - Client options including debug mode.
 * @returns {Promise<AzionStorageResponse<AzionDeletedBucket>>} Confirmation of deletion or error message.
 *
 * @example
 * const { data, error } = await deleteBucket({ name: 'my-bucket', options: { debug: true } });
 * if (data) {
 *   console.log(`Bucket ${data.name} deleted successfully`);
 * } else {
 *   console.error('Failed to delete bucket', error);
 * }
 */
const deleteBucketWrapper = ({
  name,
  options,
}: {
  name: string;
  options?: AzionClientOptions;
}): Promise<AzionStorageResponse<AzionDeletedBucket>> =>
  deleteBucketMethod(resolveToken(), name, resolveClientOptions(options));

/**
 * Retrieves a list of buckets with optional filtering and pagination.
 *
 * @param {Object} params - Parameters for retrieving buckets.
 * @param {AzionBucketCollectionParams} [params.params] - Optional parameters for filtering and pagination.
 * @param {AzionClientOptions} [params.options] - Client options including debug mode.
 * @returns {Promise<AzionBucket[] | null>} Array of bucket objects or null if retrieval failed.
 *
 * @example
 * const { data: buckets, error } = await getBuckets({ params: { limit: 10, offset: 0 }, options: { debug: true } });
 * if (buckets) {
 *   console.log(`Retrieved ${buckets.length} buckets`);
 * } else {
 *   console.error('Failed to retrieve buckets', error);
 * }
 */
const getBucketsWrapper = ({
  params,
  options,
}: {
  params?: AzionBucketCollectionParams;
  options?: AzionClientOptions;
}): Promise<AzionStorageResponse<AzionBucketCollection>> =>
  getBucketsMethod(resolveToken(), params, resolveClientOptions(options));

/**
 * Retrieves a bucket by its name.
 *
 * @param {Object} params - Parameters for retrieving a bucket.
 * @param {string} params.name - Name of the bucket to retrieve.
 * @param {AzionClientOptions} [params.options] - Client options including debug mode.
 * @returns {Promise<AzionStorageResponse<AzionBucket>>} The retrieved bucket or error message.
 *
 * @example
 * const { data: bucket, error } = await getBucket({ name: 'my-bucket', options: { debug: true } });
 * if (bucket) {
 *   console.log(`Retrieved bucket: ${bucket.name}`);
 * } else {
 *   console.error('Bucket not found', error);
 * }
 */
const getBucketWrapper = ({
  name,
  options,
}: {
  name: string;
  options?: AzionClientOptions;
}): Promise<AzionStorageResponse<AzionBucket>> => getBucketMethod(resolveToken(), name, resolveClientOptions(options));

/**
 * Updates an existing bucket.
 *
 * @param {Object} params - Parameters for updating a bucket.
 * @param {string} params.name - Name of the bucket to update.
 * @param {string} params.edge_access - New edge access configuration for the bucket.
 * @param {AzionClientOptions} [params.options] - Client options including debug mode.
 * @returns {Promise<AzionStorageResponse<AzionBucket>>} The updated bucket or error message.
 *
 * @example
 * const { data: updatedBucket, error } = await updateBucket({ name: 'my-bucket', edge_access: 'private', options: { debug: true } });
 * if (updatedBucket) {
 *   console.log(`Bucket updated: ${updatedBucket.name}`);
 * } else {
 *   console.error('Failed to update bucket', error);
 * }
 */
const updateBucketWrapper = ({
  name,
  edge_access,
  options,
}: {
  name: string;
  edge_access: EdgeAccessType;
  options?: AzionClientOptions;
}): Promise<AzionStorageResponse<AzionBucket>> =>
  updateBucketMethod(resolveToken(), name, edge_access, resolveClientOptions(options));

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
 * const { data: objects, error } = await getObjects({ bucket: 'my-bucket', params: { max_object_count: 50 }, options: { debug: true } });
 * if (objects) {
 *   console.log(`Retrieved ${objects.length} objects from the bucket`);
 * } else {
 *   console.error('Failed to retrieve objects', error);
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
}): Promise<AzionStorageResponse<AzionBucketObjects>> =>
  getObjectsMethod(resolveToken(), bucket, params, resolveClientOptions(options));

/**
 * Creates a new object in a specific bucket.
 *
 * @param {Object} params - Parameters for creating an object.
 * @param {string} params.bucket - Name of the bucket to create the object in.
 * @param {string} params.key - Key (name) of the object to create.
 * @param {string} params.content - Content of the content to upload.
 * @param {AzionClientOptions} [params.options] - Client options including debug mode.
 * @returns {Promise<AzionStorageResponse<AzionBucketObject>>} The created object or error message
 *
 * @example
 * const { data: newObject, error } = await createObject({ bucket: 'my-bucket', key: 'new-content.txt', content: 'content content', options: { debug: true } });
 * if (newObject) {
 *   console.log(`Object created with key: ${newObject.key}`);
 *   console.log(`Object content: ${newObject.content}`);
 * } else {
 *   console.error('Failed to create object', error);
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
  content: ContentObjectStorage;
  options?: AzionClientOptions;
}): Promise<AzionStorageResponse<AzionBucketObject>> =>
  createObjectMethod(resolveToken(), bucket, key, content, resolveClientOptions(options));

/**
 * Retrieves an object from a specific bucket by its key.
 *
 * @param {Object} params - Parameters for retrieving an object.
 * @param {string} params.bucket - Name of the bucket containing the object.
 * @param {string} params.key - Key of the object to retrieve.
 * @param {AzionClientOptions} [params.options] - Client options including debug mode.
 * @returns {Promise<AzionStorageResponse<AzionBucketObject>>} The retrieved object or error message.
 *
 * @example
 * const { data: object, error } = await getObjectByKey({ bucket: 'my-bucket', key: 'content.txt', options: { debug: true } });
 * if (object) {
 *   console.log(`Retrieved object: ${object.key}`);
 * } else {
 *   console.error('Object not found', error);
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
}): Promise<AzionStorageResponse<AzionBucketObject>> =>
  getObjectByKeyMethod(resolveToken(), bucket, key, resolveClientOptions(options));

/**
 * Updates an existing object in a specific bucket.
 *
 * @param {Object} params - Parameters for updating an object.
 * @param {string} params.bucket - Name of the bucket containing the object.
 * @param {string} params.key - Key of the object to update.
 * @param {string} params.content - New content of the content.
 * @param {AzionClientOptions} [params.options] - Client options including debug mode.
 * @returns {Promise<AzionStorageResponse<AzionBucketObject>>} The updated object or error message.
 *
 * @example
 * const { data: updatedObject, error } = await updateObject({ bucket: 'my-bucket', key: 'content.txt', content: 'Updated content', options: { debug: true } });
 * if (updatedObject) {
 *   console.log(`Object updated: ${updatedObject.key}`);
 *   console.log(`New content: ${updatedObject.content}`);
 * } else {
 *   console.error('Failed to update object', error);
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
  content: ContentObjectStorage;
  options?: AzionClientOptions;
}): Promise<AzionStorageResponse<AzionBucketObject>> =>
  updateObjectMethod(resolveToken(), bucket, key, content, resolveClientOptions(options));

/**
 * Deletes an object from a specific bucket.
 *
 * @param {Object} params - Parameters for deleting an object.
 * @param {string} params.bucket - Name of the bucket containing the object.
 * @param {string} params.key - Key of the object to delete.
 * @param {AzionClientOptions} [params.options] - Client options including debug mode.
 * @returns {Promise<AzionStorageResponse<AzionDeletedBucketObject>>} Confirmation of deletion or error if deletion failed.
 *
 * @example
 * const { data: result, error } = await deleteObject({ bucket: 'my-bucket', key: 'content.txt', options: { debug: true } });
 * if (result) {
 *   console.log(`Object ${result.key} deleted successfully`);
 * } else {
 *   console.error('Failed to delete object', error);
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
}): Promise<AzionStorageResponse<AzionDeletedBucketObject>> =>
  deleteObjectMethod(resolveToken(), bucket, key, resolveClientOptions(options));

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
 * const { data, error } = await storageClient.createBucket({ name: 'my-new-bucket', edge_access: 'public' });
 *
 * // Get all buckets
 * const { data: allBuckets } = await storageClient.getBuckets({ params: { page: 1, page_size: 10 } });
 *
 * // Delete a bucket
 * const deletedBucket = await storageClient.deleteBucket({ name: 'my-bucket' });
 */
const client: CreateAzionStorageClient = (
  config?: Partial<{ token: string; options?: AzionClientOptions }>,
): AzionStorageClient => {
  const tokenValue = resolveToken(config?.token);
  const resolvedOptions = resolveClientOptions(config?.options);

  const client: AzionStorageClient = {
    getBuckets: (params?: {
      params?: AzionBucketCollectionParams;
    }): Promise<AzionStorageResponse<AzionBucketCollection>> =>
      getBucketsMethod(tokenValue, params?.params, resolvedOptions),
    createBucket: ({
      name,
      edge_access,
    }: {
      name: string;
      edge_access: EdgeAccessType;
    }): Promise<AzionStorageResponse<AzionBucket>> =>
      createBucketMethod(tokenValue, name, edge_access, resolvedOptions),
    updateBucket: ({
      name,
      edge_access,
    }: {
      name: string;
      edge_access: EdgeAccessType;
    }): Promise<AzionStorageResponse<AzionBucket>> =>
      updateBucketMethod(tokenValue, name, edge_access, resolvedOptions),
    deleteBucket: ({ name }: { name: string }): Promise<AzionStorageResponse<AzionDeletedBucket>> =>
      deleteBucketMethod(tokenValue, name, resolvedOptions),
    getBucket: ({ name }: { name: string }): Promise<AzionStorageResponse<AzionBucket>> =>
      getBucketMethod(tokenValue, name, resolvedOptions),
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
