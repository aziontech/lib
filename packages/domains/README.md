# Azion Edge Domains

Azion Edge SQL Domains provides a simple interface to interact with the Azion Edge Domains API, allowing you to create, delete, and query databases. This client is configurable and supports both debug mode and environment variable-based configuration.

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
    - [List Domains](#listdomains)
    - [Get Domain](#getdomain)
    - [Update Domain](#updatedomain)
- [API Reference](#api-reference)
  - [`createDomain`](#createdomain)
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

You can use the provided wrapper methods to perform database operations directly.

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
import type { AzionDomainResponse } from 'azion/domains';

const domain: AzionDomainResponse = await createDomain({ name: 'example domain', edgeApplicationId: 123 });
if (domain) {
  console.log(`Domain created with ID: ${domain.id}`);
} else {
  console.error('Failed to create domain');
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
import type { AzionDomainResponse, AzionDomainsClient } from 'azion/domains';

const client: AzionDomainsClient = createClient({ token: 'your-api-token', { debug: true } });

const newDomain: AzionDomainResponse = await client.createDomain({ name: 'example domain', edgeApplicationId: 123 });
if (newDomain) {
  console.log(`Database created with ID: ${newDomain.id}`);
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

- `Promise<AzionDomainResponse>` - The created domain object or throw if creation failed.

> AzionDomainResponse

- `state: 'executed'| 'failed'` - State of the domain creation.
- `data: AzionDomain` - Domain object.

### `listDomains`

Lists all domains.

**Parameters:**

- `options?: { debug?: boolean }` - Object options params.
- `queryParams?: { pageSize?: number; page?: number; order?: 'id' | 'name'; sort?: 'asc' | 'desc'  }` - Query parameters.

**Returns:**

- `Promise<AzionListDomainsResponse>` - An array of domain objects.

> AzionListDomainsResponse

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

- `Promise<AzionDomainResponse>` - The domain object or throw if the domain does not exist.

### `updateDomain`

Update a domain.

**Parameters:**

- `domainId: number` - Domain ID.
- `domain: AzionUpdateDomain` - Domain object.
- `options?: { debug?: boolean }` - Object options params.

**Returns:**

- `Promise<AzionDomainResponse>` - The updated domain object or throw if the update failed.

### `createClient`

Creates an SQL client with methods to interact with Azion Edge SQL databases.

**Parameters:**

- `config?: Partial<{ token: string; options?: OptionsParams }>` - Configuration options for the Domain client.

**Returns:**

- `AzionDomainsClient` - An object with methods to interact with Domains.

## Types

### `ClientConfig`

Configuration options for the SQL client.

- `token?: string` - Your Azion API token.
- `options?: OptionsParams` - Object options params.
  - `debug?: boolean` - Enable debug mode for detailed logging.

## Contributing

Feel free to submit issues or pull requests to improve the functionality or documentation.
