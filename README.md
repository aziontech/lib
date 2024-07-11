# Azion Libraries

The Azion Libraries provide a suite of tools to interact with various Azion services including Products (Purge, SQL, Storage) and Utilities (WASM Image Processor, Cookies). Each library is configurable and supports debug mode and environment variable-based configuration.

## Table of Contents

- [Installation](#installation)
- [Products](#products)
  - [Storage](#storage)
  - [SQL](#sql)
  - [Purge](#purge)
- [Utilities](#utilities)
  - [Cookies](#cookies)
  - [WASM Image Processor](#wasm-image-processor)
- [Client](#client)
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

## Products

### Storage

The Storage library provides methods to interact with Azion Edge Storage.

#### Examples

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
```

**TypeScript:**

```typescript
import { createClient } from 'azion/storage';
import { StorageClient, Bucket } from 'azion/storage/types';

const client: StorageClient = createClient({ token: 'your-api-token', debug: true });

const newBucket: Bucket | null = await client.createBucket('my-new-bucket', 'public');
if (newBucket) {
  console.log(`Bucket created with name: ${newBucket.name}`);
}

const allBuckets: Bucket[] | null = await client.getBuckets();
if (allBuckets) {
  console.log(`Retrieved ${allBuckets.length} buckets`);
}
```

Read more in the [Storage README](azion/storage/README.md).

### SQL

The SQL library provides methods to interact with Azion Edge SQL databases.

#### Examples

**JavaScript:**

```javascript
import { createClient } from 'azion/sql';

const client = createClient({ token: 'your-api-token', debug: true });

const newDatabase = await client.createDatabase('my-new-db');
if (newDatabase) {
  console.log(`Database created with ID: ${newDatabase.id}`);
}

const allDatabases = await client.getDatabases();
if (allDatabases) {
  console.log(`Retrieved ${allDatabases.length} databases`);
}
```

**TypeScript:**

```typescript
import { createClient } from 'azion/sql';
import { SQLClient, Database } from 'azion/sql/types';

const client: SQLClient = createClient({ token: 'your-api-token', debug: true });

const newDatabase: Database | null = await client.createDatabase('my-new-db');
if (newDatabase) {
  console.log(`Database created with ID: ${newDatabase.id}`);
}

const allDatabases: Database[] | null = await client.getDatabases();
if (allDatabases) {
  console.log(`Retrieved ${allDatabases.length} databases`);
}
```

Read more in the [SQL README](azion/sql/README.md).

### Purge

The Purge library provides methods to purge URLs, Cache Keys, and Wildcard expressions from the Azion Edge cache.

#### Examples

**JavaScript:**

```javascript
import { createClient } from 'azion/purge';

const client = createClient({ token: 'your-api-token', debug: true });

const purgeResult = await client.purgeURL(['http://example.com/image.jpg']);
if (purgeResult) {
  console.log(`Purge successful: ${purgeResult.items}`);
}

const cacheKeyResult = await client.purgeCacheKey(['my-cache-key-1', 'my-cache-key-2']);
if (cacheKeyResult) {
  console.log(`Cache key purge successful: ${cacheKeyResult.items}`);
}
```

**TypeScript:**

```typescript
import { createClient } from 'azion/purge';
import { PurgeClient, CreatedPurge } from 'azion/purge/types';

const client: PurgeClient = createClient({ token: 'your-api-token', debug: true });

const purgeResult: CreatedPurge | null = await client.purgeURL(['http://example.com/image.jpg']);
if (purgeResult) {
  console.log(`Purge successful: ${purgeResult.items}`);
}

const cacheKeyResult: CreatedPurge | null = await client.purgeCacheKey(['my-cache-key-1', 'my-cache-key-2']);
if (cacheKeyResult) {
  console.log(`Cache key purge successful: ${cacheKeyResult.items}`);
}
```

Read more in the [Purge README](azion/purge/README.md).

## Utilities

### Cookies

The Cookies library provides methods to get and set cookies.

#### Examples

**JavaScript:**

```javascript
import { getCookie, setCookie } from 'azion/cookies';

const myCookie = getCookie(request, 'my-cookie');
setCookie(response, 'my-cookie', 'cookie-value', { maxAge: 3600 });
```

**TypeScript:**

```typescript
import { getCookie, setCookie } from 'azion/cookies';
import { CookieOptions } from 'azion/cookies/types';

const myCookie: string | undefined = getCookie(request, 'my-cookie');
const options: CookieOptions = { maxAge: 3600 };
setCookie(response, 'my-cookie', 'cookie-value', options);
```

Read more in the [Cookies README](azion/cookies/README.md).

### WASM Image Processor

The WASM Image Processor library provides methods to process images using WebAssembly.

#### Examples

**JavaScript:**

```javascript
import WasmImageProcessor from 'azion/wasm-image-processor';

await WasmImageProcessor.loadImage('https://example.com/image.jpg');
await WasmImageProcessor.resize(0.5, 0.5);
const imageResponse = WasmImageProcessor.getImageResponse('jpeg');
console.log(imageResponse);
```

**TypeScript:**

```typescript
import WasmImageProcessor from 'azion/wasm-image-processor';

await WasmImageProcessor.loadImage('https://example.com/image.jpg');
await WasmImageProcessor.resize(0.5, 0.5);
const imageResponse = WasmImageProcessor.getImageResponse('jpeg');
console.log(imageResponse);
```

Read more in the [WASM Image Processor README](azion/wasm-image-processor/README.md).

## Client

The Azion Client provides a unified interface to interact with all Azion services.

#### Examples

**JavaScript:**

```javascript
import { createClient } from 'azion';

const client = createClient({ token: 'your-api-token', debug: true });

// Storage
const newBucket = await client.storage.createBucket('my-new-bucket', 'public');
console.log(`Bucket created with name: ${newBucket.name}`);

const allBuckets = await client.storage.getBuckets();
console.log(`Retrieved ${allBuckets.length} buckets`);

// SQL
const newDatabase = await client.sql.createDatabase('my-new-db');
console.log(`Database created with ID: ${newDatabase.id}`);

const allDatabases = await client.sql.getDatabases();
console.log(`Retrieved ${allDatabases.length} databases`);

// Purge
const purgeResult = await client.purge.purgeURL(['http://example.com/image.jpg']);
console.log(`Purge successful: ${purgeResult.items}`);
```

**TypeScript:**

```typescript
import { createClient } from 'azion';
import { AzionClient, Bucket, Database, CreatedPurge } from 'azion/types';

const client: AzionClient = createClient({ token: 'your-api-token', debug: true });

// Storage
const newBucket: Bucket | null = await client.storage.createBucket('my-new-bucket', 'public');
console.log(`Bucket created with name: ${newBucket.name}`);

const allBuckets: Bucket[] | null = await client.storage.getBuckets();
console.log(`Retrieved ${allBuckets.length} buckets`);

// SQL
const newDatabase: Database | null = await client.sql.createDatabase('my-new-db');
console.log(`Database created with ID: ${newDatabase.id}`);

const allDatabases: Database[] | null = await client.sql.getDatabases();
console.log(`Retrieved ${allDatabases.length} databases`);

// Purge
const purgeResult: CreatedPurge | null = await client.purge.purgeURL(['http://example.com/image.jpg']);
console.log(`Purge successful: ${purgeResult.items}`);
```

## Contributing

Feel free to submit issues or pull requests to improve the functionality or documentation.
