# Azion Edge Application Configuration

This module provides a function to configure and validate options for the Azion Edge Application. It supports various configurations, including domain settings, origin settings, cache settings, rules, network lists, and purge operations.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Example Configuration](#example-configuration)
  - [Example Process Configuration](#example-process-configuration)
- [API Reference](#api-reference)
  - [`defineConfig`](#defineconfig)
  - [`processConfig`](#processconfig)
- [Types](#types)
  - [`AzionBuild`](#azionbuild)
  - [`AzionConfig`](#azionconfig)
  - [`AzionDomain`](#aziondomain)
  - [`AzionOrigin`](#azionorigin)
  - [`AzionCache`](#azioncache)
  - [`AzionRequestRule`](#azionrequestrule)
  - [`AzionResponseRule`](#azionresponserule)
  - [`AzionRules`](#azionrules)
  - [`AzionPurge`](#azionpurge)

## Installation

To install the package, use npm or yarn:

```sh
npm install azion
```

or

```sh
yarn add azion
```

## Usage

### Example Configuration

Here are two examples of how to configure the Azion Edge Application:

1. Using JSDoc to provide type information:

```javascript
/* @type {import('azion').AzionConfig} */
const config = {...}

export default config;
```

2. Using the `defineConfig` function to enforce types and provide configuration:

```javascript
import { defineConfig } from 'azion';

const config = defineConfig({
  domain: {
    name: 'example.com',
    cnameAccessOnly: false,
    cnames: ['www.example.com', 'cdn.example.com'],
    Id: 12345,
    edgeFirewallId: 67890,
    digitalCertificateId: null,
    mtls: {
      verification: 'enforce',
      trustedCaCertificateId: 98765,
    },
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
  cache: [
    {
      name: 'Default Cache',
      browser: {
        maxAgeSeconds: 3600,
      },
      edge: {
        maxAgeSeconds: 7200,
      },
    },
  ],
  rules: {
    request: [
      {
        name: 'Example Rule',
        match: 'path',
        behavior: {
          setOrigin: {
            name: 'My Origin',
            type: 'single_origin',
          },
        },
      },
    ],
  },
  purge: [
    {
      type: 'url',
      urls: ['https://example.com/path/to/purge'],
      method: 'delete',
      layer: 'edge_caching',
    },
  ],
});
```

### Example Process Configuration

```javascript
import { processConfig } from 'azion';

const config = {...};

const manifest = processConfig(config);

console.log(manifest);
```

```typescript
import { AzionConfig, processConfig } from 'azion';

const config: AzionConfig = {...};

const manifest = processConfig(config);

console.log(manifest);
```

## API Reference

### `defineConfig`

Configures and validates the options for the Azion Edge Application.

**Parameters:**

- `config: AzionConfig` - The configuration object for the Azion Edge Application.

### `processConfig`

Processes the configuration object and returns a manifest.

**Parameters:**

- `config: AzionConfig` - The configuration object for the Azion Edge Application.

## Types

### `AzionConfig`

**Properties:**

- `build?: AzionBuild` - The build configuration.
- `domain?: AzionDomain` - The domain object.
- `origin?: AzionOrigin[]` - List of origins.
- `cache?: AzionCache[]` - List of cache settings.
- `rules?: AzionRules[]` - List of edge rules.
- `purge?: AzionPurge[]` - List of URLs or CacheKeys to purge.

### `AzionBuild`

Type definition for the build configuration.

**Properties:**

- `builder?: 'esbuild' | 'webpack'` - The builder to use.
- `preset?: { name: string; }` - The preset to use.
- `entry?: string` - The entry file.
- `polyfills?: boolean` - Whether to include polyfills.
- `worker?: boolean` - Whether to build a owner worker.
- `custom?: Record<string, any>` - Custom build configuration.
- `memoryFS?: { injectionDirs: string[], removePathPrefix: string }` - Memory file system configuration.

### `AzionDomain`

Type definition for the domain configuration.

**Properties:**

- `name: string` - The domain name.
- `cnameAccessOnly?: boolean` - Whether to restrict access only to CNAMEs.
- `cnames?: string[]` - List of CNAMEs for the domain.
- `id?: number` - ID of the edge application.
- `edgeApplicationId?: number` - ID of the edge application.
- `edgeFirewallId?: number` - ID of the edge firewall.
- `digitalCertificateId?: string | number | null` - ID of the digital certificate.
- `mtls?: MTLSConfig` - Configuration for mTLS.
  - `verification: 'enforce' | 'permissive'` - mTLS verification mode.
  - `trustedCaCertificateId: number` - ID of the trusted CA certificate.
  - `crlList?: number[]` - List of Certificate Revocation Lists (CRLs).

### `AzionOrigin`

Type definition for the origin configuration.

**Properties:**

- `id?: number` - ID of the origin.
- `key?: string` - Key for the origin.
- `name: string` - Name of the origin.
- `type: string` - Type of the origin (e.g., 'single_origin', 'load_balancer').
- `bucket?: string | null` - Bucket name for storage origins.
- `prefix?: string | null` - Prefix for storage origins.
- `addresses?: (string | { address: string; weight?: number })[]` - Array of addresses for the origin.
- `hostHeader?: string` - Custom host header.
- `protocolPolicy?: 'http' | 'https' | 'preserve'` - Protocol policy for the origin.
- `redirection?: boolean` - Whether to enable redirection.
- `method?: 'ip_hash' | 'least_connections' | 'round_robin'` - Load balancing method.
- `path?: string` - Path for the origin.
- `connectionTimeout?: number` - Connection timeout in seconds.
- `timeoutBetweenBytes?: number` - Timeout between bytes in seconds.
- `hmac?: { region: string; accessKey: string; secretKey: string }` - HMAC configuration for the origin.

### `AzionCache`

Type definition for the cache configuration.

**Properties:**

- `name: string` - Name of the cache configuration.
- `stale?: boolean` - Whether to allow stale content.
- `queryStringSort?: boolean` - Whether to sort query string parameters.
- `methods?: CacheMethods` - HTTP methods to cache.
  - `post?: boolean` - Whether to cache POST requests.
  - `options?: boolean` - Whether to cache OPTIONS requests.
- `browser?: BrowserCacheConfig` - Browser cache settings.
  - `maxAgeSeconds: number | string` - Maximum age for browser cache in seconds.
- `edge?: EdgeCacheConfig` - Edge cache settings.
  - `maxAgeSeconds: number | string` - Maximum age for edge cache in seconds.
- `cacheByCookie?: CacheByCookieConfig` - Cache by cookie settings.
  - `option: 'ignore' | 'varies' | 'whitelist' | 'blacklist'` - Cache by cookie option.
  - `list?: string[]` - List of cookies to use for caching.
- `cacheByQueryString?: CacheByQueryStringConfig` - Cache by query string settings.
  - `option: 'ignore' | 'varies' | 'whitelist' | 'blacklist'` - Cache by query string option.
  - `list?: string[]` - List of query string parameters to use for caching.

### `AzionRequestRule`

Type definition for the request rule configuration.

**Properties:**

- `name: string` - Name of the request rule.
- `description?: string` - Description of the request rule.
- `active?: boolean` - Whether the rule is active.
- `match: string` - Match criteria for the rule.
- `variable?: string` - Variable to be used in the match.
- `behavior?: RequestBehavior` - Behavior to apply when the rule matches.
  - `setOrigin?: { name: string; type: string }` - Set a new origin.
  - `rewrite?: string` - Rewrite the request.
  - `setHeaders?: string[]` - Set headers.
  - `bypassCache?: boolean | null` - Bypass cache.
  - `httpToHttps?: boolean | null` - Force HTTPS.
  - `redirectTo301?: string | null` - Redirect with 301 status.
  - `redirectTo302?: string | null` - Redirect with 302 status.
  - `forwardCookies?: boolean | null` - Forward cookies.
  - `setCookie?: string | null` - Set a cookie.
  - `deliver?: boolean | null` - Deliver the content.
  - `capture?: { match: string; captured: string; subject: string }` - Capture configuration.
  - `runFunction?: { path: string; name?: string | null }` - Run a serverless function.
  - `setCache?: string | { name: string; browser_cache_settings_maximum_ttl?: number | null; cdn_cache_settings_maximum_ttl?: number | null }` - Set cache configuration.

### `AzionResponseRule`

Type definition for the response rule configuration.

**Properties:**

- `name: string` - Name of the response rule.
- `description?: string` - Description of the response rule.
- `active?: boolean` - Whether the rule is active.
- `match: string` - Match criteria for the rule.
- `variable?: string` - Variable to be used in the match.
- `behavior?: ResponseBehavior` - Behavior to apply when the rule matches.

  - `setCookie?: string | null` - Set a cookie.
  - `setHeaders?: string[]` - Set headers.
  - `deliver?: boolean | null` - Deliver the content.
  - `capture?: { match: string; captured: string; subject: string }` - Capture configuration.
  - `enableGZIP?: boolean | null` - Enable GZIP compression.
  - `filterCookie?: string | null` - Filter a cookie.
  - `filterHeader?: string | null` - Filter a header.
  - `runFunction?: { path: string; name?: string | null }` - Run a serverless function.
  - `redirectTo301?: string | null` - Redirect with 301 status.
  - `redirectTo302?: string | null` - Redirect with 302 status.

  ### `AzionRules`

  Type definition for the rule set.

  **Properties:**

  - `request: AzionRequestRule[]` - Ruleset for Request phase.
  - `response?: AzionResponseRule[]` - Ruleset for Response phase.

  ### `AzionPurge`

  Type definition for the purge configuration.

  **Properties:**

  - `type: 'url' | 'cachekey' | 'wildcard'` - The type of purge to be performed.
  - `urls: string[]` - List of URLs or patterns to be purged.
  - `method?: 'delete'` - HTTP method for the purge request.
  - `layer?: 'edge_caching' | 'l2_caching'` - Cache layer to be purged.
