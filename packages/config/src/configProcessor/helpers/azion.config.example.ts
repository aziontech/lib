import type {
  AzionConfig,
  AzionConnector,
  CacheByCookie,
  CacheByQueryString,
  ConnectorDnsResolution,
  ConnectorHttpVersionPolicy,
  ConnectorTransportPolicy,
  ConnectorType,
  CustomPageErrorCode,
  CustomPageType,
  NetworkListType,
  WafSensitivity,
  WafThreatType,
  WorkloadInfrastructure,
  WorkloadMTLSVerification,
  WorkloadTLSCipher,
  WorkloadTLSVersion,
} from 'azion/config';

const config: AzionConfig = {
  build: {
    entry: './src/index.js',
    preset: 'angular', // V4: 'angular' | 'react' | 'next' | 'vue' | 'nuxt' | 'astro' | etc.
    bundler: 'webpack', // V4: 'webpack' | 'esbuild'
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
            maxAgeSeconds: 1000 * 5, // 5000 seconds
          },
          edge: {
            maxAgeSeconds: 1000,
          },
          tieredCache: {
            enabled: true,
            topology: 'global',
          },
          cacheByQueryString: {
            option: 'denylist' as CacheByQueryString,
            list: ['order', 'user'],
          },
          cacheByCookie: {
            option: 'allowlist' as CacheByCookie,
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
                  value: 'mycache', // Using name reference (validated)
                },
              },
              {
                type: 'rewrite_request',
                attributes: {
                  value: '/new/%{captured[1]}',
                },
              },
              {
                type: 'set_cookie',
                attributes: {
                  value: 'user=12345; Path=/; Secure',
                },
              },
              {
                type: 'add_response_header',
                attributes: {
                  value: 'Cache-Control: no-cache',
                },
              },
              {
                type: 'forward_cookies',
              },
            ],
          },
          {
            name: 'staticContentRuleExample',
            description: 'Handle static content by setting a specific origin and delivering directly.',
            active: true,
            criteria: [
              [
                {
                  variable: '${uri}',
                  conditional: 'if',
                  operator: 'matches',
                  argument: '^/_statics/',
                },
              ],
            ],
            behaviors: [
              {
                type: 'set_origin',
                attributes: {
                  value: 123, // Using ID reference (no validation needed)
                },
              },
              {
                type: 'deliver',
              },
            ],
          },
          {
            name: 'computeFunctionRuleExample',
            description: 'Executes a serverless function for compute paths.',
            active: true,
            criteria: [
              [
                {
                  variable: '${uri}',
                  conditional: 'if',
                  operator: 'matches',
                  argument: '^/compute/',
                },
              ],
            ],
            behaviors: [
              {
                type: 'run_function',
                attributes: {
                  value: 'my--function', // Using name reference (validated)
                },
              },
            ],
          },
          {
            name: 'setConnectorExample',
            description: 'Routes traffic through  connector.',
            active: true,
            criteria: [
              [
                {
                  variable: '${uri}',
                  conditional: 'if',
                  operator: 'matches',
                  argument: '^/api/',
                },
              ],
            ],
            behaviors: [
              {
                type: 'set_connector',
                attributes: {
                  value: 'my-http-connector', // Using name reference (validated)
                },
              },
            ],
          },
          {
            name: 'complexCriteriaExample',
            description: 'Example with multiple criteria groups (AND/OR logic).',
            active: true,
            criteria: [
              [
                {
                  variable: '${uri}',
                  conditional: 'if',
                  operator: 'starts_with',
                  argument: '/mobile/',
                },
                {
                  variable: '${device_group}',
                  conditional: 'and',
                  operator: 'is_equal',
                  argument: 'mobile-devices',
                },
              ],
              [
                {
                  variable: '${host}',
                  conditional: 'if',
                  operator: 'is_equal',
                  argument: 'm.example.com',
                },
              ],
            ],
            behaviors: [
              {
                type: 'redirect_to_302',
                attributes: {
                  value: 'https://mobile.example.com${uri}',
                },
              },
            ],
          },
        ],
        response: [
          {
            name: 'apiDataResponseRuleExample',
            description: 'Manage headers, cookies, and GZIP compression for API data responses.',
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
          {
            name: 'securityHeadersExample',
            description: 'Add security headers to responses.',
            active: true,
            criteria: [
              [
                {
                  variable: '${status}',
                  conditional: 'if',
                  operator: 'is_equal',
                  argument: '200',
                },
              ],
            ],
            behaviors: [
              {
                type: 'add_response_header',
                attributes: {
                  value: 'X-Frame-Options: DENY',
                },
              },
              {
                type: 'add_response_header',
                attributes: {
                  value: 'X-Content-Type-Options: nosniff',
                },
              },
              {
                type: 'filter_response_cookie',
                attributes: {
                  value: 'internal_session',
                },
              },
            ],
          },
          {
            name: 'captureGroupsExample',
            description: 'Example using capture groups behavior.',
            active: true,
            criteria: [
              [
                {
                  variable: '${uri}',
                  conditional: 'if',
                  operator: 'matches',
                  argument: '^/capture/(.+)',
                },
              ],
            ],
            behaviors: [
              {
                type: 'capture_match_groups',
                attributes: {
                  regex: '^/capture/(.+)',
                  subject: '${uri}',
                  captured_array: 'captured',
                },
              },
              {
                type: 'add_response_header',
                attributes: {
                  value: 'X-Captured-Path: ${captured[1]}',
                },
              },
            ],
          },
        ],
      },
      deviceGroups: [
        {
          name: 'mobile-devices',
          userAgent: '(Mobile|Android|iPhone|iPad)',
        },
        {
          name: 'desktop-browsers',
          userAgent: '(Chrome|Firefox|Safari).*(?!Mobile)',
        },
      ],
      functionsInstances: [
        {
          name: 'auth-function-instance',
          ref: 'my--function', // Using name reference
          args: {
            environment: 'production',
            apiUrl: 'https://api.example.com',
          },
        },
        {
          name: 'analytics-function-instance',
          ref: 12345, // Using ID reference (no validation needed)
          args: {
            environment: 'production',
            trackingId: 'UA-12345',
          },
        },
      ],
    },
  ],
  connectors: [
    {
      name: 'my-http-connector',
      active: true,
      type: 'http' as ConnectorType,
      attributes: {
        addresses: [
          {
            active: true,
            address: 'api.example.com',
            httpPort: 80,
            httpsPort: 443,
            modules: null,
          },
        ],
        connectionOptions: {
          dnsResolution: 'preserve' as ConnectorDnsResolution,
          transportPolicy: 'preserve' as ConnectorTransportPolicy,
          httpVersionPolicy: 'http1_1' as ConnectorHttpVersionPolicy,
          host: '${host}',
          pathPrefix: '',
          followingRedirect: false,
          realIpHeader: 'X-Real-IP',
          realPortHeader: 'X-Real-PORT',
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
    } as AzionConnector,
    {
      name: 'my-s3-connector',
      active: true,
      type: 'edge_storage' as ConnectorType,
      attributes: {
        bucket: 'my-bucket',
        prefix: '/uploads',
      },
    } as AzionConnector,
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
          bucket: 'my-storage', // Using name reference
          prefix: 'auth-data/',
        },
      },
    },
  ],
  storage: [
    {
      name: 'my-storage',
      edgeAccess: 'read_write', // 'read_only' | 'read_write' | 'restricted'
      dir: './storage',
      prefix: '1236677364374',
    },
  ],
  purge: [
    {
      type: 'url',
      items: ['http://www.example.com/image.jpg'],
      layer: 'cache',
    },
    {
      type: 'cachekey',
      items: ['https://example.com/test1', 'https://example.com/test2'],
      layer: 'cache',
    },
    {
      type: 'wildcard',
      items: ['http://www.example.com/*'],
    },
  ],
  networkList: [
    {
      name: 'my-ip-allowlist',
      type: 'ip_cidr' as NetworkListType,
      items: ['10.0.0.1/32', '192.168.1.0/24'],
      active: true,
    },
    {
      name: 'trusted-asn-list',
      type: 'asn' as NetworkListType,
      items: ['123', '456', '789'],
      active: true,
    },
    {
      name: 'allowed-countries',
      type: 'countries' as NetworkListType,
      items: ['US', 'BR', 'UK'],
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
            { threat: 'sql_injection' as WafThreatType, sensitivity: 'high' as WafSensitivity },
            { threat: 'cross_site_scripting' as WafThreatType, sensitivity: 'high' as WafSensitivity },
            { threat: 'remote_file_inclusion' as WafThreatType, sensitivity: 'medium' as WafSensitivity },
            { threat: 'directory_traversal' as WafThreatType, sensitivity: 'low' as WafSensitivity },
            { threat: 'evading_tricks' as WafThreatType, sensitivity: 'medium' as WafSensitivity },
            { threat: 'file_upload' as WafThreatType, sensitivity: 'low' as WafSensitivity },
            { threat: 'unwanted_access' as WafThreatType, sensitivity: 'high' as WafSensitivity },
            { threat: 'identified_attack' as WafThreatType, sensitivity: 'medium' as WafSensitivity },
          ],
        },
      },
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
        {
          name: 'customResponse_Only',
          active: true,
          match: '^/custom-error/',
          behavior: {
            setCustomResponse: {
              statusCode: 403,
              contentType: 'application/json',
              contentBody: '{"error": "Custom error response"}',
            },
          },
        },
      ],
    },
  ],
  workloads: [
    {
      name: 'my-production-workload',
      active: true,
      infrastructure: 1 as WorkloadInfrastructure, // Production Infrastructure
      domains: ['example.com', 'www.example.com'],
      workloadDomainAllowAccess: true,
      tls: {
        certificate: 12345,
        ciphers: 1 as WorkloadTLSCipher, // TLS cipher suite 1
        minimumVersion: 'tls_1_3' as WorkloadTLSVersion,
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
        verification: 'enforce' as WorkloadMTLSVerification,
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
              application: 'my--app', // Reference to  application name
              firewall: 'my--firewall', // Reference to  firewall name
              customPage: 'my-custom-error-pages', // Reference to custom page name
            },
          },
        },
        {
          name: 'staging-deployment',
          current: false,
          active: true,
          strategy: {
            type: 'default',
            attributes: {
              application: 67890, // Using ID reference (no validation needed)
              firewall: null, // No firewall for staging
              customPage: null,
            },
          },
        },
      ],
    },
  ],
  customPages: [
    {
      name: 'my-custom-error-pages',
      active: true,
      pages: [
        {
          code: '404' as CustomPageErrorCode,
          page: {
            type: 'page_connector' as CustomPageType,
            attributes: {
              connector: 'my--connector', // Using name reference
              ttl: 3600,
              uri: '/errors/404.html',
              customStatusCode: 404,
            },
          },
        },
        {
          code: '500' as CustomPageErrorCode,
          page: {
            type: 'page_connector' as CustomPageType,
            attributes: {
              connector: 12345, // Using ID reference (no validation needed)
              ttl: 0,
              uri: '/errors/500.html',
              customStatusCode: null,
            },
          },
        },
        {
          code: 'default' as CustomPageErrorCode,
          page: {
            attributes: {
              connector: 'my--connector',
              ttl: 1800,
              uri: '/errors/default.html',
              customStatusCode: null,
            },
          },
        },
      ],
    },
  ],
};

export default config;
