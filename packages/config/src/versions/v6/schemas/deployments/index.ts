import { DEPLOYMENT_BINDING_POLICIES, DEPLOYMENT_POLICIES } from '../../constants';

/**
 * Schema of the v6 deployments, from `DeploymentRequest` of the v6 API.
 */
const deploymentsSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 3,
        maxLength: 255,
        errorMessage: "The 'name' field must be a string between 3 and 255 characters",
      },
      description: {
        type: ['string', 'null'],
        errorMessage: "The 'description' field must be a string or null",
      },
      bindingPolicy: {
        type: 'string',
        enum: DEPLOYMENT_BINDING_POLICIES,
        errorMessage: `The 'bindingPolicy' field must be one of: ${DEPLOYMENT_BINDING_POLICIES.join(', ')}`,
      },
      deploymentPolicy: {
        type: 'string',
        enum: DEPLOYMENT_POLICIES,
        errorMessage: `The 'deploymentPolicy' field must be one of: ${DEPLOYMENT_POLICIES.join(', ')}`,
      },
      strategyDefaults: {
        type: 'object',
        properties: {
          skewProtection: {
            type: 'object',
            properties: {
              enabled: { type: 'boolean' },
              defaultTtlSeconds: { type: 'integer', minimum: 1, maximum: 2147483647 },
            },
            required: ['enabled', 'defaultTtlSeconds'],
            additionalProperties: false,
            errorMessage: {
              additionalProperties: 'No additional properties are allowed in skewProtection',
              required: "The 'enabled' and 'defaultTtlSeconds' fields are required in skewProtection",
            },
          },
        },
        additionalProperties: false,
        errorMessage: {
          additionalProperties: 'No additional properties are allowed in strategyDefaults',
        },
      },
    },
    required: ['name'],
    additionalProperties: false,
    errorMessage: {
      additionalProperties: 'No additional properties are allowed in deployment objects',
      required: { name: "The 'name' field is required in each deployment" },
    },
  },
  errorMessage: "The 'deployments' field must be an array of deployment objects",
};

export default deploymentsSchema;
