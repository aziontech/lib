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
- [API Reference](#api-reference)
  - [`createDatabase`](#createdatabase)
  - [`deleteDatabase`](#deletedatabase)
  - [`getDatabaseById`](#getdatabasebyid)
  - [`getDatabases`](#getdatabases)
  - [`queryDatabase`](#querydatabase)
  - [`createClient`](#createclient)
- [Types](#types)
  - [`ClientConfig`](#clientconfig)
  - [`AzionSQLClient`](#sqlclient)
  - [`AzionDatabase`](#aziondatabase)
  - [`DeletedAzionDatabase`](#deletedaziondatabase)
  - [`Query`](#query)
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
import { createDatabase } from 'azion/sql';
import { AzionDatabase } from 'azion/sql/types';

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
import { deleteDatabase } from 'azion/sql';
import { DeletedAzionDatabase } from 'azion/sql/types';

const result: DeletedAzionDatabase | null = await deleteDatabase(123, { debug: true });
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
import { getDatabase } from 'azion/sql';
import { AzionDatabase } from 'azion/sql/types';

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
import { getDatabases } from 'azion/sql';
import { AzionDatabase } from 'azion/sql/types';

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
import { useQuery } from 'azion/sql';
import { QueryResponse } from 'azion/sql/types';

const result: QueryResponse | null = await useQuery('my-db', ['SELECT * FROM users'], { debug: true });
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

await useExecute('my-db', [`INSERT INTO users (id, name) VALUES (1, 'John Doe')`], { debug: true });
console.log(`Executed`);
```

**TypeScript:**

```typescript
import { useExecute } from 'azion/sql';

await useExecute('my-db', [`INSERT INTO users (id, name) VALUES (1, 'John Doe')`], { debug: true });
console.log(`Executed`);
```

### Using Client

**JavaScript:**

```javascript
import { createClient } from 'azion/sql';

const client = createClient({ token: 'your-api-token', { debug: true } });

const newDatabase = await client.createDatabase('my-new-db');
if (newDatabase) {
  console.log(`Database created with ID: ${newDatabase.id}`);
}

const allDatabases = await client.getDatabases();
if (allDatabases) {
  console.log(`Retrieved ${allDatabases.length} databases`);
}

const queryResult = await newDatabase.query(['SELECT * FROM users']);
if (queryResult) {
  console.log(`Query executed. Rows returned: ${queryResult.rows.length}`);
}
```

**TypeScript:**

```typescript
import { createClient } from 'azion/sql';
import { AzionSQLClient, AzionDatabase, QueryResponse } from 'azion/sql/types';

const client: AzionSQLClient = createClient({ token: 'your-api-token', { debug: true } });

const newDatabase: AzionDatabase | null = await client.createDatabase('my-new-db');
if (newDatabase) {
  console.log(`Database created with ID: ${newDatabase.id}`);
}

const allDatabases: AzionDatabase[] | null = await client.getDatabases();
if (allDatabases) {
  console.log(`Retrieved ${allDatabases.length} databases`);
}

const queryResult: QueryResponse | null = await newDatabase.query(['SELECT * FROM users'], { debug: true });
if (queryResult) {
  console.log(`Query executed. Rows returned: ${queryResult.rows.length}`);
}
```

## API Reference

### `createDatabase`

Creates a new database.

**Parameters:**

- `name: string` - Name of the new database.
- `debug?: boolean` - Enable debug mode for detailed logging.

**Returns:**

- `Promise<AzionDatabase | null>` - The created database object or null if creation failed.

### `deleteDatabase`

Deletes a database by its ID.

**Parameters:**

- `id: number` - ID of the database to delete.
- `debug?: boolean` - Enable debug mode for detailed logging.

**Returns:**

- `Promise<DeletedAzionDatabase | null>` - Object confirming deletion or null if deletion failed.

### `getDatabase`

Retrieves a database by its Name.

**Parameters:**

- `name: string` - Name of the database to retrieve.
- `options?: OptionsParams` - Object options params.
  - `debug?: boolean` - Enable debug mode for detailed logging.

**Returns:**

- `Promise<AzionDatabase | null>` - The retrieved database object or null if not found.

### `getDatabases`

Retrieves a list of databases with optional filtering and pagination.

**Parameters:**

- `params?: DatabaseCollectionOptions` - Optional parameters for filtering and pagination.
  - `ordering?: string` - Field to order the results by.
  - `page?: number` - Page number for pagination.
  - `page_size?: number` - Number of items per page.
  - `search?: string` - Search term to filter databases.
- `options?: OptionsParams` - Object options params.
  - `debug?: boolean` - Enable debug mode for detailed logging.

**Returns:**

- `Promise<AzionDatabase[] | null>` - Array of database objects or null if retrieval failed.

### `useQuery`

Executes a query on a specific database.

**Parameters:**

- `name: string` - Name of the database to query.
- `statements: string[]` - Array of SQL statements to execute.
- `options?: OptionsParams` - Object options params.
  - `debug?: boolean` - Enable debug mode for detailed logging.

**Returns:**

- `Promise<QueryResponse | null>` - Query result object or null if execution failed.

### `createClient`

Creates an SQL client with methods to interact with Azion Edge SQL databases.

**Parameters:**

- `config?: Partial<{ token: string; options?: OptionsParams }>` - Configuration options for the SQL client.

**Returns:**

- `AzionSQLClient` - An object with methods to interact with SQL databases.

## Types

### `ClientConfig`

Configuration options for the SQL client.

- `token?: string` - Your Azion API token.
- `options?: OptionsParams` - Object options params.
  - `debug?: boolean` - Enable debug mode for detailed logging.

### `AzionSQLClient`

An object with methods to interact with SQL databases.

- `createDatabase: (name: string) => Promise<AzionDatabase | null>`
- `deleteDatabase: (id: number) => Promise<DeletedAzionDatabase | null>`
- `getDatabase: (name: string) => Promise<AzionDatabase | null>`
- `getDatabases: (params?: DatabaseCollectionOptions) => Promise<AzionDatabase[] | null>`

### `AzionDatabase`

The database object.

- `id: number`
- `name: string`
- `client_id: string`
- `status: string`
- `created_at: string`
- `updated_at: string`
- `deleted_at: string | null`
- `query: (statements: string[], options?: OptionsParams) => Promise<QueryResponse | null>`
- `execute: (statements: string[], options?: OptionsParams) => Promise<QueryResponse | null>`

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

## Contributing

Feel free to submit issues or pull requests to improve the functionality or documentation.
