# Azion Edge Domains

Azion Edge Domains provides a simple interface to interact with the Azion Edge Domains API, allowing you to create, list, get, update, and delete domains.

## Table of Contents

- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Debug Mode](#debug-mode)
- [Usage](#usage)
  - [Using Environment Variables](#using-environment-variables)
  - [Direct Method Calls](#direct-method-calls)
  - [Client Configuration](#client-configuration)
  - [API Examples](#api-examples)
    - [Create Domain](#create-domain)
    - [List Domains](#list-domains)
    - [Get Domain](#get-domain)
    - [Update Domain](#update-domain)
    - [Delete Domain](#delete-domain)
    - [Using Client](#using-client)
- [API Reference](#api-reference)
  - [`createDomain`](#createdomain)
  - [`listDomains`](#listdomains)
  - [`getDomain`](#getdomain)
  - [`updateDomain`](#updatedomain)
  - [`deleteDomain`](#deletedomain)
- [Types](#types)
  - [`ClientConfig`](#clientconfig)
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

You can use the provided wrapper methods to interact with the Azion Edge Domains.

### Client Configuration

You can create a client instance with specific configurations.

### API Examples

#### Create Domain

**JavaScript:**

```javascript
import { createDomain } from 'azion/domains';

const domain = await createDomain({ name: 'example domain', edgeApplicationId: 123 });
if (domain) {
  console.log(`Domain created with URL: ${domain.url}`);
} else {
  console.error('Failed to create domain');
}
```

**TypeScript:**

```typescript
import { createDomain } from 'azion/domains';
import type { AzionDomain } from 'azion/domains';

const domain: AzionDomain = await createDomain({ name: 'example domain', edgeApplicationId: 123 });
if (domain) {
  console.log(`Domain created with ID: ${domain.id}`);
} else {
  console.error('Failed to create domain');
}
```

### List Domains

**JavaScript:**

```javascript
import { listDomains } from 'azion/domains';

const domains = await listDomains();

if (domains) {
  console.log(`Found ${domains.length} domains`);
} else {
  console.error('Failed to list domains');
}
```

**TypeScript:**

```typescript
import { listDomains } from 'azion/domains';
import type { AzionDomains } from 'azion/domains';

const domains: AzionDomains = await listDomains();

if (domains) {
  console.log(`Found ${domains.data.length} domains`);
} else {
  console.error('Failed to list domains');
}
```

### Get Domain

**JavaScript:**

```javascript
import { getDomain } from 'azion/domains';

const domainId = 123;
const domain = await getDomain(domainId);

if (domain) {
  console.log(`Found domain with name: ${domain.name}`);
} else {
  console.error('Failed to get domain');
}
```

**TypeScript:**

```typescript
import { getDomain } from 'azion/domains';
import type { AzionDomain } from 'azion/domains';

const domainId = 123;
const domain: AzionDomain = await getDomain(domainId);

if (domain) {
  console.log(`Found domain with name: ${domain.data.name}`);
} else {
  console.error('Failed to get domain');
}
```

### Update Domain

**JavaScript:**

```javascript
import { updateDomain } from 'azion/domains';

const domainId = 123;
const domain = await updateDomain(domainId, { name: 'new domain name', edgeApplicationId: 456 });

if (domain) {
  console.log(`Updated domain with name: ${domain.name}`);
} else {
  console.error('Failed to update domain');
}
```

**TypeScript:**

```typescript
import { updateDomain } from 'azion/domains';
import type { AzionDomain } from 'azion/domains';

const domainId = 123;
const domain: AzionDomain = await updateDomain(domainId, { name: 'new domain name', edgeApplicationId: 456 });

if (domain) {
  console.log(`Updated domain with name: ${domain.data.name}`);
} else {
  console.error('Failed to update domain');
}
```

### Delete Domain

**JavaScript:**

```javascript
import { deleteDomain } from 'azion/domains';

const domainId = 123;
const deletedDomain = await deleteDomain(domainId);

if (deletedDomain) {
  console.log(`Deleted domain with ID: ${deletedDomain}`);
} else {
  console.error('Failed to delete domain');
}
```

**TypeScript:**

```typescript
import { deleteDomain } from 'azion/domains';
import type { AzionDomain } from 'azion/domains';

const domainId = 123;
const deletedDomain: AzionDomain = await deleteDomain(domainId);

if (deletedDomain) {
  console.log(`Deleted domain with ID: ${deletedDomain.data.id}`);
} else {
  console.error('Failed to delete domain');
}
```

### Using Client

**JavaScript:**

```javascript
import { createClient } from 'azion/domains';

const client = createClient({ token: 'your-api-token', { debug: true } });

const newDomain = await client.createDomain({ name: 'example domain', edgeApplicationId: 123 });
if (newDomain) {
  console.log(`Domain created with ID: ${newDomain.id}`);
}


```

**TypeScript:**

```typescript
import { createClient } from 'azion/domains';
import type { AzionDomain, AzionDomainsClient } from 'azion/domains';

const client: AzionDomainsClient = createClient({ token: 'your-api-token', { debug: true } });

const newDomain: AzionDomain = await client.createDomain({ name: 'example domain', edgeApplicationId: 123 });
if (newDomain) {
  console.log(`Domain created with ID: ${newDomain.id}`);
}

```

## API Reference

> AzionDomain

- `id: number` - Domain ID.
- `name: string` - Domain name.
- `edgeApplicationId: number` - Edge application ID.
- `active: boolean` - Domain status.
- `cnameAccessOnly: boolean` - CNAME access only.
- `cnames: string[]` - List of CNAMEs.
- `edgeFirewallId: number` - Edge firewall ID.
- `digitalCertificateId: number | string | null` - Digital certificate ID.
- `mtls: object | null` - Mutual TLS configuration.
- `mtls.verication: string` - Verification method. Enforce or permissive.
- `mtls.trustedCaCertificateId: number` - Trusted CA certificate ID.
- `mtls.crlList: number[]` - List of CRL IDs.

### `createDomain`

Creates a new domain.

**Parameters:**

- `domain: AzionCreateDomain` - Domain object.
- `options?: { debug?: boolean }` - Object options params.

**Returns:**

- `Promise<AzionDomain>` - The created domain object or state failed.

> AzionDomain

- `state: 'executed'| 'failed'` - State of the domain creation.
- `data: AzionDomain` - Domain object.

### `listDomains`

Lists all domains.

**Parameters:**

- `options?: { debug?: boolean }` - Object options params.
- `queryParams?: { pageSize?: number; page?: number; order?: 'id' | 'name'; sort?: 'asc' | 'desc'  }` - Query parameters.

**Returns:**

- `Promise<AzionDomains>` - An array of domain objects.

> AzionDomains

- `state: 'executed'| 'failed'` - State of the domain list.
- `pages: number` - Number of pages.
- `count: number` - Number of domains.
- `data: AzionDomain[]` - Array of domain objects.

### `getDomain`

Get a domain by ID.

**Parameters:**

- `domainId: number` - Domain ID.
- `options?: { debug?: boolean }` - Object options params.

**Returns:**

- `Promise<AzionDomain>` - The domain object or state failed.

### `updateDomain`

Update a domain.

**Parameters:**

- `domainId: number` - Domain ID.
- `domain: AzionUpdateDomain` - Domain object.
- `options?: { debug?: boolean }` - Object options params.

**Returns:**

- `Promise<AzionDomain>` - The updated domain object or state failed.

### `deleteDomain`

Delete a domain.

**Parameters:**

- `domainId: number` - Domain ID.
- `options?: { debug?: boolean }` - Object options params.

**Returns:**

- `Promise<AzionDomain>` - The deleted domain id or state failed.

### `createClient`

Creates a new Azion Domains client.

**Parameters:**

- `config?: Partial<{ token: string; options?: OptionsParams }>` - Configuration options for the Domain client.

**Returns:**

- `AzionDomainsClient` - An object with methods to interact with Domains.

## Types

### `ClientConfig`

Configuration options for the Azion Domains client.

- `token?: string` - Your Azion API token.
- `options?: OptionsParams` - Object options params.
  - `debug?: boolean` - Enable debug mode for detailed logging.

## Contributing

Feel free to submit issues or pull requests to improve the functionality or documentation.
