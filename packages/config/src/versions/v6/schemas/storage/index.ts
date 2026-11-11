import { WORKLOADS_ACCESS_TYPES } from '../../constants';

/**
 * Schema of the v6 storage, from `BucketCreateRequest` of the v6 API: the name has 6 to 63 lowercase letters, digits
 * and hyphens, and does not start nor end with a hyphen. A `$PLACEHOLDER` is also accepted, as the presets use them
 * and the Azion CLI replaces them.
 */
const storageSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 6,
        maxLength: 63,
        pattern: '^(\\$[A-Z][A-Z0-9_]*|[a-z0-9][a-z0-9-]*[a-z0-9])$',
        errorMessage:
          "The 'name' field must be a string between 6 and 63 characters, with lowercase letters, digits and hyphens, and must not start or end with a hyphen.",
      },
      dir: {
        type: 'string',
        errorMessage: "The 'dir' field must be a string.",
      },
      workloadsAccess: {
        type: 'string',
        enum: WORKLOADS_ACCESS_TYPES,
        errorMessage: "The 'workloadsAccess' field must be one of: read_only, read_write, restricted.",
      },
      prefix: {
        type: 'string',
        errorMessage: "The 'prefix' field must be a string.",
      },
    },
    required: ['name', 'dir'],
    additionalProperties: false,
    errorMessage: {
      additionalProperties: 'No additional properties are allowed in storage items.',
      required: "The 'name' and 'dir' fields are required.",
    },
  },
  errorMessage: "The 'storage' field must be an array of storage items.",
};

export default storageSchema;
