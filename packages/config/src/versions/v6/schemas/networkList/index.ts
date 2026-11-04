import { NETWORK_LIST_TYPES } from '../../constants';

/**
 * Schema of the v6 network lists, from `NetworkListRequest` of the v6 API: each item has 1 to 250 characters.
 * The items follow the formats the API documents for the types `asn` (digits only) and `countries` (two uppercase
 * alphanumeric characters, ISO 3166-1 alpha-2). The items of `ip_cidr` can be an IP with or without CIDR and with or
 * without an expiration date, so they are not checked.
 */
const networkListSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        maxLength: 250,
        pattern: '.*',
        errorMessage: "The 'name' field must be a string between 1 and 250 characters.",
      },
      type: {
        type: 'string',
        enum: NETWORK_LIST_TYPES,
        errorMessage: "The 'type' field must be a string. Accepted values are 'ip_cidr', 'asn' or 'countries'.",
      },
      items: {
        type: 'array',
        minItems: 1,
        maxItems: 20000,
        items: {
          type: 'string',
          minLength: 1,
          maxLength: 250,
          pattern: '.*',
          errorMessage: "Each item in 'items' must be a string between 1 and 250 characters.",
        },
        errorMessage: "The 'items' field must be an array of strings with 1-20000 items.",
      },
      active: {
        type: 'boolean',
        default: true,
        errorMessage: "The 'active' field must be a boolean.",
      },
    },
    required: ['name', 'type', 'items'],
    additionalProperties: false,
    allOf: [
      {
        if: { properties: { type: { const: 'asn' } }, required: ['type'] },
        then: {
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'string',
                pattern: '^[0-9]+$',
                errorMessage: 'Each ASN item must be a number composed of digits only.',
              },
            },
          },
        },
      },
      {
        if: { properties: { type: { const: 'countries' } }, required: ['type'] },
        then: {
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'string',
                pattern: '^[A-Z0-9]{2}$',
                errorMessage:
                  'Each country item must be a two-character uppercase alphanumeric code (ISO 3166-1 alpha-2).',
              },
            },
          },
        },
      },
    ],
    errorMessage: {
      additionalProperties: 'No additional properties are allowed in network list items.',
      required: "The 'name', 'type' and 'items' fields are required in each network list item.",
    },
  },
};

export default networkListSchema;
