import {
  DEPLOYMENT_POLICIES,
  ENVIRONMENT_BRANCH_TRACKING_MODES,
  ENVIRONMENT_LOG_VERBOSITY,
  ENVIRONMENT_ROBOTS_POLICIES,
} from '../../constants';

/**
 * Schema of the v6 environments, from `EnvironmentCreateRequest` and `EnvironmentRequest` of the v6 API.
 * `deploymentPolicy` is required, as in the creation of an environment, and the API does not accept changing it later.
 */
const environmentsSchema = {
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
      logVerbosity: {
        type: 'string',
        enum: ENVIRONMENT_LOG_VERBOSITY,
        errorMessage: `The 'logVerbosity' field must be one of: ${ENVIRONMENT_LOG_VERBOSITY.join(', ')}`,
      },
      robotsPolicy: {
        type: 'string',
        enum: ENVIRONMENT_ROBOTS_POLICIES,
        errorMessage: `The 'robotsPolicy' field must be one of: ${ENVIRONMENT_ROBOTS_POLICIES.join(', ')}`,
      },
      protection: {
        type: 'object',
        properties: {
          azionAuthentication: {
            type: 'object',
            properties: { enabled: { type: 'boolean' } },
            required: ['enabled'],
            additionalProperties: false,
          },
          passwordProtection: {
            type: 'object',
            properties: {
              enabled: { type: 'boolean' },
              secretId: { type: ['string', 'null'], minLength: 1 },
            },
            required: ['enabled', 'secretId'],
            additionalProperties: false,
          },
          ipAllowlist: {
            type: 'object',
            properties: {
              enabled: { type: 'boolean' },
              cidrs: { type: 'array', items: { type: 'string', minLength: 2, maxLength: 49 } },
            },
            required: ['enabled', 'cidrs'],
            additionalProperties: false,
          },
          ssoEnforcement: {
            type: 'object',
            properties: {
              enabled: { type: 'boolean' },
              idpId: { type: ['string', 'null'], minLength: 1 },
              allowedDomains: { type: 'array', items: { type: 'string', minLength: 1 } },
            },
            required: ['enabled', 'idpId', 'allowedDomains'],
            additionalProperties: false,
          },
        },
        additionalProperties: false,
        errorMessage: {
          additionalProperties: 'No additional properties are allowed in the environment protection',
        },
      },
      branchTracking: {
        type: ['object', 'null'],
        properties: {
          enabled: { type: 'boolean' },
          mode: {
            type: 'string',
            enum: ENVIRONMENT_BRANCH_TRACKING_MODES,
            errorMessage: `The 'mode' field must be one of: ${ENVIRONMENT_BRANCH_TRACKING_MODES.join(', ')}`,
          },
          branchMatch: { type: 'string', minLength: 1, maxLength: 255 },
        },
        required: ['enabled', 'mode', 'branchMatch'],
        additionalProperties: false,
        errorMessage: {
          additionalProperties: 'No additional properties are allowed in branchTracking',
          required: "The 'enabled', 'mode' and 'branchMatch' fields are required in branchTracking",
        },
      },
      deploymentPolicy: {
        type: 'string',
        enum: DEPLOYMENT_POLICIES,
        errorMessage: `The 'deploymentPolicy' field must be one of: ${DEPLOYMENT_POLICIES.join(', ')}`,
      },
    },
    required: ['name', 'deploymentPolicy'],
    additionalProperties: false,
    errorMessage: {
      additionalProperties: 'No additional properties are allowed in environment objects',
      required: {
        name: "The 'name' field is required in each environment",
        deploymentPolicy: "The 'deploymentPolicy' field is required in each environment",
      },
    },
  },
  errorMessage: "The 'environments' field must be an array of environment objects",
};

export default environmentsSchema;
