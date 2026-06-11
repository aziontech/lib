import { NETWORK_LIST_TYPES } from '../../../constants';

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
          pattern: '.*',
          errorMessage: "Each item in 'items' must be a string.",
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
    errorMessage: {
      additionalProperties: 'No additional properties are allowed in network list items.',
      required: "The 'name', 'type' and 'items' fields are required in each network list item.",
    },
  },
};

export default networkListSchema;
