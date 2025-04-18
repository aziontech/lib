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
  FIREWALL_BEHAVIOR_NAMES,
  FIREWALL_RATE_LIMIT_BY,
  FIREWALL_RATE_LIMIT_TYPES,
  FIREWALL_RULE_CONDITIONALS,
  FIREWALL_RULE_OPERATORS,
  FIREWALL_VARIABLES,
  LOAD_BALANCER_METHODS,
  NETWORK_LIST_TYPES,
  ORIGIN_PROTOCOL_POLICIES,
  ORIGIN_TYPES,
  RULE_BEHAVIOR_NAMES,
  RULE_CONDITIONALS,
  RULE_OPERATORS_WITH_VALUE,
  RULE_OPERATORS_WITHOUT_VALUE,
  RULE_PHASES,
  RULE_VARIABLES,
  WAF_MODE,
  WAF_SENSITIVITY,
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

const schemaDomainsManifest = {
  type: ['object', 'null'],
  properties: {
    id: {
      type: 'number',
      errorMessage: "The 'id' field must be a number.",
    },
    name: {
      type: 'string',
      errorMessage: "The 'name' field must be a string.",
    },
    edge_application_id: {
      type: 'number',
      errorMessage: "The 'edge_application_id' field must be a number.",
    },
    cnames: {
      type: 'array',
      items: {
        type: 'string',
      },
      errorMessage: "The 'cnames' field must be an array of strings.",
    },
    cname_access_only: {
      type: 'boolean',
      errorMessage: "The 'cname_access_only' field must be a boolean.",
    },
    digital_certificate_id: {
      oneOf: [{ type: 'number' }, { type: 'string', enum: ['lets_encrypt'] }, { type: 'null' }],
      errorMessage: "The 'digital_certificate_id' field must be a number, 'lets_encrypt' or null.",
    },
    is_active: {
      type: 'boolean',
      default: true,
      errorMessage: "The 'is_active' field must be a boolean.",
    },
    domain_name: {
      type: 'string',
      errorMessage: "The 'domain_name' field must be a string.",
    },
    is_mtls_enabled: {
      type: 'boolean',
      errorMessage: "The 'is_mtls_enabled' field must be a boolean.",
    },
    mtls_verification: {
      type: 'string',
      enum: ['enforce', 'permissive'],
      errorMessage: "The 'mtls_verification' field must be either 'enforce' or 'permissive'.",
    },
    mtls_trusted_ca_certificate_id: {
      type: 'number',
      errorMessage: "The 'mtls_trusted_ca_certificate_id' field must be a number.",
    },
    edge_firewall_id: {
      type: 'number',
      errorMessage: "The 'edge_firewall_id' field must be a number.",
    },
    crl_list: {
      type: 'array',
      items: {
        type: 'number',
      },
      errorMessage: "The 'crl_list' field must be an array of numbers.",
    },
  },
  required: ['name'],
  dependencies: {
    is_mtls_enabled: {
      oneOf: [
        {
          properties: {
            is_mtls_enabled: { enum: [false] },
          },
        },
        {
          properties: {
            is_mtls_enabled: { enum: [true] },
          },
          required: ['mtls_verification', 'mtls_trusted_ca_certificate_id'],
        },
      ],
    },
  },
  additionalProperties: false,
  errorMessage: {
    additionalProperties: 'No additional properties are allowed in domain items.',
    required:
      "The 'name', 'edge_application_id', 'cnames', 'cname_access_only', and 'digital_certificate_id' fields are required.",
    dependencies: {
      is_mtls_enabled: "When mTLS is enabled, 'mtls_verification' and 'mtls_trusted_ca_certificate_id' are required.",
    },
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

const schemaApplicationOrigins = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      errorMessage: "The 'name' field must be a string.",
    },
    origin_type: {
      type: 'string',
      enum: ORIGIN_TYPES,
      errorMessage:
        "The 'origin_type' field must be one of: single_origin, load_balancer, live_ingest, object_storage.",
    },
    origin_protocol_policy: {
      type: 'string',
      enum: ORIGIN_PROTOCOL_POLICIES,
      errorMessage: "The 'origin_protocol_policy' must be one of: preserve, http, https.",
    },
    host_header: {
      type: 'string',
      errorMessage: "The 'host_header' field must be a string.",
    },
    bucket: {
      type: 'string',
      errorMessage: "The 'bucket' field must be a string.",
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
            minimum: 0,
            maximum: 100,
            errorMessage: "The 'weight' field must be a number between 0 and 100.",
          },
          server_role: {
            type: 'string',
            enum: ['primary', 'backup'],
            errorMessage: "The 'server_role' field must be either 'primary' or 'backup'.",
          },
        },
        required: ['address'],
        additionalProperties: false,
      },
    },
    load_balancer: {
      type: 'object',
      properties: {
        method: {
          type: 'string',
          enum: LOAD_BALANCER_METHODS,
          errorMessage: "The 'method' field must be one of: ip_hash, least_connections, round_robin.",
        },
      },
      required: ['method'],
      additionalProperties: false,
    },
  },
  required: ['name', 'origin_type', 'addresses'],
  allOf: [
    {
      if: {
        properties: { origin_type: { const: 'object_storage' } },
      },
      then: {
        required: ['bucket'],
        errorMessage: "When origin_type is 'object_storage', the 'bucket' field is required.",
      },
    },
  ],
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

// ... resto do arquivo mantido como está ...

const schemaApplicationManifest = {
  type: 'object',
  properties: {
    main_settings: {
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
      },
      additionalProperties: false,
      required: ['name'],
    },
    cache_settings: {
      type: 'array',
      items: schemaApplicationCacheSettings,
      errorMessage: "The 'cache_settings' field must be an array of cache setting items.",
    },
    origins: {
      type: 'array',
      items: schemaApplicationOrigins,
      errorMessage: "The 'origins' field must be an array of origin items.",
    },
    rules: {
      type: 'array',
      items: schemaApplicationRules,
      errorMessage: "The 'rules' field must be an array of application rule items.",
    },
  },
  required: ['main_settings'],
  additionalProperties: false,
  errorMessage: {
    additionalProperties: 'No additional properties are allowed in application items.',
    required: "The 'name' and 'main_settings' fields are required.",
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
    domain: {
      ...schemaDomainsManifest,
      errorMessage: {
        type: "The 'domain' field must be an object",
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
  },
};
export { schemaManifest };
