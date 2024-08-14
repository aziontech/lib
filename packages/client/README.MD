# Azion Client

Azion Client provides a unified interface to interact with various Azion services, including Storage, SQL, and Purge APIs. This client is configurable and supports both debug mode and environment variable-based configuration.

## Table of Contents

- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Debug Mode](#debug-mode)
- [Usage](#usage)
  - [Client Configuration](#client-configuration)
  - [API Examples](#api-examples)
    - [Storage Client](#storage-client)
    - [SQL Client](#sql-client)
    - [Purge Client](#purge-client)
- [API Reference](#api-reference)
  - [`createClient`](#createclient)
- [Types](#types)
  - [`ClientConfig`](#clientconfig)
  - [`AzionClient`](#azionclient)
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

### Client Configuration

You can create a client instance with specific configurations.

### API Examples

#### Storage Client

**JavaScript:**

```javascript
import { createClient } from 'azion';

const client = createClient({ token: 'your-api-token', debug: true });

const newBucket = await client.storage.createBucket('my-new-bucket', 'public');
if (newBucket) {
  console.log(`Bucket created with name: ${newBucket.name}`);
}

const allBuckets = await client.storage.getBuckets();
if (allBuckets) {
  console.log(`Retrieved ${allBuckets.length} buckets`);
}

const deletedBucket = await client.storage.deleteBucket('my-bucket');
if (deletedBucket) {
  console.log(`Bucket deleted with name: ${deletedBucket.name}`);
}
```

**TypeScript:**

```typescript
import { createClient } from 'azion';
import { AzionClient, Bucket } from 'azion/storage/types';

const client: AzionClient = createClient({ token: 'your-api-token', debug: true });

const newBucket: Bucket | null = await client.storage.createBucket('my-new-bucket', 'public');
if (newBucket) {
  console.log(`Bucket created with name: ${newBucket.name}`);
}

const allBuckets: Bucket[] | null = await client.storage.getBuckets();
if (allBuckets) {
  console.log(`Retrieved ${allBuckets.length} buckets`);
}

const deletedBucket: Bucket | null = await client.storage.deleteBucket('my-bucket');
if (deletedBucket) {
  console.log(`Bucket deleted with name: ${deletedBucket.name}`);
}
```

#### SQL Client

**JavaScript:**

```javascript
import { createClient } from 'azion';

const client = createClient({ token: 'your-api-token', debug: true });

const newDatabase = await client.sql.createDatabase('my-new-db');
if (newDatabase) {
  console.log(`Database created with ID: ${newDatabase.id}`);
}

const allDatabases = await client.sql.getDatabases();
if (allDatabases) {
  console.log(`Retrieved ${allDatabases.length} databases`);
}

const queryResult = await client.sql.query('SELECT * FROM users');
if (queryResult) {
  console.log(`Query executed. Rows returned: ${queryResult.rows.length}`);
}
```

**TypeScript:**

```typescript
import { createClient } from 'azion';
import { AzionClient, Database, QueryResponse } from 'azion/sql/types';

const client: AzionClient = createClient({ token: 'your-api-token', debug: true });

const newDatabase: Database | null = await client.sql.createDatabase('my-new-db');
if (newDatabase) {
  console.log(`Database created with ID: ${newDatabase.id}`);
}

const allDatabases: Database[] | null = await client.sql.getDatabases();
if (allDatabases) {
  console.log(`Retrieved ${allDatabases.length} databases`);
}

const queryResult: QueryResponse | null = await client.sql.query('SELECT * FROM users');
if (queryResult) {
  console.log(`Query executed. Rows returned: ${queryResult.rows.length}`);
}
```

#### Purge Client

**JavaScript:**

```javascript
import { createClient } from 'azion';

const client = createClient({ token: 'your-api-token', debug: true });

const purgeResult = await client.purge.purgeURL(['http://example.com/image.jpg']);
if (purgeResult) {
  console.log(`Purge successful: ${purgeResult.items}`);
}

const cacheKeyResult = await client.purge.purgeCacheKey(['my-cache-key-1', 'my-cache-key-2']);
if (cacheKeyResult) {
  console.log(`Cache key purge successful: ${cacheKeyResult.items}`);
}

const wildcardResult = await client.purge.purgeWildCard(['http://example.com/*']);
if (wildcardResult) {
  console.log(`Wildcard purge successful: ${wildcardResult.items}`);
}
```

**TypeScript:**

```typescript
import { createClient } from 'azion';
import { AzionClient, Purge } from 'azion/purge/types';

const client: AzionClient = createClient({ token: 'your-api-token', debug: true });

const purgeResult: Purge | null = await client.purge.purgeURL(['http://example.com/image.jpg']);
if (purgeResult) {
  console.log(`Purge successful: ${purgeResult.items}`);
}

const cacheKeyResult: Purge | null = await client.purge.purgeCacheKey(['my-cache-key-1', 'my-cache-key-2']);
if (cacheKeyResult) {
  console.log(`Cache key purge successful: ${cacheKeyResult.items}`);
}

const wildcardResult: Purge | null = await client.purge.purgeWildCard(['http://example.com/*']);
if (wildcardResult) {
  console.log(`Wildcard purge successful: ${wildcardResult.items}`);
}
```

## API Reference

### `createClient`

Creates an Azion Client with methods to interact with Azion.

**Parameters:**

- `config?: ClientConfig` - Client configuration options.
  - `token?: string` - Authentication token for Azion API.
  - `debug?: boolean` - Enable debug mode for detailed logging.

**Returns:**

- `AzionClient` - An object containing SQL, Storage, and Purge clients.

## Types

### `ClientConfig`

Configuration options for the Azion client.

- `token?: string` - Your Azion API token.
- `debug?: boolean` - Enable debug mode for detailed logging.

### `AzionClient`

An object with methods to interact with Azion services.

- `storage: StorageClient`
- `sql: SQLClient`
- `purge: PurgeClient`

## Contributing

Feel free to submit issues or pull requests to improve the functionality or documentation.
