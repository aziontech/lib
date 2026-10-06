const wafSchema = {
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
                      errorMessage: "The 'sensitivity' field must be one of: highest, high, medium, low, lowest",
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
          required: "The 'engineVersion', 'type', and 'attributes' fields are required in the engineSettings object",
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
};

export default wafSchema;
