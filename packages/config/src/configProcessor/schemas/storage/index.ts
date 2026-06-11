import { WORKLOADS_ACCESS_TYPES } from '../../../constants';

const storageSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 6,
        maxLength: 63,
        pattern: '^.{6,63}$',
        errorMessage: "The 'name' field must be a string between 6 and 63 characters.",
      },
      dir: {
        type: 'string',
        errorMessage: "The 'dir' field must be a string.",
      },
      workloadsAccess: {
        type: 'string',
        enum: WORKLOADS_ACCESS_TYPES,
        errorMessage: "The 'workloads_access' field must be one of: read_only, read_write, restricted.",
      },
      prefix: {
        type: 'string',
        errorMessage: "The 'prefix' field must be a string.",
      },
    },
    required: ['name', 'dir', 'prefix'],
    additionalProperties: false,
    errorMessage: {
      additionalProperties: 'No additional properties are allowed in storage items.',
      required: "The 'name', 'dir' and 'prefix' fields are required.",
    },
  },
  errorMessage: "The 'storage' field must be an array of storage items.",
};

export default storageSchema;
