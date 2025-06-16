# Azion KV Package

A key-value (KV) storage package that uses Azion Storage as backend, with automatic caching using Web Cache API.

## Installation

```bash
npm install azion
```

## Configuration

### Environment Variables

```bash
AZION_TOKEN=your_token_here
AZION_DEBUG=true  # optional, for detailed logs
```

## Usage

### Recommended Way - setupKV (New)

The simplest and most intuitive way to use KV is through `setupKV`, which returns a configured instance:

```javascript
import { setupKV } from 'azion/kv';

// Configure and get KV instance
const kv = await setupKV({
  bucket: 'my-bucket',
  ttl: 300, // 5 minutes (optional)
  cache: true, // use cache (optional)
  prefix: 'app:', // key prefix (optional)
});

// Use the instance
await kv.put('user:123', { name: 'John', age: 30 });
const user = await kv.get('user:123');
console.log(user.data?.value); // { name: 'John', age: 30 }

// Check if exists
const exists = await kv.has('user:123');
console.log(exists.data); // true

// List keys
const keys = await kv.list({ prefix: 'user:' });
console.log(keys.data?.keys); // ['user:123']

// Remove
await kv.delete('user:123');

// Clear all
await kv.clear();

// Cache management
await kv.cache.invalidate('user:123'); // Remove from cache only
await kv.cache.clear(); // Clear all cache entries
```

### TypeScript

```typescript
import { setupKV, KVInstance } from 'azion/kv';

interface User {
  name: string;
  age: number;
}

const kv: KVInstance = await setupKV({
  bucket: 'users',
  ttl: 600,
});

// Automatic typing
await kv.put('user:1', { name: 'John', age: 30 });
const result = await kv.get<User>('user:1');
if (result.data) {
  console.log(result.data.value.name); // TypeScript knows it's a string
}
```

### With Custom Token

```javascript
const kv = await setupKV(
  {
    bucket: 'my-bucket',
    ttl: 300,
  },
  {
    token: 'my-custom-token',
    debug: true,
  },
);
```

## API Reference

### setupKV(config, options?) → Promise\<KVInstance\>

Creates and returns a configured KV instance.

**Parameters:**

- `config: KVConfig` - KV configuration
- `options?: { token?: string } & AzionClientOptions` - Additional options

**Returns:** `Promise<KVInstance>` - Configured KV instance

### KVInstance

Interface of the KV instance returned by `setupKV`:

#### kv.put(key, value, options?) → Promise\<AzionStorageResponse\<boolean\>\>

Stores a value.

**Parameters:**

- `key: string` - Key
- `value: T` - Value to store
- `options?: KVPutOptions` - Options (ttl, metadata)

#### kv.get\<T\>(key) → Promise\<AzionStorageResponse\<KVValue\<T\>\>\>

Retrieves a value.

**Parameters:**

- `key: string` - Key

#### kv.delete(key) → Promise\<AzionStorageResponse\<boolean\>\>

Removes a value.

**Parameters:**

- `key: string` - Key

#### kv.list(options?) → Promise\<AzionStorageResponse\<KVKeys\>\>

Lists keys.

**Parameters:**

- `options?: KVListOptions` - Listing options (prefix, limit)

#### kv.has(key) → Promise\<AzionStorageResponse\<boolean\>\>

Checks if a key exists.

**Parameters:**

- `key: string` - Key

#### kv.clear() → Promise\<AzionStorageResponse\<boolean\>\>

Removes all values.

#### kv.cache.invalidate(key) → Promise\<AzionStorageResponse\<boolean\>\>

Invalidates cache for a specific key.

**Parameters:**

- `key: string` - Key to invalidate from cache

#### kv.cache.clear() → Promise\<AzionStorageResponse\<boolean\>\>

Clears all cache entries (keeps storage data intact).

## Types

### KVConfig

```typescript
interface KVConfig {
  bucket: string; // Bucket name
  ttl?: number; // Default TTL in seconds (default: 300)
  cache?: boolean; // Use cache (default: true)
  prefix?: string; // Key prefix (default: 'kv:')
}
```

### KVPutOptions

```typescript
interface KVPutOptions {
  ttl?: number; // Specific TTL for this item
  metadata?: Record<string, unknown>; // Additional metadata
}
```

### KVValue\<T\>

```typescript
interface KVValue<T = unknown> {
  value: T; // Stored value
  fromCache?: boolean; // Whether it came from cache
  metadata?: Record<string, unknown>; // Associated metadata
  expiresAt?: number; // Expiration timestamp
}
```

### KVListOptions

```typescript
interface KVListOptions {
  prefix?: string; // Filter by prefix
  limit?: number; // Result limit
}
```

## Cache

The package uses Web Cache API for automatic caching when available. The cache:

- Stores values temporarily for faster access
- Respects the configured TTL
- Automatically removes expired items
- Only works in environments that support Web Cache API (Workers, Edge Runtime)

## Debug

To enable detailed logs:

```bash
AZION_DEBUG=true
```

Or programmatically:

```javascript
const kv = await setupKV({ bucket: 'test' }, { debug: true });
```
