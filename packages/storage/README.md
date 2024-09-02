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

const bucket = await createBucket({ name: 'my-new-bucket', edge_access: 'public' });
if (bucket) {
  console.log(`Bucket created with name: ${bucket.name}`);
} else {
  console.error('Failed to create bucket');
}
```

**TypeScript:**

```typescript
import { createBucket, AzionBucket } from 'azion/storage';
const bucket: AzionBucket | null = await createBucket({ name: 'my-new-bucket', edge_access: 'public' });
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

const result = await deleteBucket({ name: 'my-bucket' });
if (result) {
  console.log(`Bucket ${result.name} deleted successfully`);
} else {
  console.error('Failed to delete bucket');
}
```

**TypeScript:**

```typescript
import { deleteBucket, AzionDeletedBucket } from 'azion/storage';

const result: AzionDeletedBucket | null = await deleteBucket({ name: 'my-bucket' });
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

const buckets = await getBuckets({ params: { page: 1, page_size: 10 } });
if (buckets) {
  console.log(`Retrieved ${buckets.length} buckets`);
} else {
  console.error('Failed to retrieve buckets');
}
```

**TypeScript:**

```typescript
import { getBuckets, AzionBucket } from 'azion/storage';

const buckets: AzionBucket[] | null = await getBuckets({ params: { page: 1, page_size: 10 } });
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

const bucket = await getBucket({ name: 'my-bucket' });
if (bucket) {
  console.log(`Retrieved bucket: ${bucket.name}`);
} else {
  console.error('Bucket not found');
}
```

**TypeScript:**

```typescript
import { getBucket, AzionBucket } from 'azion/storage';

const bucket: AzionBucket | null = await getBucket({ name: 'my-bucket' });
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

const updatedBucket = await updateBucket({ name: 'my-bucket', edge_access: 'private' });
if (updatedBucket) {
  console.log(`Bucket updated: ${updatedBucket.name}`);
} else {
  console.error('Failed to update bucket');
}
```

**TypeScript:**

```typescript
import { updateBucket, AzionBucket } from 'azion/storage';

const updatedBucket: AzionBucket | null = await updateBucket({ name: 'my-bucket', edge_access: 'private' });
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

const newObject = await createObject({ bucketName: 'my-bucket', key: 'new-file.txt', file: 'File content' });
if (newObject) {
  console.log(`Object created with key: ${newObject.key}`);
  console.log(`Object content: ${newObject.content}`);
} else {
  console.error('Failed to create object');
}
```

**TypeScript:**

```typescript
import { createObject, AzionBucketObject } from 'azion/storage';

const newObject: AzionBucketObject | null = await createObject({
  bucketName: 'my-bucket',
  key: 'new-file.txt',
  file: 'File content',
});
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

const object = await getObjectByKey({ bucketName: 'my-bucket', key: 'file.txt' });
if (object) {
  console.log(`Retrieved object: ${object.key}`);
} else {
  console.error('Object not found');
}
```

**TypeScript:**

```typescript
import { getObjectByKey, AzionBucketObject } from 'azion/storage';

const object: AzionBucketObject | null = await getObjectByKey({ bucketName: 'my-bucket', key: 'file.txt' });
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

const objects = await getObjects({ bucketName: 'my-bucket' });
if (objects) {
  console.log(`Retrieved ${objects.length} objects from the bucket`);
} else {
  console.error('Failed to retrieve objects');
}
```

**TypeScript:**

```typescript
import { getObjects, AzionBucketObject } from 'azion/storage';

const objects: AzionBucketObject[] | null = await getObjects({ bucketName: 'my-bucket' });
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

const updatedObject = await updateObject({ bucketName: 'my-bucket', key: 'file.txt', file: 'Updated content' });
if (updatedObject) {
  console.log(`Object updated: ${updatedObject.key}`);
  console.log(`New content: ${updatedObject.content}`);
} else {
  console.error('Failed to update object');
}
```

**TypeScript:**

```typescript
import { updateObject, AzionBucketObject } from 'azion/storage';

const updatedObject: AzionBucketObject | null = await updateObject({
  bucketName: 'my-bucket',
  key: 'file.txt',
  file: 'Updated content',
});
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

const result = await deleteObject({ bucketName: 'my-bucket', key: 'file.txt' });
if (result) {
  console.log(`Object ${result.key} deleted successfully`);
} else {
  console.error('Failed to delete object');
}
```

**TypeScript:**

```typescript
import { deleteObject, AzionDeletedBucketObject } from 'azion/storage';

const result: AzionDeletedBucketObject | null = await deleteObject({ bucketName: 'my-bucket', key: 'file.txt' });
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

const newBucket = await client.createBucket({ name: 'my-new-bucket', edge_access: 'public' });
if (newBucket) {
  console.log(`Bucket created with name: ${newBucket.name}`);
}

const allBuckets = await client.getBuckets();
if (allBuckets) {
  console.log(`Retrieved ${allBuckets.length} buckets`);
}

const newObject = await client.createObject({ bucketName: 'my-new-bucket', key: 'new-file.txt', file: 'File content' });
if (newObject) {
  console.log(`Object created with key: ${newObject.key}`);
}

const queryResult = await newObject.updateObject({ key: 'new-file.txt', file: 'Updated content' });
if (queryResult) {
  console.log(`Object updated with key: ${queryResult.key}`);
}
```

**TypeScript:**

```typescript
import { createClient, StorageClient, AzionBucket, AzionBucketObject } from 'azion/storage';

const client: StorageClient = createClient({ token: 'your-api-token', debug: true });

const newBucket: AzionBucket | null = await client.createBucket({ name: 'my-new-bucket', edge_access: 'public' });
if (newBucket) {
  console.log(`Bucket created with name: ${newBucket.name}`);
}

const allBuckets: AzionBucket[] | null = await client.getBuckets();
if (allBuckets) {
  console.log(`Retrieved ${allBuckets.length} buckets`);
}

const newObject: AzionBucketObject | null = await client.createObject({
  bucketName: 'my-new-bucket',
  key: 'new-file.txt',
  file: 'File content',
});
if (newObject) {
  console.log(`Object created with key: ${newObject.key}`);
}

const queryResult: AzionBucketObject | null = await client.updateObject({
  bucketName: 'my-new-bucket',
  key: 'new-file.txt',
  file: 'Updated content',
});
if (queryResult) {
  console.log(`Object updated with key: ${queryResult.key}`);
}
```
