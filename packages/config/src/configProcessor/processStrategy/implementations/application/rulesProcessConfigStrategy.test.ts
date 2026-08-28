import { AzionConnector, AzionFunction, AzionManifestRule, AzionRules } from '../../../../types';
import RulesProcessConfigStrategy from './rulesProcessConfigStrategy';

describe('RulesProcessConfigStrategy', () => {
  let strategy: RulesProcessConfigStrategy;

  beforeEach(() => {
    strategy = new RulesProcessConfigStrategy();
  });

  describe('transformToManifest', () => {
    it('should return empty array when no rules are provided', () => {
      const applicationRules: AzionRules = {};
      const result = strategy.transformToManifest(applicationRules);
      expect(result).toEqual([]);
    });

    it('should return empty array when rules object has empty request and response arrays', () => {
      const applicationRules: AzionRules = { request: [], response: [] };
      const result = strategy.transformToManifest(applicationRules);
      expect(result).toEqual([]);
    });

    it('should transform request rules to manifest format', () => {
      const applicationRules: AzionRules = {
        request: [
          {
            name: 'test-request-rule',
            description: 'Test request rule',
            active: true,
            criteria: [
              [
                {
                  variable: 'request_uri',
                  conditional: 'if',
                  operator: 'is_equal',
                  argument: '/test',
                },
              ],
            ],
            behaviors: [{ type: 'deliver' }],
          },
        ],
      };

      const result = strategy.transformToManifest(applicationRules);

      expect(result).toEqual([
        {
          phase: 'request',
          rule: {
            name: 'test-request-rule',
            description: 'Test request rule',
            active: true,
            criteria: [
              [
                {
                  variable: '${request_uri}',
                  conditional: 'if',
                  operator: 'is_equal',
                  argument: '/test',
                },
              ],
            ],
            behaviors: [{ type: 'deliver' }],
          },
        },
      ]);
    });

    it('should transform response rules to manifest format', () => {
      const applicationRules: AzionRules = {
        response: [
          {
            name: 'test-response-rule',
            criteria: [
              [
                {
                  variable: '${host}',
                  conditional: 'if',
                  operator: 'is_equal',
                  argument: '404',
                },
              ],
            ],
            behaviors: [{ type: 'deliver' }],
          },
        ],
      };

      const result = strategy.transformToManifest(applicationRules);

      expect(result).toHaveLength(1);
      expect(result[0].phase).toBe('response');
      expect(result[0].rule.name).toBe('test-response-rule');
    });

    it('should default active to true when not provided', () => {
      const applicationRules: AzionRules = {
        request: [
          {
            name: 'no-active-rule',
            criteria: [[{ variable: 'request_uri', conditional: 'if', operator: 'exists' }]],
            behaviors: [{ type: 'deliver' }],
          },
        ],
      };

      const result = strategy.transformToManifest(applicationRules);

      expect(result[0].rule.active).toBe(true);
    });

    it('should not add ${} wrapping when variable is already wrapped', () => {
      const applicationRules: AzionRules = {
        request: [
          {
            name: 'wrapped-variable-rule',
            criteria: [[{ variable: '${request_uri}', conditional: 'if', operator: 'exists' }]],
            behaviors: [{ type: 'deliver' }],
          },
        ],
      };

      const result = strategy.transformToManifest(applicationRules);

      expect(result[0].rule.criteria[0][0].variable).toBe('${request_uri}');
    });

    it('should not include argument for criteria operators that do not require a value', () => {
      const applicationRules: AzionRules = {
        request: [
          {
            name: 'exists-rule',
            criteria: [[{ variable: 'request_uri', conditional: 'if', operator: 'exists' }]],
            behaviors: [{ type: 'deliver' }],
          },
        ],
      };

      const result = strategy.transformToManifest(applicationRules);

      expect(result[0].rule.criteria[0][0]).toEqual({
        variable: '${request_uri}',
        conditional: 'if',
        operator: 'exists',
      });
      expect(result[0].rule.criteria[0][0]).not.toHaveProperty('argument');
    });

    it('should include attributes for behaviors that require them', () => {
      const functions: AzionFunction[] = [{ name: 'my-function', path: './functions/my-function.js' }];
      const applicationRules: AzionRules = {
        request: [
          {
            name: 'run-function-rule',
            criteria: [[{ variable: 'request_uri', conditional: 'if', operator: 'exists' }]],
            behaviors: [{ type: 'run_function', attributes: { value: 'my-function' } }],
          },
        ],
      };

      const result = strategy.transformToManifest(applicationRules, functions);

      expect(result[0].rule.behaviors).toEqual([{ type: 'run_function', attributes: { value: 'my-function' } }]);
    });

    it('should not include attributes key for behaviors without attributes', () => {
      const applicationRules: AzionRules = {
        request: [
          {
            name: 'deliver-rule',
            criteria: [[{ variable: 'request_uri', conditional: 'if', operator: 'exists' }]],
            behaviors: [{ type: 'deliver' }],
          },
        ],
      };

      const result = strategy.transformToManifest(applicationRules);

      expect(result[0].rule.behaviors[0]).toEqual({ type: 'deliver' });
      expect(result[0].rule.behaviors[0]).not.toHaveProperty('attributes');
    });

    it('should transform both request and response rules together', () => {
      const applicationRules: AzionRules = {
        request: [
          {
            name: 'request-rule',
            criteria: [[{ variable: 'request_uri', conditional: 'if', operator: 'exists' }]],
            behaviors: [{ type: 'deliver' }],
          },
        ],
        response: [
          {
            name: 'response-rule',
            criteria: [[{ variable: '${domain}', conditional: 'if', operator: 'exists' }]],
            behaviors: [{ type: 'deliver' }],
          },
        ],
      };

      const result = strategy.transformToManifest(applicationRules);

      expect(result).toHaveLength(2);
      expect(result[0].phase).toBe('request');
      expect(result[1].phase).toBe('response');
    });

    it('should throw an error when a request rule references a non-existent function', () => {
      const functions: AzionFunction[] = [{ name: 'existing-function', path: './functions/existing-function.js' }];
      const applicationRules: AzionRules = {
        request: [
          {
            name: 'invalid-function-rule',
            criteria: [[{ variable: 'request_uri', conditional: 'if', operator: 'exists' }]],
            behaviors: [{ type: 'run_function', attributes: { value: 'non-existent-function' } }],
          },
        ],
      };

      expect(() => strategy.transformToManifest(applicationRules, functions)).toThrow(
        'Function "non-existent-function" referenced in rule "invalid-function-rule" is not defined in the functions array.',
      );
    });

    it('should throw an error when a response rule references a non-existent function', () => {
      const functions: AzionFunction[] = [{ name: 'existing-function', path: './functions/existing-function.js' }];
      const applicationRules: AzionRules = {
        response: [
          {
            name: 'invalid-function-response-rule',
            criteria: [[{ variable: '${domain}', conditional: 'if', operator: 'exists' }]],
            behaviors: [{ type: 'run_function', attributes: { value: 'non-existent-function' } }],
          },
        ],
      };

      expect(() => strategy.transformToManifest(applicationRules, functions)).toThrow(
        'Function "non-existent-function" referenced in rule "invalid-function-response-rule" is not defined in the functions array.',
      );
    });

    it('should not validate function reference when value is a number (ID)', () => {
      const applicationRules: AzionRules = {
        request: [
          {
            name: 'function-by-id-rule',
            criteria: [[{ variable: 'request_uri', conditional: 'if', operator: 'exists' }]],
            behaviors: [{ type: 'run_function', attributes: { value: 123 } }],
          },
        ],
      };

      expect(() => strategy.transformToManifest(applicationRules, [])).not.toThrow();
    });

    it('should throw an error when a rule references a non-existent connector', () => {
      const connectors: AzionConnector[] = [
        {
          name: 'existing-connector',
          type: 'storage',
          attributes: { bucket: 'my-bucket' },
        } as AzionConnector,
      ];
      const applicationRules: AzionRules = {
        request: [
          {
            name: 'invalid-connector-rule',
            criteria: [[{ variable: 'request_uri', conditional: 'if', operator: 'exists' }]],
            behaviors: [{ type: 'set_connector', attributes: { value: 'non-existent-connector' } }],
          },
        ],
      };

      expect(() => strategy.transformToManifest(applicationRules, undefined, connectors)).toThrow(
        'Connector "non-existent-connector" referenced in rule "invalid-connector-rule" is not defined in the connectors array.',
      );
    });

    it('should not throw when a rule references an existing connector', () => {
      const connectors: AzionConnector[] = [
        {
          name: 'existing-connector',
          type: 'storage',
          attributes: { bucket: 'my-bucket' },
        } as AzionConnector,
      ];
      const applicationRules: AzionRules = {
        request: [
          {
            name: 'valid-connector-rule',
            criteria: [[{ variable: 'request_uri', conditional: 'if', operator: 'exists' }]],
            behaviors: [{ type: 'set_connector', attributes: { value: 'existing-connector' } }],
          },
        ],
      };

      expect(() => strategy.transformToManifest(applicationRules, undefined, connectors)).not.toThrow();
    });

    it('should not validate connector reference when value is a number (ID)', () => {
      const applicationRules: AzionRules = {
        request: [
          {
            name: 'connector-by-id-rule',
            criteria: [[{ variable: 'request_uri', conditional: 'if', operator: 'exists' }]],
            behaviors: [{ type: 'set_connector', attributes: { value: 456 } }],
          },
        ],
      };

      expect(() => strategy.transformToManifest(applicationRules, undefined, [])).not.toThrow();
    });
  });

  describe('transformToConfig', () => {
    it('should return empty request and response arrays when no payload is provided', () => {
      const result = strategy.transformToConfig(undefined as unknown as AzionManifestRule[]);
      expect(result).toEqual({ request: [], response: [] });
    });

    it('should return empty request and response arrays when payload is empty', () => {
      const result = strategy.transformToConfig([]);
      expect(result).toEqual({ request: [], response: [] });
    });

    it('should transform a request manifest rule to config format', () => {
      const payload: AzionManifestRule[] = [
        {
          phase: 'request',
          rule: {
            name: 'test-request-rule',
            description: 'Test request rule',
            active: true,
            criteria: [
              [
                {
                  variable: '${request_uri}',
                  conditional: 'if',
                  operator: 'is_equal',
                  argument: '/test',
                },
              ],
            ],
            behaviors: [{ type: 'deliver' }],
          },
        },
      ];

      const result = strategy.transformToConfig(payload);

      expect(result.request).toEqual([
        {
          name: 'test-request-rule',
          description: 'Test request rule',
          active: true,
          criteria: [
            [
              {
                variable: '${request_uri}',
                conditional: 'if',
                operator: 'is_equal',
                argument: '/test',
              },
            ],
          ],
          behaviors: [{ type: 'deliver' }],
        },
      ]);
      expect(result.response).toEqual([]);
    });

    it('should transform a response manifest rule to config format', () => {
      const payload: AzionManifestRule[] = [
        {
          phase: 'response',
          rule: {
            name: 'test-response-rule',
            active: true,
            criteria: [[{ variable: '${uri}', conditional: 'if', operator: 'exists' }]],
            behaviors: [{ type: 'deliver' }],
          },
        },
      ];

      const result = strategy.transformToConfig(payload);

      expect(result.request).toEqual([]);
      expect(result.response).toHaveLength(1);
      expect(result.response![0].name).toBe('test-response-rule');
    });

    it('should default active to true when not provided', () => {
      const payload: AzionManifestRule[] = [
        {
          phase: 'request',
          rule: {
            name: 'no-active-rule',
            criteria: [[{ variable: '${request_uri}', conditional: 'if', operator: 'exists' }]],
            behaviors: [{ type: 'deliver' }],
          } as AzionManifestRule['rule'],
        },
      ];

      const result = strategy.transformToConfig(payload);

      expect(result.request![0].active).toBe(true);
    });

    it('should not include argument for criteria without a value', () => {
      const payload: AzionManifestRule[] = [
        {
          phase: 'request',
          rule: {
            name: 'exists-rule',
            criteria: [[{ variable: '${request_uri}', conditional: 'if', operator: 'exists' }]],
            behaviors: [{ type: 'deliver' }],
          },
        },
      ];

      const result = strategy.transformToConfig(payload);

      expect(result.request![0].criteria[0][0]).toEqual({
        variable: '${request_uri}',
        conditional: 'if',
        operator: 'exists',
      });
      expect(result.request![0].criteria[0][0]).not.toHaveProperty('argument');
    });

    it('should include attributes for behaviors that require them', () => {
      const payload: AzionManifestRule[] = [
        {
          phase: 'request',
          rule: {
            name: 'run-function-rule',
            criteria: [[{ variable: '${request_uri}', conditional: 'if', operator: 'exists' }]],
            behaviors: [{ type: 'run_function', attributes: { value: 'my-function' } }],
          },
        },
      ];

      const result = strategy.transformToConfig(payload);

      expect(result.request![0].behaviors).toEqual([{ type: 'run_function', attributes: { value: 'my-function' } }]);
    });

    it('should transform both request and response manifest rules together', () => {
      const payload: AzionManifestRule[] = [
        {
          phase: 'request',
          rule: {
            name: 'request-rule',
            criteria: [[{ variable: '${request_uri}', conditional: 'if', operator: 'exists' }]],
            behaviors: [{ type: 'deliver' }],
          },
        },
        {
          phase: 'response',
          rule: {
            name: 'response-rule',
            criteria: [[{ variable: '${args}', conditional: 'if', operator: 'exists' }]],
            behaviors: [{ type: 'deliver' }],
          },
        },
      ];

      const result = strategy.transformToConfig(payload);

      expect(result.request).toHaveLength(1);
      expect(result.response).toHaveLength(1);
      expect(result.request![0].name).toBe('request-rule');
      expect(result.response![0].name).toBe('response-rule');
    });
  });
});
