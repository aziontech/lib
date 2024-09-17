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
  - [`getDomains`](#getdomains)
  - [`getDomain`](#getdomain)
  - [`updateDomain`](#updatedomain)
  - [`deleteDomain`](#deletedomain)
- [Types](#types)
  - [`ClientConfig`](#clientconfig)
  - [`AzionDomainsResponse<T>`](#aziondomainsresponset)
  - [`AzionDomain`](#aziondomain)
  - [`AzionDomainCollection`](#aziondomaincollection)
  - [`AzionDeleteDomain`](#aziondeletedomain)
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

const { data: domain, error } = await createDomain({ name: 'example domain', edgeApplicationId: 123 });
if (domain) {
  console.log(`Domain created with URL: ${domain.url}`);
} else {
  console.error('Failed to create domain', error);
}
```

**TypeScript:**

```typescript
import { createDomain } from 'azion/domains';
import type { AzionDomain, AzionDomainsResponse } from 'azion/domains';

const { data: domain, error }: AzionDomainsResponse<AzionDomain> = await createDomain({
  name: 'example domain',
  edgeApplicationId: 123,
});
if (domain) {
  console.log(`Domain created with ID: ${domain.id}`);
} else {
  console.error('Failed to create domain', error);
}
```

### List Domains

**JavaScript:**

```javascript
import { getDomains } from 'azion/domains';

const { data: domains, error } = await getDomains();

if (domains) {
  console.log(`Found ${domains.count} domains`);
} else {
  console.error('Failed to list domains', error);
}
```

**TypeScript:**

```typescript
import { getDomains } from 'azion/domains';
import type { AzionDomainCollection, AzionDomainsResponse } from 'azion/domains';

const { data: domains, error }: AzionDomainsResponse<AzionDomainCollection> = await getDomains();

if (domains) {
  console.log(`Found ${domains.count} domains`);
} else {
  console.error('Failed to list domains', error);
}
```

### Get Domain

**JavaScript:**

```javascript
import { getDomain } from 'azion/domains';

const domainId = 123;
const { data: domain, error } = await getDomain(domainId);

if (domain) {
  console.log(`Found domain with name: ${domain.name}`);
} else {
  console.error('Failed to get domain', error);
}
```

**TypeScript:**

```typescript
import { getDomain } from 'azion/domains';
import type { AzionDomain, AzionDomainsResponse } from 'azion/domains';

const domainId = 123;
const { data: domain, error }: AzionDomainsResponse<AzionDomain> = await getDomain(domainId);

if (domain) {
  console.log(`Found domain with name: ${domain.name}`);
} else {
  console.error('Failed to get domain', error);
}
```

### Update Domain

**JavaScript:**

```javascript
import { updateDomain } from 'azion/domains';

const domainId = 123;
const { data: domain, error } = await updateDomain(domainId, { name: 'new domain name', edgeApplicationId: 456 });

if (domain) {
  console.log(`Updated domain with name: ${domain.name}`);
} else {
  console.error('Failed to update domain', error);
}
```

**TypeScript:**

```typescript
import { updateDomain } from 'azion/domains';
import type { AzionDomain, AzionDomainsResponse } from 'azion/domains';

const domainId = 123;
const { data: domain, error }: AzionDomainsResponse<AzionDomain> = await updateDomain(domainId, {
  name: 'new domain name',
  edgeApplicationId: 456,
});

if (domain) {
  console.log(`Updated domain with name: ${domain.name}`);
} else {
  console.error('Failed to update domain', error);
}
```

### Delete Domain

**JavaScript:**

```javascript
import { deleteDomain } from 'azion/domains';

const domainId = 123;
const { data: deletedDomain, error } = await deleteDomain(domainId);

if (deletedDomain) {
  console.log(`Deleted domain with ID: ${deletedDomain.id}`);
} else {
  console.error('Failed to delete domain', error);
}
```

**TypeScript:**

```typescript
import { deleteDomain } from 'azion/domains';
import type { AzionDomain, AzionDomainsResponse } from 'azion/domains';

const domainId = 123;
const { data: deletedDomain, error }: AzionDomainsResponse<AzionDomain> = await deleteDomain(domainId);

if (deletedDomain) {
  console.log(`Deleted domain with ID: ${deletedDomain.id}`);
} else {
  console.error('Failed to delete domain', error);
}
```

### Using Client

**JavaScript:**

```javascript
import { createClient } from 'azion/domains';

const client = createClient({ token: 'your-api-token', { debug: true } });

const { data: newDomain, error } = await client.createDomain({ name: 'example domain', edgeApplicationId: 123 });
if (newDomain) {
  console.log(`Domain created with ID: ${newDomain.id}`);
}


```

**TypeScript:**

```typescript
import { createClient } from 'azion/domains';
import type { AzionDomain, AzionDomainsClient } from 'azion/domains';

const client: AzionDomainsClient = createClient({ token: 'your-api-token', { debug: true } });

const { data: newDomain, error }: AzionDomainsResponse<AzionDomain> = await client.createDomain({ name: 'example domain', edgeApplicationId: 123 });
if (newDomain) {
  console.log(`Domain created with ID: ${newDomain.id}`);
}

```

## API Reference

### `createDomain`

Creates a new domain.

**Parameters:**

- `{ data: domain, error }: AzionCreateDomain` - Domain object.
- `options?: { debug?: boolean }` - Object options params.

**Returns:**

- `Promise<AzionDomainsResponse<AzionDomain>>` - The created domain object or error failed.

### `getDomains`

Lists all domains.

**Parameters:**

- `options?: { debug?: boolean }` - Object options params.
- `queryParams?: { pageSize?: number; page?: number; order?: 'id' | 'name'; sort?: 'asc' | 'desc'  }` - Query parameters.

**Returns:**

- `Promise<AzionDomainsResponse<AzionDomainCollection>>` - An array of domain objects or error failed.

### `getDomain`

Get a domain by ID.

**Parameters:**

- `domainId: number` - Domain ID.
- `options?: { debug?: boolean }` - Object options params.

**Returns:**

- `Promise<AzionDomainsResponse<AzionDomain>>` - The domain object or state failed.

### `updateDomain`

Update a domain.

**Parameters:**

- `domainId: number` - Domain ID.
- `{ data: domain, error }: AzionUpdateDomain` - Domain object.
- `options?: { debug?: boolean }` - Object options params.

**Returns:**

- `Promise<AzionDomainsResponse<AzionDomain>>` - The updated domain object or state failed.

### `deleteDomain`

Delete a domain.

**Parameters:**

- `domainId: number` - Domain ID.
- `options?: { debug?: boolean }` - Object options params.

**Returns:**

- `Promise<AzionDomainsResponse<AzionDeletedDomain>>` - The deleted domain id or state failed.

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

### `AzionDomainsResponse<T>`

- `data?: T` - The response data.
- `error?: { message: string; operation: string;}` - The error object.

### `AzionDomain`

- `state: 'pending' | 'executed' | 'failed'` - State of the domain.
- `id?: number` - Domain ID.
- `name: string` - Domain name.
- `url?: string` - Domain URL.
- `environment?: string` - Domain environment.
- `edgeApplicationId: number` - Edge application ID.
- `active: boolean` - Domain status.
- `cnameAccessOnly?: boolean` - CNAME access only.
- `cnames: string[]` - List of CNAMEs.
- `edgeFirewallId?: number` - Edge firewall ID.
- `digitalCertificateId: number | string | null` - Digital certificate ID.
- `mtls?: object | null` - Mutual TLS configuration.
- `mtls.verication: string` - Verification method. Enforce or permissive.
- `mtls.trustedCaCertificateId: number` - Trusted CA certificate ID.
- `mtls.crlList: number[]` - List of CRL IDs.

### `AzionDomainCollection`

- `state: 'pending' | 'executed' | 'failed'` - State of the domain list.
- `pages: number` - Number of pages.
- `count: number` - Number of domains.
- `results: AzionDomain[]` - Array of domain objects.

### `AzionDeleteDomain`

- `id: number` - Domain ID.
- `state: 'pending' | 'executed' | 'failed'` - State of the domain deletion.

## Contributing

Feel free to submit issues or pull requests to improve the functionality or documentation.
