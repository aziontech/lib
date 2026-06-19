import {
  ALL_REQUEST_VARIABLES,
  ALL_RESPONSE_VARIABLES,
  RULE_CONDITIONALS,
  RULE_OPERATORS_WITH_VALUE,
  RULE_OPERATORS_WITHOUT_VALUE,
  SPECIAL_VARIABLES,
} from '../../../constants';
import applicationRuleBehaviorSchema from './behaviors';

const createVariableValidation = (isRequestPhase = false) => ({
  type: 'string',
  anyOf: [
    {
      type: 'string',
      pattern:
        '^\\$\\{(' + [...new Set(isRequestPhase ? ALL_REQUEST_VARIABLES : ALL_RESPONSE_VARIABLES)].join('|') + ')\\}$',
      errorMessage: "The 'variable' field must be a valid variable wrapped in ${}",
    },
    {
      type: 'string',
      pattern: isRequestPhase
        ? '^\\$\\{(arg_|cookie_|http_)[a-zA-Z0-9_]+\\}$'
        : '^\\$\\{(arg_|cookie_|http_|sent_http_|upstream_cookie_|upstream_http_)[a-zA-Z0-9_]+\\}$',
    },
    {
      // special variables with arguments
      type: 'string',
      pattern: `^\\$\\{(${SPECIAL_VARIABLES.join('|')})\\([^)]+\\)\\}$`,
    },
  ],
  errorMessage: isRequestPhase
    ? "The 'variable' field must be a valid request phase variable wrapped in ${}, follow the patterns arg_*, cookie_*, http_*, or be a special function variable cookie_time_offset(), encode_base64()"
    : "The 'variable' field must be a valid response phase variable wrapped in ${}, follow the patterns arg_*, cookie_*, http_*, sent_http_*, upstream_cookie_*, upstream_http_*, or be a special function variable cookie_time_offset(), encode_base64()",
});

const createCriteriaBaseSchema = (isRequestPhase = false) => ({
  type: 'object',
  properties: {
    variable: createVariableValidation(isRequestPhase).anyOf
      ? {
          type: 'string',
          anyOf: createVariableValidation(isRequestPhase).anyOf,
          errorMessage: createVariableValidation(isRequestPhase).errorMessage,
        }
      : createVariableValidation(isRequestPhase),
    conditional: {
      type: 'string',
      enum: RULE_CONDITIONALS,
      errorMessage: `The 'conditional' field must be one of: ${RULE_CONDITIONALS.join(', ')}`,
    },
    operator: {
      type: 'string',
      enum: [...RULE_OPERATORS_WITH_VALUE, ...RULE_OPERATORS_WITHOUT_VALUE],
      errorMessage: `The 'operator' field must be one of: ${[...RULE_OPERATORS_WITH_VALUE, ...RULE_OPERATORS_WITHOUT_VALUE].join(', ')}`,
    },
    argument: {
      type: 'string',
      errorMessage: "The 'argument' field must be a string",
    },
  },
  required: ['variable', 'conditional', 'operator'],
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
});

const createRuleSchema = (isRequestPhase = false) => ({
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 250,
      pattern: '.*',
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
        items: createCriteriaBaseSchema(isRequestPhase),
        minItems: 1,
        maxItems: 10,
        errorMessage: 'Each criteria group must have between 1 and 10 criteria items.',
      },
      minItems: 1,
      maxItems: 5,
      errorMessage: 'The criteria must be an array of arrays with 1-5 groups.',
    },
    behaviors: {
      type: 'array',
      items: applicationRuleBehaviorSchema,
      minItems: 1,
      maxItems: 10,
      errorMessage: 'The behaviors must be an array with 1-10 items.',
    },
  },
  required: ['name', 'criteria', 'behaviors'],
  additionalProperties: false,
});

const applicationsSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        maxLength: 250,
        errorMessage: "The 'name' field must be a string with 1 to 250 characters",
      },
      active: {
        type: 'boolean',
        default: true,
        errorMessage: "The 'active' field must be a boolean",
      },
      debug: {
        type: 'boolean',
        default: false,
        errorMessage: "The 'debug' field must be a boolean",
      },
      edgeCacheEnabled: {
        type: 'boolean',
        default: true,
        errorMessage: "The 'edgeCacheEnabled' field must be a boolean",
      },
      functionsEnabled: {
        type: 'boolean',
        default: false,
        errorMessage: "The 'functionsEnabled' field must be a boolean",
      },
      applicationAcceleratorEnabled: {
        type: 'boolean',
        default: false,
        errorMessage: "The 'applicationAcceleratorEnabled' field must be a boolean",
      },
      imageProcessorEnabled: {
        type: 'boolean',
        default: false,
        errorMessage: "The 'imageProcessorEnabled' field must be a boolean",
      },
      cache: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              minLength: 1,
              maxLength: 250,
              errorMessage: "The 'name' field must be a string with 1 to 250 characters",
            },
            stale: {
              type: 'boolean',
              errorMessage: "The 'stale' field must be a boolean.",
            },
            queryStringSort: {
              type: 'boolean',
              errorMessage: "The 'queryStringSort' field must be a boolean.",
            },
            tieredCache: {
              type: 'object',
              properties: {
                enabled: {
                  type: 'boolean',
                  default: false,
                  errorMessage: "The 'enabled' field must be a boolean.",
                },
                topology: {
                  type: ['string', 'null'],
                  enum: ['nearest-region', 'us-east-1', 'br-east-1', null],
                  default: 'nearest-region',
                  errorMessage:
                    "The 'topology' field must be one of 'nearest-region', 'br-east-1', 'us-east-1' or null.",
                },
              },
              required: ['enabled'],
              if: {
                properties: { enabled: { const: true } },
              },
              then: {
                required: ['enabled', 'topology'],
                errorMessage: {
                  required: "When 'enabled' is true, 'topology' is required in the 'tiered_cache' object.",
                },
              },
              additionalProperties: false,
              errorMessage: {
                additionalProperties: "No additional properties are allowed in the 'tiered_cache' object.",
              },
            },
            methods: {
              type: 'object',
              properties: {
                post: {
                  type: 'boolean',
                  errorMessage: "The 'post' field must be a boolean.",
                },
                options: {
                  type: 'boolean',
                  errorMessage: "The 'options' field must be a boolean.",
                },
              },
              additionalProperties: false,
              errorMessage: {
                additionalProperties: "No additional properties are allowed in the 'methods' object.",
              },
            },
            browser: {
              type: 'object',
              properties: {
                maxAgeSeconds: {
                  oneOf: [
                    {
                      type: 'number',
                      errorMessage: "The 'maxAgeSeconds' field must be a number or a valid mathematical expression.",
                    },
                    {
                      type: 'string',
                      pattern: '^[0-9+*/.() -]+$',
                      errorMessage: "The 'maxAgeSeconds' field must be a valid mathematical expression.",
                    },
                  ],
                },
              },
              required: ['maxAgeSeconds'],
              additionalProperties: false,
              errorMessage: {
                additionalProperties: "No additional properties are allowed in the 'browser' object.",
                required: "The 'maxAgeSeconds' field is required in the 'browser' object.",
              },
            },
            edge: {
              type: 'object',
              properties: {
                maxAgeSeconds: {
                  oneOf: [
                    {
                      type: 'number',
                      errorMessage: "The 'maxAgeSeconds' field must be a number or a valid mathematical expression.",
                    },
                    {
                      type: 'string',
                      pattern: '^[0-9+*/.() -]+$',
                      errorMessage: "The 'maxAgeSeconds' field must be a valid mathematical expression.",
                    },
                  ],
                },
              },
              required: ['maxAgeSeconds'],
              additionalProperties: false,
              errorMessage: {
                additionalProperties: "No additional properties are allowed in the 'edge' object.",
                required: "The 'maxAgeSeconds' field is required in the 'edge' object.",
              },
            },
            cacheByCookie: {
              type: 'object',
              properties: {
                option: {
                  type: 'string',
                  enum: ['ignore', 'all', 'allowlist', 'denylist'],
                  errorMessage: "The 'option' field must be one of 'ignore', 'all', 'allowlist' or 'denylist'.",
                },
                list: {
                  type: 'array',
                  items: {
                    type: 'string',
                    errorMessage: "Each item in 'list' must be a string.",
                  },
                  errorMessage: {
                    type: "The 'list' field must be an array of strings.",
                  },
                },
              },
              required: ['option'],
              additionalProperties: false,
              errorMessage: {
                additionalProperties: "No additional properties are allowed in the 'cacheByCookie' object.",
                required: "The 'option' field is required in the 'cacheByCookie' object.",
              },
              if: {
                properties: {
                  option: { enum: ['allowlist', 'denylist'] },
                },
              },
              then: {
                required: ['list'],
                errorMessage: {
                  required: "The 'list' field is required when 'option' is 'allowlist' or 'denylist'.",
                },
              },
            },
            cacheByQueryString: {
              type: 'object',
              properties: {
                option: {
                  type: 'string',
                  enum: ['ignore', 'all', 'allowlist', 'denylist'],
                  errorMessage: "The 'option' field must be one of 'ignore', 'all', 'allowlist' or 'denylist'.",
                },
                list: {
                  type: 'array',
                  items: {
                    type: 'string',
                    errorMessage: "Each item in 'list' must be a string.",
                  },
                  errorMessage: {
                    type: "The 'list' field must be an array of strings.",
                  },
                },
              },
              required: ['option'],
              additionalProperties: false,
              errorMessage: {
                additionalProperties: "No additional properties are allowed in the 'cacheByQueryString' object.",
                required: "The 'option' field is required in the 'cacheByQueryString' object.",
              },
              if: {
                properties: {
                  option: { enum: ['allowlist', 'denylist'] },
                },
              },
              then: {
                required: ['list'],
                errorMessage: {
                  required: "The 'list' field is required when 'option' is 'allowlist' or 'denylist'.",
                },
              },
            },
          },
          required: ['name'],
          additionalProperties: false,
          errorMessage: {
            additionalProperties: 'No additional properties are allowed in cache item objects.',
            required: "The 'name' field is required in each cache item.",
          },
        },
        errorMessage: "The 'cache' field must be an array of cache setting items.",
      },
      rules: {
        type: 'object',
        properties: {
          request: {
            type: 'array',
            items: createRuleSchema(true),
          },
          response: {
            type: 'array',
            items: createRuleSchema(false),
          },
        },
        additionalProperties: false,
      },
      deviceGroups: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              minLength: 1,
              maxLength: 250,
              pattern: '.*',
              errorMessage: "The 'name' field must be a string between 1 and 250 characters",
            },
            userAgent: {
              type: 'string',
              minLength: 1,
              maxLength: 512,
              pattern: '.*',
              errorMessage: "The 'userAgent' field must be a valid regex pattern between 1 and 512 characters",
            },
          },
          required: ['name', 'userAgent'],
          additionalProperties: false,
          errorMessage: {
            additionalProperties: 'No additional properties are allowed in device group objects',
            required: "The 'name' and 'userAgent' fields are required in each device group",
          },
        },
        errorMessage: "The 'deviceGroups' field must be an array of device group objects",
      },
      functionsInstances: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              minLength: 1,
              maxLength: 100,
              pattern: '.*',
              errorMessage: "The 'name' field must be a string between 1 and 100 characters",
            },
            ref: {
              type: ['string', 'number'],
              errorMessage: "The 'ref' field must be a string or number referencing an existing Function name or ID",
            },
            args: {
              type: 'object',
              default: {},
              errorMessage: "The 'args' field must be an object",
            },
            active: {
              type: 'boolean',
              default: true,
              errorMessage: "The 'active' field must be a boolean",
            },
          },
          required: ['name', 'ref'],
          additionalProperties: false,
          errorMessage: {
            additionalProperties: 'No additional properties are allowed in function instance objects',
            required: "The 'name' and 'ref' fields are required in each function instance",
          },
        },
        errorMessage: "The 'functions' field must be an array of function instance objects",
      },
    },
    required: ['name'],
    additionalProperties: false,
  },
  minItems: 1,
  errorMessage: "The 'applications' field must be an array of application objects with at least one item",
};

export default applicationsSchema;
