import {
  FIREWALL_BEHAVIOR_NAMES,
  FIREWALL_RATE_LIMIT_BY,
  FIREWALL_RATE_LIMIT_TYPES,
  FIREWALL_RULE_CONDITIONALS,
  FIREWALL_RULE_OPERATORS,
  FIREWALL_VARIABLES,
  NETWORK_LIST_TYPES,
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
  required: ['name', 'edge_application_id', 'cnames', 'cname_access_only', 'digital_certificate_id'],
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
    criteria: schemaFirewallRuleCriteria,
    behavior: schemaFirewallRuleBehavior,
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
  required: ['name', 'criteria', 'behavior'],
  additionalProperties: false,
};

const schemaFirewallManifest = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      errorMessage: "The 'name' field must be a string.",
    },
    domains: {
      type: 'array',
      items: {
        type: 'number',
      },
      errorMessage: "The 'domains' field must be an array of numbers.",
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
    rules: {
      type: 'array',
      items: schemaFirewallRule,
      errorMessage: "The 'rules' field must be an array of firewall rules.",
    },
  },
  required: ['name'],
  additionalProperties: false,
  errorMessage: {
    additionalProperties: 'No additional properties are allowed in firewall items.',
    required: "The 'name' field is required in each firewall item.",
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
    domains: {
      type: 'array',
      items: schemaDomainsManifest,
      errorMessage: "The 'domains' field must be an array of domain items.",
    },
    firewall: {
      type: 'array',
      items: schemaFirewallManifest,
      errorMessage: "The 'firewall' field must be an array of firewall items.",
    },
  },
};

export { schemaManifest };
