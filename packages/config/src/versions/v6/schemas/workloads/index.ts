import {
  WORKLOAD_HTTP_VERSIONS,
  WORKLOAD_INFRASTRUCTURE,
  WORKLOAD_MTLS_VERIFICATION,
  WORKLOAD_TLS_CIPHERS,
  WORKLOAD_TLS_VERSIONS,
} from '../../constants';

/**
 * Schema of the v6 workloads.
 * Based on v4, checked against `WorkloadRequest` of the v6 API: the domains and the certificate moved to the
 * `bindings`, `tls.ciphers` is not nullable and the ports and versions of the http protocol have limits.
 */
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
      infrastructure: {
        type: 'integer',
        enum: WORKLOAD_INFRASTRUCTURE,
        default: 1,
        errorMessage: "The 'infrastructure' must be either 1 or 2",
      },
      workloadDomainAllowAccess: {
        type: 'boolean',
        default: true,
        errorMessage: "The 'workloadDomainAllowAccess' field must be a boolean",
      },
      tls: {
        type: 'object',
        properties: {
          ciphers: {
            type: 'integer',
            enum: WORKLOAD_TLS_CIPHERS,
            errorMessage: "The 'ciphers' must be an integer between 1-8",
          },
          minimumVersion: {
            type: ['string', 'null'],
            enum: [...WORKLOAD_TLS_VERSIONS, null],
            default: 'tls_1_3',
            errorMessage: "The 'minimumVersion' must be a valid TLS version or null",
          },
        },
        additionalProperties: false,
        errorMessage: {
          additionalProperties:
            'No additional properties are allowed in tls. The certificate is set per domain in the bindings',
        },
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
                maxItems: 3,
                // the API requires http1 and http2
                allOf: [{ contains: { const: 'http1' } }, { contains: { const: 'http2' } }],
                default: ['http1', 'http2', 'http3'],
                errorMessage: {
                  allOf: "The 'versions' field must include http1 and http2",
                },
              },
              httpPorts: {
                type: 'array',
                items: { type: 'integer' },
                minItems: 1,
                maxItems: 4,
                default: [80],
              },
              httpsPorts: {
                type: 'array',
                items: { type: 'integer' },
                minItems: 1,
                maxItems: 12,
                default: [443],
              },
              quicPorts: {
                type: ['array', 'null'],
                items: { type: 'integer' },
                maxItems: 12,
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
      bindings: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            environment: {
              type: 'string',
              minLength: 1,
              errorMessage: "The 'environment' field must be the name of an environment declared in 'environments'",
            },
            deployment: {
              type: 'string',
              minLength: 1,
              errorMessage: "The 'deployment' field must be the name of a deployment declared in 'deployments'",
            },
            domains: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  domain: {
                    type: 'string',
                    minLength: 1,
                    maxLength: 250,
                    errorMessage: "The 'domain' field must be a string between 1 and 250 characters",
                  },
                  certificate: {
                    type: ['integer', 'null'],
                    minimum: 1,
                    errorMessage: "The 'certificate' must be an integer >= 1 or null",
                  },
                },
                required: ['domain'],
                additionalProperties: false,
                errorMessage: {
                  additionalProperties: 'No additional properties are allowed in binding domains',
                  required: { domain: "The 'domain' field is required in each binding domain" },
                },
              },
              errorMessage: "The 'domains' field must be an array of domain objects",
            },
          },
          required: ['environment', 'deployment'],
          additionalProperties: false,
          errorMessage: {
            additionalProperties: 'No additional properties are allowed in binding objects',
            required: "The 'environment' and 'deployment' fields are required in each binding",
          },
        },
        errorMessage: "The 'bindings' field must be an array of binding objects",
      },
    },
    required: ['name'],
    additionalProperties: false,
    errorMessage: {
      additionalProperties: 'No additional properties are allowed in workload items',
      required: { name: "The 'name' field is required in workloads" },
    },
  },
  errorMessage: "The 'workloads' field must be an array of workload items.",
};

export default workloadsSchema;
