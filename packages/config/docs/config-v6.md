# Azion config for the API v6

The Azion API v6 changes how a project is published, so it has its own `azion.config` shape. `@aziontech/config` validates
and processes it into a v6 `manifest.json`, which the Azion CLI uses to create the resources.

> **Status:** the v6 schemas follow the v6 OpenAPI and may change while the Azion CLI implements the API calls. The v4 config
> is still the default: a config without `version` is a v4 one, and the examples of the README are v4.

## Using it

Declare `version: 6` in the config (the type `AzionConfigV6` is exported by the package):

```typescript
import { defineConfig, processConfig, validateConfig } from '@aziontech/config';

const config = defineConfig({
  version: 6,
  // ...
});

validateConfig(config); // throws on an invalid config
const manifest = processConfig(config); // the v6 manifest, with `version: 6`
```

With the Azion Bundler, the version comes from the `version` of the `azion.config`, or from the flag
`--config-version 6` (the flag and the file must not disagree):

```sh
azbundler build --preset react --config-version 6
azbundler manifest generate --config-file ./azion.config.ts
```

Every preset of `@aziontech/presets` has a v6 config (`configs[6]`).

## What changes from v4

| v4                                                                                                                                                | v6                                                                                                                                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Saving publishes                                                                                                                                  | Saving writes a draft, and publishing is a separate step done by the CLI                                                                                                                                                                          |
| `workloads[].domains` and `workloads[].tls.certificate`                                                                                           | `workloads[].bindings[].domains[{ domain, certificate }]`: each binding has the domains and the certificate of an environment                                                                                                                     |
| No environments                                                                                                                                   | `environments[]`: `name` and `deploymentPolicy` (`single_version` or `versioned_urls`, required and immutable)                                                                                                                                    |
| `workloads[].deployments` with the `strategy` (application, firewall, custom page)                                                                | `deployments[]`: `name`, `bindingPolicy` (required), `description`, `deploymentPolicy` (`single_version`, `versioned_urls` or `latest`) and `strategyDefaults.skewProtection`. The application a deployment serves is set by the CLI in a release |
| `active` in applications, rules, functions, function instances, connectors, addresses, firewalls, WAFs, network lists, custom pages and workloads | Removed: the v6 API has no `active` in any resource                                                                                                                                                                                               |
| `edgeCacheEnabled` can be `false`                                                                                                                 | The cache module cannot be disabled: only `true`                                                                                                                                                                                                  |
| Purge `layer`: `cache` or `tiered_cache`                                                                                                          | `cache` only                                                                                                                                                                                                                                      |
| Device group `name` of any text                                                                                                                   | Letters and numbers only (`^[a-zA-Z0-9]+$`)                                                                                                                                                                                                       |
| Workload `protocols.http.versions` of any combination                                                                                             | Must include `http1` and `http2`                                                                                                                                                                                                                  |
| Functions without dependencies                                                                                                                    | `functions[].dependencies`: up to 20 connectors or network lists the function uses at runtime                                                                                                                                                     |
| `tls.ciphers` can be `null`                                                                                                                       | `tls.ciphers` is not nullable                                                                                                                                                                                                                     |
| Rule variables of any phase                                                                                                                       | Each variable is valid only in the phases the API documents                                                                                                                                                                                       |
| Firewall `set_waf.mode`: `learning \| blocking`                                                                                                   | `logging \| blocking`                                                                                                                                                                                                                             |
| `kv`                                                                                                                                              | Not available                                                                                                                                                                                                                                     |

The behaviors and criterion variables of the rules need the modules the API documents. An application needs
`applicationAcceleratorEnabled` for every variable except `${uri}` and for `forward_cookies`, `filter_request_cookie`,
`rewrite_request`, `capture_match_groups`, `add_request_cookie` and `set_cookie`, `imageProcessorEnabled` for
`optimize_images`, and functions (`functionsEnabled`, or declared `functionsInstances`) for `run_function`. A firewall needs
at least one of its modules (`functions`, `networkProtection`, `waf`) for each behavior, `waf` for the header, `request_args`
and `request_method` variables, `networkProtection` for `network`, and `functions` for `run_function`. The config fails with
a message naming the rule and the module when one is missing.

A workload with `workloadDomainAllowAccess: true` (the default) cannot be bound to an environment whose `deploymentPolicy` is
`versioned_urls`; for such a workload the default becomes `false`.

Resource limits also follow the v6 API: names of 100 characters at most for applications and rules, cache max age up to one
year, 23 pages at most in a custom page, storage names with the pattern `^[a-z0-9][a-z0-9-]*[a-z0-9]$`, and so on.

A **binding** references an environment (declared in `environments`) and a deployment (declared in `deployments`) by name. The
function and connector of the rules, and the WAF of a firewall rule, accept the name of a resource declared in the config, or
its ID (an ID is not validated).

## Complete example

This is every resource the v6 config has, with the references between them:

```typescript
const config: AzionConfigV6 = {
  version: 6,
  build: {
    bundler: 'esbuild',
    entry: './src/index.js',
    polyfills: true,
  },
  functions: [
    {
      name: 'my-function',
      path: './functions/index.js',
      bindings: {
        storage: {
          bucket: 'my-bucket-assets',
          prefix: 'v1',
        },
      },
      // connectors and network lists the function uses at runtime, which a release includes with it
      dependencies: [
        { type: 'connector', ref: 'my-origin' },
        { type: 'network_list', ref: 'my-ip-allowlist' },
      ],
    },
  ],
  storage: [
    {
      name: 'my-bucket-assets',
      prefix: 'v1',
      dir: './dist',
      workloadsAccess: 'read_only',
    },
  ],
  connectors: [
    {
      name: 'my-storage-connector',
      type: 'storage',
      attributes: {
        bucket: 'my-bucket-assets',
        prefix: 'v1',
      },
    },
    {
      name: 'my-origin',
      type: 'http',
      attributes: {
        addresses: [
          {
            address: 'origin.example.com',
            httpsPort: 443,
            modules: { loadBalancer: { serverRole: 'primary', weight: 10 } },
          },
        ],
        connectionOptions: {
          dnsResolution: 'both',
          transportPolicy: 'force_https',
          host: 'origin.example.com',
          followingRedirect: false,
        },
        modules: {
          loadBalancer: {
            enabled: true,
            config: { method: 'round_robin', maxRetries: 3, connectionTimeout: 60, readWriteTimeout: 120 },
          },
        },
      },
    },
  ],
  applications: [
    {
      name: 'my-app',
      debug: false,
      edgeCacheEnabled: true,
      functionsEnabled: true,
      applicationAcceleratorEnabled: true,
      imageProcessorEnabled: false,
      cache: [
        {
          name: 'my-cache',
          browser: { maxAgeSeconds: 7200 },
          edge: { maxAgeSeconds: 7200 },
          tieredCache: { enabled: true, topology: 'nearest-region' },
          cacheByQueryString: { option: 'denylist', list: ['order', 'user'] },
        },
      ],
      rules: {
        request: [
          {
            name: 'Run the function',
            description: 'Run the function for the API paths',
            criteria: [[{ variable: '${uri}', conditional: 'if', operator: 'matches', argument: '^/api' }]],
            behaviors: [{ type: 'run_function', attributes: { value: 'my-function' } }],
          },
          {
            name: 'Serve from the storage',
            criteria: [[{ variable: '${uri}', conditional: 'if', operator: 'matches', argument: '^/' }]],
            behaviors: [
              { type: 'set_cache_policy', attributes: { value: 'my-cache' } },
              { type: 'set_connector', attributes: { value: 'my-storage-connector' } },
            ],
          },
        ],
        response: [
          {
            name: 'Add a header',
            criteria: [[{ variable: '${status}', conditional: 'if', operator: 'is_equal', argument: '200' }]],
            behaviors: [{ type: 'add_response_header', attributes: { value: 'X-Served-By: azion' } }],
          },
        ],
      },
      functionsInstances: [
        {
          name: 'my-function-instance',
          ref: 'my-function',
          args: { greeting: 'hello' },
        },
      ],
      deviceGroups: [{ name: 'mobile', userAgent: 'Android|iPhone' }],
    },
  ],
  customPages: [
    {
      name: 'my-custom-pages',
      pages: [
        {
          code: '404',
          page: {
            type: 'page_connector',
            attributes: { connector: 'my-storage-connector', ttl: 60, uri: '/404.html', customStatusCode: 404 },
          },
        },
      ],
    },
  ],
  networkList: [
    { name: 'my-ip-allowlist', type: 'ip_cidr', items: ['10.0.0.1/32', '192.168.1.0/24'] },
    { name: 'allowed-countries', type: 'countries', items: ['US', 'BR'] },
  ],
  waf: [
    {
      name: 'my-waf',
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
  firewall: [
    {
      name: 'my-firewall',
      debugRules: false,
      functions: false,
      networkProtection: true,
      waf: true,
      rules: [
        {
          name: 'Allow the trusted networks',
          criteria: [{ variable: 'network', conditional: 'if', operator: 'is_in_list', argument: 'my-ip-allowlist' }],
          behaviors: [{ type: 'bypass' }],
        },
        {
          name: 'Protect with the WAF',
          criteria: [{ variable: 'request_uri', conditional: 'if', operator: 'starts_with', argument: '/admin' }],
          behaviors: [{ type: 'set_waf', attributes: { mode: 'blocking', wafId: 'my-waf' } }],
        },
      ],
    },
  ],
  environments: [
    {
      name: 'production',
      description: 'Production environment',
      deploymentPolicy: 'single_version',
      logVerbosity: 'normal',
      robotsPolicy: 'respect_origin',
    },
  ],
  // the application, firewall and custom page a deployment serves are set by the Azion CLI when it creates the release
  deployments: [
    {
      name: 'my-deployment',
      description: 'Main deployment',
      bindingPolicy: 'FLEXIBLE',
      strategyDefaults: { skewProtection: { enabled: true, defaultTtlSeconds: 3600 } },
    },
  ],
  workloads: [
    {
      name: 'my-workload',
      infrastructure: 1,
      workloadDomainAllowAccess: true,
      tls: { minimumVersion: 'tls_1_3' },
      protocols: {
        http: { versions: ['http1', 'http2', 'http3'], httpPorts: [80], httpsPorts: [443], quicPorts: [443] },
      },
      bindings: [
        {
          environment: 'production',
          deployment: 'my-deployment',
          domains: [{ domain: 'example.com', certificate: null }],
        },
      ],
    },
  ],
  purge: [{ type: 'url', items: ['https://example.com/index.html'], layer: 'cache' }],
};
```

## The manifest

`processConfig` writes the same blocks as v4 (`build`, `functions`, `storage`, `connectors`, `applications`, `firewall`,
`custom_pages`, ...) plus:

- `version: 6`.
- `environments` and `deployments`: the environments and the deployments, with the fields the API requires filled with defaults.
- `workloads[].bindings`: each binding names its environment and deployment in `environment_name` and `deployment_name`.
  The Azion CLI creates both and resolves the names to their IDs.

The v6 `tls.ciphers` is left out of the workload when not set.

## What is not in the v6 config yet

- `kv`.
- `code` and `azion_form` of the functions: the config keeps `path`.
- Rollout, versions and releases: they are operations of the Azion CLI and the API, not part of the config.
