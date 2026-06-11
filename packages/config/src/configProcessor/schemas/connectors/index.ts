import {
  EDGE_CONNECTOR_DNS_RESOLUTION,
  EDGE_CONNECTOR_HMAC_TYPE,
  EDGE_CONNECTOR_HTTP_VERSION_POLICY,
  EDGE_CONNECTOR_LOAD_BALANCE_METHOD,
  EDGE_CONNECTOR_TRANSPORT_POLICY,
  EDGE_CONNECTOR_TYPES,
} from '../../../constants';

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
        enum: EDGE_CONNECTOR_TYPES,
        errorMessage: "The 'type' field must be one of: http, storage, live_ingest",
      },
      attributes: {
        oneOf: [
          {
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
                minLength: 0,
                maxLength: 255,
                pattern: '.*',
                errorMessage: "The 'prefix' field must be a string between 0 and 255 characters",
              },
            },
            required: ['bucket', 'prefix'],
            additionalProperties: false,
            errorMessage: 'Storage attributes must have bucket and prefix',
          },
          {
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
                      type: ['object', 'null'],
                      errorMessage: "The 'modules' field must be an object or null",
                    },
                  },
                  required: ['address'],
                  additionalProperties: false,
                },
                errorMessage: "The 'addresses' field must be an array of address objects",
              },
              connectionOptions: {
                type: 'object',
                properties: {
                  dnsResolution: {
                    type: 'string',
                    enum: EDGE_CONNECTOR_DNS_RESOLUTION,
                    default: 'both',
                    errorMessage: "The 'dnsResolution' must be one of: both, force_ipv4",
                  },
                  transportPolicy: {
                    type: 'string',
                    enum: EDGE_CONNECTOR_TRANSPORT_POLICY,
                    default: 'preserve',
                    errorMessage: "The 'transportPolicy' must be one of: preserve, force_https, force_http",
                  },
                  httpVersionPolicy: {
                    type: 'string',
                    enum: EDGE_CONNECTOR_HTTP_VERSION_POLICY,
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
                        type: ['object', 'null'],
                        properties: {
                          method: {
                            type: 'string',
                            enum: EDGE_CONNECTOR_LOAD_BALANCE_METHOD,
                            default: 'round_robin',
                            errorMessage: "The 'method' must be one of: round_robin, least_conn, ip_hash",
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
                        type: ['object', 'null'],
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
                                type: ['object', 'null'],
                                properties: {
                                  type: {
                                    type: 'string',
                                    enum: EDGE_CONNECTOR_HMAC_TYPE,
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
                                        errorMessage:
                                          "The 'region' field must be a string between 1 and 255 characters",
                                      },
                                      service: {
                                        type: 'string',
                                        minLength: 1,
                                        maxLength: 255,
                                        pattern: '.*',
                                        default: 's3',
                                        errorMessage:
                                          "The 'service' field must be a string between 1 and 255 characters",
                                      },
                                      accessKey: {
                                        type: 'string',
                                        minLength: 1,
                                        maxLength: 255,
                                        pattern: '.*',
                                        errorMessage:
                                          "The 'accessKey' field must be a string between 1 and 255 characters",
                                      },
                                      secretKey: {
                                        type: 'string',
                                        minLength: 1,
                                        maxLength: 255,
                                        pattern: '.*',
                                        errorMessage:
                                          "The 'secretKey' field must be a string between 1 and 255 characters",
                                      },
                                    },
                                    required: ['region', 'accessKey', 'secretKey'],
                                    additionalProperties: false,
                                  },
                                },
                                additionalProperties: false,
                              },
                            },
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
                required: ['loadBalancer', 'originShield'],
                additionalProperties: false,
              },
            },
            required: ['addresses', 'connectionOptions', 'modules'],
            additionalProperties: false,
            errorMessage: 'HTTP/Live Ingest attributes must have addresses, connectionOptions, and modules',
          },
        ],
        errorMessage:
          "The 'attributes' field must match either  storage format (bucket, prefix) or HTTP/Live Ingest format (addresses, connectionOptions, modules).",
      },
    },
    required: ['name', 'type', 'attributes'],
    additionalProperties: false,
  },
};

export default connectorsSchema;
