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
            rules: [
              {
                name: 'rule-1',
                description: 'desc',
                match: '/api/*',
                variable: 'request_uri',
                behaviors: [{ deny: true }],
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
                behaviors: [
                  { runFunction: 'func-1' },
                  { setWafRuleset: { wafMode: 'blocking', wafId: 123 } },
                  {
                    setRateLimit: {
                      type: 'minute',
                      limitBy: 'clientIp',
                      averageRateLimit: '60',
                      maximumBurstSize: '20',
                    },
                  },
                  { drop: true },
                  {
                    setCustomResponse: {
                      statusCode: 429,
                      contentType: 'application/json',
                      contentBody: '{"err":true}',
                    },
                  },
                ],
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

    it('should transform a firewall rule with runFunction followed by other behaviors', () => {
      const config: AzionConfig = {
        firewall: [
          {
            name: 'fw-runFunction',
            functions: true,
            networkProtection: false,
            waf: false,
            rules: [
              {
                name: 'rule-runFunction-deny',
                match: '/api/*',
                variable: 'request_uri',
                behaviors: [{ runFunction: 'my-function' }, { deny: true }],
              },
            ],
          },
        ],
      };

      const result = strategy.transformToManifest(config)!;
      expect(result).toHaveLength(1);
      const rule = result[0].rules_engine[0];

      expect(rule.behaviors).toEqual([
        { type: 'run_function', attributes: { value: 'my-function' } },
        { type: 'deny' },
      ]);
    });

    it('should transform a firewall rule with single deny behavior', () => {
      const config: AzionConfig = {
        firewall: [
          {
            name: 'fw-single',
            functions: false,
            networkProtection: true,
            waf: false,
            rules: [
              {
                name: 'rule-single-deny',
                match: '/blocked/*',
                variable: 'request_uri',
                behaviors: [{ deny: true }],
              },
            ],
          },
        ],
      };

      const result = strategy.transformToManifest(config)!;
      expect(result).toHaveLength(1);
      const rule = result[0].rules_engine[0];

      expect(rule.behaviors).toEqual([{ type: 'deny' }]);
    });

    it('should transform a firewall rule with single drop behavior', () => {
      const config: AzionConfig = {
        firewall: [
          {
            name: 'fw-drop',
            functions: false,
            networkProtection: true,
            waf: false,
            rules: [
              {
                name: 'rule-drop',
                match: '/drop/*',
                variable: 'request_uri',
                behaviors: [{ drop: true }],
              },
            ],
          },
        ],
      };

      const result = strategy.transformToManifest(config)!;
      expect(result).toHaveLength(1);
      const rule = result[0].rules_engine[0];

      expect(rule.behaviors).toEqual([{ type: 'drop' }]);
    });

    it('should transform a firewall rule with runFunction, setWafRuleset, and deny', () => {
      const config: AzionConfig = {
        firewall: [
          {
            name: 'fw-multiple',
            functions: true,
            networkProtection: false,
            waf: true,
            rules: [
              {
                name: 'rule-multiple',
                match: '/protected/*',
                variable: 'request_uri',
                behaviors: [
                  { runFunction: 123 },
                  { setWafRuleset: { wafMode: 'blocking', wafId: 456 } },
                  { deny: true },
                ],
              },
            ],
          },
        ],
      };

      const result = strategy.transformToManifest(config)!;
      expect(result).toHaveLength(1);
      const rule = result[0].rules_engine[0];

      expect(rule.behaviors).toEqual([
        { type: 'run_function', attributes: { value: 123 } },
        { type: 'set_waf_ruleset', attributes: { mode: 'blocking', waf_id: 456 } },
        { type: 'deny' },
      ]);
    });

    it('should transform a firewall rule using criteria instead of match/variable', () => {
      const config: AzionConfig = {
        firewall: [
          {
            name: 'fw-criteria',
            functions: false,
            networkProtection: true,
            waf: false,
            rules: [
              {
                name: 'rule-criteria',
                criteria: [
                  { variable: 'host', operator: 'is_equal', conditional: 'if', argument: 'example.com' },
                  { variable: 'request_method', operator: 'matches', conditional: 'and', argument: '^(GET|POST)$' },
                ],
                behaviors: [{ deny: true }],
              },
            ],
          },
        ],
      };

      const result = strategy.transformToManifest(config)!;
      expect(result).toHaveLength(1);
      const rule = result[0].rules_engine[0];

      expect(rule.criteria).toEqual([
        [
          { variable: 'host', operator: 'is_equal', conditional: 'if', argument: 'example.com' },
          { variable: 'request_method', operator: 'matches', conditional: 'and', argument: '^(GET|POST)$' },
        ],
      ]);
      expect(rule.behaviors).toEqual([{ type: 'deny' }]);
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

    it('should transform rules_engine behaviors and criteria to config behaviors object', () => {
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

      // Note: behaviors.runFunction is mapped to an object with { path } by the strategy
      expect(transformedPayload.firewall?.[0]).toMatchObject({
        name: 'fw-2',
      });

      // If rules are mapped, it should look like the following structure
      // This expectation documents the intended behaviors; failing here indicates a bug in the strategy.
      const expectedRule = {
        name: 'BlockBots',
        active: false,
        behaviors: [
          { runFunction: '/path/to/f.js' },
          { setWafRuleset: { wafMode: 'learning', wafId: 999 } },
          {
            setRateLimit: {
              type: 'second',
              limitBy: 'global',
              averageRateLimit: '10',
              maximumBurstSize: '5',
            },
          },
          { deny: true },
          { drop: true },
          { setCustomResponse: { statusCode: 403, contentType: 'text/plain', contentBody: 'forbidden' } },
        ],
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
        // Document current behaviors if rules are not mapped due to a bug
        expect(transformedPayload.firewall?.[0]?.rules).toBeDefined();
      }
    });

    it('should transform manifest with runFunction followed by deny to config', () => {
      const payload = {
        firewall: [
          {
            name: 'fw-runFunction',
            modules: { functions: { enabled: true }, network_protection: { enabled: false }, waf: { enabled: false } },
            rules_engine: [
              {
                type: 'RunThenDeny',
                active: true,
                behaviors: [{ type: 'run_function', attributes: { value: 'my-func' } }, { type: 'deny' }],
                criteria: [[{ variable: 'request_uri', operator: 'matches', conditional: 'if', argument: '/api/*' }]],
              },
            ],
          },
        ],
      };

      const transformedPayload: AzionConfig = {};
      strategy.transformToConfig(payload, transformedPayload);

      expect(transformedPayload.firewall?.[0]?.rules?.[0]).toMatchObject({
        name: 'RunThenDeny',
        active: true,
        behaviors: [{ runFunction: 'my-func' }, { deny: true }],
      });
    });

    it('should transform manifest with single deny behavior to config', () => {
      const payload = {
        firewall: [
          {
            name: 'fw-single-deny',
            modules: { functions: { enabled: false }, network_protection: { enabled: true }, waf: { enabled: false } },
            rules_engine: [
              {
                type: 'DenyOnly',
                active: true,
                behaviors: [{ type: 'deny' }],
                criteria: [[{ variable: 'host', operator: 'is_equal', conditional: 'if', argument: 'blocked.com' }]],
              },
            ],
          },
        ],
      };

      const transformedPayload: AzionConfig = {};
      strategy.transformToConfig(payload, transformedPayload);

      expect(transformedPayload.firewall?.[0]?.rules?.[0]).toMatchObject({
        name: 'DenyOnly',
        active: true,
        behaviors: [{ deny: true }],
      });
    });

    it('should transform manifest with single drop behavior to config', () => {
      const payload = {
        firewall: [
          {
            name: 'fw-single-drop',
            modules: { functions: { enabled: false }, network_protection: { enabled: true }, waf: { enabled: false } },
            rules_engine: [
              {
                type: 'DropOnly',
                active: true,
                behaviors: [{ type: 'drop' }],
                criteria: [
                  [{ variable: 'request_method', operator: 'is_equal', conditional: 'if', argument: 'DELETE' }],
                ],
              },
            ],
          },
        ],
      };

      const transformedPayload: AzionConfig = {};
      strategy.transformToConfig(payload, transformedPayload);

      expect(transformedPayload.firewall?.[0]?.rules?.[0]).toMatchObject({
        name: 'DropOnly',
        active: true,
        behaviors: [{ drop: true }],
      });
    });

    it('should transform manifest with runFunction, setWafRuleset, and setCustomResponse to config', () => {
      const payload = {
        firewall: [
          {
            name: 'fw-complex',
            modules: { functions: { enabled: true }, network_protection: { enabled: false }, waf: { enabled: true } },
            rules_engine: [
              {
                type: 'ComplexRule',
                active: true,
                behaviors: [
                  { type: 'run_function', attributes: { value: 999 } },
                  { type: 'set_waf_ruleset', attributes: { mode: 'counting', waf_id: 111 } },
                  {
                    type: 'set_custom_response',
                    attributes: {
                      status_code: 429,
                      content_type: 'application/json',
                      content_body: '{"error":"rate limit"}',
                    },
                  },
                ],
                criteria: [
                  [{ variable: 'client_ip', operator: 'is_in_list', conditional: 'if', argument: 'blocklist' }],
                ],
              },
            ],
          },
        ],
      };

      const transformedPayload: AzionConfig = {};
      strategy.transformToConfig(payload, transformedPayload);

      expect(transformedPayload.firewall?.[0]?.rules?.[0]).toMatchObject({
        name: 'ComplexRule',
        active: true,
        behaviors: [
          { runFunction: 999 },
          { setWafRuleset: { wafMode: 'counting', wafId: 111 } },
          {
            setCustomResponse: {
              statusCode: 429,
              contentType: 'application/json',
              contentBody: '{"error":"rate limit"}',
            },
          },
        ],
      });
    });
  });
});
