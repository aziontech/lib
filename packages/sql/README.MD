# Azion Edge SQL Client

Azion Edge SQL Client provides a simple interface to interact with the Azion Edge SQL API, allowing you to create, delete, and query databases. This client is configurable and supports both debug mode and environment variable-based configuration.

## Table of Contents

- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Debug Mode](#debug-mode)
- [Usage](#usage)
  - [Using Environment Variables](#using-environment-variables)
  - [Direct Method Calls](#direct-method-calls)
  - [Client Configuration](#client-configuration)
  - [API Examples](#api-examples)
    - [Create Database](#create-database)
    - [Delete Database](#delete-database)
    - [Get Database](#get-database)
    - [Get Databases](#get-databases)
    - [Use Query](#use-query)
    - [Use Execute](#use-execute)
    - [List Tables](#list-tables)
- [API Reference](#api-reference)
  - [`createDatabase`](#createdatabase)
  - [`deleteDatabase`](#deletedatabase)
  - [`getDatabase`](#getdatabase)
  - [`getDatabases`](#getdatabases)
  - [`useQuery`](#usequery)
  - [`useExecute`](#useexecute)
  - [`createClient`](#createclient)
- [Types](#types)
  - [`ClientConfig`](#clientconfig)
  - [`AzionSQLClient`](#azionsqlclient)
  - [`AzionDatabase`](#aziondatabase)
  - [`AzionDatabaseResponse`](#aziondatabaseresponse)
  - [`QueryResult`](#queryresult)
  - [`AzionClientOptions`](#azionclientoptions)
  - [`AzionDatabaseCollectionOptions`](#aziondatabasecollectionoptions)
  - [`AzionDatabaseQueryResponse`](#aziondatabasequeryresponse)
  - [`AzionDatabaseExecutionResponse`](#aziondatabaseexecutionresponse)
  - [`NonSelectQueryResult`](#nonselectqueryresult)
  - [`AzionQueryExecutionInfo`](#azionqueryexecutioninfo)
  - [`AzionQueryExecutionParams`](#azionqueryexecutionparams)
  - [`AzionQueryParams`](#azionqueryparams)
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

#### Create Database

**JavaScript:**

```javascript
import { createDatabase } from 'azion/sql';

const { data, error } = await createDatabase('my-new-database', { debug: true });
if (data) {
  console.log(`Database created with ID: ${data.id}`);
} else {
  console.error('Failed to create database', error);
}
```

**TypeScript:**

```typescript
import { createDatabase, AzionDatabase } from 'azion/sql';
import type { AzionDatabaseResponse, AzionDatabase } from 'azion/sql';

const { data, error }: AzionDatabaseResponse<AzionDatabase> = await createDatabase('my-new-database', { debug: true });
if (data) {
  const database: AzionDatabase = data;
  console.log(`Database created with ID: ${database.id}`);
} else {
  console.error('Failed to create database', error);
}
```

#### Delete Database

**JavaScript:**

```javascript
import { deleteDatabase } from 'azion/sql';

const { data, error } = await deleteDatabase(123, { debug: true });
if (data) {
  console.log(`Database ${data.id} deleted successfully`);
} else {
  console.error('Failed to delete database', error);
}
```

**TypeScript:**

```typescript
import { deleteDatabase } from 'azion/sql';
import type { AzionDatabaseResponse, AzionDatabaseDeleteResponse } from 'azion/sql';

const { data, error }: AzionDatabaseResponse<AzionDatabaseDeleteResponse> = await deleteDatabase(123, { debug: true });
if (data) {
  console.log(`Database ${data.id} deleted successfully`);
} else {
  console.error('Failed to delete database', error);
}
```

#### Get Database

**JavaScript:**

```javascript
import { getDatabase } from 'azion/sql';

const { data, error } = await getDatabase('my-db', { debug: true });
if (data) {
  console.log(`Retrieved database: ${data.id}`);
} else {
  console.error('Database not found', error);
}
```

**TypeScript:**

```typescript
import { getDatabase } from 'azion/sql';
import type { AzionDatabaseResponse, AzionDatabase } from 'azion/sql';

const { data, error }: AzionDatabaseResponse<AzionDatabase> = await getDatabase('my-db', { debug: true });
if (data) {
  const database: AzionDatabase = data;
  console.log(`Retrieved database: ${database.id}`);
} else {
  console.error('Database not found', error);
}
```

#### Get Databases

**JavaScript:**

```javascript
import { getDatabases } from 'azion/sql';

const { data, error } = await getDatabases({ page: 1, page_size: 10 }, { debug: true });
if (data) {
  console.log(`Retrieved ${data.length} databases`);
} else {
  console.error('Failed to retrieve databases', error);
}
```

**TypeScript:**

```typescript
import { getDatabases } from 'azion/sql';
import type { AzionDatabaseResponse, AzionDatabaseCollections } from 'azion/sql';

const { data: allDatabases, error }: AzionDatabaseResponse<AzionDatabaseCollections> = await getDatabases(
  { page: 1, page_size: 10 },
  { debug: true },
);
if (allDatabases) {
  console.log(`Retrieved ${allDatabases.count} databases`);
} else {
  console.error('Failed to retrieve databases', error);
}
```

#### Use Query

**JavaScript:**

```javascript
import { useQuery } from 'azion/sql';

const result = await useQuery('my-db', ['SELECT * FROM users'], { debug: true });
if (result) {
  console.log(`Query executed. Rows returned: ${result.rows.length}`);
} else {
  console.error('Query execution failed');
}
```

**TypeScript:**

```typescript
import { useQuery, AzionDatabaseQueryResponse, AzionDatabaseResponse } from 'azion/sql';

const { data: result, error }: AzionDatabaseResponse<AzionDatabaseQueryResponse> = await useQuery(
  'my-db',
  ['SELECT * FROM users'],
  {
    debug: true,
  },
);
if (result) {
  console.log(`Query executed. Rows returned: ${result.rows.length}`);
} else {
  console.error('Query execution failed', error);
}
```

#### Use Execute

**JavaScript:**

```javascript
import { useExecute } from 'azion/sql';

const result = await useExecute('my-db', ['INSERT INTO users (name) VALUES ("John")'], { debug: true });
if (result?.state === 'executed') {
  console.log('Executed with success');
} else {
  console.error('Execution failed');
}
```

**TypeScript:**

```typescript
import { useExecute, AzionDatabaseQueryResponse } from 'azion/sql';

const result: AzionDatabaseQueryResponse | null = await useExecute(
  'my-db',
  ['INSERT INTO users (name) VALUES ("John")'],
  {
    debug: true,
  },
);
if (result?.state === 'executed') {
  console.log('Executed with success');
} else {
  console.error('Execution failed');
}
```

#### List Tables

**JavaScript:**

```javascript
import { getTables } from 'azion/sql';

const { data, error } = await getTables('my-db', { debug: true });

if (data) {
  console.log(data);
} else {
  console.error('Query execution failed', error);
}
```

**TypeScript:**

```typescript
import { getTables } from 'azion/sql';
import type { AzionDatabaseResponse, AzionDatabaseQueryResponse } from 'azion/sql';

const { data, error }: AzionDatabaseResponse<AzionDatabaseQueryResponse> = await getTables('my-db', { debug: true });

if (data) {
  console.log(data);
} else {
  console.error('Query execution failed', error);
}
```

## API Reference

### `createDatabase`

Creates a new database.

**Parameters:**

- `name: string` - Name of the new database.
- `options?: AzionClientOptions` - Optional parameters for the creation.

**Returns:**

- `Promise<AzionDatabaseResponse<AzionDatabase>>` - The created database object or error.

**Example:**

```javascript
const { data, error } = await sqlClient.createDatabase('my-new-db');
if (data) {
  console.log(`Database created with ID: ${data.id}`);
} else {
  console.error('Failed to create database', error);
}
```

### `deleteDatabase`

Deletes a database by its ID.

**Parameters:**

- `id: number` - ID of the database to delete.
- `options?: AzionClientOptions` - Optional parameters for the deletion.

**Returns:**

- `Promise<AzionDatabaseResponse<AzionDatabaseDeleteResponse>>` - Object confirming deletion or error.

**Example:**

```javascript
const { data, error } = await sqlClient.deleteDatabase(123);
if (data) {
  console.log(`Database ${data.id} deleted successfully`);
} else {
  console.error('Failed to delete database', error);
}
```

### `getDatabase`

Retrieves a database by its Name.

**Parameters:**

- `name: string` - Name of the database to retrieve.
- `options?: AzionClientOptions` - Optional parameters for the retrieval.

**Returns:**

- `Promise<AzionDatabaseResponse<AzionDatabase>>` - The retrieved database object or error.

**Example:**

```javascript
const { data, error } = await sqlClient.getDatabase('my-db');
if (data) {
  console.log(`Retrieved database: ${data.name}`);
} else {
  console.error('Database not found', error);
}
```

### `getDatabases`

Retrieves a list of databases with optional filtering and pagination.

**Parameters:**

- `params?: AzionDatabaseCollectionOptions` - Optional parameters for filtering and pagination.
- `options?: AzionClientOptions` - Optional parameters for the retrieval.

**Returns:**

- `Promise<AzionDatabaseResponse<AzionDatabaseCollections>>` - Array of database objects or error.

**Example:**

```javascript
const { data: allDatabases, error } = await sqlClient.getDatabases({ page: 1, page_size: 10, search: 'test' });
if (allDatabases) {
  console.log(`Retrieved ${allDatabases.count} databases`);
  allDatabases.results.forEach((db) => console.log(`- ${db.name} (ID: ${db.id})`));
} else {
  console.error('Failed to retrieve databases', error);
}
```

### `useQuery`

Executes a query on a specific database.

**Parameters:**

- `name: string` - Name of the database to query.
- `statements: string[]` - Array of SQL statements to execute.
- `options?: AzionClientOptions` - Optional parameters for the query.

**Returns:**

- `Promise<AzionDatabaseResponse<AzionDatabaseQueryResponse>>` - Query result object or error.

**Example:**

```javascript
const { data, error } = await sqlClient.query('my-db', ['SELECT * FROM users']);
if (data) {
  console.log(`Query executed. Rows returned: ${data.rows.length}`);
} else {
  console.error('Query execution failed', error);
}
```

### `useExecute`

Executes a set of SQL statements on a specific database.

**Parameters:**

- `name: string` - Name of the database to execute the statements on.
- `statements: string[]` - Array of SQL statements to execute.
- `options?: AzionClientOptions` - Optional parameters for the execution.

**Returns:**

- `Promise<AzionDatabaseResponse<AzionDatabaseQueryResponse>>` - Execution result object or error.

**Example:**

```javascript
const { data, error } = await sqlClient.execute('my-db', ['INSERT INTO users (name) VALUES ("John")']);
if (data) {
  console.log('Executed with success');
} else {
  console.error('Execution failed', error);
}
```

### `createClient`

Creates an SQL client with methods to interact with Azion Edge SQL databases.

**Parameters:**

- `config?: Partial<{ token: string; options?: AzionClientOptions }>` - Configuration options for the SQL client.

**Returns:**

- `AzionSQLClient` - An object with methods to interact with SQL databases.

## Types

## Types

### `ClientConfig`

Configuration options for the SQL client.

- `token?: string` - Your Azion API token.
- `options?: AzionClientOptions` - Optional parameters for the client configuration.

### `AzionSQLClient`

An object with methods to interact with SQL databases.

- `createDatabase: (name: string) => Promise<AzionDatabaseResponse<AzionDatabase>>`
- `deleteDatabase: (id: number) => Promise<AzionDatabaseResponse<AzionDatabaseDeleteResponse>>`
- `getDatabase: (name: string) => Promise<AzionDatabaseResponse<AzionDatabase>>`
- `getDatabases: (params?: AzionDatabaseCollectionOptions) => Promise<AzionDatabaseResponse<AzionDatabaseCollections>>`
- `useQuery: (name: string, statements: string[], options?: AzionClientOptions) => Promise<AzionDatabaseResponse<AzionDatabaseQueryResponse>>`
- `useExecute: (name: string, statements: string[], options?: AzionClientOptions) => Promise<AzionDatabaseResponse<AzionDatabaseExecutionResponse>>`

### `AzionDatabase`

The database object.

- `id: number`
- `name: string`
- `clientId: string`
- `status: string`
- `createdAt: string`
- `updatedAt: string`
- `deletedAt: string | null`
- `query: (statements: string[], options?: AzionClientOptions) => Promise<AzionDatabaseResponse<AzionDatabaseQueryResponse>>`
- `execute: (statements: string[], options?: AzionClientOptions) => Promise<AzionDatabaseResponse<AzionDatabaseExecutionResponse>>`
- `getTables: (options?: AzionClientOptions) => Promise<AzionDatabaseResponse<AzionDatabaseQueryResponse>>`

### `AzionDatabaseResponse<T>`

The response object from a database operation.

- `data?: T`
- `error?: { message: string, operation: string }`

### `QueryResult`

- `state: string`
- `columns: string[]`
- `statement: string`
- `rows: (number | string)[][]`

### `AzionClientOptions`

Optional parameters for the client configuration.

- `debug?: boolean`
- `force?: boolean`

### `AzionDatabaseCollectionOptions`

Optional parameters for filtering and pagination.

- `ordering?: string`
- `page?: number`
- `page_size?: number`
- `search?: string`

### `AzionDatabaseQueryResponse`

The response object from a query execution.

- `state: 'executed' | 'pending' | 'executed-runtime' | 'failed'`
- `data: QueryResult[]`
- `toObject?: () => JsonObjectQueryExecutionResponse`

### `AzionDatabaseExecutionResponse`

The response object from a query execution.

- `state: 'executed' | 'pending' | 'executed-runtime' | 'failed'`
- `data: QueryResult[]`
- `toObject?: () => JsonObjectQueryExecutionResponse`

### `AzionQueryExecutionParams`

Parameters for query execution.

- `statements: string[]`
- `params?: (AzionQueryParams | Record<string, AzionQueryParams>)[]`

### `AzionQueryParams`

Query parameters.

- `string | number | boolean | null`

## Contributing

Feel free to submit issues or pull requests to improve the functionality or documentation.
