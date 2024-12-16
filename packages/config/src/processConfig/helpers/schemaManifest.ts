import {
  DYNAMIC_VARIABLE_PATTERNS,
  FIREWALL_BEHAVIOR_NAMES,
  FIREWALL_BEHAVIORS_REQUIRING_ARGUMENT,
  FIREWALL_RATE_LIMIT_BY,
  FIREWALL_RATE_LIMIT_TYPES,
  FIREWALL_VARIABLES,
  FIREWALL_WAF_MODES,
  NETWORK_LIST_TYPES,
  RULE_CONDITIONALS,
  RULE_OPERATORS_WITH_VALUE,
  RULE_OPERATORS_WITHOUT_VALUE,
  RULE_VARIABLES,
  RULES_ENGINE_BEHAVIORS,
  RULES_ENGINE_BEHAVIORS_REQUIRING_TARGET,
} from '../../constants';

const firewallBehaviorSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      enum: FIREWALL_BEHAVIOR_NAMES,
    },
    argument: {
      oneOf: [
        {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: FIREWALL_RATE_LIMIT_TYPES,
            },
            limit_by: {
              type: 'string',
              enum: FIREWALL_RATE_LIMIT_BY,
            },
            mode: {
              type: 'string',
              enum: FIREWALL_WAF_MODES,
            },
          },
        },
        { type: 'string' },
        { type: 'null' },
      ],
    },
  },
  required: ['name'],
  allOf: [
    {
      if: {
        properties: {
          name: { enum: FIREWALL_BEHAVIORS_REQUIRING_ARGUMENT },
        },
      },
      then: {
        required: ['argument'],
      },
    },
  ],
};

const purgeSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      urls: {
        type: 'array',
        items: { type: 'string' },
        maxItems: 50,
      },
      method: {
        type: 'string',
        enum: ['delete'],
      },
      type: {
        type: 'string',
        enum: ['urls', 'cachekey', 'wildcard'],
      },
      layer: {
        type: 'string',
        enum: ['edge_caching', 'l2_caching'],
      },
    },
    required: ['urls', 'method', 'type'],
  },
};

const domainSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    cname_access_only: {
      type: 'boolean',
      default: false,
    },
    cnames: {
      type: 'array',
      items: { type: 'string' },
    },
    digital_certificate_id: {
      oneOf: [{ type: 'string', enum: ['lets_encrypt'] }, { type: 'number' }, { type: 'null' }],
    },
    edge_application_id: { type: 'number' },
    edge_firewall_id: { type: 'number' },
    is_active: {
      type: 'boolean',
      default: true,
    },
    is_mtls_enabled: { type: 'boolean' },
    mtls_verification: {
      type: 'string',
      enum: ['enforce', 'permissive'],
    },
    mtls_trusted_ca_certificate_id: { type: 'number' },
    crl_list: {
      type: 'array',
      items: { type: 'number' },
    },
  },
  required: ['name', 'edge_application_id', 'cnames', 'cname_access_only'],
  allOf: [
    {
      if: {
        properties: { is_mtls_enabled: { const: true } },
      },
      then: {
        required: ['mtls_verification', 'mtls_trusted_ca_certificate_id'],
      },
    },
  ],
};

const cacheSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
    },
    browser_cache_settings: {
      type: 'string',
      enum: ['honor', 'override'],
      default: 'honor',
    },
    browser_cache_settings_maximum_ttl: {
      type: 'integer',
      minimum: 0,
      maximum: 31536000,
      default: 0,
    },
    cdn_cache_settings: {
      type: 'string',
      enum: ['honor', 'override'],
      default: 'honor',
    },
    cdn_cache_settings_maximum_ttl: {
      type: 'integer',
      minimum: 60,
      maximum: 31536000,
      default: 60,
    },
    cache_by_query_string: {
      type: 'string',
      enum: ['ignore', 'whitelist', 'blacklist', 'all'],
      default: 'ignore',
    },
    query_string_fields: {
      type: 'array',
      items: { type: 'integer' },
    },
    enable_query_string_sort: {
      type: 'boolean',
      default: false,
    },
    cache_by_cookie: {
      type: 'string',
      enum: ['ignore', 'whitelist', 'blacklist', 'all'],
      default: 'ignore',
    },
    cookie_names: {
      type: 'array',
      items: { type: 'integer' },
    },
    adaptive_delivery_action: {
      type: 'string',
      enum: ['ignore', 'whitelist'],
      default: 'ignore',
    },
    device_group: {
      type: 'array',
      items: { type: 'string' },
    },
    l2_caching_enabled: {
      type: 'boolean',
      default: false,
    },
    l2_region: {
      type: ['string', 'null'],
      enum: [null, 'sa-brazil', 'na-united-states'],
      default: null,
    },
    is_slice_configuration_enabled: {
      type: 'boolean',
      default: false,
    },
    is_slice_edge_caching_enabled: {
      type: 'boolean',
      default: false,
    },
    is_slice_l2_caching_enabled: {
      type: 'boolean',
      default: false,
    },
    slice_configuration_range: {
      type: 'integer',
      default: 1024,
    },
    enable_stale_cache: {
      type: 'boolean',
      default: true,
    },
    enable_caching_for_post: {
      type: 'boolean',
      default: false,
    },
    enable_caching_for_options: {
      type: 'boolean',
      default: false,
    },
  },
  required: ['name'],
};

const originSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
      },
      origin_type: {
        type: 'string',
        enum: ['single_origin', 'load_balancer', 'live_ingest', 'object_storage'],
        default: 'single_origin',
      },
      origin_path: {
        type: 'string',
      },
      addresses: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            address: { type: 'string' },
            weight: {
              type: 'number',
              minimum: 0,
              maximum: 10,
            },
            server_role: { type: 'string' },
          },
          required: ['address'],
        },
      },
      host_header: {
        type: 'string',
        default: '${host}',
      },
      origin_protocol_policy: {
        type: 'string',
        enum: ['preserve', 'http', 'https'],
        default: 'preserve',
      },
      is_origin_redirection_enabled: {
        type: 'boolean',
        default: false,
      },
      method: {
        type: 'string',
        enum: ['ip_hash', 'least_connections', 'round_robin'],
        default: 'ip_hash',
      },
      connection_timeout: {
        type: 'number',
        minimum: 60,
        maximum: 75,
        default: 60,
      },
      timeout_between_bytes: {
        type: 'number',
        default: 120,
      },
      bucket: {
        type: 'string',
      },
      prefix: {
        type: 'string',
        default: '/',
      },
      hmac_authentication: {
        type: 'boolean',
        default: false,
      },
      hmac_region_name: {
        type: 'string',
      },
      hmac_access_key: {
        type: 'string',
      },
      hmac_secret_key: {
        type: 'string',
      },
    },
    required: ['name', 'origin_type'],
    allOf: [
      {
        if: {
          properties: {
            origin_type: {
              enum: ['single_origin', 'load_balancer', 'live_ingest'],
            },
          },
        },
        then: {
          required: ['addresses', 'host_header'],
        },
      },
      {
        if: {
          properties: {
            origin_type: { const: 'object_storage' },
          },
        },
        then: {
          required: ['bucket'],
        },
      },
    ],
  },
};

const rulesEngineBehaviorSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        enum: RULES_ENGINE_BEHAVIORS,
      },
      target: {
        oneOf: [{ type: 'string' }, { type: 'object' }, { type: 'null' }],
      },
    },
    required: ['name'],
    allOf: [
      {
        if: {
          properties: {
            name: { enum: RULES_ENGINE_BEHAVIORS_REQUIRING_TARGET },
          },
        },
        then: {
          required: ['target'],
        },
      },
    ],
  },
};

const rulesEngineSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
      },
      phase: {
        type: 'string',
        enum: ['request', 'response'],
      },
      behaviors: {
        type: 'array',
        items: rulesEngineBehaviorSchema,
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
                pattern:
                  '^\\$\\{(' +
                  [...RULE_VARIABLES, ...DYNAMIC_VARIABLE_PATTERNS].join('|').replace(/\$/g, '\\$') +
                  ')\\}$',
              },
              operator: {
                type: 'string',
                enum: [...RULE_OPERATORS_WITH_VALUE, ...RULE_OPERATORS_WITHOUT_VALUE],
              },
              conditional: {
                type: 'string',
                enum: RULE_CONDITIONALS,
              },
              input_value: {
                type: 'string',
              },
            },
            required: ['variable', 'operator', 'conditional'],
          },
        },
      },
      is_active: {
        type: 'boolean',
        default: true,
      },
      description: {
        type: 'string',
        maxLength: 1000,
      },
    },
    required: ['name', 'phase'],
  },
};

const firewallSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
    },
    is_active: {
      type: 'boolean',
      default: true,
    },
    edge_functions_enabled: {
      type: 'boolean',
      default: false,
    },
    network_protection_enabled: {
      type: 'boolean',
      default: false,
    },
    waf_enabled: {
      type: 'boolean',
      default: false,
    },
    debug_rules: {
      type: 'boolean',
      default: false,
    },
    domains: {
      type: 'array',
      items: { type: 'number' },
    },
    rules_engine: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
          },
          is_active: {
            type: 'boolean',
            default: true,
          },
          behaviors: {
            type: 'array',
            items: firewallBehaviorSchema,
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
                    pattern: '^\\$\\{(' + FIREWALL_VARIABLES.join('|').replace(/\$/g, '\\$') + ')\\}$',
                  },
                  operator: {
                    type: 'string',
                    enum: [...RULE_OPERATORS_WITH_VALUE, ...RULE_OPERATORS_WITHOUT_VALUE],
                  },
                  conditional: {
                    type: 'string',
                    enum: RULE_CONDITIONALS,
                  },
                  input_value: {
                    type: 'string',
                  },
                },
                required: ['variable', 'operator', 'conditional'],
              },
            },
          },
        },
        required: ['name'],
      },
    },
  },
  required: ['name'],
};

const schemaManifest = {
  type: 'object',
  properties: {
    domain: domainSchema,
    origin: originSchema,
    rules_engine: rulesEngineSchema,
    firewall: firewallSchema,
    network_list: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          list_type: {
            type: 'string',
            enum: NETWORK_LIST_TYPES,
          },
          items_values: {
            type: 'array',
            items: {
              oneOf: [{ type: 'string' }, { type: 'number' }],
            },
          },
        },
        required: ['id', 'list_type', 'items_values'],
      },
    },
    purge: purgeSchema,
    cache_settings: {
      type: 'array',
      items: cacheSchema,
    },
  },
};

export { schemaManifest };
