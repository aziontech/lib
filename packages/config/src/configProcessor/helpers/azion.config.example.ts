export default {
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
            option: 'denylist', // V4: ['denylist', 'allowlist', 'all', 'ignore']
            list: ['order', 'user'],
          },
          cacheByCookie: {
            option: 'allowlist', // V4: ['denylist', 'allowlist', 'all', 'ignore']
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
            variable: 'uri',
            match: '^/rewrite$',
            behavior: {
              setCache: 'mycache',
              rewrite: `/new/%{captured[1]}`,
              setCookie: 'user=12345; Path=/; Secure',
              setHeaders: ['Cache-Control: no-cache'],
              forwardCookies: true,
            },
          },
          {
            name: 'staticContentRuleExample',
            description: 'Handle static content by setting a specific origin and delivering directly.',
            active: true,
            variable: 'uri',
            match: '^/_statics/',
            behavior: {
              setOrigin: {
                name: 'myneworigin',
                type: 'object_storage',
              },
              deliver: true,
            },
          },
          {
            name: 'computeFunctionRuleExample',
            description: 'Executes a serverless function for compute paths.',
            active: true,
            variable: 'uri',
            match: '^/compute/',
            behavior: {
              runFunction: 'function_name',
            },
          },
          {
            name: 'setEdgeConnectorExample',
            description: 'Routes traffic through edge connector.',
            active: true,
            variable: 'uri',
            match: '^/api/',
            behavior: {
              setEdgeConnector: 'my-http-connector',
            },
          },
        ],
        response: [
          {
            name: 'apiDataResponseRuleExample',
            description: 'Manage headers, cookies, and GZIP compression for API data responses.',
            active: true,
            variable: 'uri',
            match: '^/api/data',
            behavior: {
              setHeaders: ['Content-Type: application/json'],
              enableGZIP: true,
            },
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
      type: 'http',
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
          dnsResolution: 'preserve', // 'preserve' | 'force_ipv4' | 'force_ipv6'
          transportPolicy: 'preserve', // 'preserve' | 'force_https' | 'force_http'
          httpVersionPolicy: 'http1_1', // 'http1_1'
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
      type: 'edge_storage',
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
          transportPolicy: 'force_https',
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
              method: 'round_robin', // 'round_robin' | 'least_conn' | 'ip_hash'
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
                  type: 'aws4_hmac_sha256',
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
      type: 'ip_cidr',
      items: ['10.0.0.1/32', '192.168.1.0/24'],
      active: true,
    },
    {
      name: 'trusted-asn-list',
      type: 'asn',
      items: ['123', '456', '789'],
      active: true,
    },
    {
      name: 'allowed-countries',
      type: 'countries',
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
            { threat: 'sql_injection', sensitivity: 'high' },
            { threat: 'cross_site_scripting', sensitivity: 'high' },
            { threat: 'remote_file_inclusion', sensitivity: 'medium' },
            { threat: 'directory_traversal', sensitivity: 'low' },
            { threat: 'evading_tricks', sensitivity: 'medium' },
            { threat: 'file_upload', sensitivity: 'low' },
            { threat: 'unwanted_access', sensitivity: 'high' },
            { threat: 'identified_attack', sensitivity: 'medium' },
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
      infrastructure: 1, // Production Infrastructure
      domains: ['example.com', 'www.example.com'],
      workloadDomainAllowAccess: true,
      tls: {
        certificate: 12345,
        ciphers: 1, // TLS cipher suite 1
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
              edgeApplication: 'my-edge-app', // Reference to edge application name
              edgeFirewall: 'my-edge-firewall', // Reference to edge firewall name
              customPage: null, // To be implemented later
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
};
