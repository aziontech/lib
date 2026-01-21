# Azion KV Usage Guide

## Dual Implementation Strategy

The KV package automatically detects if `globalThis.Azion.KV` is available and chooses the appropriate implementation:

- **Native Provider**: Uses `globalThis.Azion.KV` when available (Edge Runtime)
- **API Provider**: Uses Azion's REST API as fallback

## Basic Usage

### 1. Auto-Detection

```typescript
import { createClient } from 'azion/kv';

// Automatically detects which provider to use (Redis-like pattern)
const client = await createClient()
  .on('error', (err) => console.log('KV Client Error', err))
  .connect();

// On Edge Runtime with Azion.KV available -> uses Native Provider
// In other environments -> uses API Provider
```

### 2. Force Native Provider

```typescript
import { createClient } from 'azion/kv';

const client = await createClient({
  provider: 'native',
})
  .on('error', (err) => console.error(err))
  .connect();

// Always uses globalThis.Azion.KV
// Throws error if not available
```

### 3. Force API Provider

```typescript
import { createClient } from 'azion/kv';

const client = await createClient({
  provider: 'api',
  apiToken: 'your-token-here',
  environment: 'production', // or 'stage'
})
  .on('error', (err) => console.error(err))
  .connect();
```

### 4. Check Which Provider is Being Used

```typescript
const client = await createClient()
  .on('error', (err) => console.error(err))
  .connect();

console.log(client.getProviderType()); // 'native' or 'api'
```

## Operations

### GET

```typescript
// Simple get
const value = await client.get('user:123');

// Get with metadata
const result = await client.getWithMetadata('user:123');
console.log(result.value);
console.log(result.metadata);

// Get with specific type
const json = await client.get('user:123', { type: 'json' });
const buffer = await client.get('file:data', { type: 'arrayBuffer' });
```

### SET

```typescript
// Simple set
await client.set('user:123', 'John Doe');

// Set with options
await client.set('user:123', JSON.stringify({ name: 'John' }), {
  expiration: {
    type: 'EX',
    value: 10, // 10 seconds
  },
  metadata: { created: Date.now() },
});
```

### DELETE

```typescript
await client.delete('user:123');
// or
await client.del('user:123');
```

## Environment Configuration

### Edge Runtime (Azion)

```typescript
// Automatically uses globalThis.Azion.KV
const client = await createClient()
  .on('error', (err) => console.error(err))
  .connect();
```

### Local Development / CI/CD

```typescript
// Uses API with credentials
const client = await createClient({
  provider: 'api',
  apiToken: process.env.AZION_API_TOKEN,
  environment: 'stage',
  namespace: 'dev',
})
  .on('error', (err) => console.error(err))
  .connect();
```

### Example with Environment Variables

```typescript
const client = await createClient({
  provider: process.env.KV_PROVIDER as 'auto' | 'native' | 'api',
  apiToken: process.env.AZION_API_TOKEN,
  environment: process.env.AZION_ENV as 'production' | 'stage',
  namespace: process.env.AZION_KV_NAMESPACE,
})
  .on('error', (err) => console.error(err))
  .connect();
```
