import type {
  AzionConfig,
  CacheByCookie,
  CacheByQueryString,
  CustomPageErrorCode,
  CustomPageType,
  EdgeConnectorDnsResolution,
  EdgeConnectorHmacType,
  EdgeConnectorHttpVersionPolicy,
  EdgeConnectorLoadBalanceMethod,
  EdgeConnectorTransportPolicy,
  EdgeConnectorType,
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
  edgeApplications: [
    {
      name: 'my-edge-app',
      active: true,
      debug: false,
      edgeCacheEnabled: true,
      edgeFunctionsEnabled: false,
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
            maxAgeSeconds: 1000 * 5, // 5000 seconds
          },
          edge: {
            maxAgeSeconds: 1000,
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
                  variable: 'uri',
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
                  cookie_name: 'user',
                  cookie_value: '12345; Path=/; Secure',
                },
              },
              {
                type: 'add_response_header',
                attributes: {
                  header_name: 'Cache-Control',
                  header_value: 'no-cache',
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
                  variable: 'uri',
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
                  variable: 'uri',
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
                  value: 'my-edge-function', // Using name reference (validated)
                },
              },
            ],
          },
          {
            name: 'setEdgeConnectorExample',
            description: 'Routes traffic through edge connector.',
            active: true,
            criteria: [
              [
                {
                  variable: 'uri',
                  conditional: 'if',
                  operator: 'matches',
                  argument: '^/api/',
                },
              ],
            ],
            behaviors: [
              {
                type: 'set_edge_connector',
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
                  variable: 'uri',
                  conditional: 'if',
                  operator: 'starts_with',
                  argument: '/mobile/',
                },
                {
                  variable: 'device_group',
                  conditional: 'and',
                  operator: 'is_equal',
                  argument: 'mobile-devices',
                },
              ],
              [
                {
                  variable: 'host',
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
                  variable: 'uri',
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
                  header_name: 'Content-Type',
                  header_value: 'application/json',
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
                  variable: 'status',
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
                  header_name: 'X-Frame-Options',
                  header_value: 'DENY',
                },
              },
              {
                type: 'add_response_header',
                attributes: {
                  header_name: 'X-Content-Type-Options',
                  header_value: 'nosniff',
                },
              },
              {
                type: 'filter_response_cookie',
                attributes: {
                  cookie_name: 'internal_session',
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
                  variable: 'uri',
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
                  header_name: 'X-Captured-Path',
                  header_value: '${captured[1]}',
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
      functions: [
        {
          name: 'auth-function-instance',
          ref: 'my-edge-function', // Using name reference
          args: {
            environment: 'production',
            apiUrl: 'https://api.example.com',
          },
          bindings: {
            storage: {
              bucket: 'my-storage', // Using name reference
              prefix: 'auth-data/',
            },
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
  edgeConnectors: [
    {
      name: 'my-http-connector',
      active: true,
      type: 'http' as EdgeConnectorType,
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
          dnsResolution: 'preserve' as EdgeConnectorDnsResolution,
          transportPolicy: 'preserve' as EdgeConnectorTransportPolicy,
          httpVersionPolicy: 'http1_1' as EdgeConnectorHttpVersionPolicy,
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
    },
    {
      name: 'my-s3-connector',
      active: true,
      type: 'edge_storage' as EdgeConnectorType,
      attributes: {
        addresses: [
          {
            active: true,
            address: 's3.amazonaws.com',
            httpPort: 80,
            httpsPort: 443,
            modules: null,
          },
        ],
        connectionOptions: {
          dnsResolution: 'preserve',
          transportPolicy: 'force_https' as EdgeConnectorTransportPolicy,
          httpVersionPolicy: 'http1_1',
          host: 'my-bucket.s3.amazonaws.com',
          pathPrefix: '/uploads',
          followingRedirect: false,
          realIpHeader: 'X-Real-IP',
          realPortHeader: 'X-Real-PORT',
        },
        modules: {
          loadBalancer: {
            enabled: true,
            config: {
              method: 'round_robin' as EdgeConnectorLoadBalanceMethod,
              maxRetries: 3,
              connectionTimeout: 60,
              readWriteTimeout: 120,
            },
          },
          originShield: {
            enabled: true,
            config: {
              originIpAcl: {
                enabled: false,
              },
              hmac: {
                enabled: true,
                config: {
                  type: 'aws4_hmac_sha256' as EdgeConnectorHmacType,
                  attributes: {
                    region: 'us-east-1',
                    service: 's3',
                    accessKey: 'YOUR_ACCESS_KEY',
                    secretKey: 'YOUR_SECRET_KEY',
                  },
                },
              },
            },
          },
        },
      },
    },
  ],
  edgeFunctions: [
    {
      name: 'my-edge-function',
      path: './functions/index.js',
      runtime: 'azion_js',
      defaultArgs: {
        defaultEnv: 'development',
      },
      executionEnvironment: 'application',
      active: true,
    },
  ],
  edgeStorage: [
    {
      name: 'my-storage',
      edgeAccess: 'read_write', // 'read_only' | 'read_write' | 'restricted'
      dir: './storage',
    },
  ],
  purge: [
    {
      type: 'url',
      items: ['http://www.example.com/image.jpg'],
    },
    {
      type: 'cachekey',
      items: ['https://example.com/test1', 'https://example.com/test2'],
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
  edgeFirewall: [
    {
      name: 'my_edge_firewall',
      domains: ['www.example.com', 'api.example.com'],
      active: true,
      edgeFunctions: true,
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
              edgeApplication: 'my-edge-app', // Reference to edge application name
              edgeFirewall: 'my-edge-firewall', // Reference to edge firewall name
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
              edgeApplication: 67890, // Using ID reference (no validation needed)
              edgeFirewall: null, // No firewall for staging
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
              connector: 'my-edge-connector', // Using name reference
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
              connector: 'my-edge-connector',
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
