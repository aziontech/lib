// TODO: add `bindings` (storage) once the v6 config has storage
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
    },
    required: ['name', 'path'],
    additionalProperties: false,
  },
  errorMessage: "The 'functions' field must be an array of function objects with at least one item",
};

export default functionsSchema;
