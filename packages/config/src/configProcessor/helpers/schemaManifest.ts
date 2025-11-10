import {
  APPLICATION_DELIVERY_PROTOCOLS,
  APPLICATION_HTTP_PORTS,
  APPLICATION_HTTPS_PORTS,
  APPLICATION_SUPPORTED_CIPHERS,
  APPLICATION_TLS_VERSIONS,
  CACHE_ADAPTIVE_DELIVERY,
  CACHE_BROWSER_SETTINGS,
  CACHE_BY_COOKIE,
  CACHE_BY_QUERY_STRING,
  CACHE_CDN_SETTINGS,
  CACHE_VARY_BY_METHOD,
  COOKIE_BEHAVIORS,
  CUSTOM_PAGE_ERROR_CODES,
  EDGE_CONNECTOR_DNS_RESOLUTION,
  EDGE_CONNECTOR_HMAC_TYPE,
  EDGE_CONNECTOR_HTTP_VERSION_POLICY,
  EDGE_CONNECTOR_LOAD_BALANCE_METHOD,
  EDGE_CONNECTOR_TRANSPORT_POLICY,
  EDGE_CONNECTOR_TYPES,
  FIREWALL_BEHAVIOR_NAMES,
  FIREWALL_RATE_LIMIT_BY,
  FIREWALL_RATE_LIMIT_TYPES,
  FIREWALL_RULE_CONDITIONALS,
  FIREWALL_RULE_OPERATORS,
  FIREWALL_VARIABLES,
  FIREWALL_WAF_MODES,
  HEADER_BEHAVIORS,
  ID_BEHAVIORS,
  NETWORK_LIST_TYPES,
  NO_ARGS_BEHAVIORS,
  RULE_CONDITIONALS,
  RULE_OPERATORS_WITH_VALUE,
  RULE_OPERATORS_WITHOUT_VALUE,
  RULE_VARIABLES,
  STRING_BEHAVIORS,
  TIERED_CACHE_TOPOLOGY,
  WAF_ENGINE_VERSIONS,
  WORKLOAD_HTTP_VERSIONS,
  WORKLOAD_MTLS_VERIFICATION,
  WORKLOAD_TLS_VERSIONS,
} from '../../constants';

const schemaNetworkListManifest = {
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
      errorMessage: "The 'type' field must be a string. Accepted values are 'asn', 'countries' or 'ip_cidr'.",
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
};

const schemaWafManifest = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 250,
      pattern: '.*',
      errorMessage: "The 'name' field must be a string (1-250 characters).",
    },
    product_version: {
      type: ['string', 'null'],
      minLength: 3,
      maxLength: 50,
      pattern: '\\d+\\.\\d+',
      default: '1.0',
      errorMessage: "The 'product_version' field must be a string matching pattern \\d+\\.\\d+ (e.g., '1.0').",
    },
    engine_settings: {
      type: 'object',
      properties: {
        engine_version: {
          type: 'string',
          enum: WAF_ENGINE_VERSIONS,
          default: '2021-Q3',
          errorMessage: "The 'engine_version' field must be '2021-Q3'.",
        },
        type: {
          type: 'string',
          enum: ['score'],
          default: 'score',
          errorMessage: "The 'type' field must be 'score'.",
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
              errorMessage: "The 'rulesets' field must be an array containing [1].",
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
                    errorMessage: "The 'threat' field must be a valid threat type.",
                  },
                  sensitivity: {
                    type: 'string',
                    enum: ['highest', 'high', 'medium', 'low', 'lowest'],
                    default: 'medium',
                    errorMessage: "The 'sensitivity' field must be one of: highest, high, medium, low, lowest.",
                  },
                },
                required: ['threat', 'sensitivity'],
                additionalProperties: false,
              },
              maxItems: 8,
              default: [
                { threat: 'cross_site_scripting', sensitivity: 'medium' },
                { threat: 'directory_traversal', sensitivity: 'medium' },
                { threat: 'evading_tricks', sensitivity: 'medium' },
                { threat: 'file_upload', sensitivity: 'medium' },
                { threat: 'identified_attack', sensitivity: 'medium' },
                { threat: 'remote_file_inclusion', sensitivity: 'medium' },
                { threat: 'sql_injection', sensitivity: 'medium' },
                { threat: 'unwanted_access', sensitivity: 'medium' },
              ],
              errorMessage: "The 'thresholds' field must be an array of threat configurations (max 8 items).",
            },
          },
          required: ['rulesets', 'thresholds'],
          additionalProperties: false,
          errorMessage: {
            additionalProperties: 'No additional properties are allowed in the attributes object.',
            required: "The 'rulesets' and 'thresholds' fields are required in the attributes object.",
          },
        },
      },
      required: ['engine_version', 'type', 'attributes'],
      additionalProperties: false,
      errorMessage: {
        additionalProperties: 'No additional properties are allowed in the engine_settings object.',
        required: "The 'engine_version', 'type', and 'attributes' fields are required in the engine_settings object.",
      },
    },
  },
  required: ['name', 'engine_settings'],
  additionalProperties: false,
  errorMessage: {
    additionalProperties: 'No additional properties are allowed in waf items.',
    required:
      "The 'name, mode, active, sql_injection, sql_injection_sensitivity, remote_file_inclusion, remote_file_inclusion_sensitivity, directory_traversal, directory_traversal_sensitivity, cross_site_scripting, cross_site_scripting_sensitivity, evading_tricks, evading_tricks_sensitivity, file_upload, file_upload_sensitivity, unwanted_access, unwanted_access_sensitivity, identified_attack, identified_attack_sensitivity and bypass_addresses' fields are required in each waf item.",
  },
};

const schemaFirewallRuleCriteria = {
  type: 'object',
  properties: {
    variable: {
      type: 'string',
      enum: FIREWALL_VARIABLES,
      errorMessage: "The 'variable' field must be a valid firewall variable.",
    },
    operator: {
      type: 'string',
      enum: FIREWALL_RULE_OPERATORS,
      errorMessage: "The 'operator' field must be a valid operator.",
    },
    conditional: {
      type: 'string',
      enum: FIREWALL_RULE_CONDITIONALS,
      errorMessage: "The 'conditional' field must be one of: if, and, or",
    },
    argument: {
      type: 'string',
      errorMessage: "The 'argument' field must be a string.",
    },
  },
  required: ['variable', 'operator', 'conditional'],
  additionalProperties: false,
  errorMessage: {
    required: "The 'variable', 'operator' and 'conditional' fields are required in criteria.",
    additionalProperties: 'No additional properties are allowed in criteria.',
  },
};

const schemaStorageManifest = {
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
    edge_access: {
      type: 'string',
      enum: ['read_only', 'read_write', 'restricted'],
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
    additionalProperties: 'No additional properties are allowed in  storage items.',
    required: "The 'name', 'dir' and 'prefix' fields are required.",
  },
};

const schemaFirewallRuleBehaviorArguments = {
  set_rate_limit: {
    type: 'object',
    properties: {
      type: {
        type: 'string',
        enum: FIREWALL_RATE_LIMIT_TYPES,
        errorMessage: "The rate limit 'type' must be either 'second' or 'minute'.",
      },
      limit_by: {
        type: 'string',
        enum: FIREWALL_RATE_LIMIT_BY,
        errorMessage: "The 'limit_by' field must be either 'client_ip' or 'global'.",
      },
      average_rate_limit: {
        type: 'string',
        pattern: '^[0-9]+$',
        errorMessage: "The 'average_rate_limit' must be a string containing a number.",
      },
      maximum_burst_size: {
        type: 'string',
        pattern: '^[0-9]+$',
        errorMessage: "The 'maximum_burst_size' must be a string containing a number.",
      },
    },
    required: ['type', 'limit_by', 'average_rate_limit'],
    additionalProperties: false,
  },
  set_waf_ruleset: {
    type: 'object',
    properties: {
      waf_id: {
        type: 'integer',
        errorMessage: 'The waf_id must be an integer',
      },
      mode: {
        type: 'string',
        enum: FIREWALL_WAF_MODES,
        errorMessage: `The mode must be one of: ${FIREWALL_WAF_MODES.join(', ')}`,
      },
    },
    required: ['waf_id', 'mode'],
    additionalProperties: false,
    errorMessage: {
      additionalProperties: 'No additional properties are allowed in the set_waf_ruleset object',
      required: "Both 'waf_id' and 'mode' fields are required in set_waf_ruleset",
    },
  },
  set_custom_response: {
    type: 'object',
    properties: {
      status_code: {
        oneOf: [
          {
            type: 'integer',
            minimum: 200,
            maximum: 499,
            errorMessage: 'The status_code must be an integer between 200 and 499',
          },
          {
            type: 'string',
            pattern: '^[2-4][0-9]{2}$',
            errorMessage: 'The status_code as string must be a valid HTTP status code (200-499)',
          },
        ],
        errorMessage: 'The status_code must be either an integer or string between 200 and 499',
      },
      content_body: {
        type: 'string',
        maxLength: 500,
        errorMessage: 'The content_body must be a string with maximum 500 characters',
      },
      content_type: {
        type: 'string',
        errorMessage: 'The content_type must be a string',
      },
    },
    required: ['status_code', 'content_body', 'content_type'],
    additionalProperties: false,
    errorMessage: {
      additionalProperties: 'No additional properties are allowed in the set_custom_response object',
      required: "All fields ('status_code', 'content_body', 'content_type') are required in set_custom_response",
    },
  },
};

const schemaFirewallRuleBehavior = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      enum: FIREWALL_BEHAVIOR_NAMES,
      errorMessage: "The behavior 'name' must be a valid firewall behavior.",
    },
    target: {
      oneOf: [
        { type: 'null' },
        { type: 'string' },
        schemaFirewallRuleBehaviorArguments.set_rate_limit,
        schemaFirewallRuleBehaviorArguments.set_waf_ruleset,
        schemaFirewallRuleBehaviorArguments.set_custom_response,
      ],
      errorMessage: "The 'target' must be a string, object, or null depending on the behavior.",
    },
  },
  required: ['name'],
  additionalProperties: false,
  errorMessage: {
    required: "The 'name' field is required in firewall behaviors.",
    additionalProperties: 'No additional properties are allowed in firewall behaviors.',
  },
};

const schemaFirewallRule = {
  type: 'object',
  properties: {
    id: {
      type: 'integer',
      errorMessage: "The 'id' field must be an integer.",
    },
    name: {
      type: 'string',
      errorMessage: "The 'name' field must be a string.",
    },
    criteria: {
      type: 'array',
      items: {
        type: 'array',
        items: schemaFirewallRuleCriteria,
        errorMessage: "The 'criteria' field must be an array of criteria objects.",
      },
      errorMessage: "The 'criteria' field must be an array of criteria objects.",
    },
    behaviors: {
      type: 'array',
      items: schemaFirewallRuleBehavior,
      errorMessage: "The 'behaviors' field must be an array of behavior objects.",
    },
    description: {
      type: 'string',
      maxLength: 1000,
      pattern: '^[\\u0000-\\uFFFF]*$',
      errorMessage: "The 'description' must not exceed 1000 characters and must not contain 4-byte unicode characters.",
    },
    active: {
      type: 'boolean',
      default: true,
      errorMessage: "The 'active' field must be a boolean.",
    },
  },
  required: ['name', 'criteria', 'behaviors'],
  additionalProperties: false,
  errorMessage: {
    type: "The 'firewall' field must be an object",
    required: "The 'name', 'criteria' and 'behaviors' fields are required in firewall rules.",
    additionalProperties: 'No additional properties are allowed in firewall rules.',
  },
};
const schemaFunctionManifest = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 250,
      pattern: '.*',
      errorMessage: "The 'name' field must be a string between 1 and 250 characters",
    },
    runtime: {
      type: 'string',
      enum: ['azion_js'],
      default: 'azion_js',
      errorMessage: "The 'runtime' field must be 'azion_js'",
    },
    code: {
      type: 'string',
      minLength: 1,
      maxLength: 20971520,
      pattern: '.*',
      errorMessage: "The 'code' field must be a string between 1 and 20971520 characters (20MB max)",
    },
    default_args: {
      type: 'object',
      default: {},
      errorMessage: "The 'default_args' field must be an object",
    },
    execution_environment: {
      type: 'string',
      enum: ['application', 'firewall'],
      default: 'application',
      errorMessage: "The 'execution_environment' field must be 'application' or 'firewall'",
    },
    active: {
      type: 'boolean',
      default: true,
      errorMessage: "The 'active' field must be a boolean",
    },
    path: {
      type: 'string',
      errorMessage: "The 'path' field must be a string",
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
          additionalProperties: false,
        },
      },
      additionalProperties: false,
      errorMessage: "The 'bindings' field must be an object",
    },
  },
  required: ['name'],
  additionalProperties: false,
};

const schemaFirewallManifest = {
  type: ['object', 'null'],
  properties: {
    main_settings: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          errorMessage: "The 'name' field must be a string.",
        },
        domains: {
          type: 'array',
          items: {
            type: 'string',
            errorMessage: "Each domain in the firewall's domains list must be a string",
          },
        },
        is_active: {
          type: 'boolean',
          errorMessage: "The 'is_active' field must be a boolean.",
        },
        functions_enabled: {
          type: 'boolean',
          errorMessage: "The 'functions_enabled' field must be a boolean.",
        },
        network_protection_enabled: {
          type: 'boolean',
          errorMessage: "The 'network_protection_enabled' field must be a boolean.",
        },
        waf_enabled: {
          type: 'boolean',
          errorMessage: "The 'waf_enabled' field must be a boolean.",
        },
        debug_rules: {
          type: 'boolean',
          errorMessage: "The 'debug_rules' field must be a boolean.",
        },
      },
      required: ['name'],
      additionalProperties: false,
      errorMessage: {
        additionalProperties: 'No additional properties are allowed in firewall main settings.',
        required: "The 'name' field is required in firewall main settings.",
      },
    },
    rules_engine: {
      type: 'array',
      items: schemaFirewallRule,
      errorMessage: {
        type: "The 'rules_engine' field must be an array",
        required: "The 'rules_engine' field must be an array of firewall rules.",
        additionalProperties: 'No additional properties are allowed in firewall rules.',
      },
    },
  },
  required: ['main_settings'],
  additionalProperties: false,
  errorMessage: {
    additionalProperties: 'No additional properties are allowed in firewall object.',
    required: "The 'main_settings' field is required in firewall object.",
  },
};

const schemaApplicationCacheSettings = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 250,
      pattern: "^[a-zA-Z0-9 \\-.',|]+$",
      errorMessage: "The 'name' field must be a string between 1-250 characters with valid pattern.",
    },
    browser_cache: {
      type: 'object',
      properties: {
        behavior: {
          type: 'string',
          enum: CACHE_BROWSER_SETTINGS,
          default: 'honor',
          errorMessage: "The 'behavior' must be one of: honor, override, no-cache.",
        },
        max_age: {
          type: 'integer',
          minimum: 0,
          maximum: 31536000,
          default: 0,
          errorMessage: "The 'max_age' must be between 0 and 31536000 seconds.",
        },
      },
      required: ['behavior', 'max_age'],
      additionalProperties: false,
      errorMessage: {
        required: "Both 'behavior' and 'max_age' are required in browser_cache.",
        additionalProperties: 'No additional properties are allowed in browser_cache.',
      },
    },
    modules: {
      type: 'object',
      properties: {
        cache: {
          type: 'object',
          properties: {
            behavior: {
              type: 'string',
              enum: CACHE_CDN_SETTINGS,
              default: 'honor',
              errorMessage: "The 'behavior' must be either 'honor' or 'override'.",
            },
            max_age: {
              type: 'integer',
              minimum: 0,
              maximum: 31536000,
              default: 60,
              errorMessage: "The 'max_age' must be between 0 and 31536000 seconds.",
            },
            stale_cache: {
              type: 'object',
              properties: {
                enabled: {
                  type: 'boolean',
                  errorMessage: "The 'enabled' field must be a boolean.",
                },
              },
              required: ['enabled'],
              additionalProperties: false,
            },
            large_file_cache: {
              type: 'object',
              properties: {
                enabled: {
                  type: 'boolean',
                  errorMessage: "The 'enabled' field must be a boolean.",
                },
                offset: {
                  type: 'integer',
                  minimum: 0,
                  errorMessage: "The 'offset' must be a non-negative integer.",
                },
              },
              required: ['enabled', 'offset'],
              additionalProperties: false,
            },
            tiered_cache: {
              type: ['object', 'null'],
              properties: {
                topology: {
                  type: 'string',
                  enum: TIERED_CACHE_TOPOLOGY,
                  errorMessage: "The 'topology' must be one of: nearest-region, us-east-1, br-east-1.",
                },
              },
              required: ['topology'],
              additionalProperties: false,
            },
          },
          required: ['behavior', 'max_age'],
          additionalProperties: false,
        },
        application_accelerator: {
          type: 'object',
          properties: {
            cache_vary_by_method: {
              type: 'array',
              items: {
                type: 'string',
                enum: CACHE_VARY_BY_METHOD,
              },
              maxItems: 2,
              errorMessage: "The 'cache_vary_by_method' must be an array of max 2 valid HTTP methods (options, post).",
            },
            cache_vary_by_querystring: {
              type: 'object',
              properties: {
                behavior: {
                  type: 'string',
                  enum: CACHE_BY_QUERY_STRING,
                  default: 'ignore',
                  errorMessage: "The 'behavior' must be one of: ignore, all, allowlist, denylist.",
                },
                fields: {
                  type: 'array',
                  items: { type: 'string' },
                  errorMessage: "The 'fields' must be an array of strings.",
                },
                sort_enabled: {
                  type: 'boolean',
                  default: true,
                  errorMessage: "The 'sort_enabled' field must be a boolean.",
                },
              },
              required: ['behavior', 'fields', 'sort_enabled'],
              additionalProperties: false,
            },
            cache_vary_by_cookies: {
              type: 'object',
              properties: {
                behavior: {
                  type: 'string',
                  enum: CACHE_BY_COOKIE,
                  default: 'ignore',
                  errorMessage: "The 'behavior' must be one of: ignore, all, allowlist, denylist.",
                },
                cookie_names: {
                  type: 'array',
                  items: { type: 'string' },
                  errorMessage: "The 'cookie_names' must be an array of strings.",
                },
              },
              required: ['behavior', 'cookie_names'],
              additionalProperties: false,
            },
            cache_vary_by_devices: {
              type: 'object',
              properties: {
                behavior: {
                  type: 'string',
                  enum: CACHE_ADAPTIVE_DELIVERY,
                  default: 'ignore',
                  errorMessage: "The 'behavior' must be either 'ignore' or 'allowlist'.",
                },
                device_group: {
                  type: 'array',
                  items: { type: 'integer' },
                  errorMessage: "The 'device_group' must be an array of integers.",
                },
              },
              required: ['behavior', 'device_group'],
              additionalProperties: false,
            },
          },
          required: [
            'cache_vary_by_method',
            'cache_vary_by_querystring',
            'cache_vary_by_cookies',
            'cache_vary_by_devices',
          ],
          additionalProperties: false,
        },
      },
      required: ['cache', 'application_accelerator'],
      additionalProperties: false,
    },
  },
  required: ['name', 'browser_cache', 'modules'],
  additionalProperties: false,
};

const schemaBehaviorManifest = {
  oneOf: [
    {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: NO_ARGS_BEHAVIORS,
        },
      },
      required: ['type'],
      additionalProperties: false,
    },
    {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: STRING_BEHAVIORS,
        },
        attributes: {
          type: 'object',
          properties: {
            value: {
              type: 'string',
              minLength: 1,
              maxLength: 255,
            },
          },
          required: ['value'],
          additionalProperties: false,
        },
      },
      required: ['type', 'attributes'],
      additionalProperties: false,
    },
    {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ID_BEHAVIORS,
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
                },
                {
                  type: 'integer',
                  minimum: 1,
                },
              ],
            },
          },
          required: ['value'],
          additionalProperties: false,
        },
      },
      required: ['type', 'attributes'],
      additionalProperties: false,
    },
    {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: HEADER_BEHAVIORS,
        },
        attributes: {
          type: 'object',
          properties: {
            value: {
              type: 'string',
              minLength: 1,
              maxLength: 255,
              pattern: '.*',
            },
          },
          required: ['value'],
          additionalProperties: false,
        },
      },
      required: ['type', 'attributes'],
      additionalProperties: false,
    },
    {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: COOKIE_BEHAVIORS,
        },
        attributes: {
          type: 'object',
          properties: {
            value: {
              type: 'string',
              minLength: 1,
              maxLength: 255,
              pattern: '.*',
            },
          },
          required: ['value'],
          additionalProperties: false,
        },
      },
      required: ['type', 'attributes'],
      additionalProperties: false,
    },
    {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['capture_match_groups'],
        },
        attributes: {
          type: 'object',
          properties: {
            regex: {
              type: 'string',
              minLength: 1,
              maxLength: 255,
            },
            subject: {
              type: 'string',
              minLength: 4,
              maxLength: 50,
            },
            captured_array: {
              type: 'string',
              minLength: 1,
              maxLength: 10,
            },
          },
          required: ['regex', 'subject', 'captured_array'],
          additionalProperties: false,
        },
      },
      required: ['type', 'attributes'],
      additionalProperties: false,
    },
  ],
};

const schemaCriteriaManifest = {
  type: 'object',
  properties: {
    variable: {
      type: 'string',
      pattern: `^\\$\\{(${Array.from(new Set(RULE_VARIABLES)).join('|')})\\}$`,
      errorMessage: "The 'variable' field must be a valid variable name wrapped in ${}.",
    },
    operator: {
      type: 'string',
      enum: [...RULE_OPERATORS_WITH_VALUE, ...RULE_OPERATORS_WITHOUT_VALUE],
      errorMessage: "The 'operator' field must be a valid operator.",
    },
    conditional: {
      type: 'string',
      enum: RULE_CONDITIONALS,
      errorMessage: "The 'conditional' field must be one of: if, and, or.",
    },
    argument: {
      type: 'string',
      errorMessage: "The 'argument' field must be a string.",
    },
  },
  required: ['variable', 'operator', 'conditional'],
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
};

const schemaApplicationRulesV4 = {
  type: 'object',
  properties: {
    phase: {
      type: 'string',
      enum: ['request', 'response'],
      errorMessage: "The 'phase' field must be either 'request' or 'response'.",
    },
    rule: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          minLength: 1,
          maxLength: 250,
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
            items: schemaCriteriaManifest,
            minItems: 1,
            maxItems: 10,
          },
          minItems: 1,
          maxItems: 5,
          errorMessage: 'The criteria must be an array of arrays with 1-5 groups.',
        },
        behaviors: {
          type: 'array',
          items: schemaBehaviorManifest,
          minItems: 1,
          maxItems: 10,
          errorMessage: 'The behaviors must be an array with 1-10 items.',
        },
      },
      required: ['name', 'criteria', 'behaviors'],
      additionalProperties: false,
    },
  },
  required: ['phase', 'rule'],
  additionalProperties: false,
};

const schemaApplicationRules = schemaApplicationRulesV4;

const schemaApplicationManifest = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 100,
      pattern: '.*',
      errorMessage: "The 'name' field must be a string between 1 and 100 characters.",
    },
    delivery_protocol: {
      type: 'string',
      enum: APPLICATION_DELIVERY_PROTOCOLS,
      default: 'http',
      errorMessage: "The 'delivery_protocol' field must be either 'http,https' or 'http'.",
    },
    http3: {
      type: 'boolean',
      errorMessage: "The 'http3' field must be a boolean.",
    },
    http_port: {
      type: 'array',
      items: {
        type: 'integer',
        enum: APPLICATION_HTTP_PORTS,
      },
      errorMessage: {
        enum: "The 'http_port' field must be an array of valid HTTP ports.",
        type: "The 'http_port' field must be an array",
      },
    },
    https_port: {
      type: 'array',
      items: {
        type: 'integer',
        enum: APPLICATION_HTTPS_PORTS,
      },
      default: [443],
      errorMessage: "The 'https_port' field must be an array of valid HTTPS ports.",
    },
    minimum_tls_version: {
      type: 'string',
      enum: APPLICATION_TLS_VERSIONS,
      default: '',
      errorMessage: "The 'minimum_tls_version' field must be a valid TLS version.",
    },
    supported_ciphers: {
      type: 'string',
      enum: APPLICATION_SUPPORTED_CIPHERS,
      default: 'all',
      errorMessage: "The 'supported_ciphers' field must be a valid cipher suite.",
    },
    active: {
      type: 'boolean',
      default: true,
      errorMessage: "The 'active' field must be a boolean.",
    },
    debug: {
      type: 'boolean',
      default: false,
      errorMessage: "The 'debug' field must be a boolean.",
    },
    modules: {
      type: 'object',
      properties: {
        cache: {
          type: 'object',
          properties: {
            enabled: {
              type: 'boolean',
              default: true,
              errorMessage: "The 'enabled' field must be a boolean.",
            },
          },
          required: ['enabled'],
          additionalProperties: false,
        },
        functions: {
          type: 'object',
          properties: {
            enabled: {
              type: 'boolean',
              default: false,
              errorMessage: "The 'enabled' field must be a boolean.",
            },
          },
          required: ['enabled'],
          additionalProperties: false,
        },
        application_accelerator: {
          type: 'object',
          properties: {
            enabled: {
              type: 'boolean',
              default: false,
              errorMessage: "The 'enabled' field must be a boolean.",
            },
          },
          required: ['enabled'],
          additionalProperties: false,
        },
        image_processor: {
          type: 'object',
          properties: {
            enabled: {
              type: 'boolean',
              default: false,
              errorMessage: "The 'enabled' field must be a boolean.",
            },
          },
          required: ['enabled'],
          additionalProperties: false,
        },
      },
      required: [],
      additionalProperties: false,
      errorMessage: {
        additionalProperties: 'No additional properties are allowed in modules object.',
      },
    },
    cache_settings: {
      type: 'array',
      items: schemaApplicationCacheSettings,
      errorMessage: "The 'cache_settings' field must be an array of cache setting items.",
    },
    rules: {
      type: 'array',
      items: schemaApplicationRules,
      errorMessage: "The 'rules' field must be an array of application rule items.",
    },
    device_groups: {
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
          user_agent: {
            type: 'string',
            minLength: 1,
            maxLength: 512,
            pattern: '.*',
            errorMessage: "The 'user_agent' field must be a valid regex pattern between 1 and 512 characters.",
          },
        },
        required: ['name', 'user_agent'],
        additionalProperties: false,
        errorMessage: {
          additionalProperties: 'No additional properties are allowed in device group objects.',
          required: "The 'name' and 'user_agent' fields are required in each device group.",
        },
      },
      errorMessage: "The 'device_groups' field must be an array of device group objects.",
    },
    functions_instances: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            minLength: 1,
            maxLength: 100,
            pattern: '.*',
            errorMessage: "The 'name' field must be a string between 1 and 100 characters.",
          },
          function: {
            oneOf: [
              {
                type: 'string',
                minLength: 1,
                maxLength: 250,
                errorMessage: "The 'function' field must be a string between 1 and 250 characters.",
              },
              {
                type: 'integer',
                minimum: 1,
                errorMessage: "The 'function' field must be an integer >= 1.",
              },
            ],
            errorMessage: "The 'function' field must be either a string (function name) or integer (function ID).",
          },
          args: {
            type: 'object',
            default: {},
            errorMessage: "The 'args' field must be an object.",
          },
          active: {
            type: 'boolean',
            default: true,
            errorMessage: "The 'active' field must be a boolean.",
          },
        },
        required: ['name', 'function'],
        additionalProperties: false,
        errorMessage: {
          additionalProperties: 'No additional properties are allowed in function instance objects.',
          required: "The 'name' and 'function' fields are required in each function instance.",
        },
      },
      errorMessage: "The 'functions_instances' field must be an array of function instance objects.",
    },
  },
  required: ['name'],
  additionalProperties: false,
  errorMessage: {
    additionalProperties: 'No additional properties are allowed in application items.',
    required: "The 'name field are required.",
  },
};

const schemaWorkloadManifest = {
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
    workload_domain_allow_access: {
      type: 'boolean',
      default: true,
      errorMessage: "The 'workload_domain_allow_access' field must be a boolean",
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
        minimum_version: {
          type: ['string', 'null'],
          enum: [...WORKLOAD_TLS_VERSIONS, null],
          default: 'tls_1_3',
          errorMessage: "The 'minimum_version' must be a valid TLS version or null",
        },
      },
      default: { certificate: null, ciphers: null, minimum_version: 'tls_1_3' },
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
            http_ports: {
              type: 'array',
              items: { type: 'integer' },
              default: [80],
            },
            https_ports: {
              type: 'array',
              items: { type: 'integer' },
              default: [443],
            },
            quic_ports: {
              type: ['array', 'null'],
              items: { type: 'integer' },
            },
          },
          required: ['versions', 'http_ports', 'https_ports'],
          additionalProperties: false,
        },
      },
      default: {
        http: {
          versions: ['http1', 'http2'],
          http_ports: [80],
          https_ports: [443],
          quic_ports: null,
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
  },
  required: ['name', 'domains'],
  additionalProperties: false,
  errorMessage: {
    additionalProperties: 'No additional properties are allowed in workload items',
    required: "The 'name' and 'domains' fields are required in workload items",
  },
};

const schemaConnectorManifest = {
  type: ['object', 'null'],
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
      errorMessage: "The 'type' must be one of: http, storage, live_ingest",
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
              minLength: 1,
              maxLength: 255,
              pattern: '.*',
              errorMessage: "The 'prefix' field must be a string between 1 and 255 characters",
            },
          },
          required: ['bucket'],
          additionalProperties: false,
          errorMessage: {
            additionalProperties: 'No additional properties are allowed in  storage attributes.',
            required: "The 'bucket' field is required in  storage attributes.",
          },
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
                  http_port: {
                    type: 'integer',
                    minimum: 1,
                    maximum: 65535,
                    default: 80,
                    errorMessage: "The 'http_port' must be between 1 and 65535",
                  },
                  https_port: {
                    type: 'integer',
                    minimum: 1,
                    maximum: 65535,
                    default: 443,
                    errorMessage: "The 'https_port' must be between 1 and 65535",
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
            connection_options: {
              type: 'object',
              properties: {
                dns_resolution: {
                  type: 'string',
                  enum: EDGE_CONNECTOR_DNS_RESOLUTION,
                  default: 'preserve',
                  errorMessage: "The 'dns_resolution' must be one of: both, force_ipv4",
                },
                transport_policy: {
                  type: 'string',
                  enum: EDGE_CONNECTOR_TRANSPORT_POLICY,
                  default: 'preserve',
                  errorMessage: "The 'transport_policy' must be one of: preserve, force_https, force_http",
                },
                http_version_policy: {
                  type: 'string',
                  enum: EDGE_CONNECTOR_HTTP_VERSION_POLICY,
                  default: 'http1_1',
                  errorMessage: "The 'http_version_policy' must be http1_1",
                },
                host: {
                  type: 'string',
                  minLength: 1,
                  maxLength: 255,
                  pattern: '.*',
                  default: '${host}',
                  errorMessage: "The 'host' field must be a string between 1 and 255 characters",
                },
                path_prefix: {
                  type: 'string',
                  minLength: 0,
                  maxLength: 255,
                  pattern: '.*',
                  default: '',
                  errorMessage: "The 'path_prefix' field must be a string between 0 and 255 characters",
                },
                following_redirect: {
                  type: 'boolean',
                  default: false,
                  errorMessage: "The 'following_redirect' field must be a boolean",
                },
                real_ip_header: {
                  type: 'string',
                  minLength: 1,
                  maxLength: 255,
                  pattern: '.*',
                  default: 'X-Real-IP',
                  errorMessage: "The 'real_ip_header' field must be a string between 1 and 255 characters",
                },
                real_port_header: {
                  type: 'string',
                  minLength: 1,
                  maxLength: 255,
                  pattern: '.*',
                  default: 'X-Real-PORT',
                  errorMessage: "The 'real_port_header' field must be a string between 1 and 255 characters",
                },
              },
              required: [
                'dns_resolution',
                'transport_policy',
                'http_version_policy',
                'host',
                'path_prefix',
                'following_redirect',
                'real_ip_header',
                'real_port_header',
              ],
              additionalProperties: false,
              errorMessage: {
                additionalProperties: 'No additional properties are allowed in connection options.',
                required: 'All connection options fields are required.',
              },
            },
            modules: {
              type: 'object',
              properties: {
                load_balancer: {
                  type: 'object',
                  properties: {
                    enabled: {
                      type: 'boolean',
                      errorMessage: "The 'enabled' field must be a boolean",
                    },
                    config: {
                      type: ['object', 'null'],
                      properties: {
                        method: {
                          type: 'string',
                          enum: EDGE_CONNECTOR_LOAD_BALANCE_METHOD,
                          errorMessage: "The 'method' must be one of: round_robin, least_conn, ip_hash",
                        },
                        max_retries: {
                          type: 'integer',
                          minimum: 0,
                          maximum: 10,
                          errorMessage: "The 'max_retries' must be between 0 and 10",
                        },
                        connection_timeout: {
                          type: 'integer',
                          minimum: 1,
                          maximum: 300,
                          errorMessage: "The 'connection_timeout' must be between 1 and 300",
                        },
                        read_write_timeout: {
                          type: 'integer',
                          minimum: 1,
                          maximum: 300,
                          errorMessage: "The 'read_write_timeout' must be between 1 and 300",
                        },
                      },
                      additionalProperties: false,
                      errorMessage: {
                        additionalProperties: 'No additional properties are allowed in load balancer config.',
                      },
                    },
                  },
                  required: ['enabled'],
                  additionalProperties: false,
                  errorMessage: {
                    additionalProperties: 'No additional properties are allowed in load balancer.',
                    required: "The 'enabled' field is required in load balancer.",
                  },
                },
                origin_shield: {
                  type: 'object',
                  properties: {
                    enabled: {
                      type: 'boolean',
                      errorMessage: "The 'enabled' field must be a boolean",
                    },
                    config: {
                      type: ['object', 'null'],
                      properties: {
                        origin_ip_acl: {
                          type: 'object',
                          properties: {
                            enabled: {
                              type: 'boolean',
                              errorMessage: "The 'enabled' field must be a boolean",
                            },
                          },
                          additionalProperties: false,
                          errorMessage: {
                            additionalProperties: 'No additional properties are allowed in origin IP ACL.',
                          },
                        },
                        hmac: {
                          type: 'object',
                          properties: {
                            enabled: {
                              type: 'boolean',
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
                                      errorMessage: "The 'region' field must be a string between 1 and 255 characters",
                                    },
                                    service: {
                                      type: 'string',
                                      minLength: 1,
                                      maxLength: 255,
                                      pattern: '.*',
                                      default: 's3',
                                      errorMessage: "The 'service' field must be a string between 1 and 255 characters",
                                    },
                                    access_key: {
                                      type: 'string',
                                      minLength: 1,
                                      maxLength: 255,
                                      pattern: '.*',
                                      errorMessage:
                                        "The 'access_key' field must be a string between 1 and 255 characters",
                                    },
                                    secret_key: {
                                      type: 'string',
                                      minLength: 1,
                                      maxLength: 255,
                                      pattern: '.*',
                                      errorMessage:
                                        "The 'secret_key' field must be a string between 1 and 255 characters",
                                    },
                                  },
                                  required: ['region', 'access_key', 'secret_key'],
                                  additionalProperties: false,
                                  errorMessage: {
                                    additionalProperties: 'No additional properties are allowed in HMAC attributes.',
                                    required:
                                      "The 'region', 'access_key', and 'secret_key' fields are required in HMAC attributes.",
                                  },
                                },
                              },
                              additionalProperties: false,
                              errorMessage: {
                                additionalProperties: 'No additional properties are allowed in HMAC config.',
                              },
                            },
                          },
                          required: ['enabled'],
                          additionalProperties: false,
                          errorMessage: {
                            additionalProperties: 'No additional properties are allowed in HMAC.',
                            required: "The 'enabled' field is required in HMAC.",
                          },
                        },
                      },
                      additionalProperties: false,
                      errorMessage: {
                        additionalProperties: 'No additional properties are allowed in origin shield config.',
                      },
                    },
                  },
                  required: ['enabled'],
                  additionalProperties: false,
                  errorMessage: {
                    additionalProperties: 'No additional properties are allowed in origin shield.',
                    required: "The 'enabled' field is required in origin shield.",
                  },
                },
              },
              required: ['load_balancer', 'origin_shield'],
              additionalProperties: false,
              errorMessage: {
                additionalProperties: 'No additional properties are allowed in modules.',
                required: "The 'load_balancer' and 'origin_shield' fields are required in modules.",
              },
            },
          },
          required: ['addresses', 'connection_options', 'modules'],
          additionalProperties: false,
          errorMessage: {
            additionalProperties: 'No additional properties are allowed in HTTP/Live Ingest attributes.',
            required:
              "The 'addresses', 'connection_options', and 'modules' fields are required in HTTP/Live Ingest attributes.",
          },
        },
      ],
      errorMessage:
        "The 'attributes' field must match either  storage format (bucket, prefix) or HTTP/Live Ingest format (addresses, connection_options, modules).",
    },
  },
  required: ['name', 'type', 'attributes'],
  additionalProperties: false,
  errorMessage: {
    additionalProperties: 'No additional properties are allowed in  connector items.',
    required: "The 'name', 'type' and 'attributes' fields are required in each  connector item.",
  },
};

const schemaManifest = {
  type: 'object',
  properties: {
    networkList: {
      type: 'array',
      items: schemaNetworkListManifest,
      errorMessage: "The 'networkList' field must be an array of network list items.",
    },
    waf: {
      type: 'array',
      items: schemaWafManifest,
      errorMessage: {
        type: "The 'waf' field must be an array",
      },
    },
    firewall: {
      type: 'array',
      items: schemaFirewallManifest,
      errorMessage: {
        type: "The 'firewall' field must be an array of  firewall objects",
      },
    },
    applications: {
      type: 'array',
      items: schemaApplicationManifest,
      errorMessage: "The 'applications' field must be an array of  application items.",
    },
    workloads: {
      type: 'array',
      items: schemaWorkloadManifest,
      errorMessage: "The 'workload' field must be an array of workloads items.",
    },
    workload_deployments: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            minLength: 1,
            maxLength: 254,
            pattern: '.*',
            errorMessage: "The 'name' field must be a string between 1 and 254 characters.",
          },
          current: {
            type: 'boolean',
            default: true,
            errorMessage: "The 'current' field must be a boolean.",
          },
          active: {
            type: 'boolean',
            default: true,
            errorMessage: "The 'active' field must be a boolean.",
          },
          strategy: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                minLength: 1,
                maxLength: 255,
                pattern: '.*',
                errorMessage: "The 'type' field must be a string between 1 and 255 characters.",
              },
              attributes: {
                type: 'object',
                properties: {
                  application: {
                    type: 'string',
                    errorMessage: "The 'application' field must be a string.",
                  },
                  firewall: {
                    type: ['string', 'null'],
                    errorMessage: "The 'firewall' field must be a string or null.",
                  },
                  custom_page: {
                    type: ['string', 'null'],
                    errorMessage: "The 'custom_page' field must be a string or null.",
                  },
                },
                required: ['application'],
                additionalProperties: false,
                errorMessage: {
                  additionalProperties: 'No additional properties are allowed in strategy attributes.',
                  required: "The 'application' field is required in strategy attributes.",
                },
              },
            },
            required: ['type', 'attributes'],
            additionalProperties: false,
            errorMessage: {
              additionalProperties: 'No additional properties are allowed in strategy.',
              required: "The 'type' and 'attributes' fields are required in strategy.",
            },
          },
        },
        required: ['name', 'strategy'],
        additionalProperties: false,
        errorMessage: {
          additionalProperties: 'No additional properties are allowed in workload deployment objects.',
          required: "The 'name' and 'strategy' fields are required in each workload deployment.",
        },
      },
      errorMessage: "The 'workload_deployments' field must be an array of workload deployment objects.",
    },
    connectors: {
      type: 'array',
      items: schemaConnectorManifest,
      errorMessage: {
        type: "The 'connectors' field must be an array",
      },
    },
    custom_pages: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            minLength: 1,
            maxLength: 255,
            pattern: '.*',
            errorMessage: "The 'name' field must be a string between 1 and 255 characters.",
          },
          active: {
            type: 'boolean',
            default: true,
            errorMessage: "The 'active' field must be a boolean.",
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
                  errorMessage: "The 'code' field must be a valid error code.",
                },
                page: {
                  type: 'object',
                  properties: {
                    type: {
                      type: 'string',
                      minLength: 1,
                      maxLength: 255,
                      default: 'page_connector',
                      pattern: '.*',
                      errorMessage: "The 'type' field must be a string between 1 and 255 characters.",
                    },
                    attributes: {
                      type: 'object',
                      properties: {
                        connector: {
                          type: 'string',
                          errorMessage: "The 'connector' field must be a string.",
                        },
                        ttl: {
                          type: 'integer',
                          minimum: 0,
                          maximum: 31536000,
                          default: 0,
                          errorMessage: "The 'ttl' field must be an integer between 0 and 31536000.",
                        },
                        uri: {
                          type: ['string', 'null'],
                          minLength: 1,
                          maxLength: 250,
                          pattern: '^/[/a-zA-Z0-9\\-_.~@:]*$',
                          errorMessage: "The 'uri' field must be a valid URI path starting with / or null.",
                        },
                        custom_status_code: {
                          type: ['integer', 'null'],
                          minimum: 100,
                          maximum: 599,
                          errorMessage:
                            "The 'custom_status_code' field must be an integer between 100 and 599 or null.",
                        },
                      },
                      required: ['connector'],
                      additionalProperties: false,
                      errorMessage: {
                        additionalProperties: 'No additional properties are allowed in page attributes.',
                        required: "The 'connector' field is required in page attributes.",
                      },
                    },
                  },
                  required: ['type', 'attributes'],
                  additionalProperties: false,
                  errorMessage: {
                    additionalProperties: 'No additional properties are allowed in page configuration.',
                    required: "The 'type' and 'attributes' fields are required in page configuration.",
                  },
                },
              },
              required: ['code', 'page'],
              additionalProperties: false,
              errorMessage: {
                additionalProperties: 'No additional properties are allowed in page entry.',
                required: "The 'code' and 'page' fields are required in each page entry.",
              },
            },
            errorMessage: "The 'pages' field must be an array of page configurations with at least one item.",
          },
        },
        required: ['name', 'pages'],
        additionalProperties: false,
        errorMessage: {
          additionalProperties: 'No additional properties are allowed in custom page objects.',
          required: "The 'name' and 'pages' fields are required in each custom page.",
        },
      },
      errorMessage: "The 'custom_pages' field must be an array of custom page objects.",
    },
    functions: {
      type: 'array',
      items: schemaFunctionManifest,
      errorMessage: "The 'functions' field must be an array of  function items.",
    },
    storage: {
      type: 'array',
      items: schemaStorageManifest,
      errorMessage: "The 'storage' field must be an array of  storage items.",
    },
  },
};

export { schemaManifest };
