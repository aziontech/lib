# Azion Edge Purge Client

Azion Edge Purge Client provides a simple interface to interact with the Azion Edge Cache Purge API, allowing you to purge URLs, Cache Keys, and Wildcard expressions from the cache. This client is configurable and supports both debug mode and environment variable-based configuration.

## Table of Contents

- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Debug Mode](#debug-mode)
- [Usage](#usage)
  - [Using Environment Variables](#using-environment-variables)
  - [Direct Method Calls](#direct-method-calls)
  - [Client Configuration](#client-configuration)
  - [API Examples](#api-examples)
    - [Purge URL](#purge-url)
    - [Purge Cache Key](#purge-cache-key)
    - [Purge Wildcard](#purge-wildcard)
- [API Reference](#api-reference)
  - [`purgeURL`](#purgeurl)
  - [`purgeCacheKey`](#purgecachekey)
  - [`purgeWildCard`](#purgewildcard)
  - [`createClient`](#createclient)
- [Types](#types)
  - [`ClientConfig`](#clientconfig)
  - [`PurgeClient`](#purgeclient)
  - [`Purge`](#purge)
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

```env
AZION_TOKEN=your-api-token
AZION_DEBUG=true
```

## Debug Mode

Debug mode provides detailed logging of the API requests and responses. You can enable debug mode by setting the `AZION_DEBUG` environment variable to `true` or by passing `true` as the `debug` parameter in the methods.

## Usage

### Using Environment Variables

You can use the environment variables to configure the client without passing the token and debug parameters directly.

### Direct Method Calls

You can use the provided wrapper methods to perform cache purge operations directly.

### Client Configuration

You can create a client instance with specific configurations.

### API Examples

#### Purge URL

**JavaScript:**

```javascript
import { purgeURL } from 'azion/purge';

const url = ['http://www.domain.com/path/image.jpg'];
const { data: response, error } = await purgeURL(url, { debug: true });
if (response) {
  console.log('Purge successful:', response);
} else {
  console.error('Purge failed', error);
}
```

**TypeScript:**

```typescript
import { purgeURL } from 'azion/purge';
import type { AzionPurgeResponse, AzionPurge } from 'azion/purge';

const url: string[] = ['http://www.domain.com/path/image.jpg'];
const { data: response, error }: AzionPurgeResponse<AzionPurge> = await purgeURL(url, { debug: true });
if (response) {
  console.log('Purge successful:', response);
} else {
  console.error('Purge failed', error);
}
```

#### Purge Cache Key

**JavaScript:**

```javascript
import { purgeCacheKey } from 'azion/purge';

const cacheKey = ['http://www.domain.com/path/image.jpg'];
const { data: response, error } = await purgeCacheKey(cacheKey, { debug: true });
if (response) {
  console.log('Purge successful:', response);
} else {
  console.error('Purge failed', error);
}
```

**TypeScript:**

```typescript
import { purgeCacheKey } from 'azion/purge';
import type { AzionPurgeResponse, AzionPurge } from 'azion/purge';

const cacheKey: string[] = ['http://www.domain.com/path/image.jpg'];
const { data: response, error }: AzionPurgeResponse<AzionPurge> = await purgeCacheKey(cacheKey, { debug: true });
if (response) {
  console.log('Purge successful:', response);
} else {
  console.error('Purge failed', error);
}
```

#### Purge Wildcard

**JavaScript:**

```javascript
import { purgeWildCard } from 'azion/purge';

const wildcard = ['http://www.domain.com/path/image.jpg*'];
const { data: response, error } = await purgeWildCard(wildcard, { debug: true });
if (response) {
  console.log('Purge successful:', response);
} else {
  console.error('Purge failed', error);
}
```

**TypeScript:**

```typescript
import { purgeWildCard } from 'azion/purge';
import type { AzionPurgeResponse, AzionPurge } from 'azion/purge';

const wildcard: string[] = ['http://www.domain.com/path/image.jpg*'];
const { data: response, error }: AzionPurgeResponse<AzionPurge> = await purgeWildCard(wildcard, { debug: true });
if (response) {
  console.log('Purge successful:', response);
} else {
  console.error('Purge failed', error);
}
```

### Using Client

**JavaScript:**

```javascript
import { createClient } from 'azion/purge';

const client = createClient({ token: 'your-api-token', options: { debug: true } });

const { data: purgeURLResponse } = await client.purgeURL(['http://www.domain.com/path/image.jpg']);
if (purgeURLResponse) {
  console.log('Purge successful:', purgeURLResponse);
} else {
  console.error('Purge failed', error);
}

const { data: purgeCacheKeyResponse } = await client.purgeCacheKey(['http://www.domain.com/path/image.jpg']);
if (purgeCacheKeyResponse) {
  console.log('Purge successful:', purgeCacheKeyResponse);
} else {
  console.error('Purge failed', error);
}

const { data: purgeWildCardResponse } = await client.purgeWildCard(['http://www.domain.com/path/image.jpg*']);
if (purgeWildCardResponse) {
  console.log('Purge successful:', purgeWildCardResponse);
} else {
  console.error('Purge failed', error);
}
```

**TypeScript:**

```typescript
import { createClient,  } from 'azion/purge';
import type { AzionPurgeClient, AzionPurgeResponse, AzionPurge } from 'azion/purge';

const client: AzionPurgeClient = createClient({ token: 'your-api-token', options: { debug: true } });

const { data: purgeURLResponse, error }: AzionPurgeResponse<AzionPurge> = await client.purgeURL([
  'http://www.domain.com/path/image.jpg',
]);
if (purgeURLResponse) {
  console.log('Purge successful:', purgeURLResponse);
} else {
  console.error('Purge failed', error);
}

const { data: purgeCacheKeyResponse, error }: AzionPurgeResponse<AzionPurge> = await client.purgeCacheKey([
  'http://www.domain.com/path/image.jpg',
]);
if (purgeCacheKeyResponse) {
  console.log('Purge successful:', purgeCacheKeyResponse);
} else {
  console.error('Purge failed', error);
}

const { data: purgeWildCardResponse, error }: AzionPurgeResponse<AzionPurge> = await client.purgeWildCard([
  'http://www.domain.com/path/image.jpg*',
]);
if (purgeWildCardResponse) {
  console.log('Purge successful:', purgeWildCardResponse);
} else {
  console.error('Purge failed', error);
}
```

## API Reference

### `purgeURL`

Purge a URL from the Azion Edge cache.

**Parameters:**

- `url: string[]` - URL(s) to purge.
- `options?: AzionClientOptions` - Client options including debug mode.

**Returns:**

- `Promise<AzionPurgeResponse<AzionPurge>>` - The purge response or error if the purge failed.

### `purgeCacheKey`

Purge a Cache Key from the Azion Edge cache.

**Parameters:**

- `cacheKey: string[]` - Cache Key(s) to purge.
- `options?: AzionClientOptions` - Client options including debug mode.

**Returns:**

- `Promise<AzionPurgeResponse<AzionPurge>>` - The purge response or error if the purge failed.

### `purgeWildCard`

Purge using a wildcard expression from the Azion Edge cache.

**Parameters:**

- `wildcard: string[]` - Wildcard expression(s) to purge.
- `options?: AzionClientOptions` - Client options including debug mode.

**Returns:**

- `Promise<AzionPurgeResponse<AzionPurge>>` - The purge response or error if the purge failed.

### `createClient`

Creates a Purge client with methods to interact with Azion Edge Purge.

**Parameters:**

- `config?: ClientConfig` - Configuration options for the Purge client.

**Returns:**

- `PurgeClient` - An object with methods to interact with Purge.

## Types

### `ClientConfig`

Configuration options for the Purge client.

- `token?: string` - Your Azion API token.
- `options?: AzionClientOptions` - Additional options for the client.

### `PurgeClient`

An object with methods to interact with Purge.

- `purgeURL: (urls: string[], options?: AzionClientOptions) => Promise<AzionPurgeResponse<AzionPurge>>`
- `purgeCacheKey: (cacheKeys: string[], options?: AzionClientOptions) => Promise<AzionPurgeResponse<AzionPurge>>`
- `purgeWildCard: (wildcards: string[], options?: AzionClientOptions) => Promise<AzionPurgeResponse<AzionPurge>>`

### `Purge`

The response object from a purge request.

- `state: 'executed' | 'pending'` - The state of the purge request.
- `items: string[]` - The items that were purged.

## Contributing

Feel free to submit issues or pull requests to improve the functionality or documentation.
