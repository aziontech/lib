export default {
  build: {
    entry: './src/index.js',
    preset: {
      name: 'angular',
    },
    bundler: 'webpack', // V4: 'webpack' | 'esbuild'
  },
  // V4: Edge Applications com estrutura modules
  edgeApplications: [
    {
      name: 'my-edge-app',
      active: true,
      debug: false,
      // V4: Módulos com enabled em vez de *Enabled
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
    },
  ],
  // V4: Edge Connectors com estrutura attributes
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
  // V4: Edge Functions
  edgeFunctions: [
    {
      name: 'my-edge-function',
      path: './functions/index.js',
      args: {
        environment: 'production',
      },
    },
  ],
  // V4: Edge Storage
  edgeStorage: [
    {
      name: 'my-storage',
      edgeAccess: 'read_write', // 'read_only' | 'read_write' | 'restricted'
      dir: './storage',
    },
  ],
  // V4: Purge
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
  // V4: Network Lists
  networkList: [
    {
      id: 1,
      listType: 'ip_cidr',
      listContent: ['10.0.0.1'],
    },
    {
      id: 2,
      listType: 'asn',
      listContent: [123, 456, 789],
    },
    {
      id: 3,
      listType: 'countries',
      listContent: ['US', 'BR', 'UK'],
    },
  ],
  // V4: WAF
  waf: [
    {
      id: 123,
      name: 'my_waf',
      active: true,
      mode: 'blocking', // 'learning', 'blocking' or 'counting'
      sqlInjection: {
        sensitivity: 'high', // 'low', 'medium', 'high'
      },
      remoteFileInclusion: {
        sensitivity: 'medium',
      },
      directoryTraversal: {
        sensitivity: 'low',
      },
      crossSiteScripting: {
        sensitivity: 'high',
      },
      evadingTricks: {
        sensitivity: 'medium',
      },
      fileUpload: {
        sensitivity: 'low',
      },
      unwantedAccess: {
        sensitivity: 'high',
      },
      identifiedAttack: {
        sensitivity: 'medium',
      },
      bypassAddresses: ['10.0.0.1'],
    },
  ],
  // V4: Edge Firewall
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
};
