import { NETWORK_LIST_TYPES, WAF_MODE, WAF_SENSITIVITY } from '../../constants';

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
  },
};

export { schemaManifest };
