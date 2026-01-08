/**
 * Workloads access configuration for storage buckets.
 *
 * @type {'read_only' | 'read_write' | 'restricted'}
 * @property {'read_only'} read_only - Allows only read operations
 * @property {'read_write'} read_write - Allows both read and write operations
 * @property {'restricted'} restricted - Restricted access with limited permissions
 */
export type EdgeAccessType = 'read_only' | 'read_write' | 'restricted';

export type AzionStorageResponse<T> = {
  data?: T;
  error?: {
    message: string;
    operation: string;
  };
};

export type ContentObjectStorage = ArrayBuffer | ReadableStream | Uint8Array | string;

/**
 * Represents an Azion storage bucket with methods to interact with objects.
 *
 * @interface AzionBucket
 *
 * @property {string} name - The name of the bucket.
 * @property {EdgeAccessType} workloads_access - The Workloads access configuration for the bucket.
 * @property {'executed' | 'executed-runtime' | 'pending'} [state] - The current state of the bucket.
 */
export interface AzionBucket {
  name: string;
  workloads_access: EdgeAccessType;
  state?: 'executed' | 'executed-runtime' | 'pending';
  last_editor?: string;
  last_modified?: string;
  product_version?: string;

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
   * @param {ContentObjectStorage} params.content - The content of the new object.
   * @param {Object} [params.params] - Additional parameters for the object.
   * @param {string} [params.params.content_type] - The content type of the object.
   * @returns {Promise<AzionStorageResponse<AzionBucketObject>>} A promise that resolves to the created bucket object or error message.
   *
   * @example
   * const { data: newObject } = await bucket.createObject({
   *   key: 'new-file.txt',
   *   content: 'Hello, World!',
   *   params: { content_type: 'text/plain' }
   * });
   */
  createObject: (params: {
    key: string;
    content: ContentObjectStorage;
    params?: { content_type?: string };
  }) => Promise<AzionStorageResponse<AzionBucketObject>>;

  /**
   * Updates an existing object in the bucket.
   *
   * @param {Object} params - Parameters for updating the object.
   * @param {string} params.key - The key of the object to update.
   * @param {ContentObjectStorage} params.content - The new content for the object.
   * @param {Object} [params.params] - Additional parameters for the object.
   * @param {string} [params.params.content_type] - The new content type for the object.
   * @returns {Promise<AzionStorageResponse<AzionBucketObject>>} A promise that resolves to the updated bucket object or error message.
   *
   * @example
   * const { data: updatedObject } = await bucket.updateObject({
   *   key: 'existing-file.txt',
   *   content: 'Updated content',
   *   params: { content_type: 'text/plain' }
   * });
   */
  updateObject: (params: {
    key: string;
    content: ContentObjectStorage;
    params?: { content_type?: string };
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
  content?: ContentObjectStorage;
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
   * @param {EdgeAccessType} params.workloads_access - Workloads access configuration for the bucket.
   * @returns {Promise<AzionStorageResponse>} The created bucket or error message.
   */
  createBucket: (params: { name: string; workloads_access: EdgeAccessType }) => Promise<AzionStorageResponse<AzionBucket>>;

  /**
   * Updates a bucket by its name.
   * @param {Object} params - Parameters for updating a bucket.
   * @param {string} params.name - Name of the bucket to update.
   * @param {EdgeAccessType} params.workloads_access - New Workloads access configuration for the bucket.
   * @returns {Promise<AzionStorageResponse<AzionBucket>>} The updated bucket or error message.
   */
  updateBucket: (params: { name: string; workloads_access: EdgeAccessType }) => Promise<AzionStorageResponse<AzionBucket>>;
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
  /**
   * Sets up storage by getting an existing bucket or creating it if it doesn't exist.
   * @param {Object} params - Parameters for setting up storage.
   * @param {string} params.name - Name of the bucket to setup.
   * @param {EdgeAccessType} params.workloads_access - Workloads access configuration for the bucket (used only if creating).
   * @returns {Promise<AzionStorageResponse<AzionBucket>>} The existing or created bucket.
   */
  setupStorage: (params: { name: string; workloads_access: EdgeAccessType }) => Promise<AzionStorageResponse<AzionBucket>>;
}

export type AzionBucketCollectionParams = {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  fields?: string;
};

export type AzionObjectCollectionParams = {
  max_object_count?: number;
};

/**
 * Defines the execution environment for the Azion client.
 *
 * @type {('development' | 'staging' | 'production')}
 *
 * @property {'development'} development - Development environment for local testing
 * @property {'staging'} staging - Staging/testing environment
 * @property {'production'} production - Production environment
 *
 * @example
 * const environment: AzionEnvironment = 'development';
 *
 * @example
 * const clientOptions = {
 *   env: 'production' as AzionEnvironment
 * };
 */
export type AzionEnvironment = 'development' | 'staging' | 'production';

/**
 * Options for configuring the Azion client behavior.
 *
 * @property {boolean} [debug] - Enable debug mode for detailed logging.
 * @property {boolean} [force] - Force the operation even if it might be destructive.
 * @property {AzionEnvironment} [env] - Environment to use (dev, stage, prod).
 * @property {boolean} [external] - Force using external REST API instead of built-in runtime API.
 *
 * @example
 * const options: AzionClientOptions = {
 *   debug: true,
 *   force: false,
 *   env: 'dev',
 *   external: false
 * };
 */
export type AzionClientOptions = {
  /** Enable debug mode for detailed logging */
  debug?: boolean;
  /** Force the operation even if it might be destructive */
  force?: boolean;
  /** Environment to use (dev, stage, prod) */
  env?: AzionEnvironment;
  /** Force using external REST API instead of built-in runtime API */
  external?: boolean;
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
 *   workloads_access: 'read_write'
 * });
 */
export type CreateAzionStorageClient = (
  config?: Partial<{ token: string; options?: AzionClientOptions }>,
) => AzionStorageClient;
