import type { AzionManifestRule, AzionRules } from '../../../../../types';
import RulesProcessConfigStrategy from './rulesProcessConfigStrategy';

describe('RulesProcessConfigStrategy (v6)', () => {
  let strategy: RulesProcessConfigStrategy;

  const rules: AzionRules = {
    request: [
      {
        name: 'Execute Function',
        description: 'Execute function for all requests',
        criteria: [[{ variable: '${uri}', conditional: 'if', operator: 'matches', argument: '^/' }]],
        behaviors: [{ type: 'run_function', attributes: { value: 'fn' } }],
      },
    ],
    response: [
      {
        name: 'Add header',
        active: false,
        criteria: [[{ variable: 'status', conditional: 'if', operator: 'exists' }]],
        behaviors: [{ type: 'add_response_header', attributes: { value: 'x-test: 1' } }],
      },
    ],
  };

  const manifest: AzionManifestRule[] = [
    {
      phase: 'request',
      rule: {
        name: 'Execute Function',
        description: 'Execute function for all requests',
        active: true,
        criteria: [[{ variable: '${uri}', conditional: 'if', operator: 'matches', argument: '^/' }]],
        behaviors: [{ type: 'run_function', attributes: { value: 'fn' } }],
      },
    },
    {
      phase: 'response',
      rule: {
        name: 'Add header',
        description: undefined,
        active: false,
        criteria: [[{ variable: '${status}', conditional: 'if', operator: 'exists' }]],
        behaviors: [{ type: 'add_response_header', attributes: { value: 'x-test: 1' } }],
      },
    },
  ];

  beforeEach(() => {
    strategy = new RulesProcessConfigStrategy();
  });

  describe('transformToManifest', () => {
    it('should return an empty array when there are no rules', () => {
      expect(strategy.transformToManifest({})).toEqual([]);
    });

    it('should map request and response rules with their phase, wrapping the variables in ${}', () => {
      expect(strategy.transformToManifest(rules, [{ name: 'fn', path: './fn.js' }])).toEqual(manifest);
    });

    it('should throw when run_function references a function that is not defined', () => {
      expect(() => strategy.transformToManifest(rules, [{ name: 'other', path: './o.js' }])).toThrow(
        'Function "fn" referenced in rule "Execute Function" is not defined in the functions array.',
      );
    });

    it('should not validate a function referenced by id', () => {
      const byId: AzionRules = {
        request: [{ ...rules.request![0], behaviors: [{ type: 'run_function', attributes: { value: 10 } }] }],
      };
      expect(() => strategy.transformToManifest(byId, [])).not.toThrow();
    });

    it('should not validate the function references when the config has no functions', () => {
      expect(() => strategy.transformToManifest(rules)).not.toThrow();
    });
  });

  describe('transformToConfig', () => {
    it('should return empty rules when the manifest is not an array', () => {
      expect(strategy.transformToConfig(undefined as unknown as AzionManifestRule[])).toEqual({
        request: [],
        response: [],
      });
    });

    it('should split the manifest rules by phase back into the config', () => {
      const result = strategy.transformToConfig(manifest);

      expect(result.request).toHaveLength(1);
      expect(result.response).toHaveLength(1);
      expect(result.request![0]).toEqual(expect.objectContaining({ name: 'Execute Function', active: true }));
      expect(result.response![0]).toEqual(expect.objectContaining({ name: 'Add header', active: false }));
    });
  });
});
