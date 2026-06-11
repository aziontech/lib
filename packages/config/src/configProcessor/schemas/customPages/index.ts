import { CUSTOM_PAGE_ERROR_CODES, CUSTOM_PAGE_TYPES } from '../../../constants';

const customPagesSchema = {
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
      pages: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'object',
          properties: {
            code: {
              type: 'string',
              enum: CUSTOM_PAGE_ERROR_CODES,
              errorMessage: "The 'code' field must be a valid error code",
            },
            page: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: CUSTOM_PAGE_TYPES,
                  default: 'page_connector',
                  errorMessage: "The 'type' field must be a valid page type",
                },
                attributes: {
                  type: 'object',
                  properties: {
                    connector: {
                      type: ['string', 'number'],
                      errorMessage:
                        "The 'connector' field must be a string or number referencing a connector name or ID",
                    },
                    ttl: {
                      type: 'integer',
                      minimum: 0,
                      maximum: 31536000,
                      default: 0,
                      errorMessage: "The 'ttl' field must be an integer between 0 and 31536000",
                    },
                    uri: {
                      type: ['string', 'null'],
                      minLength: 1,
                      maxLength: 250,
                      pattern: '^/[/a-zA-Z0-9\\-_.~@:]*$',
                      errorMessage: "The 'uri' field must be a valid URI path starting with / or null",
                    },
                    customStatusCode: {
                      type: ['integer', 'null'],
                      minimum: 100,
                      maximum: 599,
                      errorMessage: "The 'customStatusCode' field must be an integer between 100 and 599 or null",
                    },
                  },
                  required: ['connector'],
                  additionalProperties: false,
                  errorMessage: {
                    additionalProperties: 'No additional properties are allowed in page attributes',
                    required: "The 'connector' field is required in page attributes",
                  },
                },
              },
              required: ['attributes'],
              additionalProperties: false,
              errorMessage: {
                additionalProperties: 'No additional properties are allowed in page configuration',
                required: "The 'attributes' field is required in page configuration",
              },
            },
          },
          required: ['code', 'page'],
          additionalProperties: false,
          errorMessage: {
            additionalProperties: 'No additional properties are allowed in page entry',
            required: "The 'code' and 'page' fields are required in each page entry",
          },
        },
        errorMessage: "The 'pages' field must be an array of page configurations with at least one item",
      },
    },
    required: ['name', 'pages'],
    additionalProperties: false,
    errorMessage: {
      additionalProperties: 'No additional properties are allowed in custom page objects',
      required: "The 'name' and 'pages' fields are required in each custom page",
    },
  },
  errorMessage: "The 'customPages' field must be an array of custom page objects",
};

export default customPagesSchema;
