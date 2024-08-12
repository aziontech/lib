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
  - [`getBucket`](#getbucketbyname)
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

const bucket = await createBucket('my-new-bucket', 'public', true);
if (bucket) {
  console.log(`Bucket created with name: ${bucket.name}`);
} else {
  console.error('Failed to create bucket');
}
```

**TypeScript:**

```typescript
import { createBucket } from 'azion/storage';
import { Bucket } from 'azion/storage/types';

const bucket: Bucket | null = await createBucket('my-new-bucket', 'public', true);
if (bucket) {
  console.log(`Bucket created with name: ${bucket.name}`);
} else {
  console.error('Failed to create bucket');
}
```

#### Delete Bucket

**JavaScript:**

```javascript
import { deleteBucket } from 'azion/storage';

const result = await deleteBucket('my-bucket', true);
if (result) {
  console.log(`Bucket ${result.name} deleted successfully`);
} else {
  console.error('Failed to delete bucket');
}
```

**TypeScript:**

```typescript
import { deleteBucket } from 'azion/storage';
import { DeletedBucket } from 'azion/storage/types';

const result: DeletedBucket | null = await deleteBucket('my-bucket', true);
if (result) {
  console.log(`Bucket ${result.name} deleted successfully`);
} else {
  console.error('Failed to delete bucket');
}
```

#### Get Buckets

**JavaScript:**

```javascript
import { getBuckets } from 'azion/storage';

const buckets = await getBuckets({ page: 1, page_size: 10 }, true);
if (buckets) {
  console.log(`Retrieved ${buckets.length} buckets`);
} else {
  console.error('Failed to retrieve buckets');
}
```

**TypeScript:**

```typescript
import { getBuckets } from 'azion/storage';
import { Bucket } from 'azion/storage/types';

const buckets: Bucket[] | null = await getBuckets({ page: 1, page_size: 10 }, true);
if (buckets) {
  console.log(`Retrieved ${buckets.length} buckets`);
} else {
  console.error('Failed to retrieve buckets');
}
```

#### Get Bucket by Name

**JavaScript:**

```javascript
import { getBucket } from 'azion/storage';

const bucket = await getBucket('my-bucket', true);
if (bucket) {
  console.log(`Retrieved bucket: ${bucket.name}`);
} else {
  console.error('Bucket not found');
}
```

**TypeScript:**

```typescript
import { getBucket } from 'azion/storage';
import { Bucket } from 'azion/storage/types';

const bucket: Bucket | null = await getBucket('my-bucket', true);
if (bucket) {
  console.log(`Retrieved bucket: ${bucket.name}`);
} else {
  console.error('Bucket not found');
}
```

#### Update Bucket

**JavaScript:**

```javascript
import { updateBucket } from 'azion/storage';

const updatedBucket = await updateBucket('my-bucket', 'private', true);
if (updatedBucket) {
  console.log(`Bucket updated: ${updatedBucket.name}`);
} else {
  console.error('Failed to update bucket');
}
```

**TypeScript:**

```typescript
import { updateBucket } from 'azion/storage';
import { Bucket } from 'azion/storage/types';

const updatedBucket: Bucket | null = await updateBucket('my-bucket', 'private', true);
if (updatedBucket) {
  console.log(`Bucket updated: ${updatedBucket.name}`);
} else {
  console.error('Failed to update bucket');
}
```

#### Create Object

**JavaScript:**

```javascript
import { createObject } from 'azion/storage';

const newObject = await createObject('my-bucket', 'new-file.txt', 'File content', true);
if (newObject) {
  console.log(`Object created with key: ${newObject.key}`);
  console.log(`Object content: ${newObject.content}`);
} else {
  console.error('Failed to create object');
}
```

**TypeScript:**

```typescript
import { createObject } from 'azion/storage';
import { BucketObject } from 'azion/storage/types';

const newObject: BucketObject | null = await createObject('my-bucket', 'new-file.txt', 'File content', true);
if (newObject) {
  console.log(`Object created with key: ${newObject.key}`);
  console.log(`Object content: ${newObject.content}`);
} else {
  console.error('Failed to create object');
}
```

#### Get Object by Key

**JavaScript:**

```javascript
import { getObjectByKey } from 'azion/storage';

const object = await getObjectByKey('my-bucket', 'file.txt', true);
if (object) {
  console.log(`Retrieved object: ${object.key}`);
} else {
  console.error('Object not found');
}
```

**TypeScript:**

```typescript
import { getObjectByKey } from 'azion/storage';
import { BucketObject } from 'azion/storage/types';

const object: BucketObject | null = await getObjectByKey('my-bucket', 'file.txt', true);
if (object) {
  console.log(`Retrieved object: ${object.key}`);
} else {
  console.error('Object not found');
}
```

#### Get Objects

**JavaScript:**

```javascript
import { getObjects } from 'azion/storage';

const objects = await getObjects('my-bucket', true);
if (objects) {
  console.log(`Retrieved ${objects.length} objects from the bucket`);
} else {
  console.error('Failed to retrieve objects');
}
```

**TypeScript:**

```typescript
import { getObjects } from 'azion/storage';
import { BucketObject } from 'azion/storage/types';

const objects: BucketObject[] | null = await getObjects('my-bucket', true);
if (objects) {
  console.log(`Retrieved ${objects.length} objects from the bucket`);
} else {
  console.error('Failed to retrieve objects');
}
```

#### Update Object

**JavaScript:**

```javascript
import { updateObject } from 'azion/storage';

const updatedObject = await updateObject('my-bucket', 'file.txt', 'Updated content', true);
if (updatedObject) {
  console.log(`Object updated: ${updatedObject.key}`);
  console.log(`New content: ${updatedObject.content}`);
} else {
  console.error('Failed to update object');
}
```

**TypeScript:**

```typescript
import { updateObject } from 'azion/storage';
import { BucketObject } from 'azion/storage/types';

const updatedObject: BucketObject | null = await updateObject('my-bucket', 'file.txt', 'Updated content', true);
if (updatedObject) {
  console.log(`Object updated: ${updatedObject.key}`);
  console.log(`New content: ${updatedObject.content}`);
} else {
  console.error('Failed to update object');
}
```

#### Delete Object

**JavaScript:**

```javascript
import { deleteObject } from 'azion/storage';

const result = await deleteObject('my-bucket', 'file.txt', true);
if (result) {
  console.log(`Object ${result.key} deleted successfully`);
} else {
  console.error('Failed to delete object');
}
```

**TypeScript:**

```typescript
import { deleteObject } from 'azion/storage';
import { DeletedBucketObject } from 'azion/storage/types';

const result: DeletedBucketObject | null = await deleteObject('my-bucket', 'file.txt', true);
if (result) {
  console.log(`Object ${result.key} deleted successfully`);
} else {
  console.error('Failed to delete object');
}
```

### Using Client

**JavaScript:**

```javascript
import { createClient } from 'azion/storage';

const client = createClient({ token: 'your-api-token', debug: true });

const newBucket = await client.createBucket('my-new-bucket', 'public');
if (newBucket) {
  console.log(`Bucket created with name: ${newBucket.name}`);
}

const allBuckets = await client.getBuckets();
if (allBuckets) {
  console.log(`Retrieved ${allBuckets.length} buckets`);
}

const newObject = await client.createObject('my-new-bucket', 'new-file.txt', 'File content');
if (newObject) {
  console.log(`Object created with key: ${newObject.key}`);
}

const queryResult = await newObject.updateObject('new-file.txt', 'Updated content');
if (queryResult) {
  console.log(`Object updated with key: ${queryResult.key}`);
}
```

**TypeScript:**

```typescript
import { createClient } from 'azion/storage';
import { StorageClient, Bucket, BucketObject, DeletedBucket, DeletedBucketObject } from 'azion/storage/types';

const client: StorageClient = createClient({ token: 'your-api-token', debug: true });

const newBucket: Bucket | null = await client.createBucket('my-new-bucket', 'public');
if (newBucket) {
  console.log(`Bucket created with name: ${newBucket.name}`);
}

const allBuckets: Bucket[] | null = await client.getBuckets();
if (allBuckets) {
  console.log(`Retrieved ${allBuckets.length} buckets`);
}

const newObject: BucketObject | null = await client.createObject('my-new-bucket', 'new-file.txt', 'File content');
if (newObject) {
  console.log(`Object created with key: ${newObject.key}`);
}

const updatedObject: BucketObject | null = await newObject.updateObject('new-file.txt', 'Updated content');
if (updatedObject) {
  console.log(`Object updated with key: ${updatedObject.key}`);
}
```

## API Reference

### `createBucket`

Creates a new bucket.

**Parameters:**

- `name: string` - Name of the new bucket.
- `edge_access: string` - Edge access configuration for the bucket.
- `debug?: boolean` - Enable debug mode for detailed logging.

**Returns:**

- `Promise<Bucket | null>` - The created bucket object or null if creation failed.

### `deleteBucket`

Deletes a bucket by its name.

**Parameters:**

- `name: string` - Name of the bucket to delete.
- `debug?: boolean` - Enable debug mode for detailed logging.

**Returns:**

- `Promise<DeletedBucket | null>` - Object confirming deletion or null if deletion failed.

### `getBuckets`

Retrieves a list of buckets with optional filtering and pagination.

**Parameters:**

- `options?: BucketCollectionOptions` - Optional parameters for filtering and pagination.
  - `page?: number` - Page number for pagination.
  - `page_size?: number` - Number of items per page.
- `debug?: boolean` - Enable debug mode for detailed logging.

**Returns:**

- `Promise<Bucket[] | null>` - Array of bucket objects or null if retrieval failed.

### `getBucket`

Retrieves a bucket by its name.

**Parameters:**

- `name: string` - Name of the bucket to retrieve.
- `debug?: boolean` - Enable debug mode for detailed logging.

**Returns:**

- `Promise<Bucket | null>` - The retrieved bucket object or null if not found.

### `updateBucket`

Updates an existing bucket.

**Parameters:**

- `name: string` - Name of the bucket to update.
- `edge_access: string` - New edge access configuration for the bucket.
- `debug?: boolean` - Enable debug mode for detailed logging.

**Returns:**

- `Promise<Bucket | null>` - The updated bucket object or null if update failed.

### `createObject`

Creates a new object in a specific bucket.

**Parameters:**

- `bucketName: string` - Name of the bucket to create the object in.
- `objectKey: string` - Key (name) of the object to create.
- `file: string` - Content of the file to upload.
- `debug?: boolean` - Enable debug mode for detailed logging.

**Returns:**

- `Promise<BucketObject | null>` - The created object or null if creation failed.

### `getObjectByKey`

Retrieves an object from a specific bucket by its key.

**Parameters:**

- `bucketName: string` - Name of the bucket containing the object.
- `objectKey: string` - Key of the object to retrieve.
- `debug?: boolean` - Enable debug mode for detailed logging.

**Returns:**

- `Promise<BucketObject | null>` - The retrieved object or null if not found.

### `getObjects`

Retrieves a list of objects in a specific bucket.

**Parameters:**

- `bucketName: string` - Name of the bucket to retrieve objects from.
- `debug?: boolean` - Enable debug mode for detailed logging.

**Returns:**

- `Promise<BucketObject[] | null>` - Array of bucket objects or null if retrieval failed.

### `updateObject`

Updates an existing object in a specific bucket.

**Parameters:**

- `bucketName: string` - Name of the bucket containing the object.
- `objectKey: string` - Key of the object to update.
- `file: string` - New content of the file.
- `debug?: boolean` - Enable debug mode for detailed logging.

**Returns:**

- `Promise<BucketObject | null>` - The updated object or null if update failed.

### `deleteObject`

Deletes an object from a specific bucket.

**Parameters:**

- `bucketName: string` - Name of the bucket containing the object.
- `objectKey: string` - Key of the object to delete.
- `debug?: boolean` - Enable debug mode for detailed logging.

**Returns:**

- `Promise<DeletedBucketObject | null>` - Confirmation of deletion or null if deletion failed.

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

- `getBuckets: (options?: BucketCollectionOptions) => Promise<Bucket[] | null>`
- `createBucket: (name: string, edge_access: string) => Promise<Bucket | null>`
- `updateBucket: (name: string, edge_access: string) => Promise<Bucket | null>`
- `deleteBucket: (name: string) => Promise<DeletedBucket | null>`
- `getBucket: (name: string) => Promise<Bucket | null>`

### `Bucket`

The bucket object.

- `name: string`
- `edge_access?: string`
- `state?: 'executed' | 'pending'`
- `getObjects?: () => Promise<BucketObject[] | null>`
- `getObjectByKey?: (objectKey: string) => Promise<BucketObject | null>`
- `createObject?: (objectKey: string, file: string) => Promise<BucketObject | null>`
- `updateObject?: (objectKey: string, file: string) => Promise<BucketObject | null>`
- `deleteObject?: (objectKey: string) => Promise<DeletedBucketObject | null>`

### `BucketObject`

The bucket object.

- `key: string`
- `state?: 'executed' | 'pending'`
- `size?: number`
- `last_modified?: string`
- `content_type?: string`
- `content?: string`

### `DeletedBucket`

The response object from a delete bucket request.

- `name: string`
- `state: 'executed' | 'pending'`

### `DeletedBucketObject`

The response object from a delete object request.

- `key: string`
- `state: 'executed' | 'pending'`

## Contributing

Feel free to submit issues or pull requests to improve the functionality or documentation.
