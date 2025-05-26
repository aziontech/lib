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
  CACHE_L2_REGION,
  EDGE_CONNECTOR_CONNECTION_PREFERENCE,
  EDGE_CONNECTOR_LOAD_BALANCE,
  EDGE_CONNECTOR_TYPES,
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
  RULE_VARIABLES,
  WAF_MODE,
  WAF_SENSITIVITY,
  WORKLOAD_HTTP_VERSIONS,
  WORKLOAD_MTLS_VERIFICATION,
  WORKLOAD_NETWORK_MAP,
  WORKLOAD_TLS_CIPHERS,
  WORKLOAD_TLS_VERSIONS,
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
  },
  required: ['name', 'dir'],
  additionalProperties: false,
  errorMessage: {
    additionalProperties: 'No additional properties are allowed in edge storage items.',
    required: "The 'name' and 'dir' fields are required.",
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
        enum: WAF_MODE,
        errorMessage: `The mode must be one of: ${WAF_MODE.join(', ')}`,
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
      errorMessage: "The 'name' field must be a string",
    },
    target: {
      type: 'string',
      errorMessage: "The 'target' field must be a string",
    },
    args: {
      type: 'object',
      errorMessage: "The 'args' field must be an object",
    },
    bindings: {
      type: 'object',
      properties: {
        edge_storage: {
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
              additionalProperties: 'No additional properties are allowed in edge_storage items',
              required: "The 'bucket' field is required",
            },
          },
          errorMessage: "The 'edge_storage' field must be an array of storage bindings",
        },
      },
      additionalProperties: false,
      errorMessage: {
        additionalProperties: 'No additional properties are allowed in bindings object',
      },
    },
  },
  required: ['name', 'target'],
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
    browser_cache_settings: {
      type: 'string',
      enum: CACHE_BROWSER_SETTINGS,
      errorMessage: "The 'browser_cache_settings' must be either 'honor' or 'override'.",
    },
    cdn_cache_settings: {
      type: 'string',
      enum: CACHE_CDN_SETTINGS,
      errorMessage: "The 'cdn_cache_settings' must be either 'honor' or 'override'.",
    },
    cache_by_query_string: {
      type: 'string',
      enum: CACHE_BY_QUERY_STRING,
      errorMessage: "The 'cache_by_query_string' must be one of: ignore, whitelist, blacklist, all.",
    },
    cache_by_cookie: {
      type: 'string',
      enum: CACHE_BY_COOKIE,
      errorMessage: "The 'cache_by_cookie' must be one of: ignore, whitelist, blacklist, all.",
    },
    adaptive_delivery_action: {
      type: 'string',
      enum: CACHE_ADAPTIVE_DELIVERY,
      errorMessage: "The 'adaptive_delivery_action' must be either 'ignore' or 'whitelist'.",
    },
    l2_caching_enabled: {
      type: 'boolean',
      errorMessage: "The 'l2_caching_enabled' field must be a boolean.",
    },
    l2_region: {
      type: ['string', 'null'],
      enum: CACHE_L2_REGION,
      errorMessage: "The 'l2_region' must be either null, 'sa-brazil' or 'na-united-states'.",
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
      errorMessage: "The 'name' field must be a string.",
    },
    phase: {
      type: 'string',
      enum: RULE_PHASES,
      errorMessage: "The 'phase' field must be either 'request' or 'response'.",
    },
    behaviors: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            enum: RULE_BEHAVIOR_NAMES,
            errorMessage: "The 'name' field must be a valid behavior name.",
          },
          target: {
            oneOf: [{ type: 'string' }, { type: 'null' }],
            errorMessage: "The 'target' must be a string or null.",
          },
        },
        required: ['name'],
        additionalProperties: false,
      },
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
              enum: Array.from(new Set(RULE_VARIABLES)),
              errorMessage: "The 'variable' field must be a valid variable name.",
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
            input_value: {
              type: 'string',
              errorMessage: "The 'input_value' field must be a string.",
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
                  errorMessage: "The operator 'matches' requires an input_value.",
                },
              ],
            },
          },
          additionalProperties: false,
        },
      },
    },
  },
  required: ['name', 'behaviors', 'criteria'],
  additionalProperties: false,
};

const schemaApplicationManifest = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      errorMessage: "The 'name' field must be a string.",
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
      errorMessage: "The 'name' field must be a string between 1 and 100 characters",
    },
    alternate_domains: {
      type: 'array',
      items: { type: 'string' },
      maxItems: 50,
      errorMessage: "The 'alternate_domains' field must be an array of strings with max 50 items",
    },
    edge_application: {
      type: 'string',
      errorMessage: "The 'edge_application' field must be a string",
    },
    active: {
      type: 'boolean',
      default: true,
      errorMessage: "The 'active' field must be a boolean",
    },
    network_map: {
      type: 'string',
      enum: WORKLOAD_NETWORK_MAP,
      default: '1',
      errorMessage: "The 'network_map' must be either '1' or '2'",
    },
    edge_firewall: {
      type: ['string', 'null'],
      errorMessage: "The 'edge_firewall' must be an string or null",
    },
    workload_hostname_allow_access: {
      type: 'boolean',
      default: true,
      errorMessage: "The 'workload_hostname_allow_access' field must be a boolean",
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
          enum: [...WORKLOAD_TLS_CIPHERS, null],
          errorMessage: "The 'ciphers' must be a valid TLS cipher suite or null",
        },
        minimum_version: {
          type: ['string', 'null'],
          enum: [...WORKLOAD_TLS_VERSIONS, null],
          default: 'tls_1_2',
          errorMessage: "The 'minimum_version' must be a valid TLS version or null",
        },
      },
      default: { certificate: null, ciphers: null, minimum_version: 'tls_1_2' },
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
  required: ['name', 'edge_application', 'domains'],
  additionalProperties: false,
  errorMessage: {
    additionalProperties: 'No additional properties are allowed in workload items',
    required: "The 'name', 'edge_application' and 'domains' fields are required in workload items",
  },
};

const schemaEdgeConnectorManifest = {
  type: ['object', 'null'],
  properties: {
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 255,
      errorMessage: "The 'name' field must be a string between 1 and 255 characters",
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
      errorMessage: "The 'active' field must be a boolean",
    },
    type: {
      type: 'string',
      enum: EDGE_CONNECTOR_TYPES,
      errorMessage: "The 'type' must be one of: http, s3, edge_storage, live_ingest",
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
            errorMessage: "The 'address' field must be a string between 1 and 255 characters",
          },
          plain_port: {
            type: 'integer',
            minimum: 1,
            maximum: 65535,
            default: 80,
            errorMessage: "The 'plain_port' must be between 1 and 65535",
          },
          tls_port: {
            type: 'integer',
            minimum: 1,
            maximum: 65535,
            default: 443,
            errorMessage: "The 'tls_port' must be between 1 and 65535",
          },
          server_role: {
            type: 'string',
            enum: ['primary', 'backup'],
            default: 'primary',
            errorMessage: "The 'server_role' must be either 'primary' or 'backup'",
          },
          weight: {
            type: 'integer',
            minimum: 0,
            maximum: 100,
            default: 1,
            errorMessage: "The 'weight' must be between 0 and 100",
          },
          active: {
            type: 'boolean',
            default: true,
            errorMessage: "The 'active' field must be a boolean",
          },
          max_conns: {
            type: 'integer',
            minimum: 0,
            maximum: 1000,
            default: 0,
            errorMessage: "The 'max_conns' must be between 0 and 1000",
          },
          max_fails: {
            type: 'integer',
            minimum: 1,
            maximum: 10,
            default: 1,
            errorMessage: "The 'max_fails' must be between 1 and 10",
          },
          fail_timeout: {
            type: 'integer',
            minimum: 1,
            maximum: 60,
            default: 10,
            errorMessage: "The 'fail_timeout' must be between 1 and 60",
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
    load_balance_method: {
      type: 'string',
      enum: EDGE_CONNECTOR_LOAD_BALANCE,
      default: 'off',
      errorMessage: `The 'load_balance_method' must be one of: ${EDGE_CONNECTOR_LOAD_BALANCE.join(', ')}`,
    },
    connection_preference: {
      type: 'array',
      items: {
        type: 'string',
        enum: EDGE_CONNECTOR_CONNECTION_PREFERENCE,
        errorMessage: `Each connection preference must be one of: ${EDGE_CONNECTOR_CONNECTION_PREFERENCE.join(', ')}`,
      },
      maxItems: 2,
      default: ['IPv6', 'IPv4'],
      errorMessage: "The 'connection_preference' field must be an array with maximum 2 items",
    },
    connection_timeout: {
      type: 'integer',
      minimum: 1,
      maximum: 300,
      default: 60,
    },
    read_write_timeout: {
      type: 'integer',
      minimum: 1,
      maximum: 300,
      default: 120,
    },
    max_retries: {
      type: 'integer',
      minimum: 0,
      maximum: 10,
    },
  },
  required: ['name', 'modules', 'product_version', 'type'],
  additionalProperties: false,
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
    edge_firewall: {
      type: 'array',
      items: schemaFirewallManifest,
      errorMessage: {
        type: "The 'edge_firewall' field must be an array of edge firewall objects",
      },
    },
    edge_applications: {
      type: 'array',
      items: schemaApplicationManifest,
      errorMessage: "The 'edge_applications' field must be an array of edge application items.",
    },
    workloads: {
      type: 'array',
      items: schemaWorkloadManifest,
      errorMessage: "The 'workload' field must be an array of workloads items.",
    },
    edge_connectors: {
      type: 'array',
      items: schemaEdgeConnectorManifest,
      errorMessage: {
        type: "The 'edge_connectors' field must be an array",
      },
      edge_storage: {
        type: 'array',
        items: schemaStorageManifest,
        errorMessage: "The 'edge_storage' field must be an array of edge storage items.",
      },
      edge_functions: {
        type: 'array',
        items: schemaFunctionManifest,
        errorMessage: "The 'edge_functions' field must be an array of edge function items.",
      },
    },
  },
};

export { schemaManifest };
