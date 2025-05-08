import {
  ALL_REQUEST_VARIABLES,
  ALL_RESPONSE_VARIABLES,
  APPLICATION_HTTP_PORTS,
  APPLICATION_HTTPS_PORTS,
  APPLICATION_SUPPORTED_CIPHERS,
  CONNECTOR_TLS_POLICIES,
  DYNAMIC_VARIABLE_PATTERNS,
  FIREWALL_RATE_LIMIT_BY,
  FIREWALL_RATE_LIMIT_TYPES,
  FIREWALL_VARIABLES,
  FIREWALL_WAF_MODES,
  NETWORK_LIST_TYPES,
  RULE_CONDITIONALS,
  RULE_OPERATORS_WITH_VALUE,
  RULE_OPERATORS_WITHOUT_VALUE,
  RULE_PHASES,
  RULE_VARIABLES,
  SPECIAL_VARIABLES,
  WAF_MODE,
  WAF_SENSITIVITY,
  WORKLOAD_HTTP_VERSIONS,
  WORKLOAD_NETWORK_MAPS,
  WORKLOAD_TLS_MINIMUM_VERSIONS,
} from '../../constants';

const criteriaBaseSchema = {
  type: 'object',
  properties: {
    variable: {
      type: 'string',
      anyOf: [
        {
          // static variables validation
          type: 'string',
          pattern: '^\\$\\{(' + RULE_VARIABLES.join('|') + ')\\}$',
        },
        {
          // dynamic variables validation
          type: 'string',
          pattern: '^\\$\\{(' + DYNAMIC_VARIABLE_PATTERNS.join('|').replace(/\$/g, '\\$') + ')\\}$',
        },
      ],
      errorMessage:
        "The 'variable' field must be wrapped in ${} and be either a valid static variable or follow the dynamic patterns (arg_*, cookie_*, http_*, sent_http_*, upstream_cookie_*, upstream_http_*)",
    },
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
        required: ['inputValue'],
        properties: {
          inputValue: {
            type: 'string',
            errorMessage: "The 'inputValue' field must be a string",
          },
        },
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
          required: ['inputValue'],
        },
      },
    },
  ],
};

const createVariableValidation = (isRequestPhase = false) => ({
  type: 'string',
  anyOf: [
    {
      // static variables
      enum: [...new Set(isRequestPhase ? ALL_REQUEST_VARIABLES : ALL_RESPONSE_VARIABLES)],
      errorMessage: "The 'variable' field must be a valid variable",
    },
    {
      // variables with ${}
      type: 'string',
      pattern:
        '^\\$\\{(' + [...new Set(isRequestPhase ? ALL_REQUEST_VARIABLES : ALL_RESPONSE_VARIABLES)].join('|') + ')\\}$',
      errorMessage: "The 'variable' field must be a valid variable wrapped in ${}",
    },
    {
      // dynamic pattern
      type: 'string',
      pattern: isRequestPhase
        ? '^(arg_|cookie_|http_)[a-zA-Z0-9_]+$'
        : '^(arg_|cookie_|http_|sent_http_|upstream_cookie_|upstream_http_)[a-zA-Z0-9_]+$',
    },
    {
      // dynamic pattern with ${}
      type: 'string',
      pattern: isRequestPhase
        ? '^\\$\\{(arg_|cookie_|http_)[a-zA-Z0-9_]+\\}$'
        : '^\\$\\{(arg_|cookie_|http_|sent_http_|upstream_cookie_|upstream_http_)[a-zA-Z0-9_]+\\}$',
    },
    {
      // special variables with arguments
      type: 'string',
      pattern: `^(${SPECIAL_VARIABLES.join('|')})\\([^)]+\\)$`,
    },
  ],
  errorMessage: isRequestPhase
    ? "The 'variable' field must be either a valid request phase variable, mTLS variable, follow the patterns (arg_*, cookie_*, http_*), or be a special function variable (cookie_time_offset, encode_base64)"
    : "The 'variable' field must be either a valid response phase variable, follow the patterns (arg_*, cookie_*, http_*, sent_http_*, upstream_cookie_*, upstream_http_*), or be a special function variable (cookie_time_offset, encode_base64)",
});

const sensitivitySchema = {
  type: 'string',
  enum: WAF_SENSITIVITY,
  errorMessage: `The 'sensitivity' field must be one of: ${WAF_SENSITIVITY.join(', ')}`,
};

const createRuleSchema = (isRequestPhase = false) => ({
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 250,
      errorMessage: "The 'name' field must be a string between 1 and 250 characters",
    },
    description: {
      type: 'string',
      maxLength: 1000,
      errorMessage: "The 'description' field must be a string with at most 1000 characters",
    },
    active: {
      type: 'boolean',
      errorMessage: "The 'active' field must be a boolean",
    },
    phase: {
      type: 'string',
      enum: RULE_PHASES,
      default: isRequestPhase ? 'request' : 'response',
      errorMessage: `The 'phase' field must be one of: ${RULE_PHASES.join(', ')}`,
    },
    match: {
      type: 'string',
      errorMessage: "The 'match' field must be a string",
    },
    variable: createVariableValidation(isRequestPhase),
    criteria: {
      type: 'array',
      items: criteriaBaseSchema,
      minItems: 1,
      maxItems: 5,
      errorMessage: "The 'criteria' array must have between 1 and 5 items",
    },
    behavior: {
      type: 'object',
      properties: {
        // Comportamentos genéricos
        deliver: {
          type: ['boolean', 'null'],
          errorMessage: "The 'deliver' behavior must be a boolean or null",
        },
        runFunction: {
          type: 'string',
          errorMessage: "The 'runFunction' behavior must be a string",
        },
        setCookie: {
          type: ['string', 'null'],
          errorMessage: "The 'setCookie' field must be a string or null.",
        },
        filterCookie: {
          type: ['string', 'null'],
          errorMessage: "The 'filterCookie' field must be a string or null.",
        },
        filterHeader: {
          type: ['string', 'null'],
          errorMessage: "The 'filterHeader' field must be a string or null.",
        },
        enableGZIP: {
          type: ['boolean', 'null'],
          errorMessage: "The 'enableGZIP' field must be a boolean or null.",
        },
        noContent: {
          type: ['boolean', 'null'],
          errorMessage: "The 'noContent' field must be a boolean or null.",
        },
        redirectTo301: {
          type: ['string', 'null'],
          errorMessage: "The 'redirectTo301' field must be a string or null.",
        },
        redirectTo302: {
          type: ['string', 'null'],
          errorMessage: "The 'redirectTo302' field must be a string or null.",
        },
        setHeaders: {
          type: 'array',
          items: {
            type: 'string',
            errorMessage: "Each item in 'setHeaders' must be a string.",
          },
          errorMessage: "The 'setHeaders' field must be an array of strings.",
        },

        // ... outros comportamentos específicos ...
      },
      additionalProperties: false,
      minProperties: 1,
      errorMessage: {
        additionalProperties: "No additional properties are allowed in the 'behavior' object.",
        minProperties: 'At least one behavior must be specified',
      },
    },
  },
  required: ['name', 'criteria', 'behavior'],
  additionalProperties: false,
});

const azionConfigSchema = {
  $id: 'azionConfig',
  definitions: {
    mainConfig: {
      type: 'object',
      properties: {
        build: {
          type: 'object',
          properties: {
            entry: {
              oneOf: [
                { type: 'string' },
                { type: 'array', items: { type: 'string' } },
                { type: 'object', additionalProperties: { type: 'string' } },
              ],
              errorMessage: "The 'build.entry' must be a string, array of strings, or object with string values",
            },
            bundler: {
              type: 'string',
              enum: ['webpack', 'esbuild'],
              errorMessage: "The 'build.bundler' must be either 'webpack' or 'esbuild'",
            },
            preset: {
              anyOf: [
                { type: 'string' },
                {
                  type: 'object',
                  properties: {
                    metadata: {
                      type: 'object',
                      properties: {
                        name: {
                          type: 'string',
                          errorMessage: "The 'name' field in preset metadata must be a string",
                        },
                        ext: {
                          type: 'string',
                          errorMessage: "The 'ext' field in preset metadata must be a string",
                        },
                      },
                      required: ['name'],
                      additionalProperties: false,
                      errorMessage: {
                        additionalProperties: 'No additional properties are allowed in preset metadata',
                        required: "The 'name' field is required in preset metadata",
                      },
                    },
                    config: {
                      $ref: '#/definitions/mainConfig',
                    },
                    handler: { instanceof: 'Function' },
                    prebuild: { instanceof: 'Function' },
                    postbuild: { instanceof: 'Function' },
                  },
                  required: ['metadata', 'config'],
                  additionalProperties: false,
                  errorMessage: {
                    additionalProperties: 'No additional properties are allowed in preset',
                    required: "Preset must contain both 'metadata' and 'config' properties",
                  },
                },
              ],
              errorMessage: 'Preset must be either a string or an object with preset properties',
            },
            polyfills: {
              type: 'boolean',
              errorMessage: "The 'build.polyfills' must be a boolean",
            },
            worker: {
              type: 'boolean',
              errorMessage: "The 'build.worker' must be a boolean",
            },
            extend: {
              instanceof: 'Function',
              errorMessage: "The 'build.extend' must be a function",
            },
            memoryFS: {
              type: 'object',
              properties: {
                injectionDirs: {
                  type: 'array',
                  items: { type: 'string' },
                },
                removePathPrefix: { type: 'string' },
              },
              required: ['injectionDirs', 'removePathPrefix'],
              additionalProperties: false,
            },
          },
          additionalProperties: false,
          errorMessage: {
            additionalProperties: "No additional properties are allowed in the 'build' object",
          },
        },
        edgeFunctions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                errorMessage: "The function's 'name' field must be a string",
              },
              path: {
                type: 'string',
                errorMessage: "The function's 'path' field must be a string",
              },
              args: {
                type: 'object',
                additionalProperties: true,
                errorMessage: "The function's 'args' field must be an object",
              },
            },
            required: ['name', 'path'],
            additionalProperties: false,
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
                errorMessage:
                  "The 'listType' field must be a string. Accepted values are 'ip_cidr', 'asn' or 'countries'.",
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
              items: {
                type: 'array',
                items: {
                  type: 'string',
                  errorMessage: "Each item in 'items' must be a string.",
                },
                minItems: 1,
                errorMessage: {
                  type: "The 'items' field must be an array of strings with at least one item.",
                  minItems: "The 'items' array must contain at least one URL.",
                },
              },
              method: {
                type: 'string',
                enum: ['delete'],
                errorMessage: "The 'method' field must be 'delete'. Default is 'delete'.",
              },
              layer: {
                type: 'string',
                enum: ['edge_cache', 'tiered_cache'],
                errorMessage:
                  "The 'layer' field must be either 'edge_cache' or 'tiered_cache'. Default is 'edge_cache'.",
              },
            },
            required: ['type', 'items'],
            additionalProperties: false,
            errorMessage: {
              additionalProperties: 'No additional properties are allowed in purge items.',
              required: "The 'type' and 'items' fields are required in each purge item.",
            },
          },
        },
        edgeFirewall: {
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
            debugRules: {
              type: 'boolean',
              errorMessage: "The firewall's 'debugRules' field must be a boolean",
            },
            edgeFunctions: {
              type: 'boolean',
              errorMessage: "The firewall's 'edgeFunctions' field must be a boolean",
            },
            networkProtection: {
              type: 'boolean',
              errorMessage: "The firewall's 'networkProtection' field must be a boolean",
            },
            waf: {
              type: 'boolean',
              errorMessage: "The firewall's 'waf' field must be a boolean",
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
                  description: {
                    type: 'string',
                    errorMessage: "The rule's 'description' field must be a string",
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
                        type: 'string',
                        errorMessage: "The 'runFunction' behavior must be a string",
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
          additionalProperties: false,
          errorMessage: {
            type: "The 'firewall' field must be an object",
            additionalProperties: 'No additional properties are allowed in the firewall object',
            required: "The 'name' field is required in the firewall object",
          },
        },
        waf: {
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
                errorMessage: "The WAF configuration must have a 'name' field of type string",
              },
              mode: {
                type: 'string',
                enum: WAF_MODE,
                errorMessage: `The 'mode' field must be one of: ${WAF_MODE.join(', ')}`,
              },
              active: {
                type: 'boolean',
                errorMessage: "The WAF configuration's 'active' field must be a boolean",
              },
              sqlInjection: {
                type: 'object',
                properties: {
                  sensitivity: sensitivitySchema,
                },
                required: ['sensitivity'],
                additionalProperties: false,
                errorMessage: {
                  additionalProperties: 'No additional properties are allowed in the sqlInjection object',
                  required: "The 'sensitivity' field is required in the sqlInjection object",
                },
              },
              remoteFileInclusion: {
                type: 'object',
                properties: {
                  sensitivity: sensitivitySchema,
                },
                required: ['sensitivity'],
                additionalProperties: false,
                errorMessage: {
                  additionalProperties: 'No additional properties are allowed in the remoteFileInclusion object',
                  required: "The 'sensitivity' field is required in the remoteFileInclusion object",
                },
              },
              directoryTraversal: {
                type: 'object',
                properties: {
                  sensitivity: sensitivitySchema,
                },
                required: ['sensitivity'],
                additionalProperties: false,
                errorMessage: {
                  additionalProperties: 'No additional properties are allowed in the directoryTraversal object',
                  required: "The 'sensitivity' field is required in the directoryTraversal object",
                },
              },
              crossSiteScripting: {
                type: 'object',
                properties: {
                  sensitivity: sensitivitySchema,
                },
                required: ['sensitivity'],
                additionalProperties: false,
                errorMessage: {
                  additionalProperties: 'No additional properties are allowed in the crossSiteScripting object',
                  required: "The 'sensitivity' field is required in the crossSiteScripting object",
                },
              },
              evadingTricks: {
                type: 'object',
                properties: {
                  sensitivity: sensitivitySchema,
                },
                required: ['sensitivity'],
                additionalProperties: false,
                errorMessage: {
                  additionalProperties: 'No additional properties are allowed in the evadingTricks object',
                  required: "The 'sensitivity' field is required in the evadingTricks object",
                },
              },
              fileUpload: {
                type: 'object',
                properties: {
                  sensitivity: sensitivitySchema,
                },
                required: ['sensitivity'],
                additionalProperties: false,
                errorMessage: {
                  additionalProperties: 'No additional properties are allowed in the fileUpload object',
                  required: "The 'sensitivity' field is required in the fileUpload object",
                },
              },
              unwantedAccess: {
                type: 'object',
                properties: {
                  sensitivity: sensitivitySchema,
                },
                required: ['sensitivity'],
                additionalProperties: false,
                errorMessage: {
                  additionalProperties: 'No additional properties are allowed in the unwantedAccess object',
                  required: "The 'sensitivity' field is required in the unwantedAccess object",
                },
              },
              identifiedAttack: {
                type: 'object',
                properties: {
                  sensitivity: sensitivitySchema,
                },
                required: ['sensitivity'],
                additionalProperties: false,
                errorMessage: {
                  additionalProperties: 'No additional properties are allowed in the identifiedAttack object',
                  required: "The 'sensitivity' field is required in the identifiedAttack object",
                },
              },
              bypassAddresses: {
                type: 'array',
                items: {
                  type: 'string',
                  errorMessage: 'Each item in the bypassAddresses list must be a string',
                },
                errorMessage: {
                  type: "The 'bypassAddresses' field must be an array of strings",
                },
              },
            },
            required: ['name', 'active', 'mode'],
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
        },
        workload: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              minLength: 1,
              maxLength: 100,
              errorMessage: "The 'name' field must be a string between 1 and 100 characters.",
            },
            alternateDomains: {
              type: 'array',
              items: {
                type: 'string',
              },
              maxItems: 50,
              errorMessage: "The 'alternateDomains' field must be an array of strings with at most 50 items.",
            },
            edgeApplication: {
              oneOf: [
                {
                  type: 'string',
                  minLength: 1,
                },
              ],
              errorMessage: "The 'edgeApplication' field must be a positive integer or a string reference.",
            },
            active: {
              type: 'boolean',
              default: true,
              errorMessage: "The 'active' field must be a boolean.",
            },
            networkMap: {
              type: 'string',
              enum: WORKLOAD_NETWORK_MAPS,
              default: '1',
              errorMessage: "The 'networkMap' field must be '1' (Edge Global Network) or '2' (Staging Network).",
            },
            edgeFirewall: {
              type: ['integer', 'null'],
              errorMessage: "The 'edgeFirewall' field must be an integer or null.",
            },
            tls: {
              type: 'object',
              properties: {
                certificate: {
                  type: ['integer', 'null'],
                  minimum: 1,
                  errorMessage: "The 'certificate' field must be a positive integer or null.",
                },
                ciphers: {
                  type: ['string', 'null'],
                  enum: [...APPLICATION_SUPPORTED_CIPHERS, null],
                  errorMessage: "The 'ciphers' field must be a valid cipher suite or null.",
                },
                minimumVersion: {
                  type: 'string',
                  enum: WORKLOAD_TLS_MINIMUM_VERSIONS,
                  default: 'tls_1_2',
                  errorMessage: "The 'minimumVersion' field must be a valid TLS version.",
                },
              },
              additionalProperties: false,
              default: { certificate: null, ciphers: null, minimumVersion: 'tls_1_2' },
              errorMessage: "The 'tls' field must be an object with valid properties.",
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
                      errorMessage: "The 'versions' field must be an array with values 'http1' and/or 'http2'.",
                    },
                    httpPorts: {
                      type: 'array',
                      items: {
                        type: 'integer',
                        enum: APPLICATION_HTTP_PORTS,
                      },
                      default: [80],
                      errorMessage: "The 'httpPorts' field must be an array of valid HTTP ports.",
                    },
                    httpsPorts: {
                      type: 'array',
                      items: {
                        type: 'integer',
                        enum: APPLICATION_HTTPS_PORTS,
                      },
                      default: [443],
                      errorMessage: "The 'httpsPorts' field must be an array of valid HTTPS ports.",
                    },
                    quicPorts: {
                      type: ['array', 'null'],
                      items: {
                        type: 'integer',
                      },
                      errorMessage: "The 'quicPorts' field must be an array of integers or null.",
                    },
                  },
                  additionalProperties: false,
                  default: { versions: ['http1', 'http2'], httpPorts: [80], httpsPorts: [443], quicPorts: null },
                  errorMessage: "The 'http' field must be an object with valid properties.",
                },
              },
              additionalProperties: false,
              default: { http: { versions: ['http1', 'http2'], httpPorts: [80], httpsPorts: [443], quicPorts: null } },
              errorMessage: "The 'protocols' field must be an object with valid properties.",
            },
            mtls: {
              type: 'object',
              properties: {
                verification: {
                  type: 'string',
                  enum: ['enforce', 'permissive'],
                  default: 'enforce',
                  errorMessage: "The 'verification' field must be 'enforce' or 'permissive'.",
                },
                certificate: {
                  type: ['integer', 'null'],
                  minimum: 1,
                  errorMessage: "The 'certificate' field must be a positive integer or null.",
                },
                crl: {
                  type: ['array', 'null'],
                  items: {
                    type: 'integer',
                  },
                  maxItems: 100,
                  errorMessage: "The 'crl' field must be an array of integers with at most 100 items or null.",
                },
              },
              additionalProperties: false,
              errorMessage: "The 'mtls' field must be an object with valid properties.",
            },
            domains: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  domain: {
                    type: ['string', 'null'],
                    minLength: 1,
                    maxLength: 250,
                    errorMessage: "The 'domain' field must be a string between 1 and 250 characters or null.",
                  },
                  allowAccess: {
                    type: 'boolean',
                    errorMessage: "The 'allowAccess' field must be a boolean.",
                  },
                },
                additionalProperties: false,
                errorMessage: 'Each domain item must be an object with valid properties.',
              },
              minItems: 1,
              maxItems: 2,
              errorMessage: "The 'domains' field must be an array with 1 or 2 items.",
            },
          },
          required: ['name', 'edgeApplication'],
          additionalProperties: false,
          errorMessage: {
            additionalProperties: "No additional properties are allowed in the 'workload' object.",
            required: "The 'name' and 'edgeApplication' fields are required in the workload object.",
          },
        },
        edgeApplication: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                minLength: 1,
                maxLength: 250,
                errorMessage: "The 'name' field must be a string between 1 and 250 characters.",
              },
              edgeCache: {
                type: 'boolean',
                default: true,
                errorMessage: "The 'edgeCache' field must be a boolean.",
              },
              edgeFunctions: {
                type: 'boolean',
                default: false,
                errorMessage: "The 'edgeFunctions' field must be a boolean.",
              },
              applicationAccelerator: {
                type: 'boolean',
                default: false,
                errorMessage: "The 'applicationAccelerator' field must be a boolean.",
              },
              imageProcessor: {
                type: 'boolean',
                default: false,
                errorMessage: "The 'imageProcessor' field must be a boolean.",
              },
              tieredCache: {
                type: 'boolean',
                default: false,
                errorMessage: "The 'tieredCache' field must be a boolean.",
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
              cache: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: {
                      type: 'string',
                      errorMessage: "The 'name' field must be a string.",
                    },
                    browser: {
                      type: 'object',
                      properties: {
                        behavior: {
                          type: 'string',
                          enum: ['honor', 'override', 'no-cache'],
                          errorMessage: "The browser 'behavior' field must be 'honor', 'override', or 'no-cache'.",
                        },
                        maxAge: {
                          oneOf: [{ type: 'number' }, { type: 'string', pattern: '^[0-9+*/.() -]+$' }],
                          errorMessage: "The 'maxAge' field must be a number or a valid mathematical expression.",
                        },
                      },
                      required: ['behavior', 'maxAge'],
                      additionalProperties: false,
                    },
                    edge: {
                      type: 'object',
                      properties: {
                        behavior: {
                          type: 'string',
                          enum: ['honor', 'override'],
                          errorMessage: "The edge 'behavior' field must be 'honor' or 'override'.",
                        },
                        maxAge: {
                          oneOf: [{ type: 'number' }, { type: 'string', pattern: '^[0-9+*/.() -]+$' }],
                          errorMessage: "The 'maxAge' field must be a number or a valid mathematical expression.",
                        },
                      },
                      required: ['behavior', 'maxAge'],
                      additionalProperties: false,
                    },
                    enablePost: {
                      type: 'boolean',
                      errorMessage: "The 'enablePost' field must be a boolean.",
                    },
                    enableOptions: {
                      type: 'boolean',
                      errorMessage: "The 'enableOptions' field must be a boolean.",
                    },
                    stale: {
                      type: 'boolean',
                      errorMessage: "The 'stale' field must be a boolean.",
                    },
                    tieredCache: {
                      type: 'boolean',
                      errorMessage: "The 'tieredCache' field must be a boolean.",
                    },
                    tieredRegion: {
                      type: 'string',
                      errorMessage: "The 'tieredRegion' field must be a string.",
                    },
                    controls: {
                      type: 'object',
                      properties: {
                        queryString: {
                          type: 'string',
                          enum: ['ignore', 'whitelist', 'blacklist', 'all'],
                          errorMessage: "The 'queryString' field must be 'ignore', 'whitelist', 'blacklist', or 'all'.",
                        },
                        queryStringFields: {
                          type: 'array',
                          items: { type: 'string' },
                        },
                        queryStringSort: {
                          type: 'boolean',
                          errorMessage: "The 'queryStringSort' field must be a boolean.",
                        },
                        cookies: {
                          type: 'string',
                          enum: ['ignore', 'whitelist', 'blacklist', 'all'],
                          errorMessage: "The 'cookies' field must be 'ignore', 'whitelist', 'blacklist', or 'all'.",
                        },
                        cookieNames: {
                          type: 'array',
                          items: { type: 'string' },
                        },
                        adaptiveDelivery: {
                          type: 'string',
                          enum: ['ignore', 'whitelist'],
                          errorMessage: "The 'adaptiveDelivery' field must be 'ignore' or 'whitelist'.",
                        },
                        deviceGroup: {
                          type: 'array',
                          items: { type: 'number' },
                        },
                      },
                      required: ['queryString', 'cookies', 'adaptiveDelivery'],
                      additionalProperties: false,
                    },
                    slice: {
                      type: 'object',
                      properties: {
                        enabled: {
                          type: 'boolean',
                          errorMessage: "The 'enabled' field must be a boolean.",
                        },
                        edgeCaching: {
                          type: 'boolean',
                          errorMessage: "The 'edgeCaching' field must be a boolean.",
                        },
                        tieredCaching: {
                          type: 'boolean',
                          errorMessage: "The 'tieredCaching' field must be a boolean.",
                        },
                        range: {
                          type: 'number',
                          minimum: 0,
                          maximum: 1024,
                          errorMessage: "The 'range' field must be a number between 0 and 1024.",
                        },
                      },
                      additionalProperties: false,
                    },
                  },
                  required: ['name', 'browser', 'edge', 'controls'],
                  additionalProperties: false,
                },
              },
            },
            required: ['name'],
            additionalProperties: false,
            errorMessage: {
              additionalProperties: "No additional properties are allowed in the 'edgeApplication' object.",
              required: "The 'name' field is required in the edgeApplication object.",
            },
          },
        },
        edgeConnectors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                minLength: 1,
                errorMessage: "The 'name' field must be a string with at least 1 character.",
              },
              type: {
                type: 'string',
                enum: ['http'],
                errorMessage: "The 'type' field must be 'http'.",
              },
              active: {
                type: 'boolean',
                default: true,
                errorMessage: "The 'active' field must be a boolean.",
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
                      default: 1,
                      errorMessage: "The 'weight' field must be a number between 0 and 100.",
                    },
                    serverRole: {
                      type: 'string',
                      errorMessage: "The 'serverRole' field must be a string.",
                    },
                    status: {
                      type: 'string',
                      errorMessage: "The 'status' field must be a string.",
                    },
                  },
                  required: ['address'],
                  additionalProperties: false,
                },
              },
              modules: {
                type: 'object',
                properties: {
                  loadBalancerEnabled: {
                    type: 'boolean',
                    default: false,
                    errorMessage: "The 'loadBalancerEnabled' field must be a boolean.",
                  },
                  originShieldEnabled: {
                    type: 'boolean',
                    default: false,
                    errorMessage: "The 'originShieldEnabled' field must be a boolean.",
                  },
                },
                additionalProperties: false,
              },
              tls: {
                type: 'object',
                properties: {
                  policy: {
                    type: 'string',
                    enum: CONNECTOR_TLS_POLICIES,
                    default: 'off',
                    errorMessage: `The 'policy' field must be one of: ${CONNECTOR_TLS_POLICIES.join(', ')}.`,
                  },
                  certificate: {
                    type: 'number',
                    errorMessage: "The 'certificate' field must be a number.",
                  },
                  certificates: {
                    type: 'array',
                    items: {
                      type: 'number',
                      errorMessage: "Each item in the 'certificates' array must be a number.",
                    },
                  },
                  secret: {
                    type: 'string',
                    errorMessage: "The 'secret' field must be a string.",
                  },
                  sni: {
                    type: 'string',
                    errorMessage: "The 'sni' field must be a string.",
                  },
                },
                additionalProperties: false,
              },
              loadBalanceMethod: {
                type: 'string',
                enum: ['off', 'round_robin', 'ip_hash', 'least_connections'],
                default: 'off',
                errorMessage:
                  "The 'loadBalanceMethod' field must be 'off', 'round_robin', 'ip_hash', or 'least_connections'.",
              },
              connectionPreference: {
                type: 'array',
                items: {
                  type: 'string',
                  enum: ['IPv4', 'IPv6'],
                  errorMessage: "Each item in the 'connectionPreference' array must be 'IPv4' or 'IPv6'.",
                },
                default: ['IPv6', 'IPv4'],
              },
              connectionTimeout: {
                type: 'number',
                minimum: 1,
                maximum: 300,
                default: 60,
                errorMessage: "The 'connectionTimeout' field must be a number between 1 and 300.",
              },
              readWriteTimeout: {
                type: 'number',
                minimum: 1,
                maximum: 300,
                default: 120,
                errorMessage: "The 'readWriteTimeout' field must be a number between 1 and 300.",
              },
              maxRetries: {
                type: 'number',
                minimum: 0,
                maximum: 10,
                default: 0,
                errorMessage: "The 'maxRetries' field must be a number between 0 and 10.",
              },
              typeProperties: {
                type: 'object',
                properties: {
                  versions: {
                    type: 'array',
                    items: {
                      type: 'string',
                      enum: ['http1', 'http2'],
                      errorMessage: "Each item in the 'versions' array must be 'http1' or 'http2'.",
                    },
                    default: ['http1'],
                  },
                  host: {
                    type: 'string',
                    errorMessage: "The 'host' field must be a string.",
                  },
                  path: {
                    type: 'string',
                    errorMessage: "The 'path' field must be a string.",
                  },
                  followingRedirect: {
                    type: 'boolean',
                    default: true,
                    errorMessage: "The 'followingRedirect' field must be a boolean.",
                  },
                  realIpHeader: {
                    type: 'string',
                    errorMessage: "The 'realIpHeader' field must be a string.",
                  },
                  realPortHeader: {
                    type: 'string',
                    errorMessage: "The 'realPortHeader' field must be a string.",
                  },
                },
                additionalProperties: false,
              },
            },
            required: ['name', 'type'],
            additionalProperties: false,
            errorMessage: {
              additionalProperties: 'No additional properties are allowed in connector objects.',
              required: "The 'name' and 'type' fields are required in the connector object.",
            },
          },
        },
      },
      additionalProperties: false,
      errorMessage: {
        additionalProperties:
          'Config can only contain the following properties: build, workload, edgeApplication, edgeConnectors, edgeFunctions, edgeFirewall, networkList, purge, and waf.',
        type: 'Configuration must be an object',
      },
    },
  },
  $ref: '#/definitions/mainConfig',
};

export default azionConfigSchema;
