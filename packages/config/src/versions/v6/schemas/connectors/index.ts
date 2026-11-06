import {
  CONNECTOR_DNS_RESOLUTION,
  CONNECTOR_HMAC_TYPE,
  CONNECTOR_HTTP_VERSION_POLICY,
  CONNECTOR_LIVE_INGEST_REGIONS,
  CONNECTOR_LOAD_BALANCE_METHOD,
  CONNECTOR_SERVER_ROLES,
  CONNECTOR_TRANSPORT_POLICY,
  CONNECTOR_TYPES,
} from '../../constants';

const storageAttributesSchema = {
  type: 'object',
  properties: {
    bucket: {
      type: 'string',
      minLength: 1,
      maxLength: 255,
      pattern: '.*',
      errorMessage: "The 'bucket' field must be a string between 1 and 255 characters",
    },
    prefix: {
      type: 'string',
      minLength: 1,
      maxLength: 255,
      pattern: '.*',
      errorMessage: "The 'prefix' field must be a string between 1 and 255 characters",
    },
  },
  required: ['bucket'],
  additionalProperties: false,
  errorMessage: {
    additionalProperties: 'No additional properties are allowed in storage attributes',
    required: "The 'bucket' field is required in storage attributes",
  },
};

const liveIngestAttributesSchema = {
  type: 'object',
  properties: {
    region: {
      type: 'string',
      enum: CONNECTOR_LIVE_INGEST_REGIONS,
      errorMessage: `The 'region' field must be one of: ${CONNECTOR_LIVE_INGEST_REGIONS.join(', ')}`,
    },
  },
  required: ['region'],
  additionalProperties: false,
  errorMessage: {
    additionalProperties: 'No additional properties are allowed in live ingest attributes',
    required: "The 'region' field is required in live ingest attributes",
  },
};

const httpAttributesSchema = {
  type: 'object',
  properties: {
    addresses: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        properties: {
          active: {
            type: 'boolean',
            default: true,
            errorMessage: "The 'active' field must be a boolean",
          },
          address: {
            type: 'string',
            minLength: 1,
            maxLength: 255,
            pattern: '.*',
            errorMessage: "The 'address' field must be a string between 1 and 255 characters",
          },
          httpPort: {
            type: 'integer',
            minimum: 1,
            maximum: 65535,
            default: 80,
            errorMessage: "The 'httpPort' must be between 1 and 65535",
          },
          httpsPort: {
            type: 'integer',
            minimum: 1,
            maximum: 65535,
            default: 443,
            errorMessage: "The 'httpsPort' must be between 1 and 65535",
          },
          modules: {
            type: 'object',
            properties: {
              loadBalancer: {
                type: 'object',
                properties: {
                  serverRole: {
                    type: 'string',
                    enum: CONNECTOR_SERVER_ROLES,
                    errorMessage: `The 'serverRole' must be one of: ${CONNECTOR_SERVER_ROLES.join(', ')}`,
                  },
                  weight: {
                    type: 'integer',
                    minimum: 1,
                    maximum: 100,
                    default: 1,
                    errorMessage: "The 'weight' must be between 1 and 100",
                  },
                },
                additionalProperties: false,
              },
            },
            additionalProperties: false,
            errorMessage: "The 'modules' field of an address must be an object",
          },
        },
        required: ['address'],
        additionalProperties: false,
      },
      errorMessage: "The 'addresses' field must be an array of at least one address object",
    },
    connectionOptions: {
      type: 'object',
      properties: {
        dnsResolution: {
          type: 'string',
          enum: CONNECTOR_DNS_RESOLUTION,
          default: 'both',
          errorMessage: `The 'dnsResolution' must be one of: ${CONNECTOR_DNS_RESOLUTION.join(', ')}`,
        },
        transportPolicy: {
          type: 'string',
          enum: CONNECTOR_TRANSPORT_POLICY,
          default: 'preserve',
          errorMessage: `The 'transportPolicy' must be one of: ${CONNECTOR_TRANSPORT_POLICY.join(', ')}`,
        },
        httpVersionPolicy: {
          type: 'string',
          enum: CONNECTOR_HTTP_VERSION_POLICY,
          default: 'http1_1',
          errorMessage: "The 'httpVersionPolicy' must be http1_1",
        },
        host: {
          type: 'string',
          minLength: 1,
          maxLength: 255,
          pattern: '.*',
          default: '${host}',
          errorMessage: "The 'host' field must be a string between 1 and 255 characters",
        },
        pathPrefix: {
          type: 'string',
          minLength: 0,
          maxLength: 255,
          pattern: '.*',
          default: '',
          errorMessage: "The 'pathPrefix' field must be a string between 0 and 255 characters",
        },
        followingRedirect: {
          type: 'boolean',
          default: false,
          errorMessage: "The 'followingRedirect' field must be a boolean",
        },
        realIpHeader: {
          type: 'string',
          minLength: 1,
          maxLength: 100,
          pattern: '.*',
          default: 'X-Real-IP',
          errorMessage: "The 'realIpHeader' field must be a string between 1 and 100 characters",
        },
        realPortHeader: {
          type: 'string',
          minLength: 1,
          maxLength: 100,
          pattern: '.*',
          default: 'X-Real-PORT',
          errorMessage: "The 'realPortHeader' field must be a string between 1 and 100 characters",
        },
      },
      additionalProperties: false,
      errorMessage: "The 'connectionOptions' field must be an object with valid connection options",
    },
    modules: {
      type: 'object',
      properties: {
        loadBalancer: {
          type: 'object',
          properties: {
            enabled: {
              type: 'boolean',
              default: false,
              errorMessage: "The 'enabled' field must be a boolean",
            },
            config: {
              type: 'object',
              properties: {
                method: {
                  type: 'string',
                  enum: CONNECTOR_LOAD_BALANCE_METHOD,
                  default: 'round_robin',
                  errorMessage: `The 'method' must be one of: ${CONNECTOR_LOAD_BALANCE_METHOD.join(', ')}`,
                },
                maxRetries: {
                  type: 'integer',
                  minimum: 0,
                  maximum: 20,
                  default: 0,
                  errorMessage: "The 'maxRetries' must be between 0 and 20",
                },
                connectionTimeout: {
                  type: 'integer',
                  minimum: 1,
                  maximum: 300,
                  default: 60,
                  errorMessage: "The 'connectionTimeout' must be between 1 and 300",
                },
                readWriteTimeout: {
                  type: 'integer',
                  minimum: 1,
                  maximum: 600,
                  default: 120,
                  errorMessage: "The 'readWriteTimeout' must be between 1 and 600",
                },
              },
              additionalProperties: false,
            },
          },
          required: ['enabled'],
          additionalProperties: false,
        },
        originShield: {
          type: 'object',
          properties: {
            enabled: {
              type: 'boolean',
              default: false,
              errorMessage: "The 'enabled' field must be a boolean",
            },
            config: {
              type: 'object',
              properties: {
                originIpAcl: {
                  type: 'object',
                  properties: {
                    enabled: {
                      type: 'boolean',
                      default: false,
                      errorMessage: "The 'enabled' field must be a boolean",
                    },
                  },
                  additionalProperties: false,
                },
                hmac: {
                  type: 'object',
                  properties: {
                    enabled: {
                      type: 'boolean',
                      default: false,
                      errorMessage: "The 'enabled' field must be a boolean",
                    },
                    config: {
                      type: 'object',
                      properties: {
                        type: {
                          type: 'string',
                          enum: CONNECTOR_HMAC_TYPE,
                          errorMessage: "The 'type' must be one of: aws4_hmac_sha256",
                        },
                        attributes: {
                          type: 'object',
                          properties: {
                            region: {
                              type: 'string',
                              minLength: 1,
                              maxLength: 255,
                              pattern: '.*',
                              errorMessage: "The 'region' field must be a string between 1 and 255 characters",
                            },
                            service: {
                              type: 'string',
                              minLength: 1,
                              maxLength: 255,
                              pattern: '.*',
                              default: 's3',
                              errorMessage: "The 'service' field must be a string between 1 and 255 characters",
                            },
                            accessKey: {
                              type: 'string',
                              minLength: 1,
                              maxLength: 255,
                              pattern: '.*',
                              errorMessage: "The 'accessKey' field must be a string between 1 and 255 characters",
                            },
                            secretKey: {
                              type: 'string',
                              minLength: 1,
                              maxLength: 255,
                              pattern: '.*',
                              errorMessage: "The 'secretKey' field must be a string between 1 and 255 characters",
                            },
                          },
                          required: ['region', 'accessKey', 'secretKey'],
                          additionalProperties: false,
                        },
                      },
                      required: ['attributes'],
                      additionalProperties: false,
                    },
                  },
                  required: ['enabled'],
                  additionalProperties: false,
                },
              },
              additionalProperties: false,
            },
          },
          required: ['enabled'],
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },
  },
  required: ['addresses'],
  additionalProperties: false,
  errorMessage: {
    additionalProperties: 'No additional properties are allowed in HTTP attributes',
    required: "The 'addresses' field is required in HTTP attributes",
  },
};

/**
 * Schema of the v6 connectors, from `ConnectorHTTPRequest`, `ConnectorStorageRequest` and `ConnectorLiveIngestRequest`
 * of the v6 API. The attributes must match the type of the connector.
 * Based on v4, checked against the v6 API: the storage prefix is optional, the HTTP attributes only require the
 * addresses, an address can have load balancer modules, force_ipv6 is a DNS resolution, live ingest has a region
 * and the module configs are not nullable.
 */
const connectorsSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        maxLength: 255,
        pattern: '.*',
        errorMessage: "The 'name' field must be a string between 1 and 255 characters",
      },
      active: {
        type: 'boolean',
        default: true,
        errorMessage: "The 'active' field must be a boolean",
      },
      type: {
        type: 'string',
        enum: CONNECTOR_TYPES,
        errorMessage: `The 'type' field must be one of: ${CONNECTOR_TYPES.join(', ')}`,
      },
      attributes: {
        type: 'object',
        errorMessage: "The 'attributes' field must be an object",
      },
    },
    required: ['name', 'type', 'attributes'],
    additionalProperties: false,
    allOf: [
      {
        if: { properties: { type: { const: 'storage' } }, required: ['type'] },
        then: { properties: { attributes: storageAttributesSchema } },
      },
      {
        if: { properties: { type: { const: 'http' } }, required: ['type'] },
        then: { properties: { attributes: httpAttributesSchema } },
      },
      {
        if: { properties: { type: { const: 'live_ingest' } }, required: ['type'] },
        then: { properties: { attributes: liveIngestAttributesSchema } },
      },
    ],
    errorMessage: {
      additionalProperties: 'No additional properties are allowed in connector objects',
      required: "The 'name', 'type' and 'attributes' fields are required in each connector",
    },
  },
  errorMessage: "The 'connectors' field must be an array of connector objects",
};

export default connectorsSchema;
