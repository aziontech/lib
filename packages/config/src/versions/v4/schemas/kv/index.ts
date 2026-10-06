const kvSchema = {
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
    },
    required: ['name'],
    additionalProperties: false,
    errorMessage: {
      additionalProperties: 'No additional properties are allowed in kv items.',
      required: "The 'name' field is required.",
    },
  },
  errorMessage: "The 'kv' field must be an array of kv items.",
};

export default kvSchema;
