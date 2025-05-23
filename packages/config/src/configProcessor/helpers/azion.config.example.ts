export default {
  build: {
    entry: './src/index.js',
    preset: {
      name: 'angular',
    },
  },
  domain: {
    name: 'my_domain',
    cnameAccessOnly: false, // Optional, defaults to false
    cnames: ['www.example.com'], // Optional
    edgeApplicationId: 12345, // Optional
    edgeFirewallId: 12345, // Optional
    digitalCertificateId: 'lets_encrypt', // 'lets_encrypt' or null
    mtls: {
      verification: 'enforce', // 'enforce' or 'permissive'
      trustedCaCertificateId: 12345,
      crlList: [111, 222],
    }, // Optional
  },
  origin: [
    {
      id: 123, // Optional. ID of your origin. Obtain this value via GET request. Cannot be changed via API.
      key: 'myorigin', // Optional. Key of your origin. Obtain this value via GET request. Cannot be changed via API.
      name: 'myneworigin', // Required
      type: 'single_origin', // Required. single_origin, load_balancer, object_storage, live_ingest. Defaults to single_origin if not provided
      path: '', // Optional. Default '' if not provided
      addresses: [
        // Required for single_origin, load_balancer, live_ingest. Optional for object_storage
        // or addresses: ['http.bin.org']
        {
          address: 'http.bin.org',
          weight: 1, // Optional. Assign a number from 1 to 10 to determine how much traffic a server can handle.
        },
      ],
      protocolPolicy: 'preserve', // Optional. preserve, https, http. Defaults to preserve if not provided
      hostHeader: '${host}', // Defaults to '${host}' if not provided
      connectionTimeout: 60, // Optional. Default 60 if not provided
      timeoutBetweenBytes: 120, // Optional. Default 120 if not provided
      redirection: false, // Optional. Default false if not provided
      hmac: {
        region: 'us-east-1', // Required for hmac
        accessKey: 'myaccesskey', // Required for hmac
        secretKey: 'secretKey', // Required for hmac
      }, // Optional
    },
    {
      id: 456, // Optional. ID of your origin. Obtain this value via GET request. Cannot be changed via API.
      key: 'myorigin', // Optional. Key of your origin. Obtain this value via GET request. Cannot be changed via API.
      name: 'myneworigin', // Required
      type: 'object_storage', // Required. single_origin, load_balancer, object_storage, live_ingest. Defaults to single_origin if not provided
      bucket: 'blue-courage', // Required for object_storage
      prefix: '0101010101001', // Optional. Default '' if not provided
    },
  ],
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
        option: 'blacklist', // ['blacklist', 'whitelist', 'varies', 'ignore]
        list: ['order', 'user'],
      },
      cacheByCookie: {
        option: 'whitelist', // ['blacklist', 'whitelist', 'varies', 'ignore]
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
        variable: 'uri', // Optional, defaults to 'uri' if not provided
        match: '^/rewrite$',
        behavior: {
          setCache: 'mycache1',
          rewrite: `/new/%{captured[1]}`, // Rewrites /original/image.jpg to /new/image.jpg
          setCookie: 'user=12345; Path=/; Secure',
          setHeaders: 'Cache-Control: no-cache',
          forwardCookies: true,
        },
      },
      {
        name: 'staticContentRuleExample',
        description: 'Handle static content by setting a specific origin and delivering directly.',
        active: true,
        variable: 'uri', // Optional, defaults to 'uri' if not provided
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
        variable: 'uri', // Optional, defaults to 'uri' if not provided
        match: '^/compute/',
        behavior: {
          runFunction: 'function_name',
        },
      },
      {
        name: 'permanentRedirectRuleExample',
        description: 'Permanently redirects from an old URL to a new URL.',
        active: true,
        variable: 'uri', // Optional, defaults to 'uri' if not provided
        match: '^/old-url$',
        behavior: {
          redirectTo301: 'https://newsite.com/new-url',
        },
      },
      {
        name: 'gzipCompressionRuleExample',
        description: 'Enables GZIP compression for specified paths.',
        active: true,
        variable: 'uri', // Optional, defaults to 'uri' if not provided
        match: '^/compress',
        behavior: {
          enableGZIP: true,
        },
      },
      {
        name: 'apiHeaderRuleExample',
        description: 'Sets multiple headers for API responses.',
        active: true,
        variable: 'uri', // Optional, defaults to 'uri' if not provided
        match: '^/api',
        behavior: {
          setHeaders: ['X-API-Version: 1', 'X-Frame-Options: deny'],
        },
      },
      {
        name: 'cookieSettingRuleExample',
        description: 'Sets a secure, HttpOnly cookie.',
        active: true,
        variable: 'uri', // Optional, defaults to 'uri' if not provided
        match: '^/check',
        behavior: {
          setCookie: 'test=12345; Path=/; Secure; HttpOnly',
        },
      },
      {
        name: 'userCaptureRuleExample',
        description: 'Captures user ID from the URL using regex.',
        active: true,
        variable: 'uri', // Optional, defaults to 'uri' if not provided
        match: '^/user/(.*)',
        behavior: {
          capture: {
            regex: '^(.*)$',
            captured: 'user_id',
            subject: 'uri',
          },
        },
      },
      {
        name: 'directCacheRuleExample',
        description: 'Directly sets caching policies within the rule.',
        active: true,
        variable: 'uri', // Optional, defaults to 'uri' if not provided
        match: '^/some-path',
        behavior: {
          setCache: {
            name: 'dynamicCache',
            stale: true,
            queryStringSort: true,
            methods: {
              post: true,
              options: true,
            },
            browser: {
              maxAgeSeconds: 3600, // 1 hour
            },
            edge: {
              maxAgeSeconds: 600, // 10 minutes
            },
          },
        },
      },
      {
        name: 'bypassCacheRuleExample',
        description: 'Ensures data is always fetched fresh, bypassing any cache.',
        active: true,
        variable: 'uri', // Optional, defaults to 'uri' if not provided
        match: '^/bypass',
        behavior: {
          bypassCache: true,
        },
      },
      {
        name: 'forceHttpsRuleExample',
        description: 'Redirects HTTP requests to HTTPS for secure areas.',
        active: true,
        variable: 'uri', // Optional, defaults to 'uri' if not provided
        match: '^/secure-area',
        behavior: {
          httpToHttps: true,
        },
      },
      {
        name: 'UriRedirectExample',
        description: 'Uses the captured path as part of the new URL.',
        active: true,
        match: '.*', // Captures all URIs
        variable: 'uri', // Defines the variable to be captured
        behavior: {
          capture: {
            match: '^(.*)$', // Captures the entire URI path
            captured: 'uri_path', // Name of the variable where the captured path will be stored
            subject: 'uri', // Indicates that the capture will be made on the 'uri' variable
          },
          redirectTo302: `https://example.com/%{uri_path}`, // Uses the captured path as part of the new URL
          filterCookie: 'original_uri_cookie', // Removes the original cookie to avoid conflicts or duplicate information
        },
      },
      {
        name: 'FilterCookieRuleExample and FilterHeaderRuleExample',
        description: 'Filters out a specific cookie from the request.',
        active: true,
        criteria: [
          {
            variable: '${uri}',
            operator: 'matches',
            conditional: 'if',
            inputValue: '^/',
          },
        ],
        behavior: {
          filterCookie: 'cookie_name',
          filterHeader: 'header_name',
        },
      },
      {
        name: 'Test behavior noContent',
        active: true,
        description: 'Test behavior noContent',
        criteria: [
          {
            variable: '${uri}',
            operator: 'matches',
            conditional: 'if',
            inputValue: '^/',
          },
        ],
        behavior: {
          noContent: true,
        },
      },
      {
        name: 'Example Deny',
        active: true,
        description: 'Test behavior deny',
        criteria: [
          {
            variable: '${uri}',
            operator: 'matches',
            conditional: 'if',
            inputValue: '^/login',
          },
        ],
        behavior: {
          deny: true,
        },
      },
    ],
    response: [
      {
        name: 'apiDataResponseRuleExample',
        description: 'Manage headers, cookies, and GZIP compression for API data responses.',
        active: true,
        variable: 'uri', // Optional, defaults to 'uri' if not provided
        match: '^/api/data',
        behavior: {
          setHeaders: 'Content-Type: application/json',
          setCookie: 'session=abcdef; Path=/; HttpOnly',
          filterHeader: 'Server',
          filterCookie: 'tracking',
          enableGZIP: true,
        },
      },
      {
        name: 'userProfileRedirectRuleExample',
        description: 'Redirects user profile requests to a new profile page URL.',
        active: true,
        variable: 'uri', // Optional, defaults to 'uri' if not provided
        match: '^/user/profile',
        behavior: {
          redirectTo301: 'https://newsite.com/profile',
        },
      },
      {
        name: 'computeResultFunctionRuleExample',
        description: 'Runs a function and captures full path from the URI for compute results.',
        active: true,
        variable: 'uri', // Optional, defaults to 'uri' if not provided
        match: '^/compute-result',
        behavior: {
          runFunction: 'function_name',
          // This rule captures the full URI path and stores it in a variable named 'full_path_arr'.
          capture: {
            match: '^(.*)$', // The regular expression '^(.*)$' captures the entire URI path.
            captured: 'full_path_arr', // The result of the capture is stored in the variable 'full_path_arr'.
            subject: 'uri', // The capture is based on the value of the 'uri' variable.
          },
          // Permanently redirects to the first element captured in 'full_path_arr'.
          redirectTo301: '%{full_path_arr[0]}', // Uses the first element of the 'full_path_arr' array as part of the new URL.
        },
      },
      {
        name: 'userProfileRedirectRuleExample',
        description: 'Redirects user profile requests based on cookie value.',
        active: true,
        // eslint-disable-next-line no-template-curly-in-string
        variable: 'cookie_name', // Example using cookie value
        match: '^user-profile$', // Matches based on the cookie value
        behavior: {
          redirectTo301: 'https://newsite.com/profile',
        },
      },
      {
        name: 'temporaryPageRedirectRuleExample',
        description: 'Temporarily redirects an old page based on query parameters.',
        active: true,
        // eslint-disable-next-line no-template-curly-in-string
        variable: 'args', // All query parameters
        match: '^old-page$', // Matches based on the presence of specific query parameters
        behavior: {
          redirectTo302: 'https://newsite.com/new-page',
        },
      },
      {
        name: 'Test behavior noContent',
        active: true,
        description: 'Test behavior noContent',
        criteria: [
          {
            variable: '${uri}',
            operator: 'matches',
            conditional: 'if',
            inputValue: '^/',
          },
        ],
        behavior: {
          noContent: true,
        },
      },
      {
        name: 'Test behavior deliver',
        active: true,
        description: 'Test behavior deliver',
        criteria: [
          {
            variable: '${uri}',
            operator: 'matches',
            conditional: 'if',
            inputValue: '^/',
          },
        ],
        behavior: {
          deliver: true,
        },
      },
    ],
  },
  purge: [
    {
      type: 'url',
      urls: ['http://www.example.com/image.jpg'],
    },
    {
      type: 'cachekey',
      urls: ['https://example.com/test1', 'https://example.com/test2'],
      method: 'delete',
    },
    {
      type: 'wildcard',
      urls: ['http://www.example.com/*'],
    },
  ],
  firewall: {
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
            // Behavior final - nada após isso será executado
            statusCode: 403,
            contentType: 'application/json',
            contentBody: '{"error": "Custom error response"}',
          },
        },
      },
      {
        name: 'setHeaders_Then_CustomResponse',
        active: true,
        match: '^/api/error/',
        behavior: {
          setCustomResponse: {
            // Behavior final - nada após isso será executado
            statusCode: 403,
            contentType: 'application/json',
            contentBody: '{"error": "Access denied"}',
          },
        },
      },
      {
        name: 'run_edge_function_and_set_rate_limit',
        active: true,
        match: '^/api/',
        behavior: {
          runFunction: 'function_name',
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
  waf: [
    {
      id: 123, // Optional. ID of your WAF. Obtain this value via GET request. Cannot be changed via API.
      name: 'my_waf', // Required for WAF configuration
      active: true, // Required to enable the WAF or false to disable
      mode: 'blocking', // 'learning', 'blocking' or 'counting'
      sqlInjection: {
        // sqlInjection is optional.
        sensitivity: 'high', // Select the protection sensibility level for this threat family (low, medium, high)
      },
      remoteFileInclusion: {
        // remoteFileInclusion is optional.
        sensitivity: 'medium', // Select the protection sensibility level for this threat family (low, medium, high)
      },
      directoryTraversal: {
        // directoryTraversal is optional.
        sensitivity: 'low', // Select the protection sensibility level for this threat family (low, medium, high)
      },
      crossSiteScripting: {
        // crossSiteScripting is optional.
        sensitivity: 'high', // Select the protection sensibility level for this threat family (low, medium, high)
      },
      evadingTricks: {
        // evadingTricks is optional.
        sensitivity: 'medium', // Select the protection sensibility level for this threat family (low, medium, high)
      },
      fileUpload: {
        // fileUpload is optional.
        sensitivity: 'low', // Select the protection sensibility level for this threat family (low, medium, high)
      },
      unwantedAccess: {
        // unwantedAccess is optional.
        sensitivity: 'high', // Select the protection sensibility level for this threat family (low, medium, high)
      },
      identifiedAttack: {
        // identifiedAttack is optional.
        sensitivity: 'medium', // Select the protection sensibility level for this threat family (low, medium, high)
      },
      bypassAddresses: ['10.0.0.1'], // Optional. Define trusted IP/CIDR addresses
    },
  ],
};
