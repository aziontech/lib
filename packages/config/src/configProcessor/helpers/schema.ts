import {
  ALL_REQUEST_VARIABLES,
  ALL_RESPONSE_VARIABLES,
  BUILD_BUNDLERS,
  DYNAMIC_VARIABLE_PATTERNS,
  EDGE_ACCESS_TYPES,
  EDGE_CONNECTOR_DNS_RESOLUTION,
  EDGE_CONNECTOR_HMAC_TYPE,
  EDGE_CONNECTOR_HTTP_VERSION_POLICY,
  EDGE_CONNECTOR_LOAD_BALANCE_METHOD,
  EDGE_CONNECTOR_TRANSPORT_POLICY,
  EDGE_CONNECTOR_TYPES,
  FIREWALL_RATE_LIMIT_BY,
  FIREWALL_RATE_LIMIT_TYPES,
  FIREWALL_VARIABLES,
  FIREWALL_WAF_MODES,
  NETWORK_LIST_TYPES,
  RULE_CONDITIONALS,
  RULE_OPERATORS_WITH_VALUE,
  RULE_OPERATORS_WITHOUT_VALUE,
  RULE_VARIABLES,
  SPECIAL_VARIABLES,
  WORKLOAD_HTTP_VERSIONS,
  WORKLOAD_MTLS_VERIFICATION,
  WORKLOAD_TLS_VERSIONS,
} from '../../constants';

const criteriaBaseSchema = {
  type: 'object',
  properties: {
    variable: {
      type: 'string',
      anyOf: [
        {
          // static variables validation
          type: 'string',
          pattern: '^\\$\\{(' + RULE_VARIABLES.join('|') + ')\\}$',
        },
        {
          // dynamic variables validation
          type: 'string',
          pattern: '^\\$\\{(' + DYNAMIC_VARIABLE_PATTERNS.join('|').replace(/\$/g, '\\$') + ')\\}$',
        },
      ],
      errorMessage:
        "The 'variable' field must be wrapped in ${} and be either a valid static variable or follow the dynamic patterns (arg_*, cookie_*, http_*, sent_http_*, upstream_cookie_*, upstream_http_*)",
    },
    conditional: {
      type: 'string',
      enum: RULE_CONDITIONALS,
      errorMessage: `The 'conditional' field must be one of: ${RULE_CONDITIONALS.join(', ')}`,
    },
    operator: {
      type: 'string',
      enum: [...RULE_OPERATORS_WITH_VALUE, ...RULE_OPERATORS_WITHOUT_VALUE],
      errorMessage: `The 'operator' field must be one of: ${[...RULE_OPERATORS_WITH_VALUE, ...RULE_OPERATORS_WITHOUT_VALUE].join(', ')}`,
    },
  },
  required: ['variable', 'conditional', 'operator'],
  allOf: [
    {
      if: {
        properties: {
          operator: { enum: RULE_OPERATORS_WITH_VALUE },
        },
      },
      then: {
        required: ['argument'],
        properties: {
          argument: {
            type: 'string',
            errorMessage: "The 'argument' field must be a string",
          },
        },
      },
    },
    {
      if: {
        properties: {
          operator: { enum: RULE_OPERATORS_WITHOUT_VALUE },
        },
      },
      then: {
        not: {
          required: ['argument'],
        },
      },
    },
  ],
};

const createVariableValidation = (isRequestPhase = false) => ({
  type: 'string',
  anyOf: [
    {
      // static variables
      enum: [...new Set(isRequestPhase ? ALL_REQUEST_VARIABLES : ALL_RESPONSE_VARIABLES)],
      errorMessage: "The 'variable' field must be a valid variable",
    },
    {
      // variables with ${}
      type: 'string',
      pattern:
        '^\\$\\{(' + [...new Set(isRequestPhase ? ALL_REQUEST_VARIABLES : ALL_RESPONSE_VARIABLES)].join('|') + ')\\}$',
      errorMessage: "The 'variable' field must be a valid variable wrapped in ${}",
    },
    {
      // dynamic pattern
      type: 'string',
      pattern: isRequestPhase
        ? '^(arg_|cookie_|http_)[a-zA-Z0-9_]+$'
        : '^(arg_|cookie_|http_|sent_http_|upstream_cookie_|upstream_http_)[a-zA-Z0-9_]+$',
    },
    {
      // dynamic pattern with ${}
      type: 'string',
      pattern: isRequestPhase
        ? '^\\$\\{(arg_|cookie_|http_)[a-zA-Z0-9_]+\\}$'
        : '^\\$\\{(arg_|cookie_|http_|sent_http_|upstream_cookie_|upstream_http_)[a-zA-Z0-9_]+\\}$',
    },
    {
      // special variables with arguments
      type: 'string',
      pattern: `^(${SPECIAL_VARIABLES.join('|')})\\([^)]+\\)$`,
    },
  ],
  errorMessage: isRequestPhase
    ? "The 'variable' field must be either a valid request phase variable, mTLS variable, follow the patterns (arg_*, cookie_*, http_*), or be a special function variable (cookie_time_offset, encode_base64)"
    : "The 'variable' field must be either a valid response phase variable, follow the patterns (arg_*, cookie_*, http_*, sent_http_*, upstream_cookie_*, upstream_http_*), or be a special function variable (cookie_time_offset, encode_base64)",
});

const createRuleSchema = (isRequestPhase = false) => ({
  type: 'object',
  properties: {
    name: {
      type: 'string',
      errorMessage: "The 'name' field must be a string",
    },
    description: {
      type: 'string',
      errorMessage: "The 'description' field must be a string",
    },
    active: {
      type: 'boolean',
      errorMessage: "The 'active' field must be a boolean",
    },
    match: {
      type: 'string',
      errorMessage: "The 'match' field must be a string",
    },
    variable: createVariableValidation(isRequestPhase),
    criteria: {
      type: 'array',
      items: criteriaBaseSchema,
      errorMessage: {
        type: 'Each criteria item must follow the criteria format',
      },
    },
    behavior: {
      type: 'object',
      properties: {
        setEdgeConnector: {
          type: 'string',
          errorMessage: "The 'setEdgeConnector' field must be a string.",
        },
        rewrite: {
          type: 'string',
          errorMessage: "The 'rewrite' field must be a string.",
        },
        setHeaders: {
          type: 'array',
          items: {
            type: 'string',
            errorMessage: "Each item in 'setHeaders' must be a string.",
          },
          errorMessage: {
            type: "The 'setHeaders' field must be an array of strings.",
          },
        },
        bypassCache: {
          type: ['boolean', 'null'],
          errorMessage: "The 'bypassCache' field must be a boolean or null.",
        },
        httpToHttps: {
          type: ['boolean', 'null'],
          errorMessage: "The 'httpToHttps' field must be a boolean or null.",
        },
        redirectTo301: {
          type: ['string', 'null'],
          errorMessage: "The 'redirectTo301' field must be a string or null.",
        },
        redirectTo302: {
          type: ['string', 'null'],
          errorMessage: "The 'redirectTo302' field must be a string or null.",
        },
        forwardCookies: {
          type: ['boolean', 'null'],
          errorMessage: "The 'forwardCookies' field must be a boolean or null.",
        },
        setCookie: {
          type: ['string', 'null'],
          errorMessage: "The 'setCookie' field must be a string or null.",
        },
        deliver: {
          type: ['boolean', 'null'],
          errorMessage: "The 'deliver' field must be a boolean or null.",
        },
        capture: {
          type: 'object',
          properties: {
            match: {
              type: 'string',
              errorMessage: "The 'match' field must be a string.",
            },
            captured: {
              type: 'string',
              errorMessage: "The 'captured' field must be a string.",
            },
            subject: {
              type: 'string',
              errorMessage: "The 'subject' field must be a string.",
            },
          },
          required: ['match', 'captured', 'subject'],
          additionalProperties: false,
          errorMessage: {
            additionalProperties: "No additional properties are allowed in the 'capture' object.",
            required: "All properties ('match', 'captured', 'subject') are required in the 'capture' object.",
          },
        },
        runFunction: {
          type: 'string',
          errorMessage: "The 'runFunction' behavior must be a string",
        },
        setWafRuleset: {
          type: 'object',
          properties: {
            wafMode: {
              type: 'string',
              enum: FIREWALL_WAF_MODES,
              errorMessage: `The wafMode must be one of: ${FIREWALL_WAF_MODES.join(', ')}`,
            },
            wafId: {
              type: 'string',
              errorMessage: 'The wafId must be a string',
            },
          },
          required: ['wafMode', 'wafId'],
          additionalProperties: false,
          errorMessage: {
            additionalProperties: 'No additional properties are allowed in the setWafRuleset object',
            required: "Both 'wafMode' and 'wafId' fields are required in setWafRuleset",
          },
        },
        setRateLimit: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: FIREWALL_RATE_LIMIT_TYPES,
              errorMessage: `The rate limit type must be one of: ${FIREWALL_RATE_LIMIT_TYPES.join(', ')}`,
            },
            limitBy: {
              type: 'string',
              enum: FIREWALL_RATE_LIMIT_BY,
              errorMessage: `The rate limit must be applied by one of: ${FIREWALL_RATE_LIMIT_BY.join(', ')}`,
            },
            averageRateLimit: {
              type: 'string',
              errorMessage: 'The averageRateLimit must be a string',
            },
            maximumBurstSize: {
              type: 'string',
              errorMessage: 'The maximumBurstSize must be a string',
            },
          },
          required: ['type', 'limitBy', 'averageRateLimit', 'maximumBurstSize'],
          additionalProperties: false,
          errorMessage: {
            additionalProperties: 'No additional properties are allowed in the setRateLimit object',
            required:
              "All fields ('type', 'limitBy', 'averageRateLimit', 'maximumBurstSize') are required in setRateLimit",
          },
        },
        deny: {
          type: 'boolean',
          errorMessage: 'The deny behavior must be a boolean',
        },
        drop: {
          type: 'boolean',
          errorMessage: 'The drop behavior must be a boolean',
        },
        setCustomResponse: {
          type: 'object',
          properties: {
            statusCode: {
              type: ['integer', 'string'],
              minimum: 200,
              maximum: 499,
              errorMessage: 'The statusCode must be a number or string between 200 and 499',
            },
            contentType: {
              type: 'string',
              errorMessage: 'The contentType must be a string',
            },
            contentBody: {
              type: 'string',
              errorMessage: 'The contentBody must be a string',
            },
          },
          required: ['statusCode', 'contentType', 'contentBody'],
          additionalProperties: false,
          errorMessage: {
            additionalProperties: 'No additional properties are allowed in the setCustomResponse object',
            required: "All fields ('statusCode', 'contentType', 'contentBody') are required in setCustomResponse",
          },
        },
        tagEvent: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              errorMessage: 'The tagEvent name must be a string',
            },
          },
          required: ['name'],
          additionalProperties: false,
        },
        setCache: {
          oneOf: [
            {
              type: 'string',
              errorMessage: "The 'setCache' field must be a string.",
            },
            {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  errorMessage: "The 'name' field must be a string.",
                },
                browserCacheSettingsMaximumTtl: {
                  type: 'number',
                  nullable: true,
                  errorMessage: "The 'browserCacheSettingsMaximumTtl' field must be a number or null.",
                },
                cdnCacheSettingsMaximumTtl: {
                  type: 'number',
                  nullable: true,
                  errorMessage: "The 'cdnCacheSettingsMaximumTtl' field must be a number or null.",
                },
              },
              required: ['name'],
              additionalProperties: false,
              errorMessage: {
                additionalProperties: 'No additional properties are allowed in the cache object.',
                required: "The 'name' field is required in the cache object.",
              },
            },
          ],
          errorMessage: "The 'cache' field must be either a string or an object with specified properties.",
        },
        filterCookie: {
          type: ['string', 'null'],
          errorMessage: "The 'filterCookie' field must be a string or null.",
        },
        filterHeader: {
          type: ['string', 'null'],
          errorMessage: "The 'filterHeader' field must be a string or null.",
        },
        enableGZIP: {
          type: ['boolean', 'null'],
          errorMessage: "The 'enableGZIP' field must be a boolean or null.",
        },
        noContent: {
          type: ['boolean', 'null'],
          errorMessage: "The 'noContent' field must be a boolean or null.",
        },
        optimizeImages: {
          type: ['boolean', 'null'],
          errorMessage: "The 'optimizeImages' field must be a boolean or null.",
        },
      },
      additionalProperties: false,
      allOf: [
        {
          not: {
            anyOf: [
              { required: ['deny', 'drop'] },
              { required: ['deny', 'setCustomResponse'] },
              { required: ['deny', 'setRateLimit'] },
              { required: ['drop', 'setCustomResponse'] },
              { required: ['drop', 'setRateLimit'] },
              { required: ['setCustomResponse', 'setRateLimit'] },
            ],
          },
          errorMessage:
            'Cannot use multiple final behaviors (deny, drop, setRateLimit, setCustomResponse) together. You can combine non-final behaviors (runFunction, setWafRuleset, tagEvent) with only one final behavior.',
        },
      ],
      minProperties: 1,
      errorMessage: {
        additionalProperties: "No additional properties are allowed in the 'behavior' object.",
        minProperties: 'At least one behavior must be specified',
      },
    },
  },
  required: ['name'],
  oneOf: [
    {
      anyOf: [{ required: ['match'] }, { required: ['variable'] }],
      not: { required: ['criteria'] },
      errorMessage: "Cannot use 'match' or 'variable' together with 'criteria'.",
    },
    {
      required: ['criteria'],
      not: {
        anyOf: [{ required: ['match'] }, { required: ['variable'] }],
      },
      errorMessage: "Cannot use 'criteria' together with 'match' or 'variable'.",
    },
  ],
  errorMessage: {
    oneOf: "You must use either 'match/variable' OR 'criteria', but not both at the same time",
  },
});

const schemaFunction = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 250,
      pattern: '.*',
      errorMessage: "The 'name' field must be a string between 1 and 250 characters",
    },
    path: {
      type: 'string',
      errorMessage: "The 'path' field must be a string",
    },
    runtime: {
      type: 'string',
      enum: ['azion_js'],
      default: 'azion_js',
      errorMessage: "The 'runtime' field must be 'azion_js'",
    },
    defaultArgs: {
      type: 'object',
      default: {},
      errorMessage: "The 'defaultArgs' field must be an object",
    },
    executionEnvironment: {
      type: 'string',
      enum: ['application', 'firewall'],
      default: 'application',
      errorMessage: "The 'executionEnvironment' field must be 'application' or 'firewall'",
    },
    active: {
      type: 'boolean',
      default: true,
      errorMessage: "The 'active' field must be a boolean",
    },
  },
  required: ['name', 'path'],
  additionalProperties: false,
};

const schemaStorage = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 6,
      maxLength: 63,
      pattern: '^.{6,63}$',
      errorMessage: "The 'name' field must be a string between 6 and 63 characters.",
    },
    dir: {
      type: 'string',
      errorMessage: "The 'dir' field must be a string.",
    },
    edgeAccess: {
      type: 'string',
      enum: EDGE_ACCESS_TYPES,
      errorMessage: "The 'edge_access' field must be one of: read_only, read_write, restricted.",
    },
  },
  required: ['name', 'dir'],
  additionalProperties: false,
  errorMessage: {
    additionalProperties: 'No additional properties are allowed in storage items.',
    required: "The 'name' and 'dir' fields are required.",
  },
};

const azionConfigSchema = {
  $id: 'azionConfig',
  definitions: {
    mainConfig: {
      type: 'object',
      properties: {
        build: {
          type: 'object',
          properties: {
            entry: {
              oneOf: [
                { type: 'string' },
                { type: 'array', items: { type: 'string' } },
                { type: 'object', additionalProperties: { type: 'string' } },
              ],
              errorMessage: "The 'build.entry' must be a string, array of strings, or object with string values",
            },
            bundler: {
              type: 'string',
              enum: BUILD_BUNDLERS,
              errorMessage: "The 'build.bundler' must be either 'webpack' or 'esbuild'",
            },
            preset: {
              anyOf: [
                { type: 'string' },
                {
                  type: 'object',
                  properties: {
                    metadata: {
                      type: 'object',
                      properties: {
                        name: {
                          type: 'string',
                          errorMessage: "The 'name' field in preset metadata must be a string",
                        },
                        ext: {
                          type: 'string',
                          errorMessage: "The 'ext' field in preset metadata must be a string",
                        },
                      },
                      required: ['name'],
                      additionalProperties: false,
                      errorMessage: {
                        additionalProperties: 'No additional properties are allowed in preset metadata',
                        required: "The 'name' field is required in preset metadata",
                      },
                    },
                    config: {
                      $ref: '#/definitions/mainConfig',
                    },
                    handler: { instanceof: 'Function' },
                    prebuild: { instanceof: 'Function' },
                    postbuild: { instanceof: 'Function' },
                  },
                  required: ['metadata', 'config'],
                  additionalProperties: false,
                  errorMessage: {
                    additionalProperties: 'No additional properties are allowed in preset',
                    required: "Preset must contain both 'metadata' and 'config' properties",
                  },
                },
              ],
              errorMessage: 'Preset must be either a string or an object with preset properties',
            },
            polyfills: {
              type: 'boolean',
              errorMessage: "The 'build.polyfills' must be a boolean",
            },
            worker: {
              type: 'boolean',
              errorMessage: "The 'build.worker' must be a boolean",
            },
            extend: {
              instanceof: 'Function',
              errorMessage: "The 'build.extend' must be a function",
            },
            memoryFS: {
              type: 'object',
              properties: {
                injectionDirs: {
                  type: 'array',
                  items: { type: 'string' },
                },
                removePathPrefix: { type: 'string' },
              },
              required: ['injectionDirs', 'removePathPrefix'],
              additionalProperties: false,
            },
          },
          additionalProperties: false,
          errorMessage: {
            additionalProperties: "No additional properties are allowed in the 'build' object",
          },
        },
        edgeApplications: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                minLength: 1,
                maxLength: 250,
                errorMessage: "The 'name' field must be a string with 1 to 250 characters",
              },
              active: {
                type: 'boolean',
                default: true,
                errorMessage: "The 'active' field must be a boolean",
              },
              debug: {
                type: 'boolean',
                default: false,
                errorMessage: "The 'debug' field must be a boolean",
              },
              edgeCacheEnabled: {
                type: 'boolean',
                default: true,
                errorMessage: "The 'edgeCacheEnabled' field must be a boolean",
              },
              edgeFunctionsEnabled: {
                type: 'boolean',
                default: false,
                errorMessage: "The 'edgeFunctionsEnabled' field must be a boolean",
              },
              applicationAcceleratorEnabled: {
                type: 'boolean',
                default: false,
                errorMessage: "The 'applicationAcceleratorEnabled' field must be a boolean",
              },
              imageProcessorEnabled: {
                type: 'boolean',
                default: false,
                errorMessage: "The 'imageProcessorEnabled' field must be a boolean",
              },
              tieredCacheEnabled: {
                type: 'boolean',
                default: false,
                errorMessage: "The 'tieredCacheEnabled' field must be a boolean",
              },
              cache: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: {
                      type: 'string',
                      minLength: 1,
                      maxLength: 250,
                      pattern: "^[a-zA-Z0-9 \\-\\.'\\,|]+$",
                      errorMessage: "The 'name' field must be a string between 1-250 characters with valid pattern.",
                    },
                    stale: {
                      type: 'boolean',
                      errorMessage: "The 'stale' field must be a boolean.",
                    },
                    queryStringSort: {
                      type: 'boolean',
                      errorMessage: "The 'queryStringSort' field must be a boolean.",
                    },
                    methods: {
                      type: 'object',
                      properties: {
                        post: {
                          type: 'boolean',
                          errorMessage: "The 'post' field must be a boolean.",
                        },
                        options: {
                          type: 'boolean',
                          errorMessage: "The 'options' field must be a boolean.",
                        },
                      },
                      additionalProperties: false,
                      errorMessage: {
                        additionalProperties: "No additional properties are allowed in the 'methods' object.",
                      },
                    },
                    browser: {
                      type: 'object',
                      properties: {
                        maxAgeSeconds: {
                          oneOf: [
                            {
                              type: 'number',
                              errorMessage:
                                "The 'maxAgeSeconds' field must be a number or a valid mathematical expression.",
                            },
                            {
                              type: 'string',
                              pattern: '^[0-9+*/.() -]+$',
                              errorMessage: "The 'maxAgeSeconds' field must be a valid mathematical expression.",
                            },
                          ],
                        },
                      },
                      required: ['maxAgeSeconds'],
                      additionalProperties: false,
                      errorMessage: {
                        additionalProperties: "No additional properties are allowed in the 'browser' object.",
                        required: "The 'maxAgeSeconds' field is required in the 'browser' object.",
                      },
                    },
                    edge: {
                      type: 'object',
                      properties: {
                        maxAgeSeconds: {
                          oneOf: [
                            {
                              type: 'number',
                              errorMessage:
                                "The 'maxAgeSeconds' field must be a number or a valid mathematical expression.",
                            },
                            {
                              type: 'string',
                              pattern: '^[0-9+*/.() -]+$',
                              errorMessage: "The 'maxAgeSeconds' field must be a valid mathematical expression.",
                            },
                          ],
                        },
                      },
                      required: ['maxAgeSeconds'],
                      additionalProperties: false,
                      errorMessage: {
                        additionalProperties: "No additional properties are allowed in the 'edge' object.",
                        required: "The 'maxAgeSeconds' field is required in the 'edge' object.",
                      },
                    },
                    cacheByCookie: {
                      type: 'object',
                      properties: {
                        option: {
                          type: 'string',
                          enum: ['ignore', 'all', 'allowlist', 'denylist'],
                          errorMessage: "The 'option' field must be one of 'ignore', 'all', 'allowlist' or 'denylist'.",
                        },
                        list: {
                          type: 'array',
                          items: {
                            type: 'string',
                            errorMessage: "Each item in 'list' must be a string.",
                          },
                          errorMessage: {
                            type: "The 'list' field must be an array of strings.",
                          },
                        },
                      },
                      required: ['option'],
                      additionalProperties: false,
                      errorMessage: {
                        additionalProperties: "No additional properties are allowed in the 'cacheByCookie' object.",
                        required: "The 'option' field is required in the 'cacheByCookie' object.",
                      },
                      if: {
                        properties: {
                          option: { enum: ['allowlist', 'denylist'] },
                        },
                      },
                      then: {
                        required: ['list'],
                        errorMessage: {
                          required: "The 'list' field is required when 'option' is 'allowlist' or 'denylist'.",
                        },
                      },
                    },
                    cacheByQueryString: {
                      type: 'object',
                      properties: {
                        option: {
                          type: 'string',
                          enum: ['ignore', 'all', 'allowlist', 'denylist'],
                          errorMessage: "The 'option' field must be one of 'ignore', 'all', 'allowlist' or 'denylist'.",
                        },
                        list: {
                          type: 'array',
                          items: {
                            type: 'string',
                            errorMessage: "Each item in 'list' must be a string.",
                          },
                          errorMessage: {
                            type: "The 'list' field must be an array of strings.",
                          },
                        },
                      },
                      required: ['option'],
                      additionalProperties: false,
                      errorMessage: {
                        additionalProperties:
                          "No additional properties are allowed in the 'cacheByQueryString' object.",
                        required: "The 'option' field is required in the 'cacheByQueryString' object.",
                      },
                      if: {
                        properties: {
                          option: { enum: ['allowlist', 'denylist'] },
                        },
                      },
                      then: {
                        required: ['list'],
                        errorMessage: {
                          required: "The 'list' field is required when 'option' is 'allowlist' or 'denylist'.",
                        },
                      },
                    },
                  },
                  required: ['name'],
                  additionalProperties: false,
                  errorMessage: {
                    additionalProperties: 'No additional properties are allowed in cache item objects.',
                    required: "The 'name' field is required in each cache item.",
                  },
                },
                errorMessage: "The 'cache' field must be an array of cache setting items.",
              },
              rules: {
                type: 'object',
                properties: {
                  request: {
                    type: 'array',
                    items: createRuleSchema(true),
                  },
                  response: {
                    type: 'array',
                    items: createRuleSchema(false),
                  },
                },
                additionalProperties: false,
              },
              deviceGroups: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: {
                      type: 'string',
                      minLength: 1,
                      maxLength: 250,
                      pattern: '.*',
                      errorMessage: "The 'name' field must be a string between 1 and 250 characters",
                    },
                    userAgent: {
                      type: 'string',
                      minLength: 1,
                      maxLength: 512,
                      pattern: '.*',
                      errorMessage: "The 'userAgent' field must be a valid regex pattern between 1 and 512 characters",
                    },
                  },
                  required: ['name', 'userAgent'],
                  additionalProperties: false,
                  errorMessage: {
                    additionalProperties: 'No additional properties are allowed in device group objects',
                    required: "The 'name' and 'userAgent' fields are required in each device group",
                  },
                },
                errorMessage: "The 'deviceGroups' field must be an array of device group objects",
              },
              functions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: {
                      type: 'string',
                      minLength: 1,
                      maxLength: 100,
                      pattern: '.*',
                      errorMessage: "The 'name' field must be a string between 1 and 100 characters",
                    },
                    ref: {
                      type: 'string',
                      errorMessage: "The 'ref' field must be a string referencing an existing Edge Function name",
                    },
                    args: {
                      type: 'object',
                      default: {},
                      errorMessage: "The 'args' field must be an object",
                    },
                    bindings: {
                      type: 'object',
                      properties: {
                        storage: {
                          type: 'object',
                          properties: {
                            bucket: {
                              type: 'string',
                              errorMessage: "The 'bucket' field must be a string",
                            },
                            prefix: {
                              type: 'string',
                              errorMessage: "The 'prefix' field must be a string",
                            },
                          },
                          required: ['bucket'],
                          additionalProperties: false,
                          errorMessage: {
                            type: "The 'storage' field must be an object",
                            additionalProperties: 'No additional properties are allowed in the storage object',
                            required: "The 'bucket' field is required in the storage object",
                          },
                        },
                      },
                      additionalProperties: false,
                      errorMessage: {
                        type: "The 'bindings' field must be an object",
                        additionalProperties: 'No additional properties are allowed in the bindings object',
                      },
                    },
                  },
                  required: ['name', 'ref'],
                  additionalProperties: false,
                  errorMessage: {
                    additionalProperties: 'No additional properties are allowed in function instance objects',
                    required: "The 'name' and 'ref' fields are required in each function instance",
                  },
                },
                errorMessage: "The 'functions' field must be an array of function instance objects",
              },
            },
            required: ['name'],
            additionalProperties: false,
          },
          errorMessage: "The 'edgeApplications' field must be an array of application objects",
        },
        workloads: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                minLength: 1,
                maxLength: 100,
                pattern: '.*',
                errorMessage: "The 'name' field must be a string between 1 and 100 characters",
              },
              active: {
                type: 'boolean',
                default: true,
                errorMessage: "The 'active' field must be a boolean",
              },
              infrastructure: {
                type: 'integer',
                enum: [1, 2],
                default: 1,
                errorMessage: "The 'infrastructure' must be either 1 or 2",
              },
              workloadDomainAllowAccess: {
                type: 'boolean',
                default: true,
                errorMessage: "The 'workloadDomainAllowAccess' field must be a boolean",
              },
              domains: {
                type: 'array',
                items: {
                  type: 'string',
                  minLength: 1,
                  maxLength: 250,
                  errorMessage: 'Each domain must be a string between 1 and 250 characters',
                },
                minItems: 1,
                errorMessage: "The 'domains' field must be an array of domain strings",
              },
              tls: {
                type: 'object',
                properties: {
                  certificate: {
                    type: ['integer', 'null'],
                    minimum: 1,
                    errorMessage: "The 'certificate' must be an integer >= 1 or null",
                  },
                  ciphers: {
                    type: ['integer', 'null'],
                    enum: [1, 2, 3, 4, 5, 6, 7, 8, null],
                    errorMessage: "The 'ciphers' must be an integer between 1-8 or null",
                  },
                  minimumVersion: {
                    type: ['string', 'null'],
                    enum: [...WORKLOAD_TLS_VERSIONS, null],
                    default: 'tls_1_3',
                    errorMessage: "The 'minimumVersion' must be a valid TLS version or null",
                  },
                },
                default: { certificate: null, ciphers: null, minimumVersion: 'tls_1_3' },
                additionalProperties: false,
              },
              protocols: {
                type: 'object',
                properties: {
                  http: {
                    type: 'object',
                    properties: {
                      versions: {
                        type: 'array',
                        items: {
                          type: 'string',
                          enum: WORKLOAD_HTTP_VERSIONS,
                        },
                        default: ['http1', 'http2'],
                      },
                      httpPorts: {
                        type: 'array',
                        items: { type: 'integer' },
                        default: [80],
                      },
                      httpsPorts: {
                        type: 'array',
                        items: { type: 'integer' },
                        default: [443],
                      },
                      quicPorts: {
                        type: ['array', 'null'],
                        items: { type: 'integer' },
                      },
                    },
                    required: ['versions', 'httpPorts', 'httpsPorts'],
                    additionalProperties: false,
                  },
                },
                default: {
                  http: {
                    versions: ['http1', 'http2'],
                    httpPorts: [80],
                    httpsPorts: [443],
                    quicPorts: null,
                  },
                },
                additionalProperties: false,
              },
              mtls: {
                type: 'object',
                properties: {
                  verification: {
                    type: 'string',
                    enum: WORKLOAD_MTLS_VERIFICATION,
                    default: 'enforce',
                  },
                  certificate: {
                    type: ['integer', 'null'],
                    minimum: 1,
                  },
                  crl: {
                    type: ['array', 'null'],
                    items: { type: 'integer' },
                    maxItems: 100,
                  },
                },
                required: ['verification'],
                additionalProperties: false,
              },
              deployments: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: {
                      type: 'string',
                      minLength: 1,
                      maxLength: 254,
                      pattern: '.*',
                      errorMessage: "The 'name' field must be a string between 1 and 254 characters",
                    },
                    current: {
                      type: 'boolean',
                      default: true,
                      errorMessage: "The 'current' field must be a boolean",
                    },
                    active: {
                      type: 'boolean',
                      default: true,
                      errorMessage: "The 'active' field must be a boolean",
                    },
                    strategy: {
                      type: 'object',
                      properties: {
                        type: {
                          type: 'string',
                          minLength: 1,
                          maxLength: 255,
                          pattern: '.*',
                          errorMessage: "The 'type' field must be a string between 1 and 255 characters",
                        },
                        attributes: {
                          type: 'object',
                          properties: {
                            edgeApplication: {
                              type: 'string',
                              errorMessage:
                                "The 'edgeApplication' field must be a string referencing an existing Edge Application name",
                            },
                            edgeFirewall: {
                              type: ['string', 'null'],
                              errorMessage:
                                "The 'edgeFirewall' field must be a string referencing an existing Edge Firewall name or null",
                            },
                            customPage: {
                              type: ['integer', 'null'],
                              minimum: 1,
                              errorMessage: "The 'customPage' field must be an integer >= 1 or null",
                            },
                          },
                          required: ['edgeApplication'],
                          additionalProperties: false,
                          errorMessage: {
                            additionalProperties: 'No additional properties are allowed in strategy attributes',
                            required: "The 'edgeApplication' field is required in strategy attributes",
                          },
                        },
                      },
                      required: ['type', 'attributes'],
                      additionalProperties: false,
                      errorMessage: {
                        additionalProperties: 'No additional properties are allowed in strategy',
                        required: "The 'type' and 'attributes' fields are required in strategy",
                      },
                    },
                  },
                  required: ['name', 'strategy'],
                  additionalProperties: false,
                  errorMessage: {
                    additionalProperties: 'No additional properties are allowed in deployment objects',
                    required: "The 'name' and 'strategy' fields are required in each deployment",
                  },
                },
                errorMessage: "The 'deployments' field must be an array of deployment objects",
              },
            },
            required: ['name', 'domains'],
            additionalProperties: false,
            errorMessage: {
              additionalProperties: 'No additional properties are allowed in workload items',
              required: {
                name: "The 'name' field is required in workloads",
                domains: "The 'domains' field is required in workloads",
              },
            },
          },
          errorMessage: "The 'workloads' field must be an array of workloads items.",
        },
        purge: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: ['url', 'cachekey', 'wildcard'],
                errorMessage: "The 'type' field must be either 'url', 'cachekey' or 'wildcard'.",
              },
              items: {
                type: 'array',
                minItems: 1,
                items: {
                  type: 'string',
                  errorMessage: "Each item in 'items' must be a string.",
                },
                errorMessage: {
                  type: "The 'items' field must be an array of strings.",
                  minItems: 'The purge items array cannot be empty. At least one item must be specified.',
                },
              },
              layer: {
                type: 'string',
                enum: ['edge_cache', 'tiered_cache'],
                errorMessage: "The 'layer' field must be either 'edge_cache' or 'tiered_cache'.",
              },
            },
            required: ['type', 'items'],
            additionalProperties: false,
            errorMessage: {
              additionalProperties: 'No additional properties are allowed in purge items.',
              required: "The 'type and items' fields are required in each purge item.",
            },
          },
        },
        edgeFirewall: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                errorMessage: "The edgeFirewall configuration must have a 'name' field of type string",
              },
              domains: {
                type: 'array',
                items: {
                  type: 'string',
                  errorMessage: "Each domain in the edge firewall's domains list must be a string",
                },
              },
              active: {
                type: 'boolean',
                errorMessage: "The firewall's 'active' field must be a boolean",
              },
              debugRules: {
                type: 'boolean',
                errorMessage: "The firewall's 'debugRules' field must be a boolean",
              },
              edgeFunctions: {
                type: 'boolean',
                errorMessage: "The firewall's 'edgeFunctions' field must be a boolean",
              },
              networkProtection: {
                type: 'boolean',
                errorMessage: "The firewall's 'networkProtection' field must be a boolean",
              },
              waf: {
                type: 'boolean',
                errorMessage: "The firewall's 'waf' field must be a boolean",
              },
              variable: {
                type: 'string',
                enum: FIREWALL_VARIABLES,
                errorMessage: `The 'variable' field must be one of: ${FIREWALL_VARIABLES.join(', ')}`,
              },
              rules: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: {
                      type: 'string',
                      errorMessage: "Each firewall rule must have a 'name' field of type string",
                    },
                    description: {
                      type: 'string',
                      errorMessage: "The rule's 'description' field must be a string",
                    },
                    active: {
                      type: 'boolean',
                      errorMessage: "The rule's 'active' field must be a boolean",
                    },
                    match: {
                      type: 'string',
                      errorMessage: "The rule's 'match' field must be a string containing a valid regex pattern",
                    },
                    behavior: {
                      type: 'object',
                      properties: {
                        runFunction: {
                          type: 'string',
                          errorMessage: "The 'runFunction' behavior must be a string",
                        },
                        setWafRuleset: {
                          type: 'object',
                          properties: {
                            wafMode: {
                              type: 'string',
                              enum: FIREWALL_WAF_MODES,
                              errorMessage: `The wafMode must be one of: ${FIREWALL_WAF_MODES.join(', ')}`,
                            },
                            wafId: {
                              type: 'string',
                              errorMessage: 'The wafId must be a string',
                            },
                          },
                          required: ['wafMode', 'wafId'],
                          additionalProperties: false,
                          errorMessage: {
                            additionalProperties: 'No additional properties are allowed in the setWafRuleset object',
                            required: "Both 'wafMode' and 'wafId' fields are required in setWafRuleset",
                          },
                        },
                        setRateLimit: {
                          type: 'object',
                          properties: {
                            type: {
                              type: 'string',
                              enum: FIREWALL_RATE_LIMIT_TYPES,
                              errorMessage: `The rate limit type must be one of: ${FIREWALL_RATE_LIMIT_TYPES.join(', ')}`,
                            },
                            limitBy: {
                              type: 'string',
                              enum: FIREWALL_RATE_LIMIT_BY,
                              errorMessage: `The rate limit must be applied by one of: ${FIREWALL_RATE_LIMIT_BY.join(', ')}`,
                            },
                            averageRateLimit: {
                              type: 'string',
                              errorMessage: 'The averageRateLimit must be a string',
                            },
                            maximumBurstSize: {
                              type: 'string',
                              errorMessage: 'The maximumBurstSize must be a string',
                            },
                          },
                          required: ['type', 'limitBy', 'averageRateLimit', 'maximumBurstSize'],
                          additionalProperties: false,
                          errorMessage: {
                            additionalProperties: 'No additional properties are allowed in the setRateLimit object',
                            required:
                              "All fields ('type', 'limitBy', 'averageRateLimit', 'maximumBurstSize') are required in setRateLimit",
                          },
                        },
                        deny: {
                          type: 'boolean',
                          errorMessage: 'The deny behavior must be a boolean',
                        },
                        drop: {
                          type: 'boolean',
                          errorMessage: 'The drop behavior must be a boolean',
                        },
                        setCustomResponse: {
                          type: 'object',
                          properties: {
                            statusCode: {
                              type: ['integer', 'string'],
                              minimum: 200,
                              maximum: 499,
                              errorMessage: 'The statusCode must be a number or string between 200 and 499',
                            },
                            contentType: {
                              type: 'string',
                              errorMessage: 'The contentType must be a string',
                            },
                            contentBody: {
                              type: 'string',
                              errorMessage: 'The contentBody must be a string',
                            },
                          },
                          required: ['statusCode', 'contentType', 'contentBody'],
                          additionalProperties: false,
                          errorMessage: {
                            additionalProperties:
                              'No additional properties are allowed in the setCustomResponse object',
                            required:
                              "All fields ('statusCode', 'contentType', 'contentBody') are required in setCustomResponse",
                          },
                        },
                      },
                      not: {
                        anyOf: [
                          { required: ['deny', 'drop'] },
                          { required: ['deny', 'setCustomResponse'] },
                          { required: ['deny', 'setRateLimit'] },
                          { required: ['drop', 'setCustomResponse'] },
                          { required: ['drop', 'setRateLimit'] },
                          { required: ['setCustomResponse', 'setRateLimit'] },
                        ],
                      },
                      errorMessage: {
                        not: 'Cannot use multiple final behaviors (deny, drop, setRateLimit, setCustomResponse) together. You can combine non-final behaviors (runFunction, setWafRuleset) with only one final behavior.',
                      },
                      additionalProperties: false,
                    },
                  },
                  required: ['name', 'behavior'],
                  oneOf: [
                    {
                      anyOf: [{ required: ['match'] }, { required: ['variable'] }],
                      not: { required: ['criteria'] },
                      errorMessage: "Cannot use 'match' or 'variable' together with 'criteria'.",
                    },
                    {
                      required: ['criteria'],
                      not: {
                        anyOf: [{ required: ['match'] }, { required: ['variable'] }],
                      },
                      errorMessage: "Cannot use 'criteria' together with 'match' or 'variable'.",
                    },
                  ],
                  errorMessage: {
                    oneOf: "You must use either 'match/variable' OR 'criteria', but not both at the same time",
                  },
                },
              },
            },
            required: ['name'],
            additionalProperties: false,
            errorMessage: {
              type: 'Each edgeFirewall item must be an object',
              additionalProperties: 'No additional properties are allowed in the edgeFirewall object',
              required: "The 'name' field is required in each edge firewall object",
            },
          },
          errorMessage: {
            type: "The 'edgeFirewall' field must be an array of edge firewall objects",
          },
        },
        networkList: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                minLength: 1,
                maxLength: 250,
                pattern: '.*',
                errorMessage: "The 'name' field must be a string between 1 and 250 characters.",
              },
              type: {
                type: 'string',
                enum: NETWORK_LIST_TYPES,
                errorMessage: "The 'type' field must be a string. Accepted values are 'ip_cidr', 'asn' or 'countries'.",
              },
              items: {
                type: 'array',
                minItems: 1,
                maxItems: 20000,
                items: {
                  type: 'string',
                  pattern: '.*',
                  errorMessage: "Each item in 'items' must be a string.",
                },
                errorMessage: "The 'items' field must be an array of strings with 1-20000 items.",
              },
              active: {
                type: 'boolean',
                default: true,
                errorMessage: "The 'active' field must be a boolean.",
              },
            },
            required: ['name', 'type', 'items'],
            additionalProperties: false,
            errorMessage: {
              additionalProperties: 'No additional properties are allowed in network list items.',
              required: "The 'name', 'type' and 'items' fields are required in each network list item.",
            },
          },
        },
        waf: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'number',
                errorMessage: "The WAF configuration must have an 'id' field of type number",
              },
              name: {
                type: 'string',
                minLength: 1,
                maxLength: 250,
                pattern: '.*',
                errorMessage: "The WAF configuration must have a 'name' field of type string (1-250 characters)",
              },
              productVersion: {
                type: ['string', 'null'],
                minLength: 3,
                maxLength: 50,
                pattern: '\\d+\\.\\d+',
                default: '1.0',
                errorMessage: "The 'productVersion' field must be a string matching pattern \\d+\\.\\d+ (e.g., '1.0')",
              },
              engineSettings: {
                type: 'object',
                properties: {
                  engineVersion: {
                    type: 'string',
                    enum: ['2021-Q3'],
                    default: '2021-Q3',
                    errorMessage: "The 'engineVersion' field must be '2021-Q3'",
                  },
                  type: {
                    type: 'string',
                    enum: ['score'],
                    default: 'score',
                    errorMessage: "The 'type' field must be 'score'",
                  },
                  attributes: {
                    type: 'object',
                    properties: {
                      rulesets: {
                        type: 'array',
                        items: {
                          type: 'integer',
                          enum: [1],
                        },
                        default: [1],
                        errorMessage: "The 'rulesets' field must be an array containing [1]",
                      },
                      thresholds: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            threat: {
                              type: 'string',
                              enum: [
                                'cross_site_scripting',
                                'directory_traversal',
                                'evading_tricks',
                                'file_upload',
                                'identified_attack',
                                'remote_file_inclusion',
                                'sql_injection',
                                'unwanted_access',
                              ],
                              errorMessage: "The 'threat' field must be a valid threat type",
                            },
                            sensitivity: {
                              type: 'string',
                              enum: ['highest', 'high', 'medium', 'low', 'lowest'],
                              default: 'medium',
                              errorMessage:
                                "The 'sensitivity' field must be one of: highest, high, medium, low, lowest",
                            },
                          },
                          required: ['threat', 'sensitivity'],
                          additionalProperties: false,
                        },
                        maxItems: 8,
                        errorMessage: "The 'thresholds' field must be an array of threat configurations (max 8 items)",
                      },
                    },
                    required: ['rulesets', 'thresholds'],
                    additionalProperties: false,
                    errorMessage: {
                      additionalProperties: 'No additional properties are allowed in the attributes object',
                      required: "The 'rulesets' and 'thresholds' fields are required in the attributes object",
                    },
                  },
                },
                required: ['engineVersion', 'type', 'attributes'],
                additionalProperties: false,
                errorMessage: {
                  additionalProperties: 'No additional properties are allowed in the engineSettings object',
                  required:
                    "The 'engineVersion', 'type', and 'attributes' fields are required in the engineSettings object",
                },
              },
            },
            required: ['name', 'engineSettings'],
            additionalProperties: false,
            errorMessage: {
              type: "The 'waf' field must be an object",
              additionalProperties: 'No additional properties are allowed in the WAF object',
              required: "The 'name, active and mode' fields are required in the WAF object",
            },
          },
          errorMessage: {
            type: "The 'waf' field must be an array",
          },
        },
        edgeConnectors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                minLength: 1,
                maxLength: 255,
                pattern: '.*',
                errorMessage: "The 'name' field must be a string between 1 and 255 characters",
              },
              active: {
                type: 'boolean',
                default: true,
                errorMessage: "The 'active' field must be a boolean",
              },
              type: {
                type: 'string',
                enum: EDGE_CONNECTOR_TYPES,
                errorMessage: "The 'type' field must be one of: http, edge_storage, live_ingest",
              },
              attributes: {
                type: 'object',
                properties: {
                  addresses: {
                    type: 'array',
                    minItems: 1,
                    items: {
                      type: 'object',
                      properties: {
                        active: {
                          type: 'boolean',
                          default: true,
                          errorMessage: "The 'active' field must be a boolean",
                        },
                        address: {
                          type: 'string',
                          minLength: 1,
                          maxLength: 255,
                          pattern: '.*',
                          errorMessage: "The 'address' field must be a string between 1 and 255 characters",
                        },
                        httpPort: {
                          type: 'integer',
                          minimum: 1,
                          maximum: 65535,
                          default: 80,
                          errorMessage: "The 'httpPort' must be between 1 and 65535",
                        },
                        httpsPort: {
                          type: 'integer',
                          minimum: 1,
                          maximum: 65535,
                          default: 443,
                          errorMessage: "The 'httpsPort' must be between 1 and 65535",
                        },
                        modules: {
                          type: ['object', 'null'],
                          errorMessage: "The 'modules' field must be an object or null",
                        },
                      },
                      required: ['address'],
                      additionalProperties: false,
                    },
                    errorMessage: "The 'addresses' field must be an array of address objects",
                  },
                  connectionOptions: {
                    type: 'object',
                    properties: {
                      dnsResolution: {
                        type: 'string',
                        enum: EDGE_CONNECTOR_DNS_RESOLUTION,
                        default: 'preserve',
                        errorMessage: "The 'dnsResolution' must be one of: preserve, force_ipv4, force_ipv6",
                      },
                      transportPolicy: {
                        type: 'string',
                        enum: EDGE_CONNECTOR_TRANSPORT_POLICY,
                        default: 'preserve',
                        errorMessage: "The 'transportPolicy' must be one of: preserve, force_https, force_http",
                      },
                      httpVersionPolicy: {
                        type: 'string',
                        enum: EDGE_CONNECTOR_HTTP_VERSION_POLICY,
                        default: 'http1_1',
                        errorMessage: "The 'httpVersionPolicy' must be http1_1",
                      },
                      host: {
                        type: 'string',
                        minLength: 1,
                        maxLength: 255,
                        pattern: '.*',
                        default: '${host}',
                        errorMessage: "The 'host' field must be a string between 1 and 255 characters",
                      },
                      pathPrefix: {
                        type: 'string',
                        minLength: 0,
                        maxLength: 255,
                        pattern: '.*',
                        default: '',
                        errorMessage: "The 'pathPrefix' field must be a string between 0 and 255 characters",
                      },
                      followingRedirect: {
                        type: 'boolean',
                        default: false,
                        errorMessage: "The 'followingRedirect' field must be a boolean",
                      },
                      realIpHeader: {
                        type: 'string',
                        minLength: 1,
                        maxLength: 100,
                        pattern: '.*',
                        default: 'X-Real-IP',
                        errorMessage: "The 'realIpHeader' field must be a string between 1 and 100 characters",
                      },
                      realPortHeader: {
                        type: 'string',
                        minLength: 1,
                        maxLength: 100,
                        pattern: '.*',
                        default: 'X-Real-PORT',
                        errorMessage: "The 'realPortHeader' field must be a string between 1 and 100 characters",
                      },
                    },
                    additionalProperties: false,
                    errorMessage: "The 'connectionOptions' field must be an object with valid connection options",
                  },
                  modules: {
                    type: 'object',
                    properties: {
                      loadBalancer: {
                        type: 'object',
                        properties: {
                          enabled: {
                            type: 'boolean',
                            default: false,
                            errorMessage: "The 'enabled' field must be a boolean",
                          },
                          config: {
                            type: ['object', 'null'],
                            properties: {
                              method: {
                                type: 'string',
                                enum: EDGE_CONNECTOR_LOAD_BALANCE_METHOD,
                                default: 'round_robin',
                                errorMessage: "The 'method' must be one of: round_robin, least_conn, ip_hash",
                              },
                              maxRetries: {
                                type: 'integer',
                                minimum: 0,
                                maximum: 20,
                                default: 0,
                                errorMessage: "The 'maxRetries' must be between 0 and 20",
                              },
                              connectionTimeout: {
                                type: 'integer',
                                minimum: 1,
                                maximum: 300,
                                default: 60,
                                errorMessage: "The 'connectionTimeout' must be between 1 and 300",
                              },
                              readWriteTimeout: {
                                type: 'integer',
                                minimum: 1,
                                maximum: 600,
                                default: 120,
                                errorMessage: "The 'readWriteTimeout' must be between 1 and 600",
                              },
                            },
                            additionalProperties: false,
                          },
                        },
                        required: ['enabled'],
                        additionalProperties: false,
                      },
                      originShield: {
                        type: 'object',
                        properties: {
                          enabled: {
                            type: 'boolean',
                            default: false,
                            errorMessage: "The 'enabled' field must be a boolean",
                          },
                          config: {
                            type: ['object', 'null'],
                            properties: {
                              originIpAcl: {
                                type: 'object',
                                properties: {
                                  enabled: {
                                    type: 'boolean',
                                    default: false,
                                    errorMessage: "The 'enabled' field must be a boolean",
                                  },
                                },
                                additionalProperties: false,
                              },
                              hmac: {
                                type: 'object',
                                properties: {
                                  enabled: {
                                    type: 'boolean',
                                    default: false,
                                    errorMessage: "The 'enabled' field must be a boolean",
                                  },
                                  config: {
                                    type: ['object', 'null'],
                                    properties: {
                                      type: {
                                        type: 'string',
                                        enum: EDGE_CONNECTOR_HMAC_TYPE,
                                        errorMessage: "The 'type' must be aws4_hmac_sha256",
                                      },
                                      attributes: {
                                        type: 'object',
                                        properties: {
                                          region: {
                                            type: 'string',
                                            minLength: 1,
                                            maxLength: 255,
                                            pattern: '.*',
                                            errorMessage:
                                              "The 'region' field must be a string between 1 and 255 characters",
                                          },
                                          service: {
                                            type: 'string',
                                            minLength: 1,
                                            maxLength: 255,
                                            pattern: '.*',
                                            default: 's3',
                                            errorMessage:
                                              "The 'service' field must be a string between 1 and 255 characters",
                                          },
                                          accessKey: {
                                            type: 'string',
                                            minLength: 1,
                                            maxLength: 255,
                                            pattern: '.*',
                                            errorMessage:
                                              "The 'accessKey' field must be a string between 1 and 255 characters",
                                          },
                                          secretKey: {
                                            type: 'string',
                                            minLength: 1,
                                            maxLength: 255,
                                            pattern: '.*',
                                            errorMessage:
                                              "The 'secretKey' field must be a string between 1 and 255 characters",
                                          },
                                        },
                                        required: ['region', 'accessKey', 'secretKey'],
                                        additionalProperties: false,
                                      },
                                    },
                                    required: ['type', 'attributes'],
                                    additionalProperties: false,
                                  },
                                },
                                additionalProperties: false,
                              },
                            },
                            additionalProperties: false,
                          },
                        },
                        required: ['enabled'],
                        additionalProperties: false,
                      },
                    },
                    required: ['loadBalancer', 'originShield'],
                    additionalProperties: false,
                  },
                },
                required: ['addresses', 'connectionOptions', 'modules'],
                additionalProperties: false,
              },
            },
            required: ['name', 'type', 'attributes'],
            additionalProperties: false,
          },
        },
        edgeFunctions: {
          type: 'array',
          items: schemaFunction,
        },
        edgeStorage: {
          type: 'array',
          items: schemaStorage,
          errorMessage: "The 'edgeStorage' field must be an array of edge storage items.",
        },
      },
      additionalProperties: false,
      errorMessage: {
        additionalProperties:
          'Config can only contain the following properties: build, edgeFunctions, edgeApplications, workloads, purge, edgefirewall, networkList, waf, edgeConnectors',
        type: 'Configuration must be an object',
      },
    },
  },
  $ref: '#/definitions/mainConfig',
};

export default azionConfigSchema;
