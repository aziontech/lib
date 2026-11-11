import { FIREWALL_RULE_CONDITIONAL, FIREWALL_RULE_OPERATORS, FIREWALL_VARIABLES } from '../../constants';
import firewallBehaviorSchema from './behaviors';
import firewallFunctionsInstances from './functionsInstances';

/**
 * Schema of the v6 firewalls, based on v4 and checked against `FirewallRequest` and `FirewallRuleRequest` of the v6 API.
 */
const firewall = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        maxLength: 250,
        errorMessage: "The firewall configuration must have a 'name' field of type string (1-250 characters)",
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
              minLength: 1,
              maxLength: 100,
              errorMessage: "Each firewall rule must have a 'name' field of type string (1-100 characters)",
            },
            description: {
              type: 'string',
              maxLength: 1000,
              errorMessage: "The rule's 'description' field must be a string of at most 1000 characters",
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
              maxItems: 10,
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
                    type: ['string', 'number', 'null'],
                    errorMessage: 'The argument must be a string, a number or null',
                  },
                },
                required: ['conditional', 'variable', 'operator'],
                additionalProperties: false,
                // only `exists` and `does_not_exist` do not compare with a value
                if: { properties: { operator: { enum: ['exists', 'does_not_exist'] } }, required: ['operator'] },
                else: {
                  required: ['argument'],
                  properties: { argument: { type: ['string', 'number'] } },
                  errorMessage: {
                    required: "The 'argument' field is required unless the operator is 'exists' or 'does_not_exist'",
                    properties: { argument: 'The argument must be a string or a number for this operator' },
                  },
                },
                errorMessage: {
                  additionalProperties: 'No additional properties are allowed in the criteria object',
                  required: "The 'variable', 'operator' and 'conditional' fields are required in each criteria object",
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
