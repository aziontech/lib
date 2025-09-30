import { AzionConfig } from '../../../../types';
import FirewallProcessConfigStrategy from './firewallProcessConfigStrategy';

describe('FirewallProcessConfigStrategy', () => {
  let strategy: FirewallProcessConfigStrategy;

  beforeEach(() => {
    strategy = new FirewallProcessConfigStrategy();
  });

  describe('transformToManifest', () => {
    it('should return empty array when no firewall is provided', () => {
      const config: AzionConfig = {};
      const result = strategy.transformToManifest(config);
      expect(result).toEqual([]);
    });

    it('should return empty array when firewall array is empty', () => {
      const config: AzionConfig = { firewall: [] };
      const result = strategy.transformToManifest(config);
      expect(result).toEqual([]);
    });

    it('should transform a single firewall with modules and default rule criteria (variable/match)', () => {
      const config: AzionConfig = {
        firewall: [
          {
            name: 'fw-1',
            functions: true,
            networkProtection: false,
            waf: true,
            variable: 'request_uri',
            rules: [
              {
                name: 'rule-1',
                description: 'desc',
                match: '/api/*',
                variable: 'request_uri',
                behavior: {
                  deny: true,
                },
              },
            ],
          },
        ],
      };

      const result = strategy.transformToManifest(config)!;

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        name: 'fw-1',
        modules: {
          functions: { enabled: true },
          network_protection: { enabled: false },
          waf: { enabled: true },
        },
        debug: false,
        active: true,
      });

      expect(result[0].rules_engine).toHaveLength(1);
      const rule = result[0].rules_engine[0];
      expect(rule).toMatchObject({
        name: 'rule-1',
        description: 'desc',
        active: true,
      });
      // behaviors mapping
      expect(rule.behaviors).toEqual([{ type: 'deny' }]);
      // default criteria built from variable/match
      expect(rule.criteria).toEqual([
        [
          {
            variable: 'request_uri',
            operator: 'matches',
            conditional: 'if',
            argument: '/api/*',
          },
        ],
      ]);
    });

    it('should transform a firewall rule with explicit criteria and full behaviors', () => {
      const config: AzionConfig = {
        firewall: [
          {
            name: 'fw-2',
            functions: false,
            networkProtection: true,
            waf: false,
            rules: [
              {
                name: 'rule-2',
                active: false,
                criteria: [
                  { variable: 'host', operator: 'is_equal', conditional: 'if', argument: 'example.com' },
                  { variable: 'request_method', operator: 'exists', conditional: 'and' },
                ],
                behavior: {
                  runFunction: 'func-1',
                  setWafRuleset: { wafMode: 'blocking', wafId: 123 },
                  setRateLimit: {
                    type: 'minute',
                    value: '100',
                    limitBy: 'clientIp',
                    averageRateLimit: '60',
                    maximumBurstSize: '20',
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  } as any,
                  drop: true,
                  setCustomResponse: { statusCode: 429, contentType: 'application/json', contentBody: '{"err":true}' },
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } as any,
              },
            ],
          },
        ],
      };

      const result = strategy.transformToManifest(config)!;
      expect(result).toHaveLength(1);
      const rule = result[0].rules_engine[0];
      expect(rule.active).toBe(false);

      // behaviors
      expect(rule.behaviors).toEqual([
        { type: 'run_function', attributes: { value: 'func-1' } },
        { type: 'set_waf_ruleset', attributes: { mode: 'blocking', waf_id: 123 } },
        {
          type: 'set_rate_limit',
          attributes: {
            type: 'minute',
            value: '100',
            limit_by: 'clientIp',
            average_rate_limit: '60',
            maximum_burst_size: '20',
          },
        },
        { type: 'drop' },
        {
          type: 'set_custom_response',
          attributes: { status_code: 429, content_type: 'application/json', content_body: '{"err":true}' },
        },
      ]);

      // criteria wrapped into array-of-arrays
      expect(rule.criteria).toEqual([
        [
          { variable: 'host', operator: 'is_equal', conditional: 'if', argument: 'example.com' },
          { variable: 'request_method', operator: 'exists', conditional: 'and' },
        ],
      ]);
    });
  });

  describe('transformToConfig', () => {
    it('should return empty array when no firewall is provided', () => {
      const payload = {};
      const transformedPayload: AzionConfig = {};
      const result = strategy.transformToConfig(payload, transformedPayload);
      expect(result).toEqual([]);
      expect(transformedPayload.firewall).toEqual([]);
    });

    it('should return empty array when firewall array is empty', () => {
      const payload = { firewall: [] };
      const transformedPayload: AzionConfig = {};
      const result = strategy.transformToConfig(payload, transformedPayload);
      expect(result).toEqual([]);
      expect(transformedPayload.firewall).toEqual([]);
    });

    it('should transform a single firewall from manifest to config format (modules and flags)', () => {
      const payload = {
        firewall: [
          {
            name: 'fw-1',
            active: true,
            debug_rules: true,
            modules: {
              functions: { enabled: true },
              network_protection: { enabled: false },
              waf: { enabled: true },
            },
          },
        ],
      };
      const transformedPayload: AzionConfig = {};

      const result = strategy.transformToConfig(payload, transformedPayload);

      // Expected high-level mapping
      expect(transformedPayload.firewall).toEqual([
        {
          name: 'fw-1',
          active: true,
          functions: true,
          networkProtection: false,
          waf: true,
          debugRules: true,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ] as any);
      expect(result).toBe(transformedPayload.firewall);
    });

    it('should transform rules_engine behaviors and criteria to config behavior object', () => {
      const payload = {
        firewall: [
          {
            name: 'fw-2',
            modules: { functions: { enabled: false }, network_protection: { enabled: true }, waf: { enabled: false } },
            rules_engine: [
              {
                type: 'BlockBots',
                active: false,
                behaviors: [
                  { type: 'run_function', attributes: { value: '/path/to/f.js' } },
                  { type: 'set_waf_ruleset', attributes: { mode: 'learning', waf_id: 999 } },
                  {
                    type: 'set_rate_limit',
                    attributes: {
                      type: 'second',
                      value: '20',
                      limit_by: 'global',
                      average_rate_limit: '10',
                      maximum_burst_size: '5',
                    },
                  },
                  { type: 'deny' },
                  { type: 'drop' },
                  {
                    type: 'set_custom_response',
                    attributes: { status_code: 403, content_type: 'text/plain', content_body: 'forbidden' },
                  },
                ],
                criteria: [
                  [
                    { variable: 'host', operator: 'is_equal', conditional: 'if', argument: 'bad.com' },
                    { variable: 'request_method', operator: 'exists', conditional: 'and' },
                  ],
                ],
              },
            ],
          },
        ],
      };

      const transformedPayload: AzionConfig = {};
      strategy.transformToConfig(payload, transformedPayload);

      // Note: behavior.runFunction is mapped to an object with { path } by the strategy
      expect(transformedPayload.firewall?.[0]).toMatchObject({
        name: 'fw-2',
      });

      // If rules are mapped, it should look like the following structure
      // This expectation documents the intended behavior; failing here indicates a bug in the strategy.
      const expectedRule = {
        name: 'BlockBots',
        active: false,
        behavior: {
          runFunction: { path: '/path/to/f.js' },
          setWafRuleset: { wafMode: 'learning', wafId: 999 },
          setRateLimit: {
            type: 'second',
            value: '20',
            limitBy: 'global',
            averageRateLimit: '10',
            maximumBurstSize: '5',
          },
          deny: true,
          drop: true,
          setCustomResponse: { statusCode: 403, contentType: 'text/plain', contentBody: 'forbidden' },
        },
        criteria: [
          { variable: 'host', operator: 'is_equal', conditional: 'if', argument: 'bad.com' },
          { variable: 'request_method', operator: 'exists', conditional: 'and' },
        ],
      };

      // Use flexible assertions in case the strategy is fixed later
      if (transformedPayload.firewall?.[0]?.rules) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(transformedPayload.firewall?.[0]?.rules?.[0]).toMatchObject(expectedRule as any);
      } else {
        // Document current behavior if rules are not mapped due to a bug
        expect(transformedPayload.firewall?.[0]?.rules).toBeDefined();
      }
    });
  });
});
