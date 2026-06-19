import { WORKLOAD_HTTP_VERSIONS, WORKLOAD_MTLS_VERIFICATION, WORKLOAD_TLS_VERSIONS } from '../../../constants';

const workloadsSchema = {
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
      active: {
        type: 'boolean',
        default: true,
        errorMessage: "The 'active' field must be a boolean",
      },
      infrastructure: {
        type: 'integer',
        enum: [1, 2],
        default: 1,
        errorMessage: "The 'infrastructure' must be either 1 or 2",
      },
      workloadDomainAllowAccess: {
        type: 'boolean',
        default: true,
        errorMessage: "The 'workloadDomainAllowAccess' field must be a boolean",
      },
      domains: {
        type: 'array',
        items: {
          type: 'string',
          minLength: 1,
          maxLength: 250,
          errorMessage: 'Each domain must be a string between 1 and 250 characters',
        },
        errorMessage: "The 'domains' field must be an array of domain strings",
      },
      tls: {
        type: 'object',
        properties: {
          certificate: {
            type: ['integer', 'null'],
            minimum: 1,
            errorMessage: "The 'certificate' must be an integer >= 1 or null",
          },
          ciphers: {
            type: ['integer', 'null'],
            enum: [1, 2, 3, 4, 5, 6, 7, 8, null],
            errorMessage: "The 'ciphers' must be an integer between 1-8 or null",
          },
          minimumVersion: {
            type: ['string', 'null'],
            enum: [...WORKLOAD_TLS_VERSIONS, null],
            default: 'tls_1_3',
            errorMessage: "The 'minimumVersion' must be a valid TLS version or null",
          },
        },
        default: { certificate: null, ciphers: null, minimumVersion: 'tls_1_3' },
        additionalProperties: false,
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
                default: ['http1', 'http2', 'http3'],
              },
              httpPorts: {
                type: 'array',
                items: { type: 'integer' },
                default: [80],
              },
              httpsPorts: {
                type: 'array',
                items: { type: 'integer' },
                default: [443],
              },
              quicPorts: {
                type: ['array', 'null'],
                items: { type: 'integer' },
              },
            },
            required: ['versions', 'httpPorts', 'httpsPorts'],
            additionalProperties: false,
          },
        },
        default: {
          http: {
            versions: ['http1', 'http2', 'http3'],
            httpPorts: [80],
            httpsPorts: [443],
            quicPorts: [443],
          },
        },
        additionalProperties: false,
      },
      mtls: {
        type: 'object',
        properties: {
          enabled: {
            type: 'boolean',
            default: false,
          },
          config: {
            type: 'object',
            properties: {
              verification: {
                type: 'string',
                enum: WORKLOAD_MTLS_VERIFICATION,
                default: 'enforce',
              },
              certificate: {
                type: ['integer', 'null'],
                minimum: 1,
              },
              crl: {
                type: ['array', 'null'],
                items: { type: 'integer' },
                maxItems: 100,
              },
            },
            additionalProperties: false,
          },
        },
        additionalProperties: false,
      },
      deployments: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              minLength: 1,
              maxLength: 254,
              pattern: '.*',
              errorMessage: "The 'name' field must be a string between 1 and 254 characters",
            },
            current: {
              type: 'boolean',
              default: true,
              errorMessage: "The 'current' field must be a boolean",
            },
            active: {
              type: 'boolean',
              default: true,
              errorMessage: "The 'active' field must be a boolean",
            },
            strategy: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  minLength: 1,
                  maxLength: 255,
                  pattern: '.*',
                  errorMessage: "The 'type' field must be a string between 1 and 255 characters",
                },
                attributes: {
                  type: 'object',
                  properties: {
                    application: {
                      type: ['string', 'number'],
                      errorMessage:
                        "The 'application' field must be a string or number referencing an existing Application name or ID",
                    },
                    firewall: {
                      type: ['string', 'number', 'null'],
                      errorMessage:
                        "The 'firewall' field must be a string or number referencing an existing Firewall name/ID or null",
                    },
                    customPage: {
                      type: ['string', 'number', 'null'],
                      minimum: 1,
                      errorMessage:
                        "The 'customPage' field must be a string or number referencing a custom page name/ID or null",
                    },
                  },
                  required: ['application'],
                  additionalProperties: false,
                  errorMessage: {
                    additionalProperties: 'No additional properties are allowed in strategy attributes',
                    required: "The 'application' field is required in strategy attributes",
                  },
                },
              },
              required: ['type', 'attributes'],
              additionalProperties: false,
              errorMessage: {
                additionalProperties: 'No additional properties are allowed in strategy',
                required: "The 'type' and 'attributes' fields are required in strategy",
              },
            },
          },
          required: ['name', 'strategy'],
          additionalProperties: false,
          errorMessage: {
            additionalProperties: 'No additional properties are allowed in deployment objects',
            required: "The 'name' and 'strategy' fields are required in each deployment",
          },
        },
        minItems: 1,
        errorMessage: "The 'deployments' field must be an array of deployment objects with at least one item.",
      },
    },
    required: ['name', 'deployments'],
    additionalProperties: false,
    errorMessage: {
      additionalProperties: 'No additional properties are allowed in workload items',
      required: {
        name: "The 'name' field is required in workloads",
        deployments: "The 'deployments' field is required in workloads",
      },
    },
  },
  minItems: 1,
  errorMessage: "The 'workloads' field must be an array of workloads items with at least one item.",
};

export default workloadsSchema;
