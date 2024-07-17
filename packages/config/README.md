# Azion Edge Application Configuration

This module provides a function to configure and validate options for the Azion Edge Application. It supports various configurations, including origin settings, cache settings, rules, and network lists.

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
  origin: [
    {
      name: 'My Origin',
      type: 'single_origin',
      addresses: ['example.com'],
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
});
```

## API Reference

### `AzionConfig`

Configures and validates the options for the Azion Edge Application.

**Parameters:**

- `config: AzionConfig` - The configuration object for the Azion Edge Application.
  - `origin: Array<OriginConfig>` - Array of origin configurations.
    - `name: string` - Name of the origin.
    - `type: string` - Type of the origin (e.g., 'single_origin', 'load_balancer').
    - `bucket?: string` - Bucket name for storage origins.
    - `prefix?: string` - Prefix for storage origins.
    - `addresses?: string[]` - Array of addresses for the origin.
    - `hostHeader?: string` - Custom host header.
  - `cache: Array<CacheConfig>` - Array of cache configurations.
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
    - `request: Array<RequestRule>` - Array of request rules.
      - `name: string` - Name of the request rule.
      - `description?: string` - Description of the request rule.
      - `active?: boolean` - Whether the rule is active.
      - `match: string` - Match condition for the rule.
      - `variable?: string` - Variable to match against.
      - `behavior?: RequestBehavior` - Behavior to apply when the rule matches.
    - `response: Array<ResponseRule>` - Array of response rules.
      - `name: string` - Name of the response rule.
      - `description?: string` - Description of the response rule.
      - `active?: boolean` - Whether the rule is active.
      - `match: string` - Match condition for the rule.
      - `variable?: string` - Variable to match against.
      - `behavior?: ResponseBehavior` - Behavior to apply when the rule matches.
  - `networkList?: Array<NetworkListConfig>` - Array of network list configurations.
    - `id: number` - ID of the network list.
    - `listType: string` - Type of the network list.
    - `listContent: string[]` - Content of the network list.

**Returns:**

- `AzionConfig` - The validated configuration object.

## Types

### `AzionConfig` Type

The type definition for the AzionConfig.

```typescript
export type AzionConfig = {
  origin?: {
    name: string;
    type: string;
    bucket?: string | null;
    prefix?: string | null;
    addresses?: string[];
    hostHeader?: string;
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

  networkList?: {
    id: number;
    listType: string;
    listContent: string[];
  }[];
};
```
