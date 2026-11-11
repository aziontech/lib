import {
  WAF_ENGINE_TYPES,
  WAF_ENGINE_VERSIONS,
  WAF_RULESETS,
  WAF_SENSITIVITY,
  WAF_THREAT_TYPES,
} from '../../constants';

/**
 * Schema of the v6 wafs, from `WAFRequest` of the v6 API. The request has no `id` nor `productVersion`, only the name
 * is required, and a threshold only requires the threat.
 */
const wafSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        maxLength: 250,
        pattern: '.*',
        errorMessage: "The WAF configuration must have a 'name' field of type string (1-250 characters)",
      },
      engineSettings: {
        type: 'object',
        properties: {
          engineVersion: {
            type: 'string',
            enum: WAF_ENGINE_VERSIONS,
            default: '2021-Q3',
            errorMessage: "The 'engineVersion' field must be '2021-Q3'",
          },
          type: {
            type: 'string',
            enum: WAF_ENGINE_TYPES,
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
                  enum: WAF_RULESETS,
                  errorMessage: "The 'rulesets' field must be an array containing [1]",
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
                      enum: WAF_THREAT_TYPES,
                      errorMessage: `The 'threat' field must be one of: ${WAF_THREAT_TYPES.join(', ')}`,
                    },
                    sensitivity: {
                      type: 'string',
                      enum: WAF_SENSITIVITY,
                      errorMessage: `The 'sensitivity' field must be one of: ${WAF_SENSITIVITY.join(', ')}`,
                    },
                  },
                  required: ['threat'],
                  additionalProperties: false,
                  errorMessage: {
                    additionalProperties: 'No additional properties are allowed in a threshold',
                    required: "The 'threat' field is required in each threshold",
                  },
                },
                maxItems: 8,
                errorMessage: "The 'thresholds' field must be an array of threat configurations (max 8 items)",
              },
            },
            additionalProperties: false,
            errorMessage: {
              additionalProperties: 'No additional properties are allowed in the attributes object',
            },
          },
        },
        additionalProperties: false,
        errorMessage: {
          additionalProperties: 'No additional properties are allowed in the engineSettings object',
        },
      },
    },
    required: ['name'],
    additionalProperties: false,
    errorMessage: {
      type: "The 'waf' field must be an object",
      additionalProperties: 'No additional properties are allowed in the WAF object',
      required: "The 'name' field is required in the WAF object",
    },
  },
  errorMessage: {
    type: "The 'waf' field must be an array",
  },
};

export default wafSchema;
