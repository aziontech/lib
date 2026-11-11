import type { AzionConfigV6 } from '@aziontech/config';

/**
 * Complete example of an azion.config for the Azion API v6.
 * It uses every resource the v6 config has. Names reference each other (the Azion CLI resolves them to IDs), and an
 * ID can be used instead of a name where the API takes one.
 */
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

export default config;
