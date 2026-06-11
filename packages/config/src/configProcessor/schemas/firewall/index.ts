import { FIREWALL_RULE_CONDITIONAL, FIREWALL_RULE_OPERATORS, FIREWALL_VARIABLES } from '../../../constants';
import firewallBehaviorSchema from './behaviors';
import firewallFunctionsInstances from './functionsInstances';

const firewall = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        errorMessage: "The firewall configuration must have a 'name' field of type string",
      },
      active: {
        type: 'boolean',
        errorMessage: "The firewall's 'active' field must be a boolean",
      },
      debugRules: {
        type: 'boolean',
        errorMessage: "The firewall's 'debugRules' field must be a boolean",
      },
      functions: {
        type: 'boolean',
        errorMessage: "The firewall's 'functions' field must be a boolean",
      },
      networkProtection: {
        type: 'boolean',
        errorMessage: "The firewall's 'networkProtection' field must be a boolean",
      },
      waf: {
        type: 'boolean',
        errorMessage: "The firewall's 'waf' field must be a boolean",
      },
      rules: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              errorMessage: "Each firewall rule must have a 'name' field of type string",
            },
            description: {
              type: 'string',
              errorMessage: "The rule's 'description' field must be a string",
            },
            active: {
              type: 'boolean',
              errorMessage: "The rule's 'active' field must be a boolean",
            },
            match: {
              type: 'string',
              errorMessage: "The rule's 'match' field must be a string containing a valid regex pattern",
            },
            variable: {
              anyOf: [
                {
                  type: 'string',
                  pattern: '^\\$\\{(' + [...new Set(FIREWALL_VARIABLES)].join('|') + ')\\}$',
                  errorMessage: "The 'variable' field must be a valid variable wrapped in ${}",
                },
                {
                  type: 'string',
                  enum: [...FIREWALL_VARIABLES],
                  errorMessage: "The 'variable' field must be a valid firewall variable",
                },
              ],
              errorMessage: "The 'variable' field must be a valid variable (with or without ${})",
            },
            behaviors: {
              type: 'array',
              items: firewallBehaviorSchema,
              minItems: 1,
              maxItems: 10,
              errorMessage: 'The behaviors must be an array with 1-10 items.',
            },
            criteria: {
              type: 'array',
              minItems: 1,
              maxItems: 5,
              items: {
                type: 'object',
                properties: {
                  conditional: {
                    type: 'string',
                    enum: FIREWALL_RULE_CONDITIONAL,
                    errorMessage: `The 'conditional' field must be one of: ${FIREWALL_RULE_CONDITIONAL.join(', ')}`,
                  },
                  variable: {
                    anyOf: [
                      {
                        type: 'string',
                        pattern: '^\\$\\{(' + [...new Set(FIREWALL_VARIABLES)].join('|') + ')\\}$',
                        errorMessage: "The 'variable' field must be a valid variable wrapped in ${}",
                      },
                      {
                        type: 'string',
                        enum: [...FIREWALL_VARIABLES],
                        errorMessage: "The 'variable' field must be a valid firewall variable",
                      },
                    ],
                    errorMessage: "The 'variable' field must be a valid variable (with or without ${})",
                  },
                  operator: {
                    type: 'string',
                    enum: FIREWALL_RULE_OPERATORS,
                    errorMessage: `The 'operator' field must be one of: ${FIREWALL_RULE_OPERATORS.join(', ')}`,
                  },
                  argument: {
                    type: ['string', 'number'],
                    errorMessage: 'The argument must be a string or number',
                  },
                },
                required: ['conditional', 'variable', 'operator', 'argument'],
                additionalProperties: false,
                errorMessage: {
                  additionalProperties: 'No additional properties are allowed in the criteria object',
                  required:
                    "The 'variable', 'operator', 'argument' and 'conditional' fields are required in each criteria object",
                },
              },
              errorMessage: {
                type: 'The criteria field must be an array with at least one criteria item',
              },
            },
          },
          required: ['name', 'behaviors'],
          oneOf: [
            {
              required: ['match', 'variable'],
              not: { required: ['criteria'] },
              errorMessage:
                "When using 'match' or 'variable', both fields are required and cannot be used with 'criteria'.",
            },
            {
              required: ['criteria'],
              not: {
                anyOf: [{ required: ['match'] }, { required: ['variable'] }],
              },
              errorMessage: "Cannot use 'criteria' together with 'match' or 'variable'.",
            },
          ],
          errorMessage: {
            oneOf: "You must use either 'match' AND 'variable' together OR 'criteria', but not both at the same time",
          },
        },
      },
      functionsInstances: {
        type: 'array',
        items: firewallFunctionsInstances,
      },
    },
    required: ['name'],
    additionalProperties: false,
    errorMessage: {
      type: 'Each firewall item must be an object',
      additionalProperties: 'No additional properties are allowed in the firewall object',
      required: "The 'name' field is required in each  firewall object",
    },
  },
  errorMessage: {
    type: "The 'firewall' field must be an array of  firewall objects",
  },
};

export default firewall;
