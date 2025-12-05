import {
  ALL_REQUEST_VARIABLES,
  ALL_RESPONSE_VARIABLES,
  BUILD_BUNDLERS,
  COOKIE_BEHAVIORS,
  CUSTOM_PAGE_ERROR_CODES,
  CUSTOM_PAGE_TYPES,
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
  HEADER_BEHAVIORS,
  ID_BEHAVIORS,
  NETWORK_LIST_TYPES,
  NO_ARGS_BEHAVIORS,
  RULE_CONDITIONALS,
  RULE_OPERATORS_WITH_VALUE,
  RULE_OPERATORS_WITHOUT_VALUE,
  SPECIAL_VARIABLES,
  STRING_BEHAVIORS,
  WORKLOAD_HTTP_VERSIONS,
  WORKLOAD_MTLS_VERIFICATION,
  WORKLOAD_TLS_VERSIONS,
} from '../../constants';

const createCriteriaBaseSchema = (isRequestPhase = false) => ({
  type: 'object',
  properties: {
    variable: createVariableValidation(isRequestPhase).anyOf
      ? {
          type: 'string',
          anyOf: createVariableValidation(isRequestPhase).anyOf,
          errorMessage: createVariableValidation(isRequestPhase).errorMessage,
        }
      : createVariableValidation(isRequestPhase),
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
    argument: {
      type: 'string',
      errorMessage: "The 'argument' field must be a string",
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
  additionalProperties: false,
});

const createVariableValidation = (isRequestPhase = false) => ({
  type: 'string',
  anyOf: [
    {
      type: 'string',
      pattern:
        '^\\$\\{(' + [...new Set(isRequestPhase ? ALL_REQUEST_VARIABLES : ALL_RESPONSE_VARIABLES)].join('|') + ')\\}$',
      errorMessage: "The 'variable' field must be a valid variable wrapped in ${}",
    },
    {
      type: 'string',
      pattern: isRequestPhase
        ? '^\\$\\{(arg_|cookie_|http_)[a-zA-Z0-9_]+\\}$'
        : '^\\$\\{(arg_|cookie_|http_|sent_http_|upstream_cookie_|upstream_http_)[a-zA-Z0-9_]+\\}$',
    },
    {
      // special variables with arguments
      type: 'string',
      pattern: `^\\$\\{(${SPECIAL_VARIABLES.join('|')})\\([^)]+\\)\\}$`,
    },
  ],
  errorMessage: isRequestPhase
    ? "The 'variable' field must be a valid request phase variable wrapped in ${}, follow the patterns arg_*, cookie_*, http_*, or be a special function variable cookie_time_offset(), encode_base64()"
    : "The 'variable' field must be a valid response phase variable wrapped in ${}, follow the patterns arg_*, cookie_*, http_*, sent_http_*, upstream_cookie_*, upstream_http_*, or be a special function variable cookie_time_offset(), encode_base64()",
});

const noArgsBehaviorSchema = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: NO_ARGS_BEHAVIORS,
      errorMessage: "The 'type' field must be a valid no-args behavior type.",
    },
  },
  required: ['type'],
  additionalProperties: false,
  errorMessage: {
    additionalProperties: 'No additional properties are allowed in no-args behaviors.',
    required: "The 'type' field is required in no-args behaviors.",
  },
};

const stringBehaviorSchema = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: STRING_BEHAVIORS,
      errorMessage: "The 'type' field must be a valid string behavior type.",
    },
    attributes: {
      type: 'object',
      properties: {
        value: {
          type: 'string',
          minLength: 1,
          maxLength: 255,
          pattern: '.*',
          errorMessage: "The 'value' field must be a string between 1 and 255 characters.",
        },
      },
      required: ['value'],
      additionalProperties: false,
      errorMessage: {
        additionalProperties: 'No additional properties are allowed in string behavior attributes.',
        required: "The 'value' field is required in string behavior attributes.",
      },
    },
  },
  required: ['type', 'attributes'],
  additionalProperties: false,
};

// Schema para behaviors com ID value (run_function, set_cache_policy, etc.)
const idBehaviorSchema = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: ID_BEHAVIORS,
      errorMessage: "The 'type' field must be a valid ID behavior type.",
    },
    attributes: {
      type: 'object',
      properties: {
        value: {
          oneOf: [
            {
              type: 'string',
              minLength: 1,
              maxLength: 255,
              pattern: '.*',
            },
            {
              type: 'number',
              minimum: 1,
            },
          ],
          errorMessage: "The 'value' field must be a string or positive number.",
        },
      },
      required: ['value'],
      additionalProperties: false,
      errorMessage: {
        additionalProperties: 'No additional properties are allowed in ID behavior attributes.',
        required: "The 'value' field is required in ID behavior attributes.",
      },
    },
  },
  required: ['type', 'attributes'],
  additionalProperties: false,
};

const headerBehaviorSchema = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: HEADER_BEHAVIORS,
      errorMessage: "The 'type' field must be a valid header behavior type.",
    },
    attributes: {
      type: 'object',
      properties: {
        value: {
          type: 'string',
          minLength: 1,
          maxLength: 255,
          pattern: '.*',
          errorMessage: "The 'value' field must be a non-empty string between 1 and 255 characters.",
        },
      },
      required: ['value'],
      additionalProperties: false,
      errorMessage: {
        additionalProperties: 'No additional properties are allowed in header behavior attributes.',
        required: "The 'value' field is required in header behavior attributes.",
      },
    },
  },
  required: ['type', 'attributes'],
  additionalProperties: false,
};

const cookieBehaviorSchema = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: COOKIE_BEHAVIORS,
      errorMessage: "The 'type' field must be a valid cookie behavior type.",
    },
    attributes: {
      type: 'object',
      properties: {
        value: {
          type: 'string',
          minLength: 1,
          maxLength: 255,
          pattern: '.*',
          errorMessage: "The 'value' field must be a non-empty string between 1 and 255 characters.",
        },
      },
      required: ['value'],
      additionalProperties: false,
      errorMessage: {
        additionalProperties: 'No additional properties are allowed in cookie behavior attributes.',
        required: "The 'value' field is required in cookie behavior attributes.",
      },
    },
  },
  required: ['type', 'attributes'],
  additionalProperties: false,
};

const captureGroupsBehaviorSchema = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: ['capture_match_groups'],
      errorMessage: "The 'type' field must be 'capture_match_groups'.",
    },
    attributes: {
      type: 'object',
      properties: {
        regex: {
          type: 'string',
          minLength: 1,
          maxLength: 255,
          pattern: '.*',
          errorMessage: "The 'regex' field must be a string between 1 and 255 characters.",
        },
        subject: {
          type: 'string',
          minLength: 4,
          maxLength: 50,
          pattern: '.*',
          errorMessage: "The 'subject' field must be a string between 4 and 50 characters.",
        },
        captured_array: {
          type: 'string',
          minLength: 1,
          maxLength: 10,
          pattern: '.*',
          errorMessage: "The 'captured_array' field must be a string between 1 and 10 characters.",
        },
      },
      required: ['regex', 'subject', 'captured_array'],
      additionalProperties: false,
      errorMessage: {
        additionalProperties: 'No additional properties are allowed in capture groups behavior attributes.',
        required:
          "All fields ('regex', 'subject', 'captured_array') are required in capture groups behavior attributes.",
      },
    },
  },
  required: ['type', 'attributes'],
  additionalProperties: false,
};

const ruleBehaviorSchema = {
  oneOf: [
    noArgsBehaviorSchema,
    stringBehaviorSchema,
    idBehaviorSchema,
    headerBehaviorSchema,
    cookieBehaviorSchema,
    captureGroupsBehaviorSchema,
  ],
  errorMessage: 'Each behavior must match one of the valid behavior formats.',
};

const createRuleSchema = (isRequestPhase = false) => ({
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 250,
      pattern: '.*',
      errorMessage: "The 'name' field must be a string between 1 and 250 characters.",
    },
    description: {
      type: 'string',
      maxLength: 1000,
      errorMessage: "The 'description' field must be a string with maximum 1000 characters.",
    },
    active: {
      type: 'boolean',
      default: true,
      errorMessage: "The 'active' field must be a boolean.",
    },
    criteria: {
      type: 'array',
      items: {
        type: 'array',
        items: createCriteriaBaseSchema(isRequestPhase),
        minItems: 1,
        maxItems: 10,
        errorMessage: 'Each criteria group must have between 1 and 10 criteria items.',
      },
      minItems: 1,
      maxItems: 5,
      errorMessage: 'The criteria must be an array of arrays with 1-5 groups.',
    },
    behaviors: {
      type: 'array',
      items: ruleBehaviorSchema,
      minItems: 1,
      maxItems: 10,
      errorMessage: 'The behaviors must be an array with 1-10 items.',
    },
  },
  required: ['name', 'criteria', 'behaviors'],
  additionalProperties: false,
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
    bindings: {
      type: 'object',
      properties: {
        storage: {
          type: 'object',
          properties: {
            bucket: {
              type: ['string', 'number'],
              errorMessage: "The 'bucket' field must be a string or number",
            },
            prefix: {
              type: 'string',
              errorMessage: "The 'prefix' field must be a string",
            },
          },
          required: ['bucket', 'prefix'],
          additionalProperties: false,
          errorMessage: {
            type: "The 'storage' field must be an object",
            additionalProperties: 'No additional properties are allowed in the storage object binding.',
            required: "The 'bucket' and 'prefix' fields are required in the storage object binding.",
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
      enum: EDGE_ACCESS_TYPES,
      errorMessage: "The 'edge_access' field must be one of: read_only, read_write, restricted.",
    },
    prefix: {
      type: 'string',
      errorMessage: "The 'prefix' field must be a string.",
    },
  },
  required: ['name', 'dir', 'prefix'],
  additionalProperties: false,
  errorMessage: {
    additionalProperties: 'No additional properties are allowed in storage items.',
    required: "The 'name', 'dir' and 'prefix' fields are required.",
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
        applications: {
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
              functionsEnabled: {
                type: 'boolean',
                default: false,
                errorMessage: "The 'functionsEnabled' field must be a boolean",
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
              cache: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: {
                      type: 'string',
                      minLength: 1,
                      maxLength: 250,
                      pattern: "^[a-zA-Z0-9 \\-.',|]+$",
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
                    tieredCache: {
                      type: 'object',
                      properties: {
                        enabled: {
                          type: 'boolean',
                          default: false,
                          errorMessage: "The 'enabled' field must be a boolean.",
                        },
                        topology: {
                          type: ['string', 'null'],
                          enum: ['nearest-region', 'us-east-1', 'br-east-1', null],
                          default: 'nearest-region',
                          errorMessage:
                            "The 'topology' field must be one of 'nearest-region', 'br-east-1', 'us-east-1' or null.",
                        },
                      },
                      required: ['enabled'],
                      if: {
                        properties: { enabled: { const: true } }
                      },
                      then: {
                        required: ['enabled', 'topology'],
                        errorMessage: {
                          required: "When 'enabled' is true, 'topology' is required in the 'tiered_cache' object."
                        }
                      },
                      additionalProperties: false,
                      errorMessage: {
                        additionalProperties: "No additional properties are allowed in the 'tiered_cache' object.",
                      },
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
              functionsInstances: {
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
                      type: ['string', 'number'],
                      errorMessage:
                        "The 'ref' field must be a string or number referencing an existing Function name or ID",
                    },
                    args: {
                      type: 'object',
                      default: {},
                      errorMessage: "The 'args' field must be an object",
                    },
                    active: {
                      type: 'boolean',
                      default: true,
                      errorMessage: "The 'active' field must be a boolean",
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
          minItems: 1,
          errorMessage: "The 'applications' field must be an array of application objects with at least one item",
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
                  enabled: {
                    type: 'boolean',
                    default: false,
                  },
                  config: {
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
                    additionalProperties: false,
                  },
                },
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
                            application: {
                              type: ['string', 'number'],
                              errorMessage:
                                "The 'application' field must be a string or number referencing an existing Application name or ID",
                            },
                            firewall: {
                              type: ['string', 'number', 'null'],
                              errorMessage:
                                "The 'firewall' field must be a string or number referencing an existing Firewall name/ID or null",
                            },
                            customPage: {
                              type: ['string', 'number', 'null'],
                              minimum: 1,
                              errorMessage:
                                "The 'customPage' field must be a string or number referencing a custom page name/ID or null",
                            },
                          },
                          required: ['application'],
                          additionalProperties: false,
                          errorMessage: {
                            additionalProperties: 'No additional properties are allowed in strategy attributes',
                            required: "The 'application' field is required in strategy attributes",
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
                minItems: 1,
                errorMessage: "The 'deployments' field must be an array of deployment objects with at least one item.",
              },
            },
            required: ['name', 'deployments'],
            additionalProperties: false,
            errorMessage: {
              additionalProperties: 'No additional properties are allowed in workload items',
              required: {
                name: "The 'name' field is required in workloads",
                deployments: "The 'deployments' field is required in workloads",
              },
            },
          },
          minItems: 1,
          errorMessage: "The 'workloads' field must be an array of workloads items with at least one item.",
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
                enum: ['cache', 'tiered_cache'],
                errorMessage: "The 'layer' field must be either 'cache' or 'tiered_cache'.",
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
        firewall: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                errorMessage: "The firewall configuration must have a 'name' field of type string",
              },
              active: {
                type: 'boolean',
                errorMessage: "The firewall's 'active' field must be a boolean",
              },
              debugRules: {
                type: 'boolean',
                errorMessage: "The firewall's 'debugRules' field must be a boolean",
              },
              functions: {
                type: 'boolean',
                errorMessage: "The firewall's 'functions' field must be a boolean",
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
                          type: ['string', 'number'],
                          errorMessage: "The 'runFunction' behavior must be a string or number",
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
                              type: ['string', 'number'],
                              errorMessage: 'The wafId must be a string or number',
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
              type: 'Each firewall item must be an object',
              additionalProperties: 'No additional properties are allowed in the firewall object',
              required: "The 'name' field is required in each  firewall object",
            },
          },
          errorMessage: {
            type: "The 'firewall' field must be an array of  firewall objects",
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
        connectors: {
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
                errorMessage: "The 'type' field must be one of: http, storage, live_ingest",
              },
              attributes: {
                oneOf: [
                  {
                    type: 'object',
                    properties: {
                      bucket: {
                        type: 'string',
                        minLength: 1,
                        maxLength: 255,
                        pattern: '.*',
                        errorMessage: "The 'bucket' field must be a string between 1 and 255 characters",
                      },
                      prefix: {
                        type: 'string',
                        minLength: 0,
                        maxLength: 255,
                        pattern: '.*',
                        errorMessage: "The 'prefix' field must be a string between 0 and 255 characters",
                      },
                    },
                    required: ['bucket', 'prefix'],
                    additionalProperties: false,
                    errorMessage: 'Storage attributes must have bucket and prefix',
                  },
                  {
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
                            default: 'both',
                            errorMessage: "The 'dnsResolution' must be one of: both, force_ipv4",
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
                                            errorMessage: "The 'type' must be one of: aws4_hmac_sha256",
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
                    errorMessage: 'HTTP/Live Ingest attributes must have addresses, connectionOptions, and modules',
                  },
                ],
                errorMessage:
                  "The 'attributes' field must match either  storage format (bucket, prefix) or HTTP/Live Ingest format (addresses, connectionOptions, modules).",
              },
            },
            required: ['name', 'type', 'attributes'],
            additionalProperties: false,
          },
        },
        functions: {
          type: 'array',
          items: schemaFunction,
          errorMessage: "The 'functions' field must be an array of function objects with at least one item",
        },
        customPages: {
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
              pages: {
                type: 'array',
                minItems: 1,
                items: {
                  type: 'object',
                  properties: {
                    code: {
                      type: 'string',
                      enum: CUSTOM_PAGE_ERROR_CODES,
                      errorMessage: "The 'code' field must be a valid error code",
                    },
                    page: {
                      type: 'object',
                      properties: {
                        type: {
                          type: 'string',
                          enum: CUSTOM_PAGE_TYPES,
                          default: 'page_connector',
                          errorMessage: "The 'type' field must be a valid page type",
                        },
                        attributes: {
                          type: 'object',
                          properties: {
                            connector: {
                              type: ['string', 'number'],
                              errorMessage:
                                "The 'connector' field must be a string or number referencing a connector name or ID",
                            },
                            ttl: {
                              type: 'integer',
                              minimum: 0,
                              maximum: 31536000,
                              default: 0,
                              errorMessage: "The 'ttl' field must be an integer between 0 and 31536000",
                            },
                            uri: {
                              type: ['string', 'null'],
                              minLength: 1,
                              maxLength: 250,
                              pattern: '^/[/a-zA-Z0-9\\-_.~@:]*$',
                              errorMessage: "The 'uri' field must be a valid URI path starting with / or null",
                            },
                            customStatusCode: {
                              type: ['integer', 'null'],
                              minimum: 100,
                              maximum: 599,
                              errorMessage:
                                "The 'customStatusCode' field must be an integer between 100 and 599 or null",
                            },
                          },
                          required: ['connector'],
                          additionalProperties: false,
                          errorMessage: {
                            additionalProperties: 'No additional properties are allowed in page attributes',
                            required: "The 'connector' field is required in page attributes",
                          },
                        },
                      },
                      required: ['attributes'],
                      additionalProperties: false,
                      errorMessage: {
                        additionalProperties: 'No additional properties are allowed in page configuration',
                        required: "The 'attributes' field is required in page configuration",
                      },
                    },
                  },
                  required: ['code', 'page'],
                  additionalProperties: false,
                  errorMessage: {
                    additionalProperties: 'No additional properties are allowed in page entry',
                    required: "The 'code' and 'page' fields are required in each page entry",
                  },
                },
                errorMessage: "The 'pages' field must be an array of page configurations with at least one item",
              },
            },
            required: ['name', 'pages'],
            additionalProperties: false,
            errorMessage: {
              additionalProperties: 'No additional properties are allowed in custom page objects',
              required: "The 'name' and 'pages' fields are required in each custom page",
            },
          },
          errorMessage: "The 'customPages' field must be an array of custom page objects",
        },
        storage: {
          type: 'array',
          items: schemaStorage,
          errorMessage: "The 'storage' field must be an array of  storage items.",
        },
      },
      additionalProperties: false,
      required: ['build', 'applications', 'workloads'],
      errorMessage: {
        additionalProperties:
          'Config can only contain the following properties: build, functions, applications, workloads, purge, edgefirewall, networkList, waf, connectors, customPages',
        type: 'Configuration must be an object',
      },
    },
  },
  $ref: '#/definitions/mainConfig',
};

export default azionConfigSchema;
