/**
 * Schema of the v6 purge.
 * Based on v4, checked against `PurgeRequest` (`POST /workspace/purge/{purge_type}`): each item has at least 1 character
 * and `layer` is `cache`. The `uri` format of the items is not enforced here: a `cachekey` item is not a URI,
 * and the strategy already checks the protocol of a `url` and the asterisk of a `wildcard`.
 */
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
          minLength: 1,
          errorMessage: {
            type: "Each item in 'items' must be a string.",
            minLength: "Each item in 'items' must have at least 1 character.",
          },
        },
        errorMessage: {
          type: "The 'items' field must be an array of strings.",
          minItems: 'The purge items array cannot be empty. At least one item must be specified.',
        },
      },
      layer: {
        type: 'string',
        enum: ['cache'],
        errorMessage: "The 'layer' field must be 'cache'.",
      },
    },
    required: ['type', 'items'],
    additionalProperties: false,
    errorMessage: {
      additionalProperties: 'No additional properties are allowed in purge items.',
      required: "The 'type and items' fields are required in each purge item.",
    },
  },
  errorMessage: "The 'purge' field must be an array of purge items.",
};

export default purgeSchema;
