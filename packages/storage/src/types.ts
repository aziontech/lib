// eslint-disable-next-line @typescript-eslint/no-namespace

export type AzionStorageResponse<T> = {
  data?: T;
  error?: {
    message: string;
    operation: string;
  };
};

/**
 * Represents an Azion storage bucket with methods to interact with objects.
 *
 * @interface AzionBucket
 *
 * @property {string} name - The name of the bucket.
 * @property {string} edge_access - The edge access configuration for the bucket.
 * @property {'executed' | 'executed-runtime' | 'pending'} [state] - The current state of the bucket.
 */
export interface AzionBucket {
  name: string;
  edge_access: string;
  state?: 'executed' | 'executed-runtime' | 'pending';

  /**
   * Retrieves a list of objects in the bucket.
   *
   * @param {Object} params - Parameters for retrieving objects.
   * @param {AzionObjectCollectionParams} params.params - Options for filtering and pagination.
   * @returns {Promise<AzionStorageResponse<AzionBucketObjects>>} A promise that resolves to an array of bucket objects or error message.
   *
   * @example
   * const { data: objects, error } = await bucket.getObjects({ params: { max_object_count: 100 } });
   */
  getObjects: (params: { params: AzionObjectCollectionParams }) => Promise<AzionStorageResponse<AzionBucketObjects>>;

  /**
   * Retrieves a specific object from the bucket by its key.
   *
   * @param {Object} params - Parameters for retrieving the object.
   * @param {string} params.key - The key of the object to retrieve.
   * @returns {Promise<AzionStorageResponse<AzionBucketObject>>} A promise that resolves to the bucket object or error message.
   *
   * @example
   * const { data: object } = await bucket.getObjectByKey({ key: 'example.txt' });
   */
  getObjectByKey: (params: { key: string }) => Promise<AzionStorageResponse<AzionBucketObject>>;

  /**
   * Creates a new object in the bucket.
   *
   * @param {Object} params - Parameters for creating the object.
   * @param {string} params.key - The key for the new object.
   * @param {string} params.content - The content of the new object.
   * @param {Object} [params.options] - Additional options for the object.
   * @param {string} [params.options.content_type] - The content type of the object.
   * @returns {Promise<AzionStorageResponse<AzionBucketObject>>} A promise that resolves to the created bucket object or error message.
   *
   * @example
   * const { data: newObject } = await bucket.createObject({
   *   key: 'new-file.txt',
   *   content: 'Hello, World!',
   *   options: { content_type: 'text/plain' }
   * });
   */
  createObject: (params: {
    key: string;
    content: string;
    options?: { content_type?: string };
  }) => Promise<AzionStorageResponse<AzionBucketObject>>;

  /**
   * Updates an existing object in the bucket.
   *
   * @param {Object} params - Parameters for updating the object.
   * @param {string} params.key - The key of the object to update.
   * @param {string} params.content - The new content for the object.
   * @param {Object} [params.options] - Additional options for the object.
   * @param {string} [params.options.content_type] - The new content type for the object.
   * @returns {Promise<AzionStorageResponse<AzionBucketObject>>} A promise that resolves to the updated bucket object or error message.
   *
   * @example
   * const { data: updatedObject } = await bucket.updateObject({
   *   key: 'existing-file.txt',
   *   content: 'Updated content',
   *   options: { content_type: 'text/plain' }
   * });
   */
  updateObject: (params: {
    key: string;
    content: string;
    options?: { content_type?: string };
  }) => Promise<AzionStorageResponse<AzionBucketObject>>;

  /**
   * Deletes an object from the bucket.
   *
   * @param {Object} params - Parameters for deleting the object.
   * @param {string} params.key - The key of the object to delete.
   * @returns {Promise<AzionStorageResponse<AzionDeletedBucketObject>>} A promise that resolves to the deleted bucket object or error if deletion failed.
   *
   * @example
   * const { data: deletedObject, error } = await bucket.deleteObject({ key: 'file-to-delete.txt' });
   */
  deleteObject: (params: { key: string }) => Promise<AzionStorageResponse<AzionDeletedBucketObject>>;
}

export interface AzionBucketObject {
  key: string;
  state?: 'executed' | 'executed-runtime' | 'pending';
  size?: number;
  last_modified?: string;
  content_type?: string;
  content?: string;
}

export interface AzionBucketObjects {
  objects: AzionBucketObject[];
  count: number;
}

export interface AzionDeletedBucketObject {
  key: string;
  state?: 'executed' | 'executed-runtime' | 'pending';
}

export interface AzionDeletedBucket {
  name: string;
  state?: 'executed' | 'executed-runtime' | 'pending';
}

export interface AzionBucketCollection {
  buckets: AzionBucket[];
  count: number;
}

export interface AzionStorageClient {
  /**
   * Retrieves a list of buckets with optional filtering and pagination.
   * @param {Object} params - Parameters for retrieving buckets.
   * @param {AzionBucketCollectionParams} [params.params] - Optional parameters for filtering and pagination.
   * @returns {Promise<AzionStorageResponse<AzionBucketCollection>>} Array of buckets or error message.
   */
  getBuckets: (params?: {
    params?: AzionBucketCollectionParams;
  }) => Promise<AzionStorageResponse<AzionBucketCollection>>;
  /**
   * Creates a new bucket.
   * @param {Object} params - Parameters for creating a bucket.
   * @param {string} params.name - Name of the new bucket.
   * @param {string} params.edge_access - Edge access configuration for the bucket.
   * @returns {Promise<AzionStorageResponse>} The created bucket or error message.
   */
  createBucket: (params: { name: string; edge_access: string }) => Promise<AzionStorageResponse<AzionBucket>>;

  /**
   * Updates a bucket by its name.
   * @param {Object} params - Parameters for updating a bucket.
   * @param {string} params.name - Name of the bucket to update.
   * @param {string} params.edge_access - New edge access configuration for the bucket.
   * @returns {Promise<AzionStorageResponse<AzionBucket>>} The updated bucket or error message.
   */
  updateBucket: (params: { name: string; edge_access: string }) => Promise<AzionStorageResponse<AzionBucket>>;
  /**
   * Deletes a bucket by its name.
   * @param {Object} params - Parameters for deleting a bucket.
   * @param {string} params.name - Name of the bucket to delete.
   * @returns {Promise<AzionStorageResponse<AzionDeletedBucket>>} Confirmation of deletion or error message.
   */
  deleteBucket: (params: { name: string }) => Promise<AzionStorageResponse<AzionDeletedBucket>>;
  /**
   * Retrieves a bucket by its name.
   * @param {Object} params - Parameters for retrieving a bucket.
   * @param {string} params.name - Name of the bucket to retrieve.
   * @returns {Promise<AzionStorageResponse<AzionBucket>>} The retrieved bucket or error message.
   */
  getBucket: (params: { name: string }) => Promise<AzionStorageResponse<AzionBucket>>;
}

export type AzionBucketCollectionParams = {
  page?: number;
  page_size?: number;
};

export type AzionObjectCollectionParams = {
  max_object_count?: number;
};

/**
 * Options for configuring the Azion client behavior.
 *
 * @property {boolean} [debug] - Enable debug mode for detailed logging.
 * @property {boolean} [force] - Force the operation even if it might be destructive.
 *
 * @example
 * const options: AzionClientOptions = {
 *   debug: true,
 *   force: false
 * };
 */
export type AzionClientOptions = {
  debug?: boolean;
  force?: boolean;
};

/**
 * Function type for creating an Azion Storage Client.
 *
 * @param {Object} [config] - Configuration options for the Storage client.
 * @param {string} [config.token] - Authentication token for Azion API. If not provided,
 * the client will attempt to use the AZION_TOKEN environment variable.
 * @param {AzionClientOptions} [config.options] - Additional client options.
 *
 * @returns {AzionStorageClient} An instance of the Azion Storage Client.
 *
 * @example
 * // Create a Storage client with a token and debug mode enabled
 * const storageClient = createAzionStorageClient({
 *   token: 'your-api-token',
 *   options: { debug: true }
 * });
 *
 * @example
 * // Create a Storage client using environment variables for token
 * const storageClient = createAzionStorageClient();
 *
 * @example
 * // Use the Storage client to create a bucket
 * const newBucket = await storageClient.createBucket({
 *   name: 'my-new-bucket',
 *   edge_access: 'public'
 * });
 */
export type CreateAzionStorageClient = (
  config?: Partial<{ token: string; options?: AzionClientOptions }>,
) => AzionStorageClient;
