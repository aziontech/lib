# Azion Edge Application Configuration

This module provides a function to configure and validate options for the Azion Edge Application. It supports various configurations, including domain settings, origin settings, cache settings, rules, network lists, and purge operations.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Example Configuration](#example-configuration)
  - [Example Process Configuration](#example-process-configuration)
  - [Example Convert JSON Configuration to Object](#example-convert-json-configuration-to-object)
- [API Reference](#api-reference)
  - [`defineConfig`](#defineconfig)
  - [`processConfig`](#processconfig)
  - [`convertJsonConfigToObject`](#convertjsonconfigtoobject)
- [Types](#types)
  - [`AzionBuild`](#azionbuild)
  - [`AzionConfig`](#azionconfig)
  - [`AzionDomain`](#aziondomain)
  - [`AzionOrigin`](#azionorigin)
  - [`AzionCache`](#azioncache)
  - [`AzionRuntimeRequestRule`](#AzionRuntimeRequestrule)
  - [`AzionResponseRule`](#azionresponserule)
  - [`AzionRules`](#azionrules)
  - [`AzionPurge`](#azionpurge)
  - [`AzionNetworkList`](#azionnetworklist)
  - [`AzionFirewall`](#azionfirewall)
  - [`AzionWaf`](#azionwaf)

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
import { defineConfig } from 'azion/config';

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
  firewall: {
    name: 'My Edge Firewall',
    domains: ['example.com', 'api.example.com'],
    active: true,
    edgeFunctions: true,
    networkProtection: true,
    waf: true,
    rules: [
      {
        name: 'Block Suspicious IPs',
        description: 'Block requests from suspicious IP addresses',
        active: true,
        criteria: [
          {
            variable: '${remote_addr}',
            operator: 'in',
            conditional: 'if',
            inputValue: 'suspicious_ips',
          },
        ],
        behavior: {
          deny: true,
        },
      },
      {
        name: 'Rate Limit API',
        description: 'Rate limit for API endpoints',
        active: true,
        criteria: [
          {
            variable: '${uri}',
            operator: 'starts_with',
            conditional: 'if',
            inputValue: '/api/',
          },
        ],
        behavior: {
          setRateLimit: {
            type: 'second',
            limitBy: 'client_ip',
            averageRateLimit: '10',
            maximumBurstSize: '20',
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
  networkLists: [
    {
      id: 12345,
      listType: 'ip_cidr',
      listContent: ['10.0.0.1'],
    },
    {
      id: 67890,
      listType: 'asn',
      listContent: [12345],
    },
    {
      id: 98765,
      listType: 'countries',
      listContent: ['US', 'CA'],
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

### Example Convert JSON Configuration to Object

```javascript
import { convertJsonConfigToObject } from 'azion';

const manifestJson = {
  origin: [
    {
      name: 'My Origin',
      origin_type: 'single_origin',
      addresses: [
        {
          address: 'origin.example.com',
          weight: 100,
        },
      ],
      origin_protocol_policy: 'https',
    },
  ],
};

const manifest = convertJsonConfigToObject(JSON.stringify(manifestJson));

console.log(manifest);
```

```typescript
import { AzionConfig, convertJsonConfigToObject } from 'azion';

const manifestJson = {
  origin: [
    {
      name: 'My Origin',
      origin_type: 'single_origin',
      addresses: [
        {
          address: 'origin.example.com',
          weight: 100,
        },
      ],
      origin_protocol_policy: 'https',
    },
  ],
};

const config: AzionConfig = convertJsonConfigToObject(JSON.stringify(manifestJson));

console.log(config);
```

## API Reference

### `defineConfig`

Configures and validates the options for the Azion Edge Application.

**Parameters:**

- `config: AzionConfig` - The configuration object for the Azion Edge Application.

### `processConfig`

Processes the configuration object and returns a manifest.

### `convertJsonConfigToObject`

Converts a Azion JSON configuration object to a AzionConfig object.

**Parameters:**

- `config: string` - The JSON configuration object.

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
- `networkLists?: AzionNetworkList[]` - List of network lists.
- `waf?: AzionWaf[]` - List of WAF configurations.

### `AzionBuild`

Type definition for the build configuration.

> ⚠️ \*Deprecation Notice:
> Support for the webpack bundler will be discontinued in future releases. While it is still available for now, new features, fixes, and improvements will be focused exclusively on esbuild. We recommend migrating to esbuild as soon as possible to ensure compatibility and better performance in upcoming versions.

**Properties:**

- \*`bundler?: 'esbuild' | 'webpack'` - The bundler to be used. Default is 'esbuild'.
- `preset?: string | AzionBuildPreset` - The preset to be used, can be a string or an AzionBuildPreset object.
- `entry?: string | string[] | Record<string, string>` - The entry file, can be a string, an array of strings, or an object.
- `polyfills?: boolean` - Whether to include polyfills.
- `extend?: (context: T) => T` - Function to extend the bundler configuration.
- `memoryFS?: { injectionDirs: string[], removePathPrefix: string }` - In-memory file system configuration.

### `AzionBuildPreset`

Type definition for the build preset.

**Properties:**

- `config: AzionConfig` - The Azion configuration.
- `handler?: (event: FetchEvent) => Promise<Response>` - Optional event handler.
- `prebuild?: (config: BuildConfiguration, ctx: BuildContext) => Promise<void | AzionPrebuildResult>` - Hook executed before the build process.
- `postbuild?: (config: BuildConfiguration, ctx: BuildContext) => Promise<void>` - Hook executed after the build process.
- `metadata: PresetMetadata` - Preset metadata.
  - `name: string` - Preset name.
  - `registry?: string` - Preset registry.
  - `ext?: string` - File extension.

### `AzionPrebuildResult`

Type definition for the prebuild result.

**Properties:**

- `filesToInject: string[]` - Files to be injected into memory during the build process.
- `injection: object` - Code injection settings.
  - `globals: object` - Global variables to be injected.
  - `entry?: string` - Code to run at the start of the worker.
  - `banner?: string` - Code to place at the top of the worker.
- `bundler: object` - Bundler configuration.
  - `defineVars: object` - Variables to be defined.
  - `plugins: (EsbuildPlugin | WebpackPlugin)[]` - Plugins to be used.

### `BuildContext`

Type definition for the build context.

**Properties:**

- `production: boolean` - Whether it is in production mode.
- `handler: BuildEntryPoint` - The build entry point.

### `BuildConfiguration`

Type definition for the build configuration.

> ⚠️ \*Deprecation Notice:
> Support for the webpack bundler will be discontinued in future releases. While it is still available for now, new features, fixes, and improvements will be focused exclusively on esbuild. We recommend migrating to esbuild as soon as possible to ensure compatibility and better performance in upcoming versions.

**Properties:**

- `entry: Record<string, string>` - The entry points.
- `baseOutputDir?: string` - Base output directory.
- `preset: AzionBuildPreset` - The preset to be used.
- `setup: BundlerSetup` - Bundler configuration.
- \*`bundler?: 'webpack' | 'esbuild'` - The bundler to be used.
- `polyfills?: boolean` - Whether to include polyfills.
- `extend?: (context: T) => T` - Function to extend the bundler configuration.
- `memoryFS?: { injectionDirs: string[], removePathPrefix: string }` - In-memory file system configuration.

### `BundlerSetup`

Type definition for the bundler setup.

**Properties:**

- `contentToInject?: string` - Content to be injected.
- `defineVars?: Record<string, string>` - Variables to be defined.

### `PresetMetadata`

Type definition for the preset metadata.

**Properties:**

- `name: string` - Preset name.
- `registry?: string` - Preset registry.
- `ext?: string` - File extension.

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
- `active?: boolean` - Whether the domain is active.
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

### `AzionRuntimeRequestRule`

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

  - `request: AzionRuntimeRequestRule[]` - Ruleset for Request phase.
  - `response?: AzionResponseRule[]` - Ruleset for Response phase.

  ### `AzionPurge`

  Type definition for the purge configuration.

  **Properties:**

  - `type: 'url' | 'cachekey' | 'wildcard'` - The type of purge to be performed.
  - `urls: string[]` - List of URLs or patterns to be purged.
  - `method?: 'delete'` - HTTP method for the purge request.
  - `layer?: 'edge_caching' | 'l2_caching'` - Cache layer to be purged.

  ### `AzionNetworkList`

  Type definition for the network list configuration.

  **Properties:**

  - `id: number` - ID of the network list.
  - `listType: 'ip_cidr' | 'asn' | 'countries'` - Type of the network list.
  - `listContent: string[] | number[]` - List of IP CIDRs, ASNs, or countries

  ### `AzionFirewall`

  Type definition for the Edge Firewall configuration.

  **Properties:**

  - `name: string` - Name of the firewall.
  - `domains?: string[]` - List of domains associated with the firewall.
  - `active?: boolean` - Whether the firewall is active.
  - `edgeFunctions?: boolean` - Whether Edge Functions are enabled.
  - `networkProtection?: boolean` - Whether Network Protection is enabled.
  - `waf?: boolean` - Whether WAF is enabled.
  - `variable?: RuleVariable` - Variable to be used in matches.
  - `rules?: AzionFirewallRule[]` - List of firewall rules.
  - `debugRules?: boolean` - Whether debug mode is enabled for rules.

  ### `AzionFirewallRule`

  Type definition for firewall rules.

  **Properties:**

  - `name: string` - Name of the rule.
  - `description?: string` - Description of the rule.
  - `active?: boolean` - Whether the rule is active.
  - `match?: string` - Match criteria for the rule.
  - `variable?: RuleVariable` - Variable to be used in the match.
  - `criteria?: AzionFirewallCriteria[]` - Array of criteria for complex conditions.
  - `behavior: AzionFirewallBehavior` - Behavior to be applied when the rule matches.

  ### `AzionFirewallBehavior`

  Type definition for firewall rule behaviors.

  **Properties:**

  - `runFunction?: { path: string }` - Run a serverless function.
  - `setWafRuleset?: { wafMode: FirewallWafMode; wafId: string }` - Set WAF ruleset.
  - `setRateLimit?: {` - Set rate limit configuration.
    - `type: FirewallRateLimitType` - Rate limit type (second, minute, hour).
    - `limitBy: FirewallRateLimitBy` - Rate limit by (client_ip, global, token).
    - `averageRateLimit: string` - Average rate limit.
    - `maximumBurstSize: string` - Maximum burst size.
  - `deny?: boolean` - Deny the request.
  - `drop?: boolean` - Drop the request.
  - `setCustomResponse?: {` - Set custom response.
    - `statusCode: number | string` - HTTP status code (200-499).
    - `contentType: string` - Response content type.
    - `contentBody: string` - Response content body.

  ### `AzionFirewallCriteria`

  Type definition for firewall rule criteria.

  **Properties:**

  - `variable: RuleVariable` - Variable to be evaluated.
  - `conditional: RuleConditional` - Conditional type.
  - `operator: RuleOperatorWithValue | RuleOperatorWithoutValue` - Comparison operator.
  - `inputValue?: string` - Input value for comparison (required for operators with value).

  ### `AzionWaf`

  Type definition for the Web Application Firewall (WAF) configuration.

  **Properties:**

  - `id?: number` - ID of the WAF.
  - `name: string` - Name of the WAF.
  - `active: boolean` - Whether the WAF is active.
  - `mode: WafMode` - WAF mode (learning, blocking and counting).
  - `sqlInjection?: object` - SQL Injection settings.
    - `sensitivity: string` - Sensitivity level (low, medium, high).
  - `remoteFileInclusion?: object` - Remote File Inclusion settings.
    - `sensitivity: string` - Sensitivity level (low, medium, high).
  - `directoryTraversal?: object` - Directory Traversal settings.
    - `sensitivity: string` - Sensitivity level (low, medium, high).
  - `crossSiteScripting?: object` - Cross-Site Scripting settings.
    - `sensitivity: string` - Sensitivity level (low, medium, high).
  - `evadingTricks?: object` - Evading Tricks settings.
    - `sensitivity: string` - Sensitivity level (low, medium, high).
  - `fileUpload?: object` - File Upload settings.
    - `sensitivity: string` - Sensitivity level (low, medium, high).
  - `unwantedAccess?: object` - Unwanted Access settings.
    - `sensitivity: string` - Sensitivity level (low, medium, high).
  - `identifiedAttack?: object` - Identified Attack settings.
    - `sensitivity: string` - Sensitivity level (low, medium, high).
  - `bypassAdresses?: string[]` - List of IP addresses to bypass the WAF.
