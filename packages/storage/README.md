# Azion Edge Storage Client

Azion Edge Storage Client provides a simple interface to interact with the Azion Edge Storage API, allowing you to manage buckets and objects. This client is configurable and supports both debug mode and environment variable-based configuration.

## Table of Contents

- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Debug Mode](#debug-mode)
- [Usage](#usage)
  - [Using Environment Variables](#using-environment-variables)
  - [Direct Method Calls](#direct-method-calls)
  - [Client Configuration](#client-configuration)
  - [API Examples](#api-examples)
    - [Create Bucket](#create-bucket)
    - [Delete Bucket](#delete-bucket)
    - [Get Buckets](#get-buckets)
    - [Get Bucket by Name](#get-bucket-by-name)
    - [Update Bucket](#update-bucket)
    - [Create Object](#create-object)
    - [Get Object by Key](#get-object-by-key)
    - [Get Objects](#get-objects)
    - [Update Object](#update-object)
    - [Delete Object](#delete-object)
- [API Reference](#api-reference)
  - [`createBucket`](#createbucket)
  - [`deleteBucket`](#deletebucket)
  - [`getBuckets`](#getbuckets)
  - [`getBucket`](#getbucket)
  - [`updateBucket`](#updatebucket)
  - [`createObject`](#createobject)
  - [`getObjectByKey`](#getobjectbykey)
  - [`getObjects`](#getobjects)
  - [`updateObject`](#updateobject)
  - [`deleteObject`](#deleteobject)
  - [`createClient`](#createclient)
- [Types](#types)
  - [`ClientConfig`](#clientconfig)
  - [`StorageClient`](#storageclient)
  - [`AzionStorageResponse`](#azionbucketresponse)
  - [`Bucket`](#bucket)
  - [`BucketObject`](#bucketobject)
  - [`DeletedBucket`](#deletedbucket)
  - [`DeletedBucketObject`](#deletedbucketobject)
- [Contributing](#contributing)

## Installation

Install the package using npm or yarn:

```sh
npm install azion
```

or

```sh
yarn add azion
```

## Environment Variables

You can configure the client using the following environment variables:

- `AZION_TOKEN`: Your Azion API token.
- `AZION_DEBUG`: Enable debug mode (true/false).

Example `.env` file:

```sh
AZION_TOKEN=your-api-token
AZION_DEBUG=true
```

## Debug Mode

Debug mode provides detailed logging of the API requests and responses. You can enable debug mode by setting the `AZION_DEBUG` environment variable to `true` or by passing `true` as the `debug` parameter in the methods.

## Usage

### Using Environment Variables

You can use the environment variables to configure the client without passing the token and debug parameters directly.

### Direct Method Calls

You can use the provided wrapper methods to perform storage operations directly.

### Client Configuration

You can create a client instance with specific configurations.

### API Examples

#### Create Bucket

**JavaScript:**

```javascript
import { createBucket } from 'azion/storage';

const { data, error } = await createBucket({ name: 'my-new-bucket', edge_access: 'public' });
if (data) {
  console.log(`Bucket created with name: ${data.name}`);
} else {
  console.error('Failed to create bucket', error);
}
```

**TypeScript:**

```typescript
import { createBucket } from 'azion/storage';
import type { AzionStorageResponse, AzionBucket } from 'azion/storage';
const { data, error }: AzionStorageResponse<AzionBucket> = await createBucket({
  name: 'my-new-bucket',
  edge_access: 'public',
});
if (data) {
  console.log(`Bucket created with name: ${data.name}`);
} else {
  console.error('Failed to create bucket', error);
}
```

#### Delete Bucket

**JavaScript:**

```javascript
import { deleteBucket } from 'azion/storage';

const { data, error } = await deleteBucket({ name: 'my-bucket' });
if (data) {
  console.log(`Bucket ${data.name} deleted successfully`);
} else {
  console.error('Failed to delete bucket', error);
}
```

**TypeScript:**

```typescript
import { deleteBucket, AzionDeletedBucket, AzionStorageResponse } from 'azion/storage';

const { data, error }: AzionStorageResponse<AzionDeletedBucket> = await deleteBucket({ name: 'my-bucket' });
if (data) {
  console.log(`Bucket ${data.name} deleted successfully`);
} else {
  console.error('Failed to delete bucket', error);
}
```

#### Get Buckets

**JavaScript:**

```javascript
import { getBuckets } from 'azion/storage';

const { data: buckets, error } = await getBuckets({ params: { page: 1, page_size: 10 } });
if (buckets) {
  console.log(`Retrieved ${buckets.count} buckets`);
} else {
  console.error('Failed to retrieve buckets', error);
}
```

**TypeScript:**

```typescript
import { getBuckets, AzionStorageResponse, AzionBucketCollection } from 'azion/storage';

const { data: buckets, error }: AzionStorageResponse<AzionBucketCollection> = await getBuckets({
  params: { page: 1, page_size: 10 },
});
if (buckets) {
  console.log(`Retrieved ${buckets.count} buckets`);
} else {
  console.error('Failed to retrieve buckets', error);
}
```

#### Get Bucket by Name

**JavaScript:**

```javascript
import { getBucket } from 'azion/storage';

const { data: bucket, error } = await getBucket({ name: 'my-bucket' });
if (bucket) {
  console.log(`Retrieved bucket: ${bucket.name}`);
} else {
  console.error('Bucket not found', error);
}
```

**TypeScript:**

```typescript
import { getBucket, AzionBucket } from 'azion/storage';

const { data: bucket, error }: AzionStorageResponse<AzionBucket> = await getBucket({ name: 'my-bucket' });
if (bucket) {
  console.log(`Retrieved bucket: ${bucket.name}`);
} else {
  console.error('Bucket not found', error);
}
```

#### Update Bucket

**JavaScript:**

```javascript
import { updateBucket } from 'azion/storage';

const { data: updatedBucket, error } = await updateBucket({ name: 'my-bucket', edge_access: 'private' });
if (updatedBucket) {
  console.log(`Bucket updated: ${updatedBucket.name}`);
} else {
  console.error('Failed to update bucket', error);
}
```

**TypeScript:**

```typescript
import { updateBucket, AzionBucket, AzionStorageResponse } from 'azion/storage';

const { data: updatedBucket, error }: AzionStorageResponse<AzionBucket> | null = await updateBucket({
  name: 'my-bucket',
  edge_access: 'private',
});
if (updatedBucket) {
  console.log(`Bucket updated: ${updatedBucket.name}`);
} else {
  console.error('Failed to update bucket', error);
}
```

#### Create Object

**JavaScript:**

```javascript
import { createObject } from 'azion/storage';

const { data: newObject, error } = await createObject({
  bucketName: 'my-bucket',
  key: 'new-file.txt',
  file: 'File content',
});
if (newObject) {
  console.log(`Object created with key: ${newObject.key}`);
  console.log(`Object content: ${newObject.content}`);
} else {
  console.error('Failed to create object', error);
}
```

**TypeScript:**

```typescript
import { createObject, AzionBucketObject, AzionStorageResponse } from 'azion/storage';

const { data: newObject, error }: AzionStorageResponse<AzionBucketObject> = await createObject({
  bucketName: 'my-bucket',
  key: 'new-file.txt',
  file: 'File content',
});
if (newObject) {
  console.log(`Object created with key: ${newObject.key}`);
  console.log(`Object content: ${newObject.content}`);
} else {
  console.error('Failed to create object', error);
}
```

#### Get Object by Key

**JavaScript:**

```javascript
import { getObjectByKey } from 'azion/storage';

const { data: object, error } = await getObjectByKey({ bucketName: 'my-bucket', key: 'file.txt' });
if (object) {
  console.log(`Retrieved object: ${object.key}`);
} else {
  console.error('Object not found', error);
}
```

**TypeScript:**

```typescript
import { getObjectByKey, AzionBucketObject, AzionStorageResponse } from 'azion/storage';

const { data: object, error }: AzionStorageResponse<AzionBucketObject> = await getObjectByKey({
  bucketName: 'my-bucket',
  key: 'file.txt',
});
if (object) {
  console.log(`Retrieved object: ${object.key}`);
} else {
  console.error('Object not found', error);
}
```

#### Get Objects

**JavaScript:**

```javascript
import { getObjects } from 'azion/storage';

const { data: objectsResult, error } = await getObjects({ bucketName: 'my-bucket' });
if (objectsResult) {
  console.log(`Retrieved ${objectsResult.count} objects from the bucket`);
} else {
  console.error('Failed to retrieve objects', error);
}
```

**TypeScript:**

```typescript
import { getObjects, AzionBucketObject, AzionStorageResponse } from 'azion/storage';

const { data: objectResult, error }: AzionStorageResponse<AzionBucketObjects> = await getObjects({
  bucketName: 'my-bucket',
});
if (objectResult) {
  console.log(`Retrieved ${objectResult.count} objects from the bucket`);
} else {
  console.error('Failed to retrieve objects', error);
}
```

#### Update Object

**JavaScript:**

```javascript
import { updateObject } from 'azion/storage';

const { data: updatedObject, error } = await updateObject({
  bucketName: 'my-bucket',
  key: 'file.txt',
  file: 'Updated content',
});
if (updatedObject) {
  console.log(`Object updated: ${updatedObject.key}`);
  console.log(`New content: ${updatedObject.content}`);
} else {
  console.error('Failed to update object', error);
}
```

**TypeScript:**

```typescript
import { updateObject, AzionBucketObject } from 'azion/storage';

const { data: updatedObject, error }: AzionStorageResponse<AzionBucketObject> = await updateObject({
  bucketName: 'my-bucket',
  key: 'file.txt',
  file: 'Updated content',
});
if (updatedObject) {
  console.log(`Object updated: ${updatedObject.key}`);
  console.log(`New content: ${updatedObject.content}`);
} else {
  console.error('Failed to update object', error);
}
```

#### Delete Object

**JavaScript:**

```javascript
import { deleteObject } from 'azion/storage';

const { data: result, error } = await deleteObject({ bucketName: 'my-bucket', key: 'file.txt' });
if (result) {
  console.log(`Object ${result.key} deleted successfully`);
} else {
  console.error('Failed to delete object', error);
}
```

**TypeScript:**

```typescript
import { deleteObject, AzionDeletedBucketObject, AzionStorageResponse } from 'azion/storage';

const { data: result, error }: AzionStorageResponse<AzionDeletedBucketObject> = await deleteObject({
  bucketName: 'my-bucket',
  key: 'file.txt',
});
if (result) {
  console.log(`Object ${result.key} deleted successfully`);
} else {
  console.error('Failed to delete object', error);
}
```

### Using Client

**JavaScript:**

```javascript
import { createClient } from 'azion/storage';

const client = createClient({ token: 'your-api-token', debug: true });

const { data, error } = await client.createBucket({ name: 'my-new-bucket', edge_access: 'public' });
if (data) {
  console.log(`Bucket created with name: ${data.name}`);
}

const { data: allBuckets } = await client.getBuckets();
if (allBuckets) {
  console.log(`Retrieved ${allBuckets.count} buckets`);
}

const { data: newObject } = await client.createObject({
  bucketName: 'my-new-bucket',
  key: 'new-file.txt',
  file: 'File content',
});
if (newObject) {
  console.log(`Object created with key: ${newObject.key}`);
}

const { data: updateResult } = await newObject.updateObject({ key: 'new-file.txt', file: 'Updated content' });
if (updateResult) {
  console.log(`Object updated with key: ${updateResult.key}`);
}
```

**TypeScript:**

```typescript
import {
  createClient,
  StorageClient,
  AzionStorageResponse,
  AzionBucket,
  AzionBucketObject,
  AzionBucketCollection,
} from 'azion/storage';

const client: StorageClient = createClient({ token: 'your-api-token', debug: true });

const { data, error }: AzionStorageResponse<AzionBucket> = await client.createBucket({
  name: 'my-new-bucket',
  edge_access: 'public',
});
if (data) {
  console.log(`Bucket created with name: ${data.name}`);
}

const { data: allBuckets }: AzionStorageResponse<AzionBucketCollection> = await client.getBuckets();
if (allBuckets) {
  console.log(`Retrieved ${allBuckets.count} buckets`);
}

const { data: newObject }: AzionStorageResponse<AzionBucketObject> = await client.createObject({
  bucketName: 'my-new-bucket',
  key: 'new-file.txt',
  file: 'File content',
});
if (newObject) {
  console.log(`Object created with key: ${newObject.key}`);
}

const { data: updateResult }: AzionStorageResponse<AzionBucketObject> = await client.updateObject({
  bucketName: 'my-new-bucket',
  key: 'new-file.txt',
  file: 'Updated content',
});
if (updateResult) {
  console.log(`Object updated with key: ${updateResult.key}`);
}
```

## API Reference

### `createBucket`

Creates a new bucket.

**Parameters:**

- `name: string` - Name of the new bucket.
- `edge_access: string` - Edge access configuration for the bucket.
- `options?: AzionClientOptions` - Optional parameters for the request.

**Returns:**

- `Promise<AzionStorageResponse<AzionBucket>>` - The created bucket object or error.

### `deleteBucket`

Deletes a bucket by its name.

**Parameters:**

- `name: string` - Name of the bucket to delete.
- `debug?: boolean` - Enable debug mode for detailed logging.

**Returns:**

- `Promise<AzionStorageResponse<AzionDeletedBucket>>` - Object confirming deletion or error.

### `getBuckets`

Retrieves a list of buckets with optional filtering and pagination.

**Parameters:**

- `options?: AzionBucketCollectionOptions` - Optional parameters for filtering and pagination.
  - `page?: number` - Page number for pagination.
  - `page_size?: number` - Number of items per page.
- `debug?: boolean` - Enable debug mode for detailed logging.

**Returns:**

- `Promise<AzionStorageResponse<AzionBucketCollection>>` - Array of bucket objects or error.

### `getBucket`

Retrieves a bucket by its name.

**Parameters:**

- `name: string` - Name of the bucket to retrieve.
- `debug?: boolean` - Enable debug mode for detailed logging.

**Returns:**

- `Promise<AzionStorageResponse<AzionBucket>>` - The retrieved bucket object or error if not found.

### `updateBucket`

Updates an existing bucket.

**Parameters:**

- `name: string` - Name of the bucket to update.
- `edge_access: string` - New edge access configuration for the bucket.
- `debug?: boolean` - Enable debug mode for detailed logging.

**Returns:**

- `Promise<AzionStorageResponse<AzionBucket>>` - The updated bucket object or error if update failed.

### `createObject`

Creates a new object in a specific bucket.

**Parameters:**

- `bucketName: string` - Name of the bucket to create the object in.
- `objectKey: string` - Key (name) of the object to create.
- `file: string` - Content of the file to upload.
- `debug?: boolean` - Enable debug mode for detailed logging.

**Returns:**

- `Promise<AzionBucketObject | null>` - The created object or null if creation failed.

### `getObjectByKey`

Retrieves an object from a specific bucket by its key.

**Parameters:**

- `bucketName: string` - Name of the bucket containing the object.
- `objectKey: string` - Key of the object to retrieve.
- `debug?: boolean` - Enable debug mode for detailed logging.

**Returns:**

- `Promise<AzionBucketObject | null>` - The retrieved object or null if not found.

### `getObjects`

Retrieves a list of objects in a specific bucket.

**Parameters:**

- `bucketName: string` - Name of the bucket to retrieve objects from.
- `debug?: boolean` - Enable debug mode for detailed logging.

**Returns:**

- `Promise<AzionStorageResponse<AzionBucketObjects>>` - Array of bucket objects or error.

### `updateObject`

Updates an existing object in a specific bucket.

**Parameters:**

- `bucketName: string` - Name of the bucket containing the object.
- `objectKey: string` - Key of the object to update.
- `file: string` - New content of the file.
- `debug?: boolean` - Enable debug mode for detailed logging.

**Returns:**

- `Promise<AzionStorageResponse<AzionBucketObject>>` - The updated object or error if update failed.

### `deleteObject`

Deletes an object from a specific bucket.

**Parameters:**

- `bucketName: string` - Name of the bucket containing the object.
- `objectKey: string` - Key of the object to delete.
- `debug?: boolean` - Enable debug mode for detailed logging.

**Returns:**

- `Promise<AzionStorageResponse<AzionDeletedBucketObject>>` - Confirmation of deletion or error if deletion failed.

### `createClient`

Creates a Storage client with methods to interact with Azion Edge Storage.

**Parameters:**

- `config?: Partial<{ token: string; debug: boolean }>` - Configuration options for the Storage client.

**Returns:**

- `StorageClient` - An object with methods to interact with Storage.

## Types

### `ClientConfig`

Configuration options for the Storage client.

- `token?: string` - Your Azion API token.
- `debug?: boolean` - Enable debug mode for detailed logging.

### `StorageClient`

An object with methods to interact with Storage.

- `getBuckets: (options?: BucketCollectionOptions) => Promise<AzionStorageResponse<AzionBucketCollection>>`
- `createBucket: (name: string, edge_access: string) => Promise<AzionStorageResponse<AzionBucket>>`
- `updateBucket: (name: string, edge_access: string) => Promise<AzionStorageResponse<AzionBucket>>`
- `deleteBucket: (name: string) => Promise<AzionStorageResponse<AzionDeletedBucket>>`
- `getBucket: (name: string) => Promise<AzionStorageResponse<AzionBucket>>`

### `AzionStorageResponse<T>`

The response object from a bucket operation.

- `data?: T` - The data generic object.
- `error?: { message: string; operation: string;}`

### `AzionBucket`

The bucket object.

- `name: string`
- `edge_access?: string`
- `state?: 'executed' | 'pending'`
- `getObjects?: () => Promise<AzionStorageResponse<AzionBucketObjects>>`
- `getObjectByKey?: (objectKey: string) => Promise<AzionStorageResponse<AzionBucketObject>>`
- `createObject?: (objectKey: string, file: string) => Promise<AzionStorageResponse<AzionBucketObject>>`
- `updateObject?: (objectKey: string, file: string) => Promise<AzionStorageResponse<AzionBucketObject>>`
- `deleteObject?: (objectKey: string) => Promise<AzionStorageResponse<AzionDeletedBucketObject>>`

### `AzionBucketObject`

The bucket object.

- `key: string`
- `state?: 'executed' | 'pending'`
- `size?: number`
- `last_modified?: string`
- `content_type?: string`
- `content?: string`

### `AzionDeletedBucket`

The response object from a delete bucket request.

- `name: string`
- `state: 'executed' | 'pending'`

### `AzionDeletedBucketObject`

The response object from a delete object request.

- `key: string`
- `state: 'executed' | 'pending'`

## Contributing

Feel free to submit issues or pull requests to improve the functionality or documentation.
