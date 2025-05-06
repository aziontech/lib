import {
  APPLICATION_HTTP_PORTS,
  APPLICATION_HTTPS_PORTS,
  APPLICATION_SUPPORTED_CIPHERS,
  FIREWALL_BEHAVIOR_NAMES,
  FIREWALL_RATE_LIMIT_BY,
  FIREWALL_RATE_LIMIT_TYPES,
  FIREWALL_RULE_CONDITIONALS,
  FIREWALL_RULE_OPERATORS,
  FIREWALL_VARIABLES,
  NETWORK_LIST_TYPES,
  RULE_BEHAVIOR_NAMES,
  RULE_CONDITIONALS,
  RULE_OPERATORS_WITH_VALUE,
  RULE_OPERATORS_WITHOUT_VALUE,
  RULE_PHASES,
  WAF_MODE,
  WAF_SENSITIVITY,
  WORKLOAD_HTTP_VERSIONS,
  WORKLOAD_NETWORK_MAPS,
  WORKLOAD_TLS_MINIMUM_VERSIONS,
} from '../../constants';

const schemaNetworkListManifest = {
  type: 'object',
  properties: {
    id: {
      type: 'number',
      errorMessage: "The 'id' field must be a number.",
    },
    list_type: {
      type: 'string',
      enum: NETWORK_LIST_TYPES,
      errorMessage: "The 'list_type' field must be a string. Accepted values are 'ip_cidr', 'asn' or 'countries'.",
    },
    items_values: {
      type: 'array',
      items: {
        type: ['string', 'number'],
        errorMessage: "The 'items_values' field must be an array of strings or numbers.",
      },
    },
  },
  required: ['id', 'list_type', 'items_values'],
  additionalProperties: false,
  errorMessage: {
    additionalProperties: 'No additional properties are allowed in network list items.',
    required: "The 'id, list_type and items_values' fields are required in each network list item.",
  },
};

const schemaWafManifest = {
  type: 'object',
  properties: {
    id: {
      type: 'number',
      errorMessage: "The WAF configuration must have an 'id' field of type number",
    },
    name: {
      type: 'string',
      errorMessage: "The 'name' field must be a string.",
    },
    mode: {
      type: 'string',
      enum: WAF_MODE,
      errorMessage: `The 'mode' field must be one of: ${WAF_MODE.join(', ')}`,
    },
    active: {
      type: 'boolean',
      errorMessage: "The 'active' field must be a boolean.",
    },
    sql_injection: {
      type: 'boolean',
      errorMessage: "The 'sql_injection' field must be a boolean.",
    },
    sql_injection_sensitivity: {
      type: 'string',
      enum: WAF_SENSITIVITY,
      errorMessage: `The 'sql_injection_sensitivity' field must be one of: ${WAF_SENSITIVITY.join(', ')}`,
    },
    remote_file_inclusion: {
      type: 'boolean',
      errorMessage: "The 'remote_file_inclusion' field must be a boolean.",
    },
    remote_file_inclusion_sensitivity: {
      type: 'string',
      enum: WAF_SENSITIVITY,
      errorMessage: `The 'remote_file_inclusion_sensitivity' field must be one of: ${WAF_SENSITIVITY.join(', ')}`,
    },
    directory_traversal: {
      type: 'boolean',
      errorMessage: "The 'directory_traversal' field must be a boolean.",
    },
    directory_traversal_sensitivity: {
      type: 'string',
      enum: WAF_SENSITIVITY,
      errorMessage: `The 'directory_traversal_sensitivity' field must be one of: ${WAF_SENSITIVITY.join(', ')}`,
    },
    cross_site_scripting: {
      type: 'boolean',
      errorMessage: "The 'cross_site_scripting' field must be a boolean.",
    },
    cross_site_scripting_sensitivity: {
      type: 'string',
      enum: WAF_SENSITIVITY,
      errorMessage: `The 'cross_site_scripting_sensitivity' field must be one of: ${WAF_SENSITIVITY.join(', ')}`,
    },
    evading_tricks: {
      type: 'boolean',
      errorMessage: "The 'evading_tricks' field must be a boolean.",
    },
    evading_tricks_sensitivity: {
      type: 'string',
      enum: WAF_SENSITIVITY,
      errorMessage: `The 'evading_tricks_sensitivity' field must be one of: ${WAF_SENSITIVITY.join(', ')}`,
    },
    file_upload: {
      type: 'boolean',
      errorMessage: "The 'file_upload' field must be a boolean.",
    },
    file_upload_sensitivity: {
      type: 'string',
      enum: WAF_SENSITIVITY,
      errorMessage: `The 'file_upload_sensitivity' field must be one of: ${WAF_SENSITIVITY.join(', ')}`,
    },
    unwanted_access: {
      type: 'boolean',
      errorMessage: "The 'unwanted_access' field must be a boolean.",
    },
    unwanted_access_sensitivity: {
      type: 'string',
      enum: WAF_SENSITIVITY,
      errorMessage: `The 'unwanted_access_sensitivity' field must be one of: ${WAF_SENSITIVITY.join(', ')}`,
    },
    identified_attack: {
      type: 'boolean',
      errorMessage: "The 'identified_attack' field must be a boolean.",
    },
    identified_attack_sensitivity: {
      type: 'string',
      enum: WAF_SENSITIVITY,
      errorMessage: `The 'identified_attack_sensitivity' field must be one of: ${WAF_SENSITIVITY.join(', ')}`,
    },
    bypass_addresses: {
      type: 'array',
      items: {
        type: 'string',
        errorMessage: "The 'bypass_addresses' field must be an array of strings.",
      },
      errorMessage: "The 'bypass_addresses' field must be an array of strings.",
    },
  },
  required: [
    'name',
    'mode',
    'active',
    'sql_injection',
    'sql_injection_sensitivity',
    'remote_file_inclusion',
    'remote_file_inclusion_sensitivity',
    'directory_traversal',
    'directory_traversal_sensitivity',
    'cross_site_scripting',
    'cross_site_scripting_sensitivity',
    'evading_tricks',
    'evading_tricks_sensitivity',
    'file_upload',
    'file_upload_sensitivity',
    'unwanted_access',
    'unwanted_access_sensitivity',
    'identified_attack',
    'identified_attack_sensitivity',
    'bypass_addresses',
  ],
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
    input_value: {
      type: 'string',
      errorMessage: "The 'input_value' field must be a string.",
    },
  },
  required: ['variable', 'operator', 'conditional'],
  additionalProperties: false,
  errorMessage: {
    required: "The 'variable', 'operator' and 'conditional' fields are required in criteria.",
    additionalProperties: 'No additional properties are allowed in criteria.',
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
      waf_id: { type: 'integer' },
      mode: {
        type: 'string',
        enum: WAF_MODE,
      },
    },
    required: ['waf_id', 'mode'],
    additionalProperties: false,
  },
  set_custom_response: {
    type: 'object',
    properties: {
      status_code: {
        oneOf: [
          { type: 'integer', minimum: 200, maximum: 499 },
          { type: 'string', pattern: '^[2-4][0-9]{2}$' },
        ],
      },
      content_body: {
        type: 'string',
        maxLength: 500,
      },
      content_type: { type: 'string' },
    },
    required: ['status_code', 'content_body', 'content_type'],
    additionalProperties: false,
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
    is_active: {
      type: 'boolean',
      default: true,
      errorMessage: "The 'is_active' field must be a boolean.",
    },
    order: {
      type: 'integer',
      errorMessage: "The 'order' field must be an integer.",
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
        edge_functions_enabled: {
          type: 'boolean',
          errorMessage: "The 'edge_functions_enabled' field must be a boolean.",
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
      errorMessage: "The 'name' field must be a string.",
    },
    browser_cache: {
      type: 'object',
      properties: {
        behavior: {
          type: 'string',
          enum: ['honor', 'override', 'no-cache'],
          errorMessage: "The 'behavior' field must be 'honor', 'override', or 'no-cache'.",
        },
        max_age: {
          type: 'number',
          minimum: 0,
          maximum: 31536000,
          errorMessage: "The 'max_age' field must be a number between 0 and 31536000.",
        },
      },
      required: ['behavior', 'max_age'],
      additionalProperties: false,
    },
    edge_cache: {
      type: 'object',
      properties: {
        behavior: {
          type: 'string',
          enum: ['honor', 'override'],
          errorMessage: "The 'behavior' field must be 'honor' or 'override'.",
        },
        max_age: {
          type: 'number',
          minimum: 0,
          maximum: 31536000,
          errorMessage: "The 'max_age' field must be a number between 0 and 31536000.",
        },
      },
      required: ['behavior', 'max_age'],
      additionalProperties: false,
    },
    caching_for_post_enabled: {
      type: 'boolean',
      required: true,
      errorMessage: "The 'caching_for_post_enabled' field must be a boolean.",
    },
    caching_for_options_enabled: {
      type: 'boolean',
      required: true,
      errorMessage: "The 'caching_for_options_enabled' field must be a boolean.",
    },
    stale_cache_enabled: {
      type: 'boolean',
      required: true,
      errorMessage: "The 'stale_cache_enabled' field must be a boolean.",
    },
    tiered_cache_enabled: {
      type: 'boolean',
      required: true,
      errorMessage: "The 'tiered_cache_enabled' field must be a boolean.",
    },
    tiered_cache_region: {
      type: ['string', 'null'],
      errorMessage: "The 'tiered_cache_region' field must be a string or null.",
    },
    application_controls: {
      type: 'object',
      properties: {
        cache_by_query_string: {
          type: 'string',
          enum: ['ignore', 'whitelist', 'blacklist', 'all'],
          required: true,
          errorMessage: "The 'cache_by_query_string' must be one of: ignore, whitelist, blacklist, all.",
        },
        query_string_fields: {
          type: 'array',
          items: { type: 'string' },
          required: true,
        },
        query_string_sort_enabled: {
          type: 'boolean',
          required: true,
          errorMessage: "The 'query_string_sort_enabled' field must be a boolean.",
        },
        cache_by_cookies: {
          type: 'string',
          enum: ['ignore', 'whitelist', 'blacklist', 'all'],
          required: true,
          errorMessage: "The 'cache_by_cookies' must be one of: ignore, whitelist, blacklist, all.",
        },
        cookie_names: {
          type: 'array',
          items: { type: 'string' },
          required: true,
        },
        adaptive_delivery_action: {
          type: 'string',
          enum: ['ignore', 'whitelist'],
          required: true,
          errorMessage: "The 'adaptive_delivery_action' must be either 'ignore' or 'whitelist'.",
        },
        device_group: {
          type: 'array',
          items: { type: 'integer' },
          required: true,
        },
      },
      required: [
        'cache_by_query_string',
        'query_string_fields',
        'query_string_sort_enabled',
        'cache_by_cookies',
        'cookie_names',
        'adaptive_delivery_action',
        'device_group',
      ],
      additionalProperties: false,
    },
    slice_controls: {
      type: 'object',
      properties: {
        slice_configuration_enabled: {
          type: 'boolean',
          required: true,
          errorMessage: "The 'slice_configuration_enabled' field must be a boolean.",
        },
        slice_edge_caching_enabled: {
          type: 'boolean',
          required: true,
          errorMessage: "The 'slice_edge_caching_enabled' field must be a boolean.",
        },
        slice_tiered_caching_enabled: {
          type: 'boolean',
          required: true,
          errorMessage: "The 'slice_tiered_caching_enabled' field must be a boolean.",
        },
        slice_configuration_range: {
          type: 'integer',
          minimum: 0,
          maximum: 1024,
          default: 1024,
          errorMessage: "The 'slice_configuration_range' must be an integer between 0 and 1024.",
        },
      },
      required: ['slice_configuration_enabled', 'slice_edge_caching_enabled', 'slice_tiered_caching_enabled'],
      additionalProperties: false,
    },
  },
  required: ['name'],
  additionalProperties: false,
};

const schemaApplicationRules = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 250,
      errorMessage: "The 'name' field must be a string between 1 and 250 characters",
    },
    phase: {
      type: 'string',
      enum: RULE_PHASES,
      errorMessage: `The 'phase' field must be one of: ${RULE_PHASES.join(', ')}`,
    },
    active: {
      type: 'boolean',
      default: true,
      errorMessage: "The 'active' field must be a boolean",
    },
    description: {
      type: 'string',
      maxLength: 1000,
      errorMessage: "The 'description' field must be a string with at most 1000 characters",
    },
    behaviors: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            enum: RULE_BEHAVIOR_NAMES,
            errorMessage: `The 'name' field must be one of: ${RULE_BEHAVIOR_NAMES.join(', ')}`,
          },
          target: {
            oneOf: [
              { type: 'string' },
              { type: 'null' },
              {
                type: 'object',
                additionalProperties: true,
                errorMessage: 'The target object must have appropriate properties for the behavior',
              },
            ],
            errorMessage: "The 'target' must be a string, object, or null according to the behavior",
          },
        },
        required: ['name'],
        additionalProperties: false,
      },
      minItems: 1,
      maxItems: 10,
      errorMessage: "The 'behaviors' array must have between 1 and 10 items",
    },
    criteria: {
      type: 'array',
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            variable: {
              type: 'string',
              errorMessage: "The 'variable' field must be a string representing a valid variable",
            },
            operator: {
              type: 'string',
              enum: [...RULE_OPERATORS_WITH_VALUE, ...RULE_OPERATORS_WITHOUT_VALUE],
              errorMessage: `The 'operator' field must be one of: ${[...RULE_OPERATORS_WITH_VALUE, ...RULE_OPERATORS_WITHOUT_VALUE].join(', ')}`,
            },
            conditional: {
              type: 'string',
              enum: RULE_CONDITIONALS,
              errorMessage: `The 'conditional' field must be one of: ${RULE_CONDITIONALS.join(', ')}`,
            },
            input_value: {
              type: 'string',
              errorMessage: "The 'input_value' field must be a string",
            },
          },
          required: ['variable', 'operator', 'conditional'],
          dependencies: {
            operator: {
              oneOf: [
                {
                  properties: {
                    operator: { enum: RULE_OPERATORS_WITH_VALUE },
                  },
                  required: ['input_value'],
                },
              ],
            },
          },
          additionalProperties: false,
        },
        minItems: 1,
        maxItems: 5,
        errorMessage: 'Each criteria group must have between 1 and 5 criterion items',
      },
      minItems: 1,
      maxItems: 5,
      errorMessage: "The 'criteria' field must have between 1 and 5 criterion groups",
    },
  },
  required: ['name', 'behaviors', 'criteria'],
  additionalProperties: false,
};

const schemaApplicationModulesManifest = {
  type: 'object',
  properties: {
    edge_cache_enabled: {
      type: 'boolean',
      default: true,
      errorMessage: "The 'edge_cache_enabled' field must be a boolean.",
    },
    edge_functions_enabled: {
      type: 'boolean',
      default: false,
      errorMessage: "The 'edge_functions_enabled' field must be a boolean.",
    },
    application_accelerator_enabled: {
      type: 'boolean',
      default: false,
      errorMessage: "The 'application_accelerator_enabled' field must be a boolean.",
    },
    image_processor_enabled: {
      type: 'boolean',
      default: false,
      errorMessage: "The 'image_processor_enabled' field must be a boolean.",
    },
    tiered_cache_enabled: {
      type: 'boolean',
      default: false,
      errorMessage: "The 'tiered_cache_enabled' field must be a boolean.",
    },
  },
  additionalProperties: false,
  errorMessage: {
    additionalProperties: "No additional properties are allowed in the 'modules' object.",
  },
};

const schemaApplicationManifest = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 250,
      errorMessage: "The 'name' field must be a string between 1 and 250 characters.",
    },
    modules: schemaApplicationModulesManifest,
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
    rules: {
      type: 'array',
      items: schemaApplicationRules,
    },
    cache_settings: {
      type: 'array',
      items: schemaApplicationCacheSettings,
    },
    functions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          path: { type: 'string' },
          args: { type: 'object' },
        },
        required: ['name', 'path'],
      },
    },
  },
  required: ['name', 'modules'],
  additionalProperties: false,
  errorMessage: {
    additionalProperties: "No additional properties are allowed in the 'application' object.",
    required: "The 'name' and 'modules' fields are required in the application object.",
  },
};

const schemaWorkloadManifest = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 100,
      errorMessage: "The 'name' field must be a string between 1 and 100 characters.",
    },
    alternate_domains: {
      type: 'array',
      items: {
        type: 'string',
      },
      maxItems: 50,
      errorMessage: "The 'alternate_domains' field must be an array of strings with at most 50 items.",
    },
    edge_application: {
      type: 'integer',
      minimum: 1,
      maximum: 9007199254740991,
      errorMessage: "The 'edge_application' field must be a positive integer.",
    },
    active: {
      type: 'boolean',
      default: true,
      errorMessage: "The 'active' field must be a boolean.",
    },
    network_map: {
      type: 'string',
      enum: WORKLOAD_NETWORK_MAPS,
      default: '1',
      errorMessage: "The 'network_map' field must be '1' (Edge Global Network) or '2' (Staging Network).",
    },
    edge_firewall: {
      type: ['integer', 'null'],
      errorMessage: "The 'edge_firewall' field must be an integer or null.",
    },
    tls: {
      type: 'object',
      properties: {
        certificate: {
          type: ['integer', 'null'],
          minimum: 1,
          errorMessage: "The 'certificate' field must be a positive integer or null.",
        },
        ciphers: {
          type: ['string', 'null'],
          enum: [...APPLICATION_SUPPORTED_CIPHERS, null],
          errorMessage: "The 'ciphers' field must be a valid cipher suite or null.",
        },
        minimum_version: {
          type: 'string',
          enum: WORKLOAD_TLS_MINIMUM_VERSIONS,
          default: 'tls_1_2',
          errorMessage: "The 'minimum_version' field must be a valid TLS version.",
        },
      },
      additionalProperties: false,
      default: { certificate: null, ciphers: null, minimum_version: 'tls_1_2' },
      errorMessage: "The 'tls' field must be an object with valid properties.",
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
              errorMessage: "The 'versions' field must be an array with values 'http1' and/or 'http2'.",
            },
            http_ports: {
              type: 'array',
              items: {
                type: 'integer',
                enum: APPLICATION_HTTP_PORTS,
              },
              default: [80],
              errorMessage: "The 'http_ports' field must be an array of valid HTTP ports.",
            },
            https_ports: {
              type: 'array',
              items: {
                type: 'integer',
                enum: APPLICATION_HTTPS_PORTS,
              },
              default: [443],
              errorMessage: "The 'https_ports' field must be an array of valid HTTPS ports.",
            },
            quic_ports: {
              type: ['array', 'null'],
              items: {
                type: 'integer',
              },
              errorMessage: "The 'quic_ports' field must be an array of integers or null.",
            },
          },
          additionalProperties: false,
          default: { versions: ['http1', 'http2'], http_ports: [80], https_ports: [443], quic_ports: null },
          errorMessage: "The 'http' field must be an object with valid properties.",
        },
      },
      additionalProperties: false,
      default: { http: { versions: ['http1', 'http2'], http_ports: [80], https_ports: [443], quic_ports: null } },
      errorMessage: "The 'protocols' field must be an object with valid properties.",
    },
    mtls: {
      type: 'object',
      properties: {
        verification: {
          type: 'string',
          enum: ['enforce', 'permissive'],
          default: 'enforce',
          errorMessage: "The 'verification' field must be 'enforce' or 'permissive'.",
        },
        certificate: {
          type: ['integer', 'null'],
          minimum: 1,
          errorMessage: "The 'certificate' field must be a positive integer or null.",
        },
        crl: {
          type: ['array', 'null'],
          items: {
            type: 'integer',
          },
          maxItems: 100,
          errorMessage: "The 'crl' field must be an array of integers with at most 100 items or null.",
        },
      },
      additionalProperties: false,
      errorMessage: "The 'mtls' field must be an object with valid properties.",
    },
    domains: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          domain: {
            type: ['string', 'null'],
            minLength: 1,
            maxLength: 250,
            errorMessage: "The 'domain' field must be a string between 1 and 250 characters or null.",
          },
          allow_access: {
            type: 'boolean',
            errorMessage: "The 'allow_access' field must be a boolean.",
          },
        },
        additionalProperties: false,
        errorMessage: 'Each domain item must be an object with valid properties.',
      },
      minItems: 1,
      maxItems: 2,
      errorMessage: "The 'domains' field must be an array with 1 or 2 items.",
    },
  },
  required: ['name', 'edge_application'],
  additionalProperties: false,
  errorMessage: {
    additionalProperties: "No additional properties are allowed in the 'workload' object.",
    required: "The 'name' and 'edge_application' fields are required in the workload object.",
  },
};

const schemaConnectorManifest = {
  type: 'object',
  properties: {
    id: {
      type: 'number',
      errorMessage: "The 'id' field must be a number.",
    },
    name: {
      type: 'string',
      errorMessage: "The 'name' field must be a string.",
    },
    type: {
      type: 'string',
      enum: ['http'],
      errorMessage: "The 'type' field must be 'http'.",
    },
    active: {
      type: 'boolean',
      errorMessage: "The 'active' field must be a boolean.",
    },
    addresses: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          address: {
            type: 'string',
            errorMessage: "The 'address' field must be a string.",
          },
          weight: {
            type: 'number',
            errorMessage: "The 'weight' field must be a number.",
          },
          server_role: {
            type: 'string',
            errorMessage: "The 'server_role' field must be a string.",
          },
          status: {
            type: 'string',
            errorMessage: "The 'status' field must be a string.",
          },
        },
        required: ['address'],
        additionalProperties: false,
      },
    },
    modules: {
      type: 'object',
      properties: {
        load_balancer_enabled: {
          type: 'boolean',
          errorMessage: "The 'load_balancer_enabled' field must be a boolean.",
        },
        origin_shield_enabled: {
          type: 'boolean',
          errorMessage: "The 'origin_shield_enabled' field must be a boolean.",
        },
      },
      additionalProperties: false,
    },
    tls: {
      type: 'object',
      properties: {
        policy: {
          type: 'string',
          enum: ['off', 'enforce', 'custom'],
          errorMessage: "The 'policy' field must be 'off', 'enforce', or 'custom'.",
        },
        certificate: {
          type: 'number',
          errorMessage: "The 'certificate' field must be a number.",
        },
        certificates: {
          type: 'array',
          items: {
            type: 'number',
          },
        },
        secret: {
          type: 'string',
          errorMessage: "The 'secret' field must be a string.",
        },
        sni: {
          type: 'string',
          errorMessage: "The 'sni' field must be a string.",
        },
      },
      additionalProperties: false,
    },
    load_balance_method: {
      type: 'string',
      enum: ['off', 'round_robin', 'ip_hash', 'least_connections'],
      errorMessage: "The 'load_balance_method' field must be one of: off, round_robin, ip_hash, least_connections.",
    },
    connection_preference: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['IPv4', 'IPv6'],
      },
    },
    connection_timeout: {
      type: 'number',
      errorMessage: "The 'connection_timeout' field must be a number.",
    },
    read_write_timeout: {
      type: 'number',
      errorMessage: "The 'read_write_timeout' field must be a number.",
    },
    max_retries: {
      type: 'number',
      errorMessage: "The 'max_retries' field must be a number.",
    },
    type_properties: {
      type: 'object',
      properties: {
        versions: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['http1', 'http2'],
          },
        },
        host: {
          type: 'string',
          errorMessage: "The 'host' field must be a string.",
        },
        path: {
          type: 'string',
          errorMessage: "The 'path' field must be a string.",
        },
        following_redirect: {
          type: 'boolean',
          errorMessage: "The 'following_redirect' field must be a boolean.",
        },
        real_ip_header: {
          type: 'string',
          errorMessage: "The 'real_ip_header' field must be a string.",
        },
        real_port_header: {
          type: 'string',
          errorMessage: "The 'real_port_header' field must be a string.",
        },
      },
      additionalProperties: false,
    },
  },
  required: ['name', 'type'],
  additionalProperties: false,
  errorMessage: {
    additionalProperties: 'No additional properties are allowed in connector objects.',
    required: "The 'name' and 'type' fields are required in the connector object.",
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
      ...schemaFirewallManifest,
      errorMessage: {
        type: "The 'firewall' field must be an object",
      },
    },
    application: {
      type: 'array',
      items: schemaApplicationManifest,
      errorMessage: "The 'application' field must be an array of application items.",
    },
    workload: {
      ...schemaWorkloadManifest,
      errorMessage: {
        type: "The 'workload' field must be an object",
      },
    },
    connectors: {
      type: 'array',
      items: schemaConnectorManifest,
      errorMessage: "The 'connectors' field must be an array of connector objects.",
    },
  },
};
export { schemaManifest };
