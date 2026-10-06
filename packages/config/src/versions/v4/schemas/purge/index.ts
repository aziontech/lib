const purgeSchema = {
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
        minItems: 1,
        items: {
          type: 'string',
          errorMessage: "Each item in 'items' must be a string.",
        },
        errorMessage: {
          type: "The 'items' field must be an array of strings.",
          minItems: 'The purge items array cannot be empty. At least one item must be specified.',
        },
      },
      layer: {
        type: 'string',
        enum: ['cache', 'tiered_cache'],
        errorMessage: "The 'layer' field must be either 'cache' or 'tiered_cache'.",
      },
    },
    required: ['type', 'items'],
    additionalProperties: false,
    errorMessage: {
      additionalProperties: 'No additional properties are allowed in purge items.',
      required: "The 'type and items' fields are required in each purge item.",
    },
  },
};

export default purgeSchema;
