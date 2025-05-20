import {
  ALL_REQUEST_VARIABLES,
  ALL_RESPONSE_VARIABLES,
  DYNAMIC_VARIABLE_PATTERNS,
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
        setOrigin: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              errorMessage: "The 'name' field must be a string.",
            },
            type: {
              type: 'string',
              errorMessage: "The 'type' field must be a string.",
            },
          },
          required: ['name', 'type'],
          additionalProperties: false,
          errorMessage: {
            additionalProperties: "No additional properties are allowed in the 'setOrigin' object.",
            required: "The 'name or type' field is required in the 'setOrigin' object.",
          },
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
                browser_cache_settings_maximum_ttl: {
                  type: 'number',
                  nullable: true,
                  errorMessage: "The 'browser_cache_settings_maximum_ttl' field must be a number or null.",
                },
                cdn_cache_settings_maximum_ttl: {
                  type: 'number',
                  nullable: true,
                  errorMessage: "The 'cdn_cache_settings_maximum_ttl' field must be a number or null.",
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
    edgeAcess: {
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
          type: 'array',
          items: {
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
              additionalProperties: 'No additional properties are allowed in storage items',
              required: "The 'bucket' field is required",
            },
          },
          errorMessage: "The 'storage' field must be an array of storage bindings",
        },
      },
      additionalProperties: false,
      errorMessage: {
        additionalProperties: 'No additional properties are allowed in bindings object',
      },
    },
  },
  required: ['name', 'path'],
  additionalProperties: false,
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
            bindings: {
              type: 'object',
              properties: {
                storage: {
                  type: 'array',
                  items: {
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
                      additionalProperties: 'No additional properties are allowed in storage items',
                      required: "The 'bucket' field are required",
                    },
                  },
                  errorMessage: "The 'storage' field must be an array of storage bindings",
                },
              },
              additionalProperties: false,
              errorMessage: {
                additionalProperties: 'No additional properties are allowed in bindings object',
              },
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
                        registry: {
                          type: 'string',
                          errorMessage: "The 'registry' field in preset metadata must be a string",
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
        functions: {
          type: 'array',
          items: schemaFunction,
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
        origin: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'integer',
                errorMessage: "The 'id' field must be a number.",
              },
              key: {
                type: 'string',
                errorMessage: "The 'key' field must be a string.",
              },
              name: {
                type: 'string',
                errorMessage: "The 'name' field must be a string.",
              },
              type: {
                type: 'string',
                enum: ['single_origin', 'object_storage', 'load_balancer', 'live_ingest'],
                errorMessage:
                  "The 'type' field must be a string and one of 'single_origin', 'object_storage', 'load_balancer' or 'live_ingest'.",
              },
              bucket: {
                type: ['string', 'null'],
                errorMessage: "The 'bucket' field must be a string or null.",
              },
              prefix: {
                type: ['string', 'null'],
                errorMessage: "The 'prefix' field must be a string or null.",
              },
              addresses: {
                anyOf: [
                  {
                    type: 'array',
                    items: {
                      type: 'string',
                    },
                    errorMessage: {
                      type: "The 'addresses' field must be an array of strings.",
                    },
                  },
                  {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        address: {
                          type: 'string',
                          errorMessage: "The 'address' field must be a string.",
                        },
                        weight: {
                          type: 'integer',
                        },
                      },
                      required: ['address'],
                      additionalProperties: false,
                      errorMessage: {
                        type: "The 'addresses' field must be an array of objects.",
                        additionalProperties: 'No additional properties are allowed in address items.',
                        required: "The 'address' field is required in each address item.",
                      },
                    },
                  },
                ],
              },
              hostHeader: {
                type: 'string',
                errorMessage: "The 'hostHeader' field must be a string.",
              },
              protocolPolicy: {
                type: 'string',
                enum: ['preserve', 'http', 'https'],
                errorMessage:
                  "The 'protocolPolicy' field must be either 'http', 'https' or 'preserve'. Default is 'preserve'.",
              },
              redirection: {
                type: 'boolean',
                errorMessage: "The 'redirection' field must be a boolean.",
              },
              method: {
                type: 'string',
                enum: ['ip_hash', 'least_connections', 'round_robin'],
                errorMessage:
                  "The 'method' field must be either 'ip_hash', 'least_connections' or 'round_robin'. Default is 'ip_hash'.",
              },
              path: {
                type: 'string',
                errorMessage: "The 'path' field must be a string.",
              },
              connectionTimeout: {
                type: 'integer',
                errorMessage: "The 'connectionTimeout' field must be a number. Default is 60.",
              },
              timeoutBetweenBytes: {
                type: 'integer',
                errorMessage: "The 'timeoutBetweenBytes' field must be a number. Default is 120.",
              },
              hmac: {
                type: 'object',
                properties: {
                  region: {
                    type: 'string',
                    errorMessage: "The 'region' field must be a string.",
                  },
                  accessKey: {
                    type: 'string',
                    errorMessage: "The 'accessKey' field must be a string.",
                  },
                  secretKey: {
                    type: 'string',
                    errorMessage: "The 'secretKey' field must be a string.",
                  },
                },
                required: ['region', 'accessKey', 'secretKey'],
                additionalProperties: false,
                errorMessage: {
                  additionalProperties: 'No additional properties are allowed in the hmac object.',
                  required: "The 'region, accessKey and secretKey' fields are required in the hmac object.",
                },
              },
            },
            required: ['name', 'type'],
            additionalProperties: false,
            errorMessage: {
              additionalProperties: 'No additional properties are allowed in origin item objects.',
              required: "The 'name and type' field is required in each origin item.",
            },
          },
          errorMessage: {
            additionalProperties: "The 'origin' field must be an array of objects.",
          },
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
                        errorMessage: "The 'maxAgeSeconds' field must be a number or a valid mathematical expression.",
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
                        errorMessage: "The 'maxAgeSeconds' field must be a number or a valid mathematical expression.",
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
                    errorMessage: "The 'option' field must be one of 'ignore', 'varies', 'whitelist' or 'blacklist'..",
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
                    errorMessage: "The 'option' field must be one of 'ignore', 'varies', 'whitelist' or 'blacklist'.",
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
                  additionalProperties: "No additional properties are allowed in the 'cacheByQueryString' object.",
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
          errorMessage: {
            additionalProperties: "The 'cache' field must be an array of objects.",
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
        domain: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              errorMessage: "The 'name' field must be a string.",
            },
            cnameAccessOnly: {
              type: 'boolean',
              errorMessage: "The 'cnameAccessOnly' field must be a boolean.",
            },
            cnames: {
              type: 'array',
              items: {
                type: 'string',
                errorMessage: "Each item in 'cnames' must be a string.",
              },
              errorMessage: {
                type: "The 'cnames' field must be an array of strings.",
              },
            },
            edgeApplicationId: {
              type: 'number',
              errorMessage: "The 'edgeApplicationId' field must be a number.",
            },
            edgeFirewallId: {
              type: 'number',
              errorMessage: "The 'edgeFirewallId' field must be a number.",
            },
            digitalCertificateId: {
              type: ['string', 'number', 'null'],
              errorMessage:
                "The 'digitalCertificateId' field must be a string, number or null. If string, it must be 'lets_encrypt'.",
            },
            active: {
              type: 'boolean',
              errorMessage: "The 'active' field must be a boolean.",
            },
            mtls: {
              type: 'object',
              properties: {
                verification: {
                  type: 'string',
                  enum: ['enforce', 'permissive'],
                  errorMessage: "The 'verification' field must be a string.",
                },
                trustedCaCertificateId: {
                  type: 'number',
                  errorMessage: "The 'trustedCaCertificateId' field must be a number.",
                },
                crlList: {
                  type: 'array',
                  items: {
                    type: 'number',
                    errorMessage: "Each item in 'crlList' must be a number.",
                  },
                  errorMessage: {
                    type: "The 'crlList' field must be an array of numbers.",
                  },
                },
              },
              required: ['verification', 'trustedCaCertificateId'],
              additionalProperties: false,
              errorMessage: {
                additionalProperties: 'No additional properties are allowed in the mtls object.',
                required: "The 'verification and trustedCaCertificateId' fields are required in the mtls object.",
              },
            },
          },
          required: ['name'],
          additionalProperties: false,
          errorMessage: {
            required: "The 'name' field is required in the domain object.",
          },
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
          type: 'object',
          properties: {
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
            type: "The 'firewall' field must be an object",
            additionalProperties: 'No additional properties are allowed in the firewall object',
            required: "The 'name' field is required in the firewall object",
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
        storage: {
          type: 'array',
          items: schemaStorage,
          errorMessage: "The 'storage' field must be an array of storage items.",
        },
      },
      additionalProperties: false,
      errorMessage: {
        additionalProperties:
          'Config can only contain the following properties: build, functions, rules, origin, cache, networkList, domain, purge, firewall',
        type: 'Configuration must be an object',
      },
    },
  },
  $ref: '#/definitions/mainConfig',
};

export default azionConfigSchema;
