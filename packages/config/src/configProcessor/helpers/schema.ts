import {
  ALL_REQUEST_VARIABLES,
  ALL_RESPONSE_VARIABLES,
  DYNAMIC_VARIABLE_PATTERNS,
  EDGE_CONNECTOR_CONNECTION_PREFERENCE,
  EDGE_CONNECTOR_LOAD_BALANCE,
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
  WAF_MODE,
  WAF_SENSITIVITY,
  WORKLOAD_HTTP_VERSIONS,
  WORKLOAD_MTLS_VERIFICATION,
  WORKLOAD_NETWORK_MAP,
  WORKLOAD_TLS_CIPHERS,
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
        required: ['inputValue'],
        properties: {
          inputValue: {
            type: 'string',
            errorMessage: "The 'inputValue' field must be a string",
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
          required: ['inputValue'],
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

const sensitivitySchema = {
  type: 'string',
  enum: WAF_SENSITIVITY,
  errorMessage: `The 'sensitivity' field must be one of: ${WAF_SENSITIVITY.join(', ')}`,
};

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
      errorMessage: "The 'name' field must be a string",
    },
    path: {
      type: 'string',
      errorMessage: "The 'path' field must be a string",
    },
    args: {
      type: 'object',
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
      enum: ['read_only', 'read_write', 'restricted'],
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
              enum: ['webpack', 'esbuild'],
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
        edgeFunctions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                errorMessage: "The function's 'name' field must be a string",
              },
              path: {
                type: 'string',
                errorMessage: "The function's 'path' field must be a string",
              },
              args: {
                type: 'object',
                additionalProperties: true,
                errorMessage: "The function's 'args' field must be an object",
              },
            },
            required: ['name', 'path'],
            additionalProperties: false,
            errorMessage: {
              additionalProperties: 'No additional properties are allowed in function items',
              required: "Both 'name' and 'path' fields are required for each function",
            },
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
              cache: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: {
                      type: 'string',
                      errorMessage: "The 'name' field must be a string.",
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
                          enum: ['ignore', 'varies', 'whitelist', 'blacklist'],
                          errorMessage:
                            "The 'option' field must be one of 'ignore', 'varies', 'whitelist' or 'blacklist'..",
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
                          option: { enum: ['whitelist', 'blacklist'] },
                        },
                      },
                      then: {
                        required: ['list'],
                        errorMessage: {
                          required: "The 'list' field is required when 'option' is 'whitelist' or 'blacklist'.",
                        },
                      },
                    },
                    cacheByQueryString: {
                      type: 'object',
                      properties: {
                        option: {
                          type: 'string',
                          enum: ['ignore', 'varies', 'whitelist', 'blacklist'],
                          errorMessage:
                            "The 'option' field must be one of 'ignore', 'varies', 'whitelist' or 'blacklist'.",
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
                          option: { enum: ['whitelist', 'blacklist'] },
                        },
                      },
                      then: {
                        required: ['list'],
                        errorMessage: {
                          required: "The 'list' field is required when 'option' is 'whitelist' or 'blacklist'.",
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
                errorMessage: "The 'name' field must be a string between 1 and 100 characters",
              },
              alternateDomains: {
                type: 'array',
                items: { type: 'string' },
                maxItems: 50,
                errorMessage: "The 'alternateDomains' field must be an array of strings with max 50 items",
              },
              edgeApplication: {
                type: 'string',
                errorMessage: "The 'edgeApplication' field must be a string",
              },
              active: {
                type: 'boolean',
                default: true,
                errorMessage: "The 'active' field must be a boolean",
              },
              networkMap: {
                type: 'string',
                enum: WORKLOAD_NETWORK_MAP,
                default: '1',
                errorMessage: "The 'networkMap' must be either '1' or '2'",
              },
              edgeFirewall: {
                type: ['string', 'null'],
                errorMessage: "The 'edgeFirewall' must be an integer or null",
              },
              workloadHostnameAllowAccess: {
                type: 'boolean',
                default: true,
                errorMessage: "The 'workloadHostnameAllowAccess' field must be a boolean",
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
                    type: ['string', 'null'],
                    enum: [...WORKLOAD_TLS_CIPHERS, 'null'],
                    errorMessage: "The 'ciphers' must be a valid TLS cipher suite or null",
                  },
                  minimumVersion: {
                    type: ['string', 'null'],
                    enum: [...WORKLOAD_TLS_VERSIONS, 'null'],
                    default: 'tls_1_2',
                    errorMessage: "The 'minimumVersion' must be a valid TLS version or null",
                  },
                },
                default: { certificate: null, ciphers: null, minimumVersion: 'tls_1_2' },
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
            },
            required: ['name', 'edgeApplication', 'domains'],
            additionalProperties: false,
            errorMessage: {
              additionalProperties: 'No additional properties are allowed in workload items',
              required: {
                name: "The 'name' field is required in workloads",
                edgeApplication: "The 'edgeApplication' field is required in workloads",
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
              urls: {
                type: 'array',
                items: {
                  type: 'string',
                  errorMessage: "Each item in 'urls' must be a string.",
                },
                errorMessage: {
                  type: "The 'urls' field must be an array of strings.",
                },
              },
              method: {
                type: 'string',
                enum: ['delete'],
                errorMessage: "The 'method' field must be either 'delete'. Default is 'delete'.",
              },
              layer: {
                type: 'string',
                enum: ['edge_caching', 'l2_caching'],
                errorMessage:
                  "The 'layer' field must be either 'edge_caching' or 'l2_caching'. Default is 'edge_caching'.",
              },
            },
            required: ['type', 'urls'],
            additionalProperties: false,
            errorMessage: {
              additionalProperties: 'No additional properties are allowed in purge items.',
              required: "The 'type and urls' fields are required in each purge item.",
            },
          },
        },
        firewall: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'number',
                errorMessage: "The 'id' field must be a number",
              },
              name: {
                type: 'string',
                errorMessage: "The firewall configuration must have a 'name' field of type string",
              },
              domains: {
                type: 'array',
                items: {
                  type: 'string',
                  errorMessage: "Each domain in the firewall's domains list must be a string",
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
                            },
                            wafId: { type: 'string' },
                          },
                          required: ['wafMode', 'wafId'],
                        },
                        setRateLimit: {
                          type: 'object',
                          properties: {
                            type: {
                              type: 'string',
                              enum: FIREWALL_RATE_LIMIT_TYPES,
                            },
                            limitBy: {
                              type: 'string',
                              enum: FIREWALL_RATE_LIMIT_BY,
                            },
                            averageRateLimit: { type: 'string' },
                            maximumBurstSize: { type: 'string' },
                          },
                          required: ['type', 'limitBy', 'averageRateLimit', 'maximumBurstSize'],
                        },
                        deny: { type: 'boolean' },
                        drop: { type: 'boolean' },
                        setCustomResponse: {
                          type: 'object',
                          properties: {
                            statusCode: { type: ['integer', 'string'], minimum: 200, maximum: 499 },
                            contentType: { type: 'string' },
                            contentBody: { type: 'string' },
                          },
                          required: ['statusCode', 'contentType', 'contentBody'],
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
              type: 'Each firewall item must be an object',
              additionalProperties: 'No additional properties are allowed in the firewall object',
              required: "The 'name' field is required in each firewall object",
            },
          },
          errorMessage: {
            type: "The 'firewall' field must be an array of firewall objects",
          },
        },
        networkList: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'number',
                errorMessage: "The 'id' field must be a number.",
              },
              listType: {
                type: 'string',
                enum: NETWORK_LIST_TYPES,
                errorMessage:
                  "The 'listType' field must be a string. Accepted values are 'ip_cidr', 'asn' or 'countries'.",
              },
              listContent: {
                type: 'array',
                items: {
                  type: ['string', 'number'],
                  errorMessage: "The 'listContent' field must be an array of strings or numbers.",
                },
              },
            },
            required: ['id', 'listType', 'listContent'],
            additionalProperties: false,
            errorMessage: {
              additionalProperties: 'No additional properties are allowed in network list items.',
              required: "The 'id, listType and listContent' fields are required in each network list item.",
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
                errorMessage: "The WAF configuration must have a 'name' field of type string",
              },
              mode: {
                type: 'string',
                enum: WAF_MODE,
                errorMessage: `The 'mode' field must be one of: ${WAF_MODE.join(', ')}`,
              },
              active: {
                type: 'boolean',
                errorMessage: "The WAF configuration's 'active' field must be a boolean",
              },
              sqlInjection: {
                type: 'object',
                properties: {
                  sensitivity: sensitivitySchema,
                },
                required: ['sensitivity'],
                additionalProperties: false,
                errorMessage: {
                  additionalProperties: 'No additional properties are allowed in the sqlInjection object',
                  required: "The 'sensitivity' field is required in the sqlInjection object",
                },
              },
              remoteFileInclusion: {
                type: 'object',
                properties: {
                  sensitivity: sensitivitySchema,
                },
                required: ['sensitivity'],
                additionalProperties: false,
                errorMessage: {
                  additionalProperties: 'No additional properties are allowed in the remoteFileInclusion object',
                  required: "The 'sensitivity' field is required in the remoteFileInclusion object",
                },
              },
              directoryTraversal: {
                type: 'object',
                properties: {
                  sensitivity: sensitivitySchema,
                },
                required: ['sensitivity'],
                additionalProperties: false,
                errorMessage: {
                  additionalProperties: 'No additional properties are allowed in the directoryTraversal object',
                  required: "The 'sensitivity' field is required in the directoryTraversal object",
                },
              },
              crossSiteScripting: {
                type: 'object',
                properties: {
                  sensitivity: sensitivitySchema,
                },
                required: ['sensitivity'],
                additionalProperties: false,
                errorMessage: {
                  additionalProperties: 'No additional properties are allowed in the crossSiteScripting object',
                  required: "The 'sensitivity' field is required in the crossSiteScripting object",
                },
              },
              evadingTricks: {
                type: 'object',
                properties: {
                  sensitivity: sensitivitySchema,
                },
                required: ['sensitivity'],
                additionalProperties: false,
                errorMessage: {
                  additionalProperties: 'No additional properties are allowed in the evadingTricks object',
                  required: "The 'sensitivity' field is required in the evadingTricks object",
                },
              },
              fileUpload: {
                type: 'object',
                properties: {
                  sensitivity: sensitivitySchema,
                },
                required: ['sensitivity'],
                additionalProperties: false,
                errorMessage: {
                  additionalProperties: 'No additional properties are allowed in the fileUpload object',
                  required: "The 'sensitivity' field is required in the fileUpload object",
                },
              },
              unwantedAccess: {
                type: 'object',
                properties: {
                  sensitivity: sensitivitySchema,
                },
                required: ['sensitivity'],
                additionalProperties: false,
                errorMessage: {
                  additionalProperties: 'No additional properties are allowed in the unwantedAccess object',
                  required: "The 'sensitivity' field is required in the unwantedAccess object",
                },
              },
              identifiedAttack: {
                type: 'object',
                properties: {
                  sensitivity: sensitivitySchema,
                },
                required: ['sensitivity'],
                additionalProperties: false,
                errorMessage: {
                  additionalProperties: 'No additional properties are allowed in the identifiedAttack object',
                  required: "The 'sensitivity' field is required in the identifiedAttack object",
                },
              },
              bypassAddresses: {
                type: 'array',
                items: {
                  type: 'string',
                  errorMessage: 'Each item in the bypassAddresses list must be a string',
                },
                errorMessage: {
                  type: "The 'bypassAddresses' field must be an array of strings",
                },
              },
            },
            required: ['name', 'active', 'mode'],
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
                errorMessage: "O campo 'name' deve ser uma string entre 1 e 255 caracteres",
              },
              modules: {
                type: 'object',
                properties: {
                  load_balancer_enabled: {
                    type: 'boolean',
                    errorMessage: "'load_balancer_enabled' must be a boolean",
                  },
                  origin_shield_enabled: {
                    type: 'boolean',
                    errorMessage: "'origin_shield_enabled' must be a boolean",
                  },
                },
                required: ['load_balancer_enabled', 'origin_shield_enabled'],
                additionalProperties: false,
                errorMessage: {
                  required: "'load_balancer_enabled' and 'origin_shield_enabled' are required in modules",
                  additionalProperties: 'No additional properties are allowed in modules',
                },
              },
              active: {
                type: 'boolean',
                default: true,
                errorMessage: "O campo 'active' deve ser um booleano",
              },
              type: {
                type: 'string',
                enum: EDGE_CONNECTOR_TYPES,
                errorMessage: "O campo 'type' deve ser um dos seguintes: http, s3, edge_storage, live_ingest",
              },
              addresses: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    address: {
                      type: 'string',
                      minLength: 1,
                      maxLength: 255,
                      errorMessage: "O campo 'address' deve ser uma string entre 1 e 255 caracteres",
                    },
                    plainPort: {
                      type: 'integer',
                      minimum: 1,
                      maximum: 65535,
                      default: 80,
                      errorMessage: "O campo 'plainPort' deve estar entre 1 e 65535",
                    },
                    tlsPort: {
                      type: 'integer',
                      minimum: 1,
                      maximum: 65535,
                      default: 443,
                      errorMessage: "O campo 'tlsPort' deve estar entre 1 e 65535",
                    },
                    serverRole: {
                      type: 'string',
                      enum: ['primary', 'backup'],
                      default: 'primary',
                      errorMessage: "O campo 'serverRole' deve ser 'primary' ou 'backup'",
                    },
                    weight: {
                      type: 'integer',
                      minimum: 0,
                      maximum: 100,
                      default: 1,
                      errorMessage: "O campo 'weight' deve estar entre 0 e 100",
                    },
                    active: {
                      type: 'boolean',
                      default: true,
                      errorMessage: "O campo 'active' deve ser um booleano",
                    },
                    maxConns: {
                      type: 'integer',
                      minimum: 0,
                      maximum: 1000,
                      default: 0,
                      errorMessage: "O campo 'maxConns' deve estar entre 0 e 1000",
                    },
                    maxFails: {
                      type: 'integer',
                      minimum: 1,
                      maximum: 10,
                      default: 1,
                      errorMessage: "O campo 'maxFails' deve estar entre 1 e 10",
                    },
                    failTimeout: {
                      type: 'integer',
                      minimum: 1,
                      maximum: 60,
                      default: 10,
                      errorMessage: "O campo 'failTimeout' deve estar entre 1 e 60",
                    },
                    tls: {
                      type: 'object',
                      properties: {
                        policy: {
                          type: 'string',
                          enum: ['off', 'on', 'preserve'],
                          default: 'preserve',
                          errorMessage: "O campo 'policy' do TLS deve ser um dos seguintes: off, on, preserve",
                        },
                      },
                      default: { policy: 'preserve' },
                    },
                  },
                  required: ['address'],
                  additionalProperties: false,
                },
              },
              tls: {
                type: 'object',
                properties: {
                  policy: { type: 'string' },
                },
                default: { policy: 'preserve' },
              },
              loadBalanceMethod: {
                type: 'string',
                enum: EDGE_CONNECTOR_LOAD_BALANCE,
                default: 'off',
              },
              connectionPreference: {
                type: 'array',
                items: {
                  type: 'string',
                  enum: EDGE_CONNECTOR_CONNECTION_PREFERENCE,
                },
                maxItems: 2,
                default: ['IPv6', 'IPv4'],
              },
              connectionTimeout: {
                type: 'integer',
                minimum: 1,
                maximum: 300,
                default: 60,
              },
              readWriteTimeout: {
                type: 'integer',
                minimum: 1,
                maximum: 300,
                default: 120,
              },
              maxRetries: {
                type: 'integer',
                minimum: 0,
                maximum: 10,
              },
            },
            required: ['name', 'modules', 'type'],
            additionalProperties: false,
          },
        },
        functions: {
          type: 'array',
          items: schemaFunction,
        },
        storage: {
          type: 'array',
          items: schemaStorage,
          errorMessage: "The 'storage' field must be an array of storage items.",
        },
      },
      additionalProperties: false,
      errorMessage: {
        additionalProperties:
          'Config can only contain the following properties: build, edgeFunctions, edgeApplications, workloads, purge, firewall, networkList, waf, edgeConnectors',
        type: 'Configuration must be an object',
      },
    },
  },
  $ref: '#/definitions/mainConfig',
};

export default azionConfigSchema;
