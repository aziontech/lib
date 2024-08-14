# Azion Edge Application Configuration

This module provides a function to configure and validate options for the Azion Edge Application. It supports various configurations, including domain settings, origin settings, cache settings, rules, network lists, and purge operations.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Example Configuration](#example-configuration)
- [API Reference](#api-reference)
  - [`AzionConfig`](#azionconfig)
- [Types](#types)
  - [`AzionConfig`](#azionconfig-type)

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

Here's an example of how to configure the Azion Edge Application:

```javascript
import { AzionConfig } from 'azion';

const config = AzionConfig({
  domain: {
    name: 'example.com',
    cnameAccessOnly: false,
    cnames: ['www.example.com', 'cdn.example.com'],
    edgeApplicationId: 12345,
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

## API Reference

### `AzionConfig`

Configures and validates the options for the Azion Edge Application.

**Parameters:**

- `config: AzionConfig` - The configuration object for the Azion Edge Application.
  - `domain?: DomainConfig` - Configuration for the domain.
    - `name: string` - The domain name.
    - `cnameAccessOnly?: boolean` - Whether to restrict access only to CNAMEs.
    - `cnames?: string[]` - List of CNAMEs for the domain.
    - `edgeApplicationId?: number` - ID of the edge application.
    - `edgeFirewallId?: number` - ID of the edge firewall.
    - `digitalCertificateId?: string | number | null` - ID of the digital certificate.
    - `mtls?: MTLSConfig` - Configuration for mTLS.
      - `verification: 'enforce' | 'permissive'` - mTLS verification mode.
      - `trustedCaCertificateId: number` - ID of the trusted CA certificate.
      - `crlList?: number[]` - List of Certificate Revocation Lists (CRLs).
  - `origin?: OriginConfig[]` - Array of origin configurations.
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
  - `cache?: CacheConfig[]` - Array of cache configurations.
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
  - `rules?: RulesConfig` - Rules configuration.
    - `request?: RequestRule[]` - Array of request rules.
      - `name: string` - Name of the request rule.
      - `description?: string` - Description of the request rule.
      - `active?: boolean` - Whether the rule is active.
      - `match: string` - Match condition for the rule.
      - `variable?: string` - Variable to match against.
      - `behavior?: RequestBehavior` - Behavior to apply when the rule matches.
        - `setOrigin?: { name: string; type: string }` - Set origin behavior.
        - `rewrite?: string` - URL rewrite behavior.
        - `setHeaders?: string[]` - Headers to set.
        - `bypassCache?: boolean | null` - Whether to bypass cache.
        - `httpToHttps?: boolean | null` - Redirect HTTP to HTTPS.
        - `redirectTo301?: string | null` - Redirect with 301 status.
        - `redirectTo302?: string | null` - Redirect with 302 status.
        - `forwardCookies?: boolean | null` - Whether to forward cookies.
        - `setCookie?: string | null` - Set cookie behavior.
        - `deliver?: boolean | null` - Whether to deliver the response.
        - `capture?: { match: string; captured: string; subject: string }` - Capture behavior.
        - `runFunction?: { path: string; name?: string | null }` - Run a custom function.
        - `setCache?: string | { name: string; browser_cache_settings_maximum_ttl?: number | null; cdn_cache_settings_maximum_ttl?: number | null }` - Set cache behavior.
    - `response?: ResponseRule[]` - Array of response rules.
      - `name: string` - Name of the response rule.
      - `description?: string` - Description of the response rule.
      - `active?: boolean` - Whether the rule is active.
      - `match: string` - Match condition for the rule.
      - `variable?: string` - Variable to match against.
      - `behavior?: ResponseBehavior` - Behavior to apply when the rule matches.
        - `setCookie?: string | null` - Set cookie behavior.
        - `setHeaders?: string[]` - Headers to set.
        - `deliver?: boolean | null` - Whether to deliver the response.
        - `capture?: { match: string; captured: string; subject: string }` - Capture behavior.
        - `enableGZIP?: boolean | null` - Enable GZIP compression.
        - `filterCookie?: string | null` - Filter cookies.
        - `filterHeader?: string | null` - Filter headers.
        - `runFunction?: { path: string; name?: string | null }` - Run a custom function.
        - `redirectTo301?: string | null` - Redirect with 301 status.
        - `redirectTo302?: string | null` - Redirect with 302 status.
  - `purge?: PurgeConfig[]` - Array of purge configurations.
    - `type: 'url' | 'cachekey' | 'wildcard'` - Type of purge operation.
    - `urls: string[]` - URLs to purge.
    - `method?: 'delete'` - HTTP method to use for purging.
    - `layer?: 'edge_caching' | 'l2_caching'` - Caching layer to target.

**Returns:**

- `AzionConfig` - The validated configuration object.

## Types

### `AzionConfig` Type

The type definition for the AzionConfig.

```typescript
export type AzionConfig = {
  domain?: {
    name: string;
    cnameAccessOnly?: boolean;
    cnames?: string[];
    edgeApplicationId?: number;
    edgeFirewallId?: number;
    digitalCertificateId?: string | number | null;
    mtls?: {
      verification: 'enforce' | 'permissive';
      trustedCaCertificateId: number;
      crlList?: number[];
    };
  };

  origin?: {
    id?: number;
    key?: string;
    name: string;
    type: string;
    bucket?: string | null;
    prefix?: string | null;
    addresses?:
      | string[]
      | {
          address: string;
          weight?: number;
        }[];
    hostHeader?: string;
    protocolPolicy?: 'http' | 'https' | 'preserve';
    redirection?: boolean;
    method?: 'ip_hash' | 'least_connections' | 'round_robin';
    path?: string;
    connectionTimeout?: number;
    timeoutBetweenBytes?: number;
    hmac?: {
      region: string;
      accessKey: string;
      secretKey: string;
    };
  }[];

  cache?: {
    name: string;
    stale?: boolean;
    queryStringSort?: boolean;
    methods?: {
      post?: boolean;
      options?: boolean;
    };
    browser?: {
      maxAgeSeconds: number | string;
    };
    edge?: {
      maxAgeSeconds: number | string;
    };
    cacheByCookie?: {
      option: 'ignore' | 'varies' | 'whitelist' | 'blacklist';
      list?: string[];
    };
    cacheByQueryString?: {
      option: 'ignore' | 'varies' | 'whitelist' | 'blacklist';
      list?: string[];
    };
  }[];

  rules?: {
    request?: {
      name: string;
      description?: string;
      active?: boolean;
      match: string;
      variable?: string;
      behavior?: {
        setOrigin?: {
          name: string;
          type: string;
        };
        rewrite?: string;
        setHeaders?: string[];
        bypassCache?: boolean | null;
        httpToHttps?: boolean | null;
        redirectTo301?: string | null;
        redirectTo302?: string | null;
        forwardCookies?: boolean | null;
        setCookie?: string | null;
        deliver?: boolean | null;
        capture?: {
          match: string;
          captured: string;
          subject: string;
        };
        runFunction?: {
          path: string;
          name?: string | null;
        };
        setCache?:
          | string
          | {
              name: string;
              browser_cache_settings_maximum_ttl?: number | null;
              cdn_cache_settings_maximum_ttl?: number | null;
            };
      };
    }[];
    response?: {
      name: string;
      description?: string;
      active?: boolean;
      match: string;
      variable?: string;
      behavior?: {
        setCookie?: string | null;
        setHeaders?: string[];
        deliver?: boolean | null;
        capture?: {
          match: string;
          captured: string;
          subject: string;
        };
        enableGZIP?: boolean | null;
        filterCookie?: string | null;
        filterHeader?: string | null;
        runFunction?: {
          path: string;
          name?: string | null;
        };
        redirectTo301?: string | null;
        redirectTo302?: string | null;
      };
    }[];
  };

  purge?: {
    type: 'url' | 'cachekey' | 'wildcard';
    urls: string[];
    method?: 'delete';
    layer?: 'edge_caching' | 'l2_caching';
  }[];
};
```
