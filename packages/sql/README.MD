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
  - [`DeletedAzionDatabase`](#deletedaziondatabase)
  - [`QueryResult`](#queryresult)
  - [`AzionClientOptions`](#azionclientoptions)
  - [`AzionDatabaseCollectionOptions`](#aziondatabasecollectionoptions)
  - [`AzionQueryResponse`](#azionqueryresponse)
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

const database = await createDatabase('my-new-database', { debug: true });
if (database) {
  console.log(`Database created with ID: ${database.id}`);
} else {
  console.error('Failed to create database');
}
```

**TypeScript:**

```typescript
import { createDatabase, AzionDatabase } from 'azion/sql';

const database: AzionDatabase | null = await createDatabase('my-new-database', { debug: true });
if (database) {
  console.log(`Database created with ID: ${database.id}`);
} else {
  console.error('Failed to create database');
}
```

#### Delete Database

**JavaScript:**

```javascript
import { deleteDatabase } from 'azion/sql';

const result = await deleteDatabase(123, { debug: true });
if (result) {
  console.log(`Database ${result.id} deleted successfully`);
} else {
  console.error('Failed to delete database');
}
```

**TypeScript:**

```typescript
import { deleteDatabase, AzionDeletedDatabase } from 'azion/sql';

const result: AzionDeletedDatabase | null = await deleteDatabase(123, { debug: true });
if (result) {
  console.log(`Database ${result.id} deleted successfully`);
} else {
  console.error('Failed to delete database');
}
```

#### Get Database

**JavaScript:**

```javascript
import { getDatabase } from 'azion/sql';

const database = await getDatabase('my-db', { debug: true });
if (database) {
  console.log(`Retrieved database: ${database.id}`);
} else {
  console.error('Database not found');
}
```

**TypeScript:**

```typescript
import { getDatabase, AzionDatabase } from 'azion/sql';

const database: AzionDatabase | null = await getDatabase('my-db', { debug: true });
if (database) {
  console.log(`Retrieved database: ${database.id}`);
} else {
  console.error('Database not found');
}
```

#### Get Databases

**JavaScript:**

```javascript
import { getDatabases } from 'azion/sql';

const databases = await getDatabases({ page: 1, page_size: 10 }, { debug: true });
if (databases) {
  console.log(`Retrieved ${databases.length} databases`);
} else {
  console.error('Failed to retrieve databases');
}
```

**TypeScript:**

```typescript
import { getDatabases, AzionDatabase } from 'azion/sql';

const databases: AzionDatabase[] | null = await getDatabases({ page: 1, page_size: 10 }, { debug: true });
if (databases) {
  console.log(`Retrieved ${databases.length} databases`);
} else {
  console.error('Failed to retrieve databases');
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
import { useQuery, AzionQueryResponse } from 'azion/sql';

const result: AzionQueryResponse | null = await useQuery('my-db', ['SELECT * FROM users'], { debug: true });
if (result) {
  console.log(`Query executed. Rows returned: ${result.rows.length}`);
} else {
  console.error('Query execution failed');
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
import { useExecute, AzionQueryResponse } from 'azion/sql';

const result: AzionQueryResponse | null = await useExecute('my-db', ['INSERT INTO users (name) VALUES ("John")'], {
  debug: true,
});
if (result?.state === 'executed') {
  console.log('Executed with success');
} else {
  console.error('Execution failed');
}
```

#### List Tables

**JavaScript:**

```javascript
import { listTables } from 'azion/sql';

const result = await listTables('my-db', { debug: true });

if (result) {
  console.log(result);
} else {
  console.error('Query execution failed');
}
```

**TypeScript:**

```typescript
import { listTables, AzionQueryResponse } from 'azion/sql';

const result: AzionQueryResponse | null = await listTables('my-db', { debug: true });
if (result) {
  console.log(result);
} else {
  console.error('Query execution failed');
}
```

## API Reference

### `createDatabase`

Creates a new database.

**Parameters:**

- `name: string` - Name of the new database.
- `options?: AzionClientOptions` - Optional parameters for the creation.

**Returns:**

- `Promise<AzionDatabase | null>` - The created database object or null if creation failed.

**Example:**

```javascript
const newDatabase = await sqlClient.createDatabase('my-new-db');
if (newDatabase) {
  console.log(`Database created with ID: ${newDatabase.id}`);
} else {
  console.error('Failed to create database');
}
```

### `deleteDatabase`

Deletes a database by its ID.

**Parameters:**

- `id: number` - ID of the database to delete.
- `options?: AzionClientOptions` - Optional parameters for the deletion.

**Returns:**

- `Promise<AzionDeletedDatabase | null>` - Object confirming deletion or null if deletion failed.

**Example:**

```javascript
const result = await sqlClient.deleteDatabase(123);
if (result) {
  console.log(`Database ${result.id} deleted successfully`);
} else {
  console.error('Failed to delete database');
}
```

### `getDatabase`

Retrieves a database by its Name.

**Parameters:**

- `name: string` - Name of the database to retrieve.
- `options?: AzionClientOptions` - Optional parameters for the retrieval.

**Returns:**

- `Promise<AzionDatabase | null>` - The retrieved database object or null if not found.

**Example:**

```javascript
const database = await sqlClient.getDatabase('my-db');
if (database) {
  console.log(`Retrieved database: ${database.name}`);
} else {
  console.error('Database not found');
}
```

### `getDatabases`

Retrieves a list of databases with optional filtering and pagination.

**Parameters:**

- `params?: AzionDatabaseCollectionOptions` - Optional parameters for filtering and pagination.
- `options?: AzionClientOptions` - Optional parameters for the retrieval.

**Returns:**

- `Promise<AzionDatabase[] | null>` - Array of database objects or null if retrieval failed.

**Example:**

```javascript
const databases = await sqlClient.getDatabases({ page: 1, page_size: 10, search: 'test' });
if (databases) {
  console.log(`Retrieved ${databases.length} databases`);
  databases.forEach((db) => console.log(`- ${db.name} (ID: ${db.id})`));
} else {
  console.error('Failed to retrieve databases');
}
```

### `useQuery`

Executes a query on a specific database.

**Parameters:**

- `name: string` - Name of the database to query.
- `statements: string[]` - Array of SQL statements to execute.
- `options?: AzionClientOptions` - Optional parameters for the query.

**Returns:**

- `Promise<AzionQueryResponse | null>` - Query result object or null if execution failed.

**Example:**

```javascript
const result = await sqlClient.useQuery('my-db', ['SELECT * FROM users']);
if (result) {
  console.log(`Query executed. Rows returned: ${result.rows.length}`);
} else {
  console.error('Query execution failed');
}
```

### `useExecute`

Executes a set of SQL statements on a specific database.

**Parameters:**

- `name: string` - Name of the database to execute the statements on.
- `statements: string[]` - Array of SQL statements to execute.
- `options?: AzionClientOptions` - Optional parameters for the execution.

**Returns:**

- `Promise<AzionQueryResponse | null>` - Execution result object or null if execution failed.

**Example:**

```javascript
const result = await sqlClient.useExecute('my-db', ['INSERT INTO users (name) VALUES ("John")']);
if (result?.state === 'executed') {
  console.log('Executed with success');
} else {
  console.error('Execution failed');
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

- `createDatabase: (name: string) => Promise<AzionDatabase | null>`
- `deleteDatabase: (id: number) => Promise<AzionDeletedDatabase | null>`
- `getDatabase: (name: string) => Promise<AzionDatabase | null>`
- `getDatabases: (params?: AzionDatabaseCollectionOptions) => Promise<AzionDatabase[] | null>`
- `useQuery: (name: string, statements: string[], options?: AzionClientOptions) => Promise<AzionQueryResponse | null>`
- `useExecute: (name: string, statements: string[], options?: AzionClientOptions) => Promise<AzionQueryResponse | null>`

### `AzionDatabase`

The database object.

- `id: number`
- `name: string`
- `client_id: string`
- `status: string`
- `created_at: string`
- `updated_at: string`
- `deleted_at: string | null`
- `query: (statements: string[], options?: AzionClientOptions) => Promise<AzionQueryResponse | null>`
- `execute: (statements: string[], options?: AzionClientOptions) => Promise<AzionQueryResponse | null>`
- `listTables: (options?: AzionClientOptions) => Promise<AzionQueryResponse | null>`

### `DeletedAzionDatabase`

The response object from a delete database request.

- `id: number`
- `state: 'executed' | 'pending'`
- `data: null`

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

### `AzionQueryResponse`

The response object from a query execution.

- `state: 'executed' | 'pending' | 'executed-runtime'`
- `data: QueryResult[] | NonSelectQueryResult`
- `toObject?: () => JsonObjectQueryExecutionResponse`

### `NonSelectQueryResult`

The result object for non-select queries.

- `info?: AzionQueryExecutionInfo`

### `AzionQueryExecutionInfo`

Information about the query execution.

- `rowsRead?: number`
- `rowsWritten?: number`
- `durationMs?: number`

### `AzionQueryExecutionParams`

Parameters for query execution.

- `statements: string[]`
- `params?: (AzionQueryParams | Record<string, AzionQueryParams>)[]`

### `AzionQueryParams`

Query parameters.

- `string | number | boolean | null`

## Contributing

Feel free to submit issues or pull requests to improve the functionality or documentation.
