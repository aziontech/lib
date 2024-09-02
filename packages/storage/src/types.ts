// eslint-disable-next-line @typescript-eslint/no-namespace
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
   * @returns {Promise<AzionBucketObject[] | null>} A promise that resolves to an array of bucket objects or null.
   *
   * @example
   * const objects = await bucket.getObjects({ params: { max_object_count: 100 } });
   */
  getObjects: (params: { params: AzionObjectCollectionParams }) => Promise<AzionBucketObject[] | null>;

  /**
   * Retrieves a specific object from the bucket by its key.
   *
   * @param {Object} params - Parameters for retrieving the object.
   * @param {string} params.key - The key of the object to retrieve.
   * @returns {Promise<AzionBucketObject | null>} A promise that resolves to the bucket object or null if not found.
   *
   * @example
   * const object = await bucket.getObjectByKey({ key: 'example.txt' });
   */
  getObjectByKey: (params: { key: string }) => Promise<AzionBucketObject | null>;

  /**
   * Creates a new object in the bucket.
   *
   * @param {Object} params - Parameters for creating the object.
   * @param {string} params.key - The key for the new object.
   * @param {string} params.content - The content of the new object.
   * @param {Object} [params.options] - Additional options for the object.
   * @param {string} [params.options.content_type] - The content type of the object.
   * @returns {Promise<AzionBucketObject | null>} A promise that resolves to the created bucket object or null if creation failed.
   *
   * @example
   * const newObject = await bucket.createObject({
   *   key: 'new-file.txt',
   *   content: 'Hello, World!',
   *   options: { content_type: 'text/plain' }
   * });
   */
  createObject: (params: {
    key: string;
    content: string;
    options?: { content_type?: string };
  }) => Promise<AzionBucketObject | null>;

  /**
   * Updates an existing object in the bucket.
   *
   * @param {Object} params - Parameters for updating the object.
   * @param {string} params.key - The key of the object to update.
   * @param {string} params.content - The new content for the object.
   * @param {Object} [params.options] - Additional options for the object.
   * @param {string} [params.options.content_type] - The new content type for the object.
   * @returns {Promise<AzionBucketObject | null>} A promise that resolves to the updated bucket object or null if update failed.
   *
   * @example
   * const updatedObject = await bucket.updateObject({
   *   key: 'existing-file.txt',
   *   content: 'Updated content',
   *   options: { content_type: 'text/plain' }
   * });
   */
  updateObject: (params: {
    key: string;
    content: string;
    options?: { content_type?: string };
  }) => Promise<AzionBucketObject | null>;

  /**
   * Deletes an object from the bucket.
   *
   * @param {Object} params - Parameters for deleting the object.
   * @param {string} params.key - The key of the object to delete.
   * @returns {Promise<AzionDeletedBucketObject | null>} A promise that resolves to the deleted bucket object or null if deletion failed.
   *
   * @example
   * const deletedObject = await bucket.deleteObject({ key: 'file-to-delete.txt' });
   */
  deleteObject: (params: { key: string }) => Promise<AzionDeletedBucketObject | null>;
}

export interface AzionBucketObject {
  key: string;
  state?: 'executed' | 'executed-runtime' | 'pending';
  size?: number;
  last_modified?: string;
  content_type?: string;
  content?: string;
}

export interface AzionDeletedBucketObject {
  key: string;
  state?: 'executed' | 'executed-runtime' | 'pending';
}

export interface AzionDeletedBucket {
  name: string;
  state?: 'executed' | 'executed-runtime' | 'pending';
}

export interface AzionStorageClient {
  /**
   * Retrieves a list of buckets with optional filtering and pagination.
   * @param {Object} params - Parameters for retrieving buckets.
   * @param {AzionBucketCollectionParams} [params.params] - Optional parameters for filtering and pagination.
   * @returns {Promise<AzionBucket[] | null>} Array of buckets or null if retrieval failed.
   */
  getBuckets: (params?: { params?: AzionBucketCollectionParams }) => Promise<AzionBucket[] | null>;
  /**
   * Creates a new bucket.
   * @param {Object} params - Parameters for creating a bucket.
   * @param {string} params.name - Name of the new bucket.
   * @param {string} params.edge_access - Edge access configuration for the bucket.
   * @returns {Promise<AzionBucket | null>} The created bucket or null if creation failed.
   */
  createBucket: (params: { name: string; edge_access: string }) => Promise<AzionBucket | null>;
  /**
   * Deletes a bucket by its name.
   * @param {Object} params - Parameters for deleting a bucket.
   * @param {string} params.name - Name of the bucket to delete.
   * @returns {Promise<AzionDeletedBucket | null>} Confirmation of deletion or null if deletion failed.
   */
  updateBucket: (params: { name: string; edge_access: string }) => Promise<AzionBucket | null>;
  /**
   * Deletes a bucket by its name.
   * @param {Object} params - Parameters for deleting a bucket.
   * @param {string} params.name - Name of the bucket to delete.
   * @returns {Promise<AzionDeletedBucket | null>} Confirmation of deletion or null if deletion failed.
   */
  deleteBucket: (params: { name: string }) => Promise<AzionDeletedBucket | null>;
  /**
   * Retrieves a bucket by its name.
   * @param {Object} params - Parameters for retrieving a bucket.
   * @param {string} params.name - Name of the bucket to retrieve.
   * @returns {Promise<AzionBucket | null>} The retrieved bucket or null if not found.
   */
  getBucket: (params: { name: string }) => Promise<AzionBucket | null>;
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
