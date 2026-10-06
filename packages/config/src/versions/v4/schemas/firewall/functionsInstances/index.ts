const firewallFunctionsInstances = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 100,
      errorMessage: 'The name must be a string between 1 and 100 characters long',
    },
    args: {
      type: 'object',
      default: {},
      errorMessage: "The 'args' field must be an object",
    },
    ref: {
      type: ['string', 'number'],
      errorMessage: "The 'ref' field must be a string or number referencing an existing Function name or ID",
    },
  },
  required: ['name', 'ref'],
  additionalProperties: false,
  errorMessage: {
    additionalProperties: 'No additional properties are allowed in the firewallFunctionsInstance object',
  },
};

export default firewallFunctionsInstances;
