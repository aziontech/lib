import {
  FIREWALL_RATE_LIMIT_BY,
  FIREWALL_RATE_LIMIT_TYPES,
  FIREWALL_VARIABLES,
  FIREWALL_WAF_MODES,
  NETWORK_LIST_TYPES,
  RULE_CONDITIONALS,
  RULE_OPERATORS_WITH_VALUE,
  RULE_OPERATORS_WITHOUT_VALUE,
  RULE_VARIABLES,
} from '../../constants';

const criteriaBaseSchema = {
  type: 'object',
  properties: {
    variable: {
      type: 'string',
      pattern: '^\\$\\{[^}]+\\}$',
      errorMessage: "The 'variable' field must be wrapped in ${} and be one of the valid variables",
    },
    conditional: {
      type: 'string',
      enum: RULE_CONDITIONALS,
      errorMessage: `The 'conditional' field must be one of: ${RULE_CONDITIONALS.join(', ')}`,
    },
  },
  required: ['variable', 'conditional'],
};

const criteriaWithValueSchema = {
  ...criteriaBaseSchema,
  properties: {
    ...criteriaBaseSchema.properties,
    operator: {
      type: 'string',
      enum: RULE_OPERATORS_WITH_VALUE,
      errorMessage: `The 'operator' field must be one of: ${RULE_OPERATORS_WITH_VALUE.join(', ')}`,
    },
    input_value: {
      type: 'string',
      errorMessage: "The 'input_value' field must be a string",
    },
  },
  required: [...criteriaBaseSchema.required, 'operator', 'input_value'],
};

const criteriaWithoutValueSchema = {
  ...criteriaBaseSchema,
  properties: {
    ...criteriaBaseSchema.properties,
    operator: {
      type: 'string',
      enum: RULE_OPERATORS_WITHOUT_VALUE,
      errorMessage: `The 'operator' field must be one of: ${RULE_OPERATORS_WITHOUT_VALUE.join(', ')}`,
    },
  },
  required: [...criteriaBaseSchema.required, 'operator'],
};

const ruleSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      errorMessage: "The 'name' field must be a string",
    },
    description: {
      type: 'string',
      errorMessage: "The 'description' field must be a string",
    },
    active: {
      type: 'boolean',
      errorMessage: "The 'active' field must be a boolean",
    },
    match: {
      type: 'string',
      errorMessage: "The 'match' field must be a string",
    },
    variable: {
      type: 'string',
      enum: RULE_VARIABLES,
      errorMessage: `The 'variable' field must be one of: ${RULE_VARIABLES.join(', ')}`,
    },
    criteria: {
      type: 'array',
      items: {
        oneOf: [criteriaWithValueSchema, criteriaWithoutValueSchema],
      },
      errorMessage: {
        oneOf: 'Each criteria item must follow either the with-value or without-value format',
      },
    },
    behavior: {
      type: 'object',
      properties: {
        runFunction: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              errorMessage: "The runFunction behavior must have a 'path' field of type string",
            },
          },
          required: ['path'],
        },
        setWafRuleset: {
          type: 'object',
          properties: {
            wafMode: {
              type: 'string',
              enum: FIREWALL_WAF_MODES,
              errorMessage: `The wafMode must be one of: ${FIREWALL_WAF_MODES.join(', ')}`,
            },
            wafId: {
              type: 'string',
              errorMessage: 'The wafId must be a string',
            },
          },
          required: ['wafMode', 'wafId'],
        },
        setRateLimit: {
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
            averageRateLimit: { type: 'string' },
            maximumBurstSize: { type: 'string' },
          },
          required: ['type', 'limitBy', 'averageRateLimit', 'maximumBurstSize'],
        },
        deny: { type: 'boolean' },
        drop: { type: 'boolean' },
        setCustomResponse: {
          type: 'object',
          properties: {
            statusCode: { type: ['integer', 'string'], minimum: 200, maximum: 499 },
            contentType: { type: 'string' },
            contentBody: { type: 'string' },
          },
          required: ['statusCode', 'contentType', 'contentBody'],
        },
      },
      allOf: [
        {
          not: {
            anyOf: [
              { required: ['deny', 'drop'] },
              { required: ['deny', 'setCustomResponse'] },
              { required: ['deny', 'setRateLimit'] },
              { required: ['drop', 'setCustomResponse'] },
              { required: ['drop', 'setRateLimit'] },
              { required: ['setCustomResponse', 'setRateLimit'] },
            ],
          },
          errorMessage:
            'Cannot use multiple final behaviors (deny, drop, setRateLimit, setCustomResponse) together. You can combine non-final behaviors (runFunction, setWafRuleset) with only one final behavior.',
        },
      ],
      minProperties: 1,
      errorMessage: {
        minProperties: 'At least one behavior must be specified',
      },
    },
  },
  required: ['name'],
  oneOf: [
    {
      anyOf: [{ required: ['match'] }, { required: ['variable'] }],
      not: { required: ['criteria'] },
      errorMessage: "Cannot use 'match' or 'variable' together with 'criteria'.",
    },
    {
      required: ['criteria'],
      not: {
        anyOf: [{ required: ['match'] }, { required: ['variable'] }],
      },
      errorMessage: "Cannot use 'criteria' together with 'match' or 'variable'.",
    },
  ],
  errorMessage: {
    oneOf: "You must use either 'match/variable' OR 'criteria', but not both at the same time",
  },
};

const azionConfigSchema = {
  type: 'object',
  properties: {
    build: {
      type: 'object',
      properties: {
        entry: {
          type: 'string',
          errorMessage: "The 'entry' field must be a string representing the entry point file path.",
        },
        builder: {
          type: ['string', 'null'],
          enum: ['esbuild', 'webpack', null],
          errorMessage: "The 'builder' field must be either 'esbuild', 'webpack', or null.",
        },
        polyfills: {
          type: 'boolean',
          errorMessage: "The 'polyfills' field must be a boolean.",
        },
        worker: {
          type: 'boolean',
          errorMessage: "The 'worker' field must be a boolean.",
        },
        preset: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              errorMessage: "The 'preset.name' field must be a string.",
            },
          },
          required: ['name'],
          additionalProperties: false,
          errorMessage: {
            additionalProperties: "No additional properties are allowed in the 'preset' object.",
            required: "The 'name' and 'mode' fields are required in the 'preset' object.",
          },
        },
        memoryFS: {
          type: 'object',
          properties: {
            injectionDirs: {
              type: ['array', 'null'],
              items: {
                type: 'string',
              },
              errorMessage: "The 'memoryFS.injectionDirs' field must be an array of strings or null.",
            },
            removePathPrefix: {
              type: ['string', 'null'],
              errorMessage: "The 'memoryFS.removePathPrefix' field must be a string or null.",
            },
          },
          additionalProperties: false,
          errorMessage: {
            additionalProperties: "No additional properties are allowed in the 'memoryFS' object.",
          },
        },
        custom: {
          type: 'object',
          additionalProperties: true,
          errorMessage: "The 'custom' field must be an object.",
        },
      },
      additionalProperties: false,
      errorMessage: {
        additionalProperties: "No additional properties are allowed in the 'build' object.",
      },
    },
    origin: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            errorMessage: "The 'id' field must be a number.",
          },
          key: {
            type: 'string',
            errorMessage: "The 'key' field must be a string.",
          },
          name: {
            type: 'string',
            errorMessage: "The 'name' field must be a string.",
          },
          type: {
            type: 'string',
            enum: ['single_origin', 'object_storage', 'load_balancer', 'live_ingest'],
            errorMessage:
              "The 'type' field must be a string and one of 'single_origin', 'object_storage', 'load_balancer' or 'live_ingest'.",
          },
          bucket: {
            type: ['string', 'null'],
            errorMessage: "The 'bucket' field must be a string or null.",
          },
          prefix: {
            type: ['string', 'null'],
            errorMessage: "The 'prefix' field must be a string or null.",
          },
          addresses: {
            anyOf: [
              {
                type: 'array',
                items: {
                  type: 'string',
                },
                errorMessage: {
                  type: "The 'addresses' field must be an array of strings.",
                },
              },
              {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    address: {
                      type: 'string',
                      errorMessage: "The 'address' field must be a string.",
                    },
                    weight: {
                      type: 'integer',
                    },
                  },
                  required: ['address'],
                  additionalProperties: false,
                  errorMessage: {
                    type: "The 'addresses' field must be an array of objects.",
                    additionalProperties: 'No additional properties are allowed in address items.',
                    required: "The 'address' field is required in each address item.",
                  },
                },
              },
            ],
          },
          hostHeader: {
            type: 'string',
            errorMessage: "The 'hostHeader' field must be a string.",
          },
          protocolPolicy: {
            type: 'string',
            enum: ['preserve', 'http', 'https'],
            errorMessage:
              "The 'protocolPolicy' field must be either 'http', 'https' or 'preserve'. Default is 'preserve'.",
          },
          redirection: {
            type: 'boolean',
            errorMessage: "The 'redirection' field must be a boolean.",
          },
          method: {
            type: 'string',
            enum: ['ip_hash', 'least_connections', 'round_robin'],
            errorMessage:
              "The 'method' field must be either 'ip_hash', 'least_connections' or 'round_robin'. Default is 'ip_hash'.",
          },
          path: {
            type: 'string',
            errorMessage: "The 'path' field must be a string.",
          },
          connectionTimeout: {
            type: 'integer',
            errorMessage: "The 'connectionTimeout' field must be a number. Default is 60.",
          },
          timeoutBetweenBytes: {
            type: 'integer',
            errorMessage: "The 'timeoutBetweenBytes' field must be a number. Default is 120.",
          },
          hmac: {
            type: 'object',
            properties: {
              region: {
                type: 'string',
                errorMessage: "The 'region' field must be a string.",
              },
              accessKey: {
                type: 'string',
                errorMessage: "The 'accessKey' field must be a string.",
              },
              secretKey: {
                type: 'string',
                errorMessage: "The 'secretKey' field must be a string.",
              },
            },
            required: ['region', 'accessKey', 'secretKey'],
            additionalProperties: false,
            errorMessage: {
              additionalProperties: 'No additional properties are allowed in the hmac object.',
              required: "The 'region, accessKey and secretKey' fields are required in the hmac object.",
            },
          },
        },
        required: ['name', 'type'],
        additionalProperties: false,
        errorMessage: {
          additionalProperties: 'No additional properties are allowed in origin item objects.',
          required: "The 'name and type' field is required in each origin item.",
        },
      },
      errorMessage: {
        additionalProperties: "The 'origin' field must be an array of objects.",
      },
    },
    cache: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            errorMessage: "The 'name' field must be a string.",
          },
          stale: {
            type: 'boolean',
            errorMessage: "The 'stale' field must be a boolean.",
          },
          queryStringSort: {
            type: 'boolean',
            errorMessage: "The 'queryStringSort' field must be a boolean.",
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
                enum: ['ignore', 'varies', 'whitelist', 'blacklist'],
                errorMessage: "The 'option' field must be one of 'ignore', 'varies', 'whitelist' or 'blacklist'..",
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
                option: { enum: ['whitelist', 'blacklist'] },
              },
            },
            then: {
              required: ['list'],
              errorMessage: {
                required: "The 'list' field is required when 'option' is 'whitelist' or 'blacklist'.",
              },
            },
          },

          cacheByQueryString: {
            type: 'object',
            properties: {
              option: {
                type: 'string',
                enum: ['ignore', 'varies', 'whitelist', 'blacklist'],
                errorMessage: "The 'option' field must be one of 'ignore', 'varies', 'whitelist' or 'blacklist'.",
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
                option: { enum: ['whitelist', 'blacklist'] },
              },
            },
            then: {
              required: ['list'],
              errorMessage: {
                required: "The 'list' field is required when 'option' is 'whitelist' or 'blacklist'.",
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
      errorMessage: {
        additionalProperties: "The 'cache' field must be an array of objects.",
      },
    },
    rules: {
      type: 'object',
      properties: {
        request: {
          type: 'array',
          items: ruleSchema,
        },
        response: {
          type: 'array',
          items: ruleSchema,
        },
      },
      additionalProperties: false,
      errorMessage: {
        additionalProperties: "No additional properties are allowed in the 'rules' object",
        anyOf: "Either 'request' or 'response' must be provided",
      },
    },
    networkList: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
            errorMessage: "The 'id' field must be a number.",
          },
          listType: {
            type: 'string',
            enum: NETWORK_LIST_TYPES,
            errorMessage: "The 'listType' field must be a string. Accepted values are 'ip_cidr', 'asn' or 'countries'.",
          },
          listContent: {
            type: 'array',
            items: {
              type: ['string', 'number'],
              errorMessage: "The 'listContent' field must be an array of strings or numbers.",
            },
          },
        },
        required: ['id', 'listType', 'listContent'],
        additionalProperties: false,
        errorMessage: {
          additionalProperties: 'No additional properties are allowed in network list items.',
          required: "The 'id, listType and listContent' fields are required in each network list item.",
        },
      },
    },
    domain: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          errorMessage: "The 'name' field must be a string.",
        },
        cnameAccessOnly: {
          type: 'boolean',
          errorMessage: "The 'cnameAccessOnly' field must be a boolean.",
        },
        cnames: {
          type: 'array',
          items: {
            type: 'string',
            errorMessage: "Each item in 'cnames' must be a string.",
          },
          errorMessage: {
            type: "The 'cnames' field must be an array of strings.",
          },
        },
        edgeApplicationId: {
          type: 'number',
          errorMessage: "The 'edgeApplicationId' field must be a number.",
        },
        edgeFirewallId: {
          type: 'number',
          errorMessage: "The 'edgeFirewallId' field must be a number.",
        },
        digitalCertificateId: {
          type: ['string', 'number', 'null'],
          errorMessage:
            "The 'digitalCertificateId' field must be a string, number or null. If string, it must be 'lets_encrypt'.",
        },
        mtls: {
          type: 'object',
          properties: {
            verification: {
              type: 'string',
              enum: ['enforce', 'permissive'],
              errorMessage: "The 'verification' field must be a string.",
            },
            trustedCaCertificateId: {
              type: 'number',
              errorMessage: "The 'trustedCaCertificateId' field must be a number.",
            },
            crlList: {
              type: 'array',
              items: {
                type: 'number',
                errorMessage: "Each item in 'crlList' must be a number.",
              },
              errorMessage: {
                type: "The 'crlList' field must be an array of numbers.",
              },
            },
          },
          required: ['verification', 'trustedCaCertificateId'],
          additionalProperties: false,
          errorMessage: {
            additionalProperties: 'No additional properties are allowed in the mtls object.',
            required: "The 'verification and trustedCaCertificateId' fields are required in the mtls object.",
          },
        },
      },
      required: ['name'],
      additionalProperties: false,
      errorMessage: {
        type: "The 'domain' field must be an object.",
        additionalProperties: 'No additional properties are allowed in the domain object.',
        required: "The 'name' field is required in the domain object.",
      },
    },
    purge: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['url', 'cachekey', 'wildcard'],
            errorMessage: "The 'type' field must be either 'url', 'cachekey' or 'wildcard'.",
          },
          urls: {
            type: 'array',
            items: {
              type: 'string',
              errorMessage: "Each item in 'urls' must be a string.",
            },
            errorMessage: {
              type: "The 'urls' field must be an array of strings.",
            },
          },
          method: {
            type: 'string',
            enum: ['delete'],
            errorMessage: "The 'method' field must be either 'delete'. Default is 'delete'.",
          },
          layer: {
            type: 'string',
            enum: ['edge_caching', 'l2_caching'],
            errorMessage: "The 'layer' field must be either 'edge_caching' or 'l2_caching'. Default is 'edge_caching'.",
          },
        },
        required: ['type', 'urls'],
        additionalProperties: false,
        errorMessage: {
          additionalProperties: 'No additional properties are allowed in purge items.',
          required: "The 'type and urls' fields are required in each purge item.",
        },
      },
    },
    firewall: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          errorMessage: "The firewall configuration must have a 'name' field of type string",
        },
        domains: {
          type: 'array',
          items: {
            type: 'string',
            errorMessage: "Each domain in the firewall's domains list must be a string",
          },
        },
        active: {
          type: 'boolean',
          errorMessage: "The firewall's 'active' field must be a boolean",
        },
        variable: {
          type: 'string',
          enum: FIREWALL_VARIABLES,
          errorMessage: `The 'variable' field must be one of: ${FIREWALL_VARIABLES.join(', ')}`,
        },
        rules: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                errorMessage: "Each firewall rule must have a 'name' field of type string",
              },
              active: {
                type: 'boolean',
                errorMessage: "The rule's 'active' field must be a boolean",
              },
              match: {
                type: 'string',
                errorMessage: "The rule's 'match' field must be a string containing a valid regex pattern",
              },
              behavior: {
                type: 'object',
                properties: {
                  runFunction: {
                    type: 'object',
                    properties: {
                      path: {
                        type: 'string',
                        errorMessage: "The runFunction behavior must have a 'path' field of type string",
                      },
                    },
                    required: ['path'],
                  },
                  setWafRuleset: {
                    type: 'object',
                    properties: {
                      wafMode: {
                        type: 'string',
                        enum: FIREWALL_WAF_MODES,
                      },
                      wafId: { type: 'string' },
                    },
                    required: ['wafMode', 'wafId'],
                  },
                  setRateLimit: {
                    type: 'object',
                    properties: {
                      type: {
                        type: 'string',
                        enum: FIREWALL_RATE_LIMIT_TYPES,
                      },
                      limitBy: {
                        type: 'string',
                        enum: FIREWALL_RATE_LIMIT_BY,
                      },
                      averageRateLimit: { type: 'string' },
                      maximumBurstSize: { type: 'string' },
                    },
                    required: ['type', 'limitBy', 'averageRateLimit', 'maximumBurstSize'],
                  },
                  deny: { type: 'boolean' },
                  drop: { type: 'boolean' },
                  setCustomResponse: {
                    type: 'object',
                    properties: {
                      statusCode: { type: ['integer', 'string'], minimum: 200, maximum: 499 },
                      contentType: { type: 'string' },
                      contentBody: { type: 'string' },
                    },
                    required: ['statusCode', 'contentType', 'contentBody'],
                  },
                },
                not: {
                  anyOf: [
                    { required: ['deny', 'drop'] },
                    { required: ['deny', 'setCustomResponse'] },
                    { required: ['deny', 'setRateLimit'] },
                    { required: ['drop', 'setCustomResponse'] },
                    { required: ['drop', 'setRateLimit'] },
                    { required: ['setCustomResponse', 'setRateLimit'] },
                  ],
                },
                errorMessage: {
                  not: 'Cannot use multiple final behaviors (deny, drop, setRateLimit, setCustomResponse) together. You can combine non-final behaviors (runFunction, setWafRuleset) with only one final behavior.',
                },
                additionalProperties: false,
              },
            },
            required: ['name', 'behavior'],
            oneOf: [
              {
                anyOf: [{ required: ['match'] }, { required: ['variable'] }],
                not: { required: ['criteria'] },
                errorMessage: "Cannot use 'match' or 'variable' together with 'criteria'.",
              },
              {
                required: ['criteria'],
                not: {
                  anyOf: [{ required: ['match'] }, { required: ['variable'] }],
                },
                errorMessage: "Cannot use 'criteria' together with 'match' or 'variable'.",
              },
            ],
            errorMessage: {
              oneOf: "You must use either 'match/variable' OR 'criteria', but not both at the same time",
            },
          },
        },
      },
      required: ['name'],
    },
  },
};

export default azionConfigSchema;
