import {
  FIREWALL_NO_ARGS_BEHAVIORS,
  FIREWALL_RATE_LIMIT_BY,
  FIREWALL_RATE_LIMIT_TYPES,
  FIREWALL_WAF_MODES,
} from '../../../../constants';

const setRateLimitBehaviorSchema = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: ['set_rate_limit'],
      errorMessage: "The 'type' field must be a valid set_rate_limit behavior type.",
    },
    attributes: {
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
        additionalProperties: 'No additional properties are allowed in set_rate_limit behavior attributes.',
        required:
          "The 'type', 'limitBy', 'averageRateLimit', and 'maximumBurstSize' fields are required in set_rate_limit behavior attributes.",
      },
    },
  },
  required: ['type', 'attributes'],
  additionalProperties: false,
};

const setWafRuleSetBehaviorSchema = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: ['set_waf_rule_set'],
      errorMessage: "The 'type' field must be a valid set_waf_rule_set behavior type.",
    },
    attributes: {
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
        additionalProperties: 'No additional properties are allowed in the setWafRuleSet object',
        required: "Both 'wafMode' and 'wafId' fields are required in setWafRuleSet attributes",
      },
    },
  },
  required: ['type', 'attributes'],
  additionalProperties: false,
};

const setCustomResponseBehaviorSchema = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: ['set_custom_response'],
      errorMessage: "The 'type' field must be a valid set_custom_response behavior type.",
    },
    attributes: {
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
        additionalProperties: 'No additional properties are allowed in the setCustomResponse object',
        required: "All fields ('statusCode', 'contentType', 'contentBody') are required in setCustomResponse",
      },
    },
  },
  required: ['type', 'attributes'],
  additionalProperties: false,
};

const noArgsBehaviorSchema = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: FIREWALL_NO_ARGS_BEHAVIORS,
      errorMessage: "The 'type' field must be a valid firewall no-args behavior type.",
    },
  },
  required: ['type'],
  additionalProperties: false,
  errorMessage: {
    additionalProperties: 'No additional properties are allowed in firewall no-args behaviors.',
    required: "The 'type' field is required in firewall no-args behaviors.",
  },
};

const runFunctionBehaviorSchema = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: ['run_function'],
      errorMessage: "The 'type' field must be 'run_function' for this behavior.",
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
              errorMessage: "The 'value' field must be a string between 1 and 255 characters.",
            },
            {
              type: 'number',
              minimum: 1,
              errorMessage: "The 'value' field must be a positive number.",
            },
          ],
          errorMessage: "The 'value' field must be a string or positive number.",
        },
      },
      required: ['value'],
      additionalProperties: false,
      errorMessage: {
        additionalProperties: 'No additional properties are allowed in run_function behavior attributes.',
        required: "The 'value' field is required in run_function behavior attributes.",
      },
    },
  },
  required: ['type', 'attributes'],
  additionalProperties: false,
};

const firewallBehaviorSchema = {
  oneOf: [
    runFunctionBehaviorSchema,
    setWafRuleSetBehaviorSchema,
    setRateLimitBehaviorSchema,
    noArgsBehaviorSchema,
    setCustomResponseBehaviorSchema,
  ],
  errorMessage: 'Each behavior must match one of the valid behavior formats.',
};

export default firewallBehaviorSchema;
