# Azion KV

A Redis-like KV (Key-Value) client library for Azion Platform.

## Installation

```bash
npm install azion
```

## Usage

### Creating a Client

```typescript
import { createClient, KVClient } from 'azion/kv';

// Create a client with Redis-like chaining pattern
const client = await createClient()
  .on('error', (err) => console.log('KV Client Error', err))
  .connect();

// Or with custom options
const client = await createClient({
  namespace: 'my-namespace',
  apiToken: 'my-token',
})
  .on('error', (err) => console.error('KV Error:', err))
  .connect();

// Get a value
const value = await client.get('my-key');

// Set a value
await client.set('my-key', 'my-value');

// Delete a value
await client.delete('my-key');

// Disconnect when done
await client.disconnect();
```

### Basic Operations

#### Get

```typescript
// Simple get
const value = await client.get('my-key');

// Get with metadata
const result = await client.getWithMetadata('my-key');
console.log(result.value, result.metadata);
```

#### Set

```typescript
// Simple set
await client.set('my-key', 'my-value');

// Set with options
await client.set('my-key', 'my-value', {
  expiration: {
    type: 'EX',
    value: 10, // 10 seconds
  },
  metadata: { userId: '123' },
});
```

#### Delete

```typescript
await client.delete('my-key');
// or
await client.del('my-key');
```

#### hSet and HSET

```typescript
await client.hSet('my-key', 'field', 'value');
await client.HSET('my-key', 'field', 'value');
```

#### hGetAll and HGETALL

```typescript
const result = await client.hGetAll('my-key');
const result = await client.HGETALL('my-key');
```

#### hVals and HVALS

```typescript
const result = await client.hVals('my-key');
const result = await client.HVALS('my-key');
```

### API Reference

#### KVClient

Main client class for interacting with Azion KV.

#### Methods

- `createClient(options?: KVClientOptions): KVClient` - Create a new KV client (does not auto-connect)
- `on(event: 'error', handler: (error: Error) => void): this` - Register error event handler (chainable)
- `connect(): Promise<this>` - Connect to KV store (chainable)
- `get(key: string, options?: KVGetOptions): Promise<KVGetValue | null>`
- `getWithMetadata(key: string, options?: KVGetOptions): Promise<KVGetResult>`
- `set(key: string, value: KVValue, options?: KVSetOptions): Promise<void>`
- `delete(key: string): Promise<void>`
- `disconnect(): Promise<void>`
- `quit(): Promise<void>`
- `hSet(key: string, field: string, value: KVValue): Promise<void>`
- `HSET(key: string, field: string, value: KVValue): Promise<void>`
- `hGetAll(key: string): Promise<KVGetValue | null>`
- `HGETALL(key: string): Promise<KVGetValue | null>`
- `hVals(key: string): Promise<KVGetValue[] | null>`
- `HVALS(key: string): Promise<KVGetValue[] | null>`
- `getProviderType(): 'native' | 'api'`

### Types

See `src/types.ts` for complete type definitions.

## License

MIT
