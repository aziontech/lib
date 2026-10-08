const functionsSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        maxLength: 250,
        pattern: '.*',
        errorMessage: "The 'name' field must be a string between 1 and 250 characters",
      },
      path: {
        type: 'string',
        errorMessage: "The 'path' field must be a string",
      },
      runtime: {
        type: 'string',
        enum: ['azion_js'],
        default: 'azion_js',
        errorMessage: "The 'runtime' field must be 'azion_js'",
      },
      defaultArgs: {
        type: 'object',
        default: {},
        errorMessage: "The 'defaultArgs' field must be an object",
      },
      executionEnvironment: {
        type: 'string',
        enum: ['application', 'firewall'],
        default: 'application',
        errorMessage: "The 'executionEnvironment' field must be 'application' or 'firewall'",
      },
      active: {
        type: 'boolean',
        default: true,
        errorMessage: "The 'active' field must be a boolean",
      },
      bindings: {
        type: 'object',
        properties: {
          storage: {
            type: 'object',
            properties: {
              bucket: {
                type: ['string', 'number'],
                errorMessage: "The 'bucket' field must be a string or number",
              },
              prefix: {
                type: 'string',
                errorMessage: "The 'prefix' field must be a string",
              },
            },
            required: ['bucket', 'prefix'],
            additionalProperties: false,
            errorMessage: {
              type: "The 'storage' field must be an object",
              additionalProperties: 'No additional properties are allowed in the storage object binding.',
              required: "The 'bucket' and 'prefix' fields are required in the storage object binding.",
            },
          },
        },
        additionalProperties: false,
        errorMessage: {
          type: "The 'bindings' field must be an object",
          additionalProperties: 'No additional properties are allowed in the bindings object',
        },
      },
    },
    required: ['name', 'path'],
    additionalProperties: false,
  },
  errorMessage: "The 'functions' field must be an array of function objects with at least one item",
};

export default functionsSchema;
