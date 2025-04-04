<p align="center">
  <img src="assets/azion-lib.svg" alt="Azion Lib Logo" width="180"/>
</p>

# Azion Library - The Edge Developer's Toolkit

[![Version](https://img.shields.io/npm/v/azion.svg)](https://www.npmjs.com/package/azion)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE.md)
[![Downloads](https://img.shields.io/npm/dm/azion.svg)](https://www.npmjs.com/package/azion)
[![GitHub Stars](https://img.shields.io/github/stars/aziontech/lib.svg)](https://github.com/aziontech/lib/stargazers)
[![Maintainers](https://img.shields.io/badge/maintainers-jotanarciso,%20jcbsfilho,%20pablodiehl-blue.svg)](https://github.com/aziontech/lib/graphs/contributors)

The Azion Libraries provide a suite of tools to interact with various Azion services, including Products (Purge, SQL, Storage) and Utilities (WASM Image Processor, Cookies). Each library is configurable and supports debug mode and environment variable-based configuration.

These libraries are designed to be versatile and can be used both within and outside of the Azion Runtime environment. When used outside of the Azion Runtime, the libraries will interact with Azion services via REST APIs. However, when used within the `Azion Runtime`, the libraries will leverage internal runtime capabilities for enhanced performance and efficiency.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Client](#client)
  - [Storage](./packages/storage/README.md)
  - [SQL](./packages/sql/README.md)
  - [Purge](./packages/purge/README.md)
  - [Domains](./packages/domains/README.md)
  - [Applications](./packages/applications/README.md)
- Utilities
  - [Cookies](./packages/cookies/README.md)
  - [Jwt](./packages/jwt/README.md)
  - [WASM Image Processor](./packages/wasm-image-processor/README.md)
  - [Utils](./packages/utils/README.md)
- [AI](./packages/ai/README.md)
- [Types](#types)
- [AzionConfig](#config)
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

## Usage

### Using the Client vs. Independent Package Functions

The Azion client provides a unified interface to interact with all products and services. You can use the client to access and manage all functionalities across Storage, SQL, Purge, and more. When using the client, you can pass configurations (e.g., `token`, `debug`) explicitly as parameters.

```javascript
import { createClient } from 'azion';

const client = createClient({ token: 'your-api-token', debug: true });

// Example: Creating a database via the client
const { data: newDatabase, error } = await client.sql.createDatabase('my-new-database');
if (data) {
  console.log(`Database created with ID: ${newDatabase.id}`);
} else {
  console.error('Failed to create database', error);
}
```

Alternatively, if you prefer to use individual functions directly from each package, you need to configure tokens and settings via environment variables (e.g., using a `.env` file). Each module has its own internal client that manages the interaction.

Example with explicit client for a specific module:

```typescript
import { createClient, StorageClient } from 'azion/storage';

const client: StorageClient = createClient({ token: 'your-api-token', debug: true });

const { data, error }: AzionStorageResponse<AzionBucket> = await client.createBucket({
  name: 'my-new-bucket',
  edge_access: 'public',
});

if (data) {
  console.log(`Bucket created with name: ${data.name}`);
} else {
  console.error('Failed to create bucket', error);
}
```

You can also use individual functions without any client by importing them directly from the package. This approach requires environment variables for configuration:

```javascript
import { createDatabase } from 'azion/sql';

const { data, error } = await createDatabase('my-new-database', { debug: true });
if (data) {
  console.log(`Database created with ID: ${data.id}`);
} else {
  console.error('Failed to create database', error);
}
```

More information on specific functionalities and usage can be found in the README file of each package (e.g., [Storage README](./packages/storage/README.md), [SQL README](./packages/sql/README.md), etc.).

This flexibility allows you to either manage everything through the client for simplicity or call specific functions from each package with more control over environment configurations.

### Client

The Azion Client provides a unified interface to interact with all Azion services.

#### Examples

**JavaScript:**

```javascript
import { createClient } from 'azion';

const client = createClient({ token: 'your-api-token', debug: true });

// Storage
const { data: newBucket, error } = await client.storage.createBucket({ name: 'my-new-bucket', edge_access: 'public' });
console.log(`Bucket created with name: ${newBucket.name}`);

const { data: allBuckets, error } = await client.storage.getBuckets();
console.log(`Retrieved ${allBuckets.count} buckets`);

// SQL
const { data: newDatabase, error } = await client.sql.createDatabase('my-new-db');
console.log(`Database created with ID: ${newDatabase.id}`);

const { data: allDatabases, error } = await client.sql.getDatabases();
console.log(`Retrieved ${allDatabases.count} databases`);

// Purge
const { data: purgeResult, error } = await client.purge.purgeURL(['http://example.com/image.jpg']);
console.log(`Purge successful: ${purgeResult.items}`);
```

**TypeScript:**

```typescript
import { createClient } from 'azion';
import type { AzionClient } from 'azion/client';
import type { AzionDatabaseResponse, AzionDatabaseQueryResponse, AzionDatabaseCollection } from 'azion/sql';
import type { AzionStorageResponse, AzionBucket, AzionBucketCollection } from 'azion/storage';
import type { AzionPurgeResponse, AzionPurge } from 'azion/purge';

const client: AzionClient = createClient({ token: 'your-api-token', debug: true });

// Storage
const { data: newBucket, error }: AzionStorageResponse<AzionBucket> = await client.createBucket({
  name: 'my-new-bucket',
  edge_access: 'public',
});
console.log(`Bucket created with name: ${newBucket.name}`);

const { data: allBuckets, error }: AzionStorageResponse<AzionBucketCollection> = await client.getBuckets();
console.log(`Retrieved ${allBuckets.count} buckets`);

// SQL
const { data: newDatabase, error }: AzionDatabaseResponse<AzionDatabase> = await client.sql.createDatabase('my-new-db');
console.log(`Database created with ID: ${newDatabase.id}`);

const { data: allDatabases, error }: AzionDatabaseResponse<AzionDatabaseCollections> = await client.sql.getDatabases();
console.log(`Retrieved ${allDatabases.count} databases`);

// Purge
const { data: purgeResult, error }: AzionPurgeResponse<AzionPurge> = await client.purge.purgeURL([
  'http://example.com/image.jpg',
]);
console.log(`Purge successful: ${purgeResult.items}`);
```

## Types

The Types package provides global TypeScript types that are used across Azion platform, ensuring consistency and reducing redundancy throughout the codebase.

⚠️ These types are specifically tailored for `Azion Runtime environments`.

#### Available Types

- **`Metadata`**  
  Represents metadata information for requests, including GeoIP data, remote address, server protocol, and TLS information.

- **`FetchEvent`**  
  Represents the FetchEvent interface, which includes the request object and methods to handle fetch events within the Azion Runtime.

- **`FirewallEvent`**  
  Represents the FirewallEvent interface, including methods to manage firewall events such as denying, dropping, or continuing a request.

Read more in the [Types README](./packages/types/README.md).

## Config

The Config library provides methods to configure and validate options for the Azion platform.

### Examples

**JavaScript:**

This is the first example using JSDoc to provide type information:

```javascript
/** @type {import('azion').AzionConfig} */
const config = {
  build: {
    // Build configuration
    bundler: 'esbuild',
    entry: './src/index.js',
    preset: 'react',
    polyfills: true,
    worker: true,
  },
  domain: {
    name: 'example.com',
    cnameAccessOnly: false,
  },
  origin: [
    {
      name: 'My Origin',
      type: 'single_origin',
      addresses: ['origin.example.com'],
    },
  ],
  cache: [
    {
      name: 'Default Cache',
      browser: { maxAgeSeconds: 3600 },
      edge: { maxAgeSeconds: 7200 },
    },
  ],
  rules: {
    request: [
      {
        name: 'Example Rule',
        match: 'path',
        behavior: { setOrigin: { name: 'My Origin', type: 'single_origin' } },
      },
    ],
  },
  purge: [
    {
      type: 'url',
      urls: ['https://example.com/path/to/purge'],
    },
  ],
  networkList: [
    {
      id: 12345,
      listType: 'ip_cidr',
      listContent: ['10.0.0.1'],
    },
  ],
  firewall: {
    name: 'My Firewall',
    active: true,
    rules: [
      {
        name: 'Block Suspicious IPs',
        behavior: { deny: true },
      },
    ],
  },
  waf: [
    {
      name: 'My WAF',
      mode: 'blocking',
      active: true,
    },
  ],
};

export default config;
```

This is the second example using the `defineConfig` function to enforce types and provide configuration:

```javascript
import { defineConfig } from 'azion';

const config = defineConfig({
  build: {
    // Advanced build configuration options
    bundler: 'webpack',
    entry: {
      main: './src/index.js',
      admin: './src/admin.js',
    },
    preset: {
      config: {
        /* custom configuration */
      },
      metadata: {
        name: 'custom-preset',
        registry: 'my-registry',
      },
      handler: async (event) => {
        // Custom handler
        return new Response('Hello World');
      },
    },
    polyfills: true,
    worker: true,
    extend: (config) => {
      // Customize bundler configuration
      return {
        ...config,
        // Specific configurations
      };
    },
    memoryFS: {
      injectionDirs: ['./src/inject'],
      removePathPrefix: './src',
    },
  },
  domain: {
    name: 'example.com',
    cnameAccessOnly: false,
    cnames: ['www.example.com'],
  },
  origin: [
    {
      name: 'My Origin',
      type: 'single_origin',
      addresses: [
        {
          address: 'origin.example.com',
          weight: 100,
        },
      ],
      protocolPolicy: 'https',
    },
  ],
  // Other configurations...
});

export default config;
```

Here's a more advanced example using preset customization with TypeScript:

```typescript
import { defineConfig } from 'azion';
import type { AzionBuildPreset, AzionPrebuildResult, BuildContext, BuildConfiguration } from 'azion/config';
import { Next } from 'azion/presets';

export default defineConfig({
  build: {
    preset: {
      ...Next,
      config: {
        ...Next.config,
        bundler: 'esbuild',
        extend: (config) => {
          config.define = {
            ...config.define,
            'global.customFeature': 'JSON.stringify(true)',
            'process.env.CUSTOM_VAR': 'JSON.stringify("value")',
          };
          return config;
        },
      },
      prebuild: async (config: BuildConfiguration, ctx: BuildContext): Promise<AzionPrebuildResult> => {
        // Your custom prebuild logic here
        console.log('Running custom prebuild with context:', ctx);

        // Return prebuild result with custom configurations
        return {
          filesToInject: ['./src/custom-file.js'],
          injection: {
            globals: {
              _ENTRIES: 'window._ENTRIES = {}',
              AsyncLocalStorage: 'globalThis.AsyncLocalStorage = class {}',
            },
            entry: '// Custom entry code\nconsole.log("Custom initialization");',
            banner: '/* Custom banner comment */',
          },
          bundler: {
            defineVars: {
              __CONFIG__: JSON.stringify({ customSetting: true }),
              __BUILD_METADATA__: JSON.stringify({ version: '1.0.0', buildTime: Date.now() }),
            },
            plugins: [],
          },
        };
      },
      postbuild: async (config: BuildConfiguration, ctx: BuildContext): Promise<void> => {
        // Your custom postbuild logic here
        console.log('Build completed with output:', config.baseOutputDir);
      },
    },
    // Other build configurations
    entry: './src/index.ts',
    polyfills: true,
    worker: true,
    memoryFS: {
      injectionDirs: ['./src/inject'],
      removePathPrefix: './src',
    },
  },
  // Domain, origin, and other configurations...
});
```

Read more in the [AzionConfig README](./packages/config/README.md).

## Contributing

Feel free to submit issues or pull requests to improve the functionality or documentation.
