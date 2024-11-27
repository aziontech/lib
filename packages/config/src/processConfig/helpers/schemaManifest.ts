const schemaNetworkListManifest = {
  type: 'object',
  properties: {
    id: {
      type: 'number',
      errorMessage: "The 'id' field must be a number.",
    },
    list_type: {
      type: 'string',
      enum: ['ip_cidr', 'asn', 'countries'],
      errorMessage: "The 'list_type' field must be a string. Accepted values are 'ip_cidr', 'asn' or 'countries'.",
    },
    items_values: {
      type: 'array',
      items: {
        type: ['string', 'number'],
        errorMessage: "The 'items_values' field must be an array of strings or numbers.",
      },
    },
  },
  required: ['id', 'list_type', 'items_values'],
  additionalProperties: false,
  errorMessage: {
    additionalProperties: 'No additional properties are allowed in network list items.',
    required: "The 'id, list_type and items_values' fields are required in each network list item.",
  },
};

const schemaManifest = {
  type: 'object',
  properties: {
    networkList: {
      type: 'array',
      items: schemaNetworkListManifest,
      errorMessage: "The 'networkList' field must be an array of network list items.",
    },
  },
};

export { schemaManifest };
