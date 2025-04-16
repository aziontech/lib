import {
  ALL_REQUEST_VARIABLES,
  ALL_RESPONSE_VARIABLES,
  DOCS_MESSAGE,
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

const withDocs = (errorMessage: string | Record<string, string>) => {
  if (typeof errorMessage === 'string') {
    return `${errorMessage}${DOCS_MESSAGE}`;
  }

  return Object.fromEntries(Object.entries(errorMessage).map(([key, value]) => [key, `${value}${DOCS_MESSAGE}`]));
};

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
      errorMessage: withDocs(
        "The 'variable' field must be wrapped in ${} and be either a valid static variable or follow the dynamic patterns (arg_*, cookie_*, http_*, sent_http_*, upstream_cookie_*, upstream_http_*)",
      ),
    },
    conditional: {
      type: 'string',
      enum: RULE_CONDITIONALS,
      errorMessage: withDocs(`The 'conditional' field must be one of: ${RULE_CONDITIONALS.join(', ')}`),
    },
    operator: {
      type: 'string',
      enum: [...RULE_OPERATORS_WITH_VALUE, ...RULE_OPERATORS_WITHOUT_VALUE],
      errorMessage: withDocs(
        `The 'operator' field must be one of: ${[...RULE_OPERATORS_WITH_VALUE, ...RULE_OPERATORS_WITHOUT_VALUE].join(', ')}`,
      ),
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
            errorMessage: withDocs("The 'inputValue' field must be a string"),
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
      errorMessage: withDocs("The 'variable' field must be a valid variable"),
    },
    {
      // variables with ${}
      type: 'string',
      pattern:
        '^\\$\\{(' + [...new Set(isRequestPhase ? ALL_REQUEST_VARIABLES : ALL_RESPONSE_VARIABLES)].join('|') + ')\\}$',
      errorMessage: withDocs("The 'variable' field must be a valid variable wrapped in ${}"),
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
    ? withDocs(
        "The 'variable' field must be either a valid request phase variable, mTLS variable, follow the patterns (arg_*, cookie_*, http_*), or be a special function variable (cookie_time_offset, encode_base64)",
      )
    : withDocs(
        "The 'variable' field must be either a valid response phase variable, follow the patterns (arg_*, cookie_*, http_*, sent_http_*, upstream_cookie_*, upstream_http_*), or be a special function variable (cookie_time_offset, encode_base64)",
      ),
});

const sensitivitySchema = {
  type: 'string',
  enum: WAF_SENSITIVITY,
  errorMessage: withDocs(`The 'sensitivity' field must be one of: ${WAF_SENSITIVITY.join(', ')}`),
};

const createRuleSchema = (isRequestPhase = false) => ({
  type: 'object',
  properties: {
    name: {
      type: 'string',
      errorMessage: withDocs("The 'name' field must be a string"),
    },
    description: {
      type: 'string',
      errorMessage: withDocs("The 'description' field must be a string"),
    },
    active: {
      type: 'boolean',
      errorMessage: withDocs("The 'active' field must be a boolean"),
    },
    match: {
      type: 'string',
      errorMessage: withDocs("The 'match' field must be a string"),
    },
    variable: createVariableValidation(isRequestPhase),
    criteria: {
      type: 'array',
      items: criteriaBaseSchema,
      errorMessage: {
        type: withDocs('Each criteria item must follow the criteria format'),
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
              errorMessage: withDocs("The 'name' field must be a string."),
            },
            type: {
              type: 'string',
              errorMessage: withDocs("The 'type' field must be a string."),
            },
          },
          required: ['name', 'type'],
          additionalProperties: false,
          errorMessage: {
            additionalProperties: withDocs("No additional properties are allowed in the 'setOrigin' object."),
            required: withDocs("The 'name or type' field is required in the 'setOrigin' object."),
          },
        },
        rewrite: {
          type: 'string',
          errorMessage: withDocs("The 'rewrite' field must be a string."),
        },
        setHeaders: {
          type: 'array',
          items: {
            type: 'string',
            errorMessage: withDocs("Each item in 'setHeaders' must be a string."),
          },
          errorMessage: {
            type: withDocs("The 'setHeaders' field must be an array of strings."),
          },
        },
        bypassCache: {
          type: ['boolean', 'null'],
          errorMessage: withDocs("The 'bypassCache' field must be a boolean or null."),
        },
        httpToHttps: {
          type: ['boolean', 'null'],
          errorMessage: withDocs("The 'httpToHttps' field must be a boolean or null."),
        },
        redirectTo301: {
          type: ['string', 'null'],
          errorMessage: withDocs("The 'redirectTo301' field must be a string or null."),
        },
        redirectTo302: {
          type: ['string', 'null'],
          errorMessage: withDocs("The 'redirectTo302' field must be a string or null."),
        },
        forwardCookies: {
          type: ['boolean', 'null'],
          errorMessage: withDocs("The 'forwardCookies' field must be a boolean or null."),
        },
        setCookie: {
          type: ['string', 'null'],
          errorMessage: withDocs("The 'setCookie' field must be a string or null."),
        },
        deliver: {
          type: ['boolean', 'null'],
          errorMessage: withDocs("The 'deliver' field must be a boolean or null."),
        },
        capture: {
          type: 'object',
          properties: {
            match: {
              type: 'string',
              errorMessage: withDocs("The 'match' field must be a string."),
            },
            captured: {
              type: 'string',
              errorMessage: withDocs("The 'captured' field must be a string."),
            },
            subject: {
              type: 'string',
              errorMessage: withDocs("The 'subject' field must be a string."),
            },
          },
          required: ['match', 'captured', 'subject'],
          additionalProperties: false,
          errorMessage: {
            additionalProperties: withDocs("No additional properties are allowed in the 'capture' object."),
            required: withDocs("All properties ('match', 'captured', 'subject') are required in the 'capture' object."),
          },
        },
        runFunction: {
          type: 'string',
          errorMessage: withDocs(
            "The 'runFunction' behavior must be the name of a function defined in the 'functions' array",
          ),
        },
        setWafRuleset: {
          type: 'object',
          properties: {
            wafMode: {
              type: 'string',
              enum: FIREWALL_WAF_MODES,
              errorMessage: withDocs(`The wafMode must be one of: ${FIREWALL_WAF_MODES.join(', ')}`),
            },
            wafId: {
              type: 'string',
              errorMessage: withDocs('The wafId must be a string'),
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
              errorMessage: withDocs(`The rate limit type must be one of: ${FIREWALL_RATE_LIMIT_TYPES.join(', ')}`),
            },
            limitBy: {
              type: 'string',
              enum: FIREWALL_RATE_LIMIT_BY,
              errorMessage: withDocs(`The rate limit must be applied by one of: ${FIREWALL_RATE_LIMIT_BY.join(', ')}`),
            },
            averageRateLimit: {
              type: 'string',
              errorMessage: withDocs('The averageRateLimit must be a string'),
            },
            maximumBurstSize: {
              type: 'string',
              errorMessage: withDocs('The maximumBurstSize must be a string'),
            },
          },
          required: ['type', 'limitBy', 'averageRateLimit', 'maximumBurstSize'],
          additionalProperties: false,
        },
        deny: {
          type: 'boolean',
          errorMessage: withDocs('The deny behavior must be a boolean'),
        },
        drop: {
          type: 'boolean',
          errorMessage: withDocs('The drop behavior must be a boolean'),
        },
        setCustomResponse: {
          type: 'object',
          properties: {
            statusCode: {
              type: ['integer', 'string'],
              minimum: 200,
              maximum: 499,
              errorMessage: withDocs('The statusCode must be a number or string between 200 and 499'),
            },
            contentType: {
              type: 'string',
              errorMessage: withDocs('The contentType must be a string'),
            },
            contentBody: {
              type: 'string',
              errorMessage: withDocs('The contentBody must be a string'),
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
              errorMessage: withDocs('The tagEvent name must be a string'),
            },
          },
          required: ['name'],
          additionalProperties: false,
        },
        setCache: {
          oneOf: [
            {
              type: 'string',
              errorMessage: withDocs("The 'setCache' field must be a string."),
            },
            {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  errorMessage: withDocs("The 'name' field must be a string."),
                },
                browser_cache_settings_maximum_ttl: {
                  type: 'number',
                  nullable: true,
                  errorMessage: withDocs("The 'browser_cache_settings_maximum_ttl' field must be a number or null."),
                },
                cdn_cache_settings_maximum_ttl: {
                  type: 'number',
                  nullable: true,
                  errorMessage: withDocs("The 'cdn_cache_settings_maximum_ttl' field must be a number or null."),
                },
              },
              required: ['name'],
              additionalProperties: false,
              errorMessage: {
                additionalProperties: withDocs('No additional properties are allowed in the cache object.'),
                required: withDocs("The 'name' field is required in the cache object."),
              },
            },
          ],
          errorMessage: withDocs("The 'cache' field must be either a string or an object with specified properties."),
        },
        filterCookie: {
          type: ['string', 'null'],
          errorMessage: withDocs("The 'filterCookie' field must be a string or null."),
        },
        filterHeader: {
          type: ['string', 'null'],
          errorMessage: withDocs("The 'filterHeader' field must be a string or null."),
        },
        enableGZIP: {
          type: ['boolean', 'null'],
          errorMessage: withDocs("The 'enableGZIP' field must be a boolean or null."),
        },
        noContent: {
          type: ['boolean', 'null'],
          errorMessage: withDocs("The 'noContent' field must be a boolean or null."),
        },
        optimizeImages: {
          type: ['boolean', 'null'],
          errorMessage: withDocs("The 'optimizeImages' field must be a boolean or null."),
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
          errorMessage: withDocs(
            'Cannot use multiple final behaviors (deny, drop, setRateLimit, setCustomResponse) together. You can combine non-final behaviors (runFunction, setWafRuleset, tagEvent) with only one final behavior.',
          ),
        },
      ],
      minProperties: 1,
      errorMessage: {
        additionalProperties: withDocs("No additional properties are allowed in the 'behavior' object."),
        minProperties: withDocs('At least one behavior must be specified'),
      },
    },
  },
  required: ['name'],
  oneOf: [
    {
      anyOf: [{ required: ['match'] }, { required: ['variable'] }],
      not: { required: ['criteria'] },
      errorMessage: withDocs("Cannot use 'match' or 'variable' together with 'criteria'."),
    },
    {
      required: ['criteria'],
      not: {
        anyOf: [{ required: ['match'] }, { required: ['variable'] }],
      },
      errorMessage: withDocs("Cannot use 'criteria' together with 'match' or 'variable'."),
    },
  ],
  errorMessage: {
    oneOf: withDocs("You must use either 'match/variable' OR 'criteria', but not both at the same time"),
  },
});

const azionConfigSchema = {
  type: 'object',
  properties: {
    build: {
      type: 'object',
      properties: {
        entry: {
          oneOf: [
            {
              type: 'string',
              errorMessage: withDocs("When using a string, the 'entry' field must be a valid file path"),
            },
            {
              type: 'array',
              items: { type: 'string' },
              errorMessage: withDocs("When using an array, the 'entry' field must be an array of file paths"),
            },
            {
              type: 'object',
              patternProperties: {
                '.*': { type: 'string' },
              },
              errorMessage: withDocs(
                "When using an object, the 'entry' field must be a map of output paths to input files",
              ),
            },
          ],
          errorMessage: withDocs(
            "The 'entry' field must be either a string, array of strings, or object mapping outputs to inputs",
          ),
        },
        bundler: {
          type: ['string', 'null'],
          enum: ['esbuild', 'webpack', null],
          errorMessage: withDocs("The 'bundler' field must be either 'esbuild', 'webpack', or null."),
        },
        polyfills: {
          type: 'boolean',
          errorMessage: withDocs("The 'polyfills' field must be a boolean."),
        },
        worker: {
          type: 'boolean',
          errorMessage: withDocs("The 'worker' field must be a boolean."),
        },
        preset: {
          oneOf: [
            {
              type: 'string',
              errorMessage: withDocs("When using a string, the 'preset' must be a valid preset name"),
            },
            {
              type: 'object',
              properties: {
                handler: {
                  type: 'string',
                  errorMessage: withDocs("The 'preset.handler' field must be a string."),
                },
                prebuild: {
                  type: 'string',
                  errorMessage: withDocs("The 'preset.prebuild' field must be a string."),
                },
                postbuild: {
                  type: 'string',
                  errorMessage: withDocs("The 'preset.postbuild' field must be a string."),
                },
                meta: {
                  type: 'object',
                  properties: {
                    name: {
                      type: 'string',
                      errorMessage: withDocs("The 'preset.meta.name' field must be a string."),
                    },
                  },
                  required: ['name'],
                  additionalProperties: false,
                },
              },
              required: ['handler', 'meta'],
              additionalProperties: false,
              errorMessage: {
                additionalProperties: withDocs("No additional properties are allowed in the 'preset' object."),
                required: withDocs("The 'handler' and 'meta' fields are required in the 'preset' object."),
              },
            },
          ],
          errorMessage: withDocs(
            "The 'preset' must be either a string (preset name) or an object with required fields",
          ),
        },
        memoryFS: {
          type: 'object',
          properties: {
            injectionDirs: {
              type: ['array', 'null'],
              items: {
                type: 'string',
              },
              errorMessage: withDocs("The 'memoryFS.injectionDirs' field must be an array of strings or null."),
            },
            removePathPrefix: {
              type: ['string', 'null'],
              errorMessage: withDocs("The 'memoryFS.removePathPrefix' field must be a string or null."),
            },
          },
          additionalProperties: false,
          errorMessage: {
            additionalProperties: withDocs("No additional properties are allowed in the 'memoryFS' object."),
          },
        },
        custom: {
          type: 'object',
          additionalProperties: true,
          errorMessage: withDocs("The 'custom' field must be an object."),
        },
      },
      additionalProperties: true, // this is temp, we need to validate the build (extend) function
      errorMessage: withDocs({
        type: "The 'build' field must be an object.",
      }),
    },
    origin: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            errorMessage: withDocs("The 'id' field must be a number."),
          },
          key: {
            type: 'string',
            errorMessage: withDocs("The 'key' field must be a string."),
          },
          name: {
            type: 'string',
            errorMessage: withDocs("The 'name' field must be a string."),
          },
          type: {
            type: 'string',
            enum: ['single_origin', 'object_storage', 'load_balancer', 'live_ingest'],
            errorMessage: withDocs(
              "The 'type' field must be a string and one of 'single_origin', 'object_storage', 'load_balancer' or 'live_ingest'.",
            ),
          },
          bucket: {
            type: ['string', 'null'],
            errorMessage: withDocs("The 'bucket' field must be a string or null."),
          },
          prefix: {
            type: ['string', 'null'],
            errorMessage: withDocs("The 'prefix' field must be a string or null."),
          },
          addresses: {
            anyOf: [
              {
                type: 'array',
                items: {
                  type: 'string',
                },
                errorMessage: {
                  type: withDocs("The 'addresses' field must be an array of strings."),
                },
              },
              {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    address: {
                      type: 'string',
                      errorMessage: withDocs("The 'address' field must be a string."),
                    },
                    weight: {
                      type: 'integer',
                    },
                  },
                  required: ['address'],
                  additionalProperties: false,
                  errorMessage: {
                    type: withDocs("The 'addresses' field must be an array of objects."),
                    additionalProperties: withDocs('No additional properties are allowed in address items.'),
                    required: withDocs("The 'address' field is required in each address item."),
                  },
                },
              },
            ],
          },
          hostHeader: {
            type: 'string',
            errorMessage: withDocs("The 'hostHeader' field must be a string."),
          },
          protocolPolicy: {
            type: 'string',
            enum: ['preserve', 'http', 'https'],
            errorMessage: withDocs(
              "The 'protocolPolicy' field must be either 'http', 'https' or 'preserve'. Default is 'preserve'.",
            ),
          },
          redirection: {
            type: 'boolean',
            errorMessage: withDocs("The 'redirection' field must be a boolean."),
          },
          method: {
            type: 'string',
            enum: ['ip_hash', 'least_connections', 'round_robin'],
            errorMessage: withDocs(
              "The 'method' field must be either 'ip_hash', 'least_connections' or 'round_robin'. Default is 'ip_hash'.",
            ),
          },
          path: {
            type: 'string',
            errorMessage: withDocs("The 'path' field must be a string."),
          },
          connectionTimeout: {
            type: 'integer',
            errorMessage: withDocs("The 'connectionTimeout' field must be a number. Default is 60."),
          },
          timeoutBetweenBytes: {
            type: 'integer',
            errorMessage: withDocs("The 'timeoutBetweenBytes' field must be a number. Default is 120."),
          },
          hmac: {
            type: 'object',
            properties: {
              region: {
                type: 'string',
                errorMessage: withDocs("The 'region' field must be a string."),
              },
              accessKey: {
                type: 'string',
                errorMessage: withDocs("The 'accessKey' field must be a string."),
              },
              secretKey: {
                type: 'string',
                errorMessage: withDocs("The 'secretKey' field must be a string."),
              },
            },
            required: ['region', 'accessKey', 'secretKey'],
            additionalProperties: false,
            errorMessage: {
              additionalProperties: withDocs('No additional properties are allowed in the hmac object.'),
              required: withDocs("The 'region, accessKey and secretKey' fields are required in the hmac object."),
            },
          },
        },
        required: ['name', 'type'],
        additionalProperties: false,
        errorMessage: {
          additionalProperties: withDocs('No additional properties are allowed in origin item objects.'),
          required: withDocs("The 'name and type' field is required in each origin item."),
        },
      },
      errorMessage: {
        additionalProperties: withDocs("The 'origin' field must be an array of objects."),
      },
    },
    cache: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            errorMessage: withDocs("The 'name' field must be a string."),
          },
          stale: {
            type: 'boolean',
            errorMessage: withDocs("The 'stale' field must be a boolean."),
          },
          queryStringSort: {
            type: 'boolean',
            errorMessage: withDocs("The 'queryStringSort' field must be a boolean."),
          },
          methods: {
            type: 'object',
            properties: {
              post: {
                type: 'boolean',
                errorMessage: withDocs("The 'post' field must be a boolean."),
              },
              options: {
                type: 'boolean',
                errorMessage: withDocs("The 'options' field must be a boolean."),
              },
            },
            additionalProperties: false,
            errorMessage: {
              additionalProperties: withDocs("No additional properties are allowed in the 'methods' object."),
            },
          },
          browser: {
            type: 'object',
            properties: {
              maxAgeSeconds: {
                oneOf: [
                  {
                    type: 'number',
                    errorMessage: withDocs(
                      "The 'maxAgeSeconds' field must be a number or a valid mathematical expression.",
                    ),
                  },
                  {
                    type: 'string',
                    pattern: '^[0-9+*/.() -]+$',
                    errorMessage: withDocs("The 'maxAgeSeconds' field must be a valid mathematical expression."),
                  },
                ],
              },
            },
            required: ['maxAgeSeconds'],
            additionalProperties: false,
            errorMessage: {
              additionalProperties: withDocs("No additional properties are allowed in the 'browser' object."),
              required: withDocs("The 'maxAgeSeconds' field is required in the 'browser' object."),
            },
          },
          edge: {
            type: 'object',
            properties: {
              maxAgeSeconds: {
                oneOf: [
                  {
                    type: 'number',
                    errorMessage: withDocs(
                      "The 'maxAgeSeconds' field must be a number or a valid mathematical expression.",
                    ),
                  },
                  {
                    type: 'string',
                    pattern: '^[0-9+*/.() -]+$',
                    errorMessage: withDocs("The 'maxAgeSeconds' field must be a valid mathematical expression."),
                  },
                ],
              },
            },
            required: ['maxAgeSeconds'],
            additionalProperties: false,
            errorMessage: {
              additionalProperties: withDocs("No additional properties are allowed in the 'edge' object."),
              required: withDocs("The 'maxAgeSeconds' field is required in the 'edge' object."),
            },
          },
          cacheByCookie: {
            type: 'object',
            properties: {
              option: {
                type: 'string',
                enum: ['ignore', 'varies', 'whitelist', 'blacklist'],
                errorMessage: withDocs(
                  "The 'option' field must be one of 'ignore', 'varies', 'whitelist' or 'blacklist'..",
                ),
              },
              list: {
                type: 'array',
                items: {
                  type: 'string',
                  errorMessage: withDocs("Each item in 'list' must be a string."),
                },
                errorMessage: {
                  type: withDocs("The 'list' field must be an array of strings."),
                },
              },
            },
            required: ['option'],
            additionalProperties: false,
            errorMessage: {
              additionalProperties: withDocs("No additional properties are allowed in the 'cacheByCookie' object."),
              required: withDocs("The 'option' field is required in the 'cacheByCookie' object."),
            },
            if: {
              properties: {
                option: { enum: ['whitelist', 'blacklist'] },
              },
            },
            then: {
              required: ['list'],
              errorMessage: {
                required: withDocs("The 'list' field is required when 'option' is 'whitelist' or 'blacklist'."),
              },
            },
          },

          cacheByQueryString: {
            type: 'object',
            properties: {
              option: {
                type: 'string',
                enum: ['ignore', 'varies', 'whitelist', 'blacklist'],
                errorMessage: withDocs(
                  "The 'option' field must be one of 'ignore', 'varies', 'whitelist' or 'blacklist'.",
                ),
              },
              list: {
                type: 'array',
                items: {
                  type: 'string',
                  errorMessage: withDocs("Each item in 'list' must be a string."),
                },
                errorMessage: {
                  type: withDocs("The 'list' field must be an array of strings."),
                },
              },
            },
            required: ['option'],
            additionalProperties: false,
            errorMessage: {
              additionalProperties: withDocs(
                "No additional properties are allowed in the 'cacheByQueryString' object.",
              ),
              required: withDocs("The 'option' field is required in the 'cacheByQueryString' object."),
            },
            if: {
              properties: {
                option: { enum: ['whitelist', 'blacklist'] },
              },
            },
            then: {
              required: ['list'],
              errorMessage: {
                required: withDocs("The 'list' field is required when 'option' is 'whitelist' or 'blacklist'."),
              },
            },
          },
        },
        required: ['name'],
        additionalProperties: false,
        errorMessage: {
          additionalProperties: withDocs('No additional properties are allowed in cache item objects.'),
          required: withDocs("The 'name' field is required in each cache item."),
        },
      },
      errorMessage: {
        additionalProperties: withDocs("The 'cache' field must be an array of objects."),
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
      errorMessage: {
        additionalProperties: withDocs("No additional properties are allowed in the 'rules' object"),
        anyOf: withDocs("Either 'request' or 'response' must be provided"),
      },
    },
    networkList: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
            errorMessage: withDocs("The 'id' field must be a number."),
          },
          listType: {
            type: 'string',
            enum: NETWORK_LIST_TYPES,
            errorMessage: withDocs(
              "The 'listType' field must be a string. Accepted values are 'ip_cidr', 'asn' or 'countries'.",
            ),
          },
          listContent: {
            type: 'array',
            items: {
              type: ['string', 'number'],
              errorMessage: withDocs("The 'listContent' field must be an array of strings or numbers."),
            },
          },
        },
        required: ['id', 'listType', 'listContent'],
        additionalProperties: false,
        errorMessage: {
          additionalProperties: withDocs('No additional properties are allowed in network list items.'),
          required: withDocs("The 'id, listType and listContent' fields are required in each network list item."),
        },
      },
    },
    domain: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          errorMessage: withDocs("The 'name' field must be a string."),
        },
        cnameAccessOnly: {
          type: 'boolean',
          errorMessage: withDocs("The 'cnameAccessOnly' field must be a boolean."),
        },
        cnames: {
          type: 'array',
          items: {
            type: 'string',
            errorMessage: withDocs("Each item in 'cnames' must be a string."),
          },
          errorMessage: {
            type: withDocs("The 'cnames' field must be an array of strings."),
          },
        },
        edgeApplicationId: {
          type: 'number',
          errorMessage: withDocs("The 'edgeApplicationId' field must be a number."),
        },
        edgeFirewallId: {
          type: 'number',
          errorMessage: withDocs("The 'edgeFirewallId' field must be a number."),
        },
        digitalCertificateId: {
          type: ['string', 'number', 'null'],
          errorMessage: withDocs(
            "The 'digitalCertificateId' field must be a string, number or null. If string, it must be 'lets_encrypt'.",
          ),
        },
        active: {
          type: 'boolean',
          errorMessage: withDocs("The 'active' field must be a boolean."),
        },
        mtls: {
          type: 'object',
          properties: {
            verification: {
              type: 'string',
              enum: ['enforce', 'permissive'],
              errorMessage: withDocs("The 'verification' field must be a string."),
            },
            trustedCaCertificateId: {
              type: 'number',
              errorMessage: withDocs("The 'trustedCaCertificateId' field must be a number."),
            },
            crlList: {
              type: 'array',
              items: {
                type: 'number',
                errorMessage: withDocs("Each item in 'crlList' must be a number."),
              },
              errorMessage: {
                type: withDocs("The 'crlList' field must be an array of numbers."),
              },
            },
          },
          required: ['verification', 'trustedCaCertificateId'],
          additionalProperties: false,
          errorMessage: {
            additionalProperties: withDocs('No additional properties are allowed in the mtls object.'),
            required: withDocs("The 'verification and trustedCaCertificateId' fields are required in the mtls object."),
          },
        },
      },
      required: ['name'],
      additionalProperties: false,
      errorMessage: {
        type: withDocs("The 'domain' field must be an object."),
        additionalProperties: withDocs('No additional properties are allowed in the domain object.'),
        required: withDocs("The 'name' field is required in the domain object."),
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
            errorMessage: withDocs("The 'type' field must be either 'url', 'cachekey' or 'wildcard'."),
          },
          urls: {
            type: 'array',
            items: {
              type: 'string',
              errorMessage: withDocs("Each item in 'urls' must be a string."),
            },
            errorMessage: {
              type: withDocs("The 'urls' field must be an array of strings."),
            },
          },
          method: {
            type: 'string',
            enum: ['delete'],
            errorMessage: withDocs("The 'method' field must be either 'delete'. Default is 'delete'."),
          },
          layer: {
            type: 'string',
            enum: ['edge_caching', 'l2_caching'],
            errorMessage: withDocs(
              "The 'layer' field must be either 'edge_caching' or 'l2_caching'. Default is 'edge_caching'.",
            ),
          },
        },
        required: ['type', 'urls'],
        additionalProperties: false,
        errorMessage: {
          additionalProperties: withDocs('No additional properties are allowed in purge items.'),
          required: withDocs("The 'type and urls' fields are required in each purge item."),
        },
      },
    },
    firewall: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          errorMessage: withDocs("The firewall configuration must have a 'name' field of type string"),
        },
        domains: {
          type: 'array',
          items: {
            type: 'string',
            errorMessage: withDocs("Each domain in the firewall's domains list must be a string"),
          },
        },
        active: {
          type: 'boolean',
          errorMessage: withDocs("The firewall's 'active' field must be a boolean"),
        },
        debugRules: {
          type: 'boolean',
          errorMessage: withDocs("The firewall's 'debugRules' field must be a boolean"),
        },
        edgeFunctions: {
          type: 'boolean',
          errorMessage: withDocs("The firewall's 'edgeFunctions' field must be a boolean"),
        },
        networkProtection: {
          type: 'boolean',
          errorMessage: withDocs("The firewall's 'networkProtection' field must be a boolean"),
        },
        waf: {
          type: 'boolean',
          errorMessage: withDocs("The firewall's 'waf' field must be a boolean"),
        },
        variable: {
          type: 'string',
          enum: FIREWALL_VARIABLES,
          errorMessage: withDocs(`The 'variable' field must be one of: ${FIREWALL_VARIABLES.join(', ')}`),
        },
        rules: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                errorMessage: withDocs("Each firewall rule must have a 'name' field of type string"),
              },
              description: {
                type: 'string',
                errorMessage: withDocs("The rule's 'description' field must be a string"),
              },
              active: {
                type: 'boolean',
                errorMessage: withDocs("The rule's 'active' field must be a boolean"),
              },
              match: {
                type: 'string',
                errorMessage: withDocs("The rule's 'match' field must be a string containing a valid regex pattern"),
              },
              behavior: {
                type: 'object',
                properties: {
                  runFunction: {
                    type: 'string',
                    errorMessage: withDocs(
                      "The 'runFunction' behavior must be the name of a function defined in the 'functions' array",
                    ),
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
                  not: withDocs(
                    'Cannot use multiple final behaviors (deny, drop, setRateLimit, setCustomResponse) together. You can combine non-final behaviors (runFunction, setWafRuleset) with only one final behavior.',
                  ),
                },
                additionalProperties: false,
              },
            },
            required: ['name', 'behavior'],
            oneOf: [
              {
                anyOf: [{ required: ['match'] }, { required: ['variable'] }],
                not: { required: ['criteria'] },
                errorMessage: withDocs("Cannot use 'match' or 'variable' together with 'criteria'."),
              },
              {
                required: ['criteria'],
                not: {
                  anyOf: [{ required: ['match'] }, { required: ['variable'] }],
                },
                errorMessage: withDocs("Cannot use 'criteria' together with 'match' or 'variable'."),
              },
            ],
            errorMessage: {
              oneOf: withDocs("You must use either 'match/variable' OR 'criteria', but not both at the same time"),
            },
          },
        },
      },
      required: ['name'],
      additionalProperties: false,
      errorMessage: {
        type: withDocs("The 'firewall' field must be an object"),
        additionalProperties: withDocs('No additional properties are allowed in the firewall object'),
        required: withDocs("The 'name' field is required in the firewall object"),
      },
    },
    waf: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
            errorMessage: withDocs("The WAF configuration must have an 'id' field of type number"),
          },
          name: {
            type: 'string',
            errorMessage: withDocs("The WAF configuration must have a 'name' field of type string"),
          },
          mode: {
            type: 'string',
            enum: WAF_MODE,
            errorMessage: withDocs(`The 'mode' field must be one of: ${WAF_MODE.join(', ')}`),
          },
          active: {
            type: 'boolean',
            errorMessage: withDocs("The WAF configuration's 'active' field must be a boolean"),
          },
          sqlInjection: {
            type: 'object',
            properties: {
              sensitivity: sensitivitySchema,
            },
            required: ['sensitivity'],
            additionalProperties: false,
            errorMessage: {
              additionalProperties: withDocs('No additional properties are allowed in the sqlInjection object'),
              required: withDocs("The 'sensitivity' field is required in the sqlInjection object"),
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
              additionalProperties: withDocs('No additional properties are allowed in the remoteFileInclusion object'),
              required: withDocs("The 'sensitivity' field is required in the remoteFileInclusion object"),
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
              additionalProperties: withDocs('No additional properties are allowed in the directoryTraversal object'),
              required: withDocs("The 'sensitivity' field is required in the directoryTraversal object"),
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
              additionalProperties: withDocs('No additional properties are allowed in the crossSiteScripting object'),
              required: withDocs("The 'sensitivity' field is required in the crossSiteScripting object"),
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
              additionalProperties: withDocs('No additional properties are allowed in the evadingTricks object'),
              required: withDocs("The 'sensitivity' field is required in the evadingTricks object"),
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
              additionalProperties: withDocs('No additional properties are allowed in the fileUpload object'),
              required: withDocs("The 'sensitivity' field is required in the fileUpload object"),
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
              additionalProperties: withDocs('No additional properties are allowed in the unwantedAccess object'),
              required: withDocs("The 'sensitivity' field is required in the unwantedAccess object"),
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
              additionalProperties: withDocs('No additional properties are allowed in the identifiedAttack object'),
              required: withDocs("The 'sensitivity' field is required in the identifiedAttack object"),
            },
          },
          bypassAddresses: {
            type: 'array',
            items: {
              type: 'string',
              errorMessage: withDocs('Each item in the bypassAddresses list must be a string'),
            },
            errorMessage: {
              type: withDocs("The 'bypassAddresses' field must be an array of strings"),
            },
          },
        },
        required: ['name', 'active', 'mode'],
        additionalProperties: false,
        errorMessage: {
          type: withDocs("The 'waf' field must be an object"),
          additionalProperties: withDocs('No additional properties are allowed in the WAF object'),
          required: withDocs("The 'name, active and mode' fields are required in the WAF object"),
        },
      },
      errorMessage: {
        type: withDocs("The 'waf' field must be an array"),
      },
    },
    functions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            errorMessage: withDocs("The function's 'name' field must be a string"),
          },
          path: {
            type: 'string',
            errorMessage: withDocs("The function's 'path' field must be a string"),
          },
          args: {
            type: 'object',
            additionalProperties: true,
            errorMessage: withDocs("The function's 'args' field must be an object"),
          },
        },
        required: ['name', 'path'],
        additionalProperties: false,
        errorMessage: {
          additionalProperties: withDocs('No additional properties are allowed in function items'),
          required: withDocs("Both 'name' and 'path' fields are required for each function"),
        },
      },
    },
  },
  errorMessage: withDocs("The function referenced in 'runFunction' must exist in the 'functions' array"),
};

export default azionConfigSchema;
