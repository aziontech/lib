# Azion Configuration

This module provides comprehensive configuration and validation for the Azion Platform. It supports applications, workloads, connectors, functions, storage, firewall rules, WAF settings, network lists, custom pages, and purge operations.

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
  - [`AzionApplication`](#azionapplication)
  - [`AzionWorkload`](#azionworkload)
  - [`AzionConnector`](#azionconnector)
  - [`AzionFunction`](#azionfunction)
  - [`AzionStorage`](#azionstorage)
  - [`AzionCache`](#azioncache)
  - [`AzionRules`](#azionrules)
  - [`AzionPurge`](#azionpurge)
  - [`AzionNetworkList`](#azionnetworklist)
  - [`AzionFirewall`](#azionfirewall)
  - [`AzionWaf`](#azionwaf)
  - [`AzionCustomPages`](#azioncustompages)

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

Here are two examples of how to configure the Azion Application:

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
  build: {
    entry: './src/index.js',
    preset: 'angular', // 'angular' | 'react' | 'next' | 'vue' | 'nuxt' | 'astro' | etc.
    bundler: 'webpack', // 'webpack' | 'esbuild'
  },
  applications: [
    {
      name: 'my--app',
      active: true,
      debug: false,
      edgeCacheEnabled: true,
      functionsEnabled: false,
      applicationAcceleratorEnabled: false,
      imageProcessorEnabled: false,
      tieredCacheEnabled: false,
      cache: [
        {
          name: 'mycache',
          stale: false,
          queryStringSort: false,
          methods: {
            post: false,
            options: false,
          },
          browser: {
            maxAgeSeconds: 5000,
          },
          edge: {
            maxAgeSeconds: 1000,
          },
          cacheByQueryString: {
            option: 'denylist',
            list: ['order', 'user'],
          },
          cacheByCookie: {
            option: 'allowlist',
            list: ['session', 'user'],
          },
        },
      ],
      rules: {
        request: [
          {
            name: 'rewriteRuleExample',
            description: 'Rewrite URLs, set cookies and headers, forward cookies.',
            active: true,
            criteria: [
              [
                {
                  variable: '${uri}',
                  conditional: 'if',
                  operator: 'matches',
                  argument: '^/rewrite$',
                },
              ],
            ],
            behaviors: [
              {
                type: 'set_cache_policy',
                attributes: {
                  value: 'mycache',
                },
              },
              {
                type: 'rewrite_request',
                attributes: {
                  value: '/new/%{captured[1]}',
                },
              },
            ],
          },
        ],
        response: [
          {
            name: 'apiDataResponseRuleExample',
            description: 'Manage headers, cookies, and GZIP compression.',
            active: true,
            criteria: [
              [
                {
                  variable: '${uri}',
                  conditional: 'if',
                  operator: 'matches',
                  argument: '^/api/data',
                },
              ],
            ],
            behaviors: [
              {
                type: 'add_response_header',
                attributes: {
                  value: 'Content-Type: application/json',
                },
              },
              {
                type: 'enable_gzip',
              },
            ],
          },
        ],
      },
      functionsInstances: [
        {
          name: 'auth-function-instance',
          ref: 'my--function',
          args: {
            environment: 'production',
            apiUrl: 'https://api.example.com',
          },
        },
      ],
    },
  ],
  connectors: [
    {
      name: 'my-http-connector',
      active: true,
      type: 'http',
      attributes: {
        addresses: [
          {
            active: true,
            address: 'api.example.com',
            httpPort: 80,
            httpsPort: 443,
          },
        ],
        connectionOptions: {
          dnsResolution: 'preserve',
          transportPolicy: 'preserve',
          httpVersionPolicy: 'http1_1',
          host: '${host}',
          pathPrefix: '',
          followingRedirect: false,
        },
        modules: {
          loadBalancer: {
            enabled: false,
            config: null,
          },
          originShield: {
            enabled: false,
            config: null,
          },
        },
      },
    },
  ],
  functions: [
    {
      name: 'my--function',
      path: './functions/index.js',
      runtime: 'azion_js',
      defaultArgs: {
        defaultEnv: 'development',
      },
      executionEnvironment: 'application',
      active: true,
      bindings: {
        storage: {
          bucket: 'my-storage',
          prefix: 'auth-data/',
        },
      },
    },
  ],
  storage: [
    {
      name: 'my-storage',
      edgeAccess: 'read_write',
      dir: './storage',
      prefix: '1236677364374',
    },
  ],
  workloads: [
    {
      name: 'my-production-workload',
      active: true,
      infrastructure: 1,
      domains: ['example.com', 'www.example.com'],
      workloadDomainAllowAccess: true,
      tls: {
        certificate: 12345,
        ciphers: 1,
        minimumVersion: 'tls_1_3',
      },
      protocols: {
        http: {
          versions: ['http1', 'http2'],
          httpPorts: [80],
          httpsPorts: [443],
          quicPorts: null,
        },
      },
      mtls: {
        verification: 'enforce',
        certificate: 67890,
        crl: [1, 2, 3],
      },
      deployments: [
        {
          name: 'production-deployment',
          current: true,
          active: true,
          strategy: {
            type: 'default',
            attributes: {
              application: 'my--app',
              firewall: 'my--firewall',
              customPage: 'my-custom-error-pages',
            },
          },
        },
      ],
    },
  ],
  firewall: [
    {
      name: 'my_firewall',
      active: true,
      functions: true,
      networkProtection: true,
      waf: true,
      rules: [
        {
          name: 'rateLimit_Then_Drop',
          active: true,
          match: '^/api/sensitive/',
          behavior: {
            setRateLimit: {
              type: 'second',
              limitBy: 'clientIp',
              averageRateLimit: '10',
              maximumBurstSize: '20',
            },
          },
        },
      ],
    },
  ],
  networkList: [
    {
      name: 'my-ip-allowlist',
      type: 'ip_cidr',
      items: ['10.0.0.1/32', '192.168.1.0/24'],
      active: true,
    },
  ],
  waf: [
    {
      name: 'my-waf-v4',
      productVersion: '1.0',
      engineSettings: {
        engineVersion: '2021-Q3',
        type: 'score',
        attributes: {
          rulesets: [1],
          thresholds: [
            { threat: 'sql_injection', sensitivity: 'high' },
            { threat: 'cross_site_scripting', sensitivity: 'high' },
          ],
        },
      },
    },
  ],
  customPages: [
    {
      name: 'my-custom-error-pages',
      active: true,
      pages: [
        {
          code: '404',
          page: {
            type: 'page_connector',
            attributes: {
              connector: 'my--connector',
              ttl: 3600,
              uri: '/errors/404.html',
              customStatusCode: 404,
            },
          },
        },
      ],
    },
  ],
  purge: [
    {
      type: 'url',
      items: ['http://www.example.com/image.jpg'],
      layer: 'edge_cache',
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
  workloads: [
    {
      name: 'my-production-workload',
      active: true,
      infrastructure: 1,
      domains: ['example.com', 'www.example.com'],
      workloadDomainAllowAccess: true,
      tls: {
        certificate: 12345,
        ciphers: 1,
        minimumVersion: 'tls_1_3',
      },
      protocols: {
        http: {
          versions: ['http1', 'http2'],
          httpPorts: [80],
          httpsPorts: [443],
          quicPorts: null,
        },
      },
      deployments: [
        {
          name: 'production-deployment',
          current: true,
          active: true,
          strategy: {
            type: 'default',
            attributes: {
              application: 'my--app',
            },
          },
        },
      ],
    },
  ],
};

const manifest = convertJsonConfigToObject(JSON.stringify(manifestJson));

console.log(manifest);
```

```typescript
import { AzionConfig, convertJsonConfigToObject } from 'azion';

const manifestJson = {
  workloads: [
    {
      name: 'my-production-workload',
      active: true,
      infrastructure: 1,
      domains: ['example.com', 'www.example.com'],
      workloadDomainAllowAccess: true,
      tls: {
        certificate: 12345,
        ciphers: 1,
        minimumVersion: 'tls_1_3',
      },
      protocols: {
        http: {
          versions: ['http1', 'http2'],
          httpPorts: [80],
          httpsPorts: [443],
          quicPorts: null,
        },
      },
      deployments: [
        {
          name: 'production-deployment',
          current: true,
          active: true,
          strategy: {
            type: 'default',
            attributes: {
              application: 'my--app',
            },
          },
        },
      ],
    },
  ],
};

const config: AzionConfig = convertJsonConfigToObject(JSON.stringify(manifestJson));

console.log(config);
```

## API Reference

### `defineConfig`

Configures and validates the options for the Azion Application.

**Parameters:**

- `config: AzionConfig` - The configuration object for the Azion Application.

### `processConfig`

Processes the configuration object and returns a manifest.

### `convertJsonConfigToObject`

Converts a Azion JSON configuration object to a AzionConfig object.

**Parameters:**

- `config: string` - The JSON configuration object.

**Parameters:**

- `config: AzionConfig` - The configuration object for the Azion Application.

## Types

### `AzionConfig`

**Properties:**

- `build?: AzionBuild` - The build configuration.
- `applications?: AzionApplication[]` - List of applications.
- `workloads?: AzionWorkload[]` - List of workloads for domain management.
- `connectors?: AzionConnector[]` - List of connectors (HTTP, storage, live ingest).
- `functions?: AzionFunction[]` - List of functions.
- `storage?: AzionStorage[]` - List of storage configurations.
- `purge?: AzionPurge[]` - List of URLs or cache keys to purge.
- `networkList?: AzionNetworkList[]` - List of network lists.
- `firewall?: AzionFirewall[]` - List of firewall configurations.
- `waf?: AzionWaf[]` - List of WAF configurations.
- `customPages?: AzionCustomPages[]` - List of custom error page configurations.

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

### `AzionApplication`

Type definition for application configuration.

**Properties:**

- `name: string` - Name of the application (1-250 characters).
- `active?: boolean` - Whether the application is active (default: true).
- `debug?: boolean` - Whether debug mode is enabled (default: false).
- `edgeCacheEnabled?: boolean` - Whether edge cache is enabled (default: true).
- `functionsEnabled?: boolean` - Whether functions are enabled (default: false).
- `applicationAcceleratorEnabled?: boolean` - Whether application accelerator is enabled (default: false).
- `imageProcessorEnabled?: boolean` - Whether image processor is enabled (default: false).
- `tieredCacheEnabled?: boolean` - Whether tiered cache is enabled (default: false).
- `cache?: AzionCache[]` - List of cache configurations.
- `rules?: AzionRules` - Request and response rules.
- `deviceGroups?: DeviceGroup[]` - List of device groups for mobile detection.
- `functionsInstances?: FunctionInstance[]` - List of function instances.

### `AzionWorkload`

Type definition for workload configuration (domain management).

**Properties:**

- `name: string` - Name of the workload (1-100 characters).
- `active?: boolean` - Whether the workload is active (default: true).
- `infrastructure?: 1 | 2` - Infrastructure type (1 for production, 2 for development).
- `workloadDomainAllowAccess?: boolean` - Whether to allow domain access (default: true).
- `domains: string[]` - List of domains (1-250 characters each).
- `tls?: TLSConfig` - TLS configuration.
  - `certificate?: number | null` - Certificate ID.
  - `ciphers?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | null` - TLS cipher suite.
  - `minimumVersion?: 'tls_1_0' | 'tls_1_1' | 'tls_1_2' | 'tls_1_3' | null` - Minimum TLS version.
- `protocols?: ProtocolConfig` - Protocol configuration.
  - `http: { versions: string[], httpPorts: number[], httpsPorts: number[], quicPorts?: number[] | null }`
- `mtls?: MTLSConfig` - Mutual TLS configuration.
  - `verification: 'enforce' | 'permissive'` - mTLS verification mode.
  - `certificate?: number | null` - Certificate ID.
  - `crl?: number[] | null` - Certificate Revocation Lists.
- `deployments: Deployment[]` - List of deployments.

### `AzionConnector`

Type definition for connector configuration.

**Properties:**

- `name: string` - Name of the connector (1-255 characters).
- `active?: boolean` - Whether the connector is active (default: true).
- `type: 'http' | 'storage' | 'live_ingest'` - Type of connector.
- `attributes: ConnectorAttributes` - Connector-specific attributes.

**For HTTP/Live Ingest connectors:**

- `addresses: Address[]` - List of backend addresses.
- `connectionOptions: ConnectionOptions` - Connection configuration.
- `modules: ConnectorModules` - Load balancer and origin shield modules.

**For Storage connectors:**

- `bucket: string` - Storage bucket name.
- `prefix: string` - Storage prefix path.

### `AzionFunction`

Type definition for function configuration.

**Properties:**

- `name: string` - Name of the function (1-250 characters).
- `path: string` - Path to the function file.
- `runtime?: 'azion_js'` - Runtime environment (default: 'azion_js').
- `defaultArgs?: object` - Default arguments for the function (default: {}).
- `executionEnvironment?: 'application' | 'firewall'` - Execution environment (default: 'application').
- `active?: boolean` - Whether the function is active (default: true).
- `bindings?: FunctionBindings` - Function bindings (e.g., storage).

### `AzionStorage`

Type definition for storage configuration.

**Properties:**

- `name: string` - Name of the storage (6-63 characters).
- `dir: string` - Local directory path.
- `edgeAccess?: 'read_only' | 'read_write' | 'restricted'` - access permissions.
- `prefix: string` - Storage prefix.

### `AzionCache`

Type definition for the cache configuration.

**Properties:**

- `name: string` - Name of the cache configuration (1-250 characters, pattern: `^[a-zA-Z0-9 \\-.',|]+$`).
- `stale?: boolean` - Whether to allow stale content.
- `queryStringSort?: boolean` - Whether to sort query string parameters.
- `methods?: CacheMethods` - HTTP methods to cache.
  - `post?: boolean` - Whether to cache POST requests.
  - `options?: boolean` - Whether to cache OPTIONS requests.
- `browser?: BrowserCacheConfig` - Browser cache settings.
  - `maxAgeSeconds: number | string` - Maximum age for browser cache in seconds (supports mathematical expressions).
- `edge?: EdgeCacheConfig` - cache settings.
  - `maxAgeSeconds: number | string` - Maximum age for edge cache in seconds (supports mathematical expressions).
- `cacheByCookie?: CacheByCookieConfig` - Cache by cookie settings.
  - `option: 'ignore' | 'all' | 'allowlist' | 'denylist'` - Cache by cookie option.
  - `list?: string[]` - List of cookies (required when option is 'allowlist' or 'denylist').
- `cacheByQueryString?: CacheByQueryStringConfig` - Cache by query string settings.
  - `option: 'ignore' | 'all' | 'allowlist' | 'denylist'` - Cache by query string option.
  - `list?: string[]` - List of query string parameters (required when option is 'allowlist' or 'denylist').

### `AzionRules`

Type definition for the rule set.

**Properties:**

- `request?: AzionRule[]` - Ruleset for Request phase.
- `response?: AzionRule[]` - Ruleset for Response phase.

### `AzionRule`

Type definition for edge application rules (request/response).

**Properties:**

- `name: string` - Name of the rule (1-250 characters).
- `description?: string` - Description of the rule (max 1000 characters).
- `active?: boolean` - Whether the rule is active (default: true).
- `criteria: Criteria[][]` - Array of criteria groups (1-5 groups, each with 1-10 criteria).
- `behaviors: Behavior[]` - Array of behaviors to execute (1-10 behaviors).

### `Criteria`

Type definition for rule criteria.

**Properties:**

- `variable: string` - Variable to evaluate (e.g., `${uri}`, `${host}`, `${http_user_agent}`).
- `conditional: 'if' | 'and' | 'or'` - Conditional operator.
- `operator: string` - Comparison operator (e.g., 'matches', 'is_equal', 'starts_with').
- `argument?: string` - Argument value (required for operators that need values).

### `Behavior`

Type definition for rule behaviors.

**Properties:**

- `type: string` - Behavior type (e.g., 'set_cache_policy', 'rewrite_request', 'run_function').
- `attributes?: object` - Behavior-specific attributes.

**Common behavior types:**

- `set_cache_policy` - Set cache policy by name or ID
- `rewrite_request` - Rewrite the request URL
- `set_cookie` - Set a cookie
- `add_request_header` / `add_response_header` - Add headers
- `run_function` - Execute an function
- `redirect_to_301` / `redirect_to_302` - Redirect requests
- `deliver` - Deliver content directly
- `enable_gzip` - Enable GZIP compression
- `capture_match_groups` - Capture regex groups

### `AzionPurge`

Type definition for the purge configuration.

**Properties:**

- `type: 'url' | 'cachekey' | 'wildcard'` - The type of purge to be performed.
- `items: string[]` - List of URLs or patterns to be purged (minimum 1 item).
- `layer?: 'edge_cache' | 'tiered_cache'` - Cache layer to be purged.

### `AzionNetworkList`

Type definition for the network list configuration.

**Properties:**

- `name: string` - Name of the network list (1-250 characters).
- `type: 'ip_cidr' | 'asn' | 'countries'` - Type of the network list.
- `items: string[]` - List of IP CIDRs, ASNs, or countries (1-20000 items).
- `active?: boolean` - Whether the network list is active (default: true).

### `AzionFirewall`

Type definition for the Firewall configuration.

**Properties:**

- `name: string` - Name of the firewall.
- `active?: boolean` - Whether the firewall is active.
- `debugRules?: boolean` - Whether debug mode is enabled for rules.
- `functions?: boolean` - Whether Functions are enabled.
- `networkProtection?: boolean` - Whether Network Protection is enabled.
- `waf?: boolean` - Whether WAF is enabled.
- `variable?: string` - Variable to be used in matches.
- `rules?: AzionFirewallRule[]` - List of firewall rules.

### `AzionFirewallRule`

Type definition for firewall rules.

**Properties:**

- `name: string` - Name of the rule.
- `description?: string` - Description of the rule.
- `active?: boolean` - Whether the rule is active.
- `match?: string` - Match criteria for the rule (regex pattern).
- `behavior: AzionFirewallBehavior` - Behavior to be applied when the rule matches.

### `AzionFirewallBehavior`

Type definition for firewall rule behaviors.

**Properties:**

- `runFunction?: string | number` - Run a serverless function (function name or ID).
- `setWafRuleset?: { wafMode: string; wafId: string | number }` - Set WAF ruleset.
- `setRateLimit?: RateLimitConfig` - Set rate limit configuration.
  - `type: 'second' | 'minute' | 'hour'` - Rate limit time window.
  - `limitBy: 'clientIp' | 'global' | 'token'` - Rate limit criteria.
  - `averageRateLimit: string` - Average rate limit.
  - `maximumBurstSize: string` - Maximum burst size.
- `deny?: boolean` - Deny the request.
- `drop?: boolean` - Drop the request.
- `setCustomResponse?: CustomResponseConfig` - Set custom response.
  - `statusCode: number | string` - HTTP status code (200-499).
  - `contentType: string` - Response content type.
  - `contentBody: string` - Response content body.

### `AzionWaf`

Type definition for the Web Application Firewall (WAF) configuration.

**Properties:**

- `id?: number` - ID of the WAF.
- `name: string` - Name of the WAF (1-250 characters).
- `productVersion?: string` - Product version (pattern: `\\d+\\.\\d+`, default: '1.0').
- `engineSettings: WafEngineSettings` - WAF engine configuration.
  - `engineVersion: '2021-Q3'` - WAF engine version.
  - `type: 'score'` - WAF type.
  - `attributes: WafAttributes` - WAF attributes.
    - `rulesets: [1]` - Array containing ruleset ID 1.
    - `thresholds: WafThreshold[]` - Array of threat thresholds (max 8 items).

### `WafThreshold`

Type definition for WAF threat thresholds.

**Properties:**

- `threat: WafThreatType` - Threat type ('sql_injection', 'cross_site_scripting', 'remote_file_inclusion', 'directory_traversal', 'evading_tricks', 'file_upload', 'unwanted_access', 'identified_attack').
- `sensitivity: 'highest' | 'high' | 'medium' | 'low' | 'lowest'` - Sensitivity level (default: 'medium').

### `AzionCustomPages`

Type definition for custom error pages configuration.

**Properties:**

- `name: string` - Name of the custom pages configuration (1-255 characters).
- `active?: boolean` - Whether the custom pages are active (default: true).
- `pages: CustomPage[]` - Array of custom page configurations (minimum 1 item).

### `CustomPage`

Type definition for individual custom pages.

**Properties:**

- `code: string` - Error code ('400', '403', '404', '405', '406', '407', '408', '409', '410', '411', '412', '413', '414', '415', '416', '417', '422', '429', '500', '501', '502', '503', '504', 'default').
- `page: PageConfig` - Page configuration.
  - `type?: 'page_connector'` - Page type (default: 'page_connector').
  - `attributes: PageAttributes` - Page attributes.
    - `connector: string | number` - Connector name or ID.
    - `ttl?: number` - Time to live (0-31536000 seconds, default: 0).
    - `uri?: string | null` - URI path (must start with /, max 250 characters).
    - `customStatusCode?: number | null` - Custom status code (100-599).
