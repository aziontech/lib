import { AzionConfig } from '../../../../types';
import FirewallProcessConfigStrategy from './firewallProcessConfigStrategy';

describe('FirewallProcessConfigStrategy', () => {
  let strategy: FirewallProcessConfigStrategy;

  beforeEach(() => {
    strategy = new FirewallProcessConfigStrategy();
  });

  describe('transformToManifest', () => {
    it('should transform a complete firewall config to manifest', () => {
      const config: AzionConfig = {
        firewall: {
          name: 'Test Firewall',
          domains: ['example.com'],
          active: true,
          edgeFunctions: true,
          networkProtection: true,
          waf: true,
          debugRules: true,
          rules: [
            {
              name: 'Test Rule',
              description: 'Test Description',
              active: true,
              match: '/test',
              variable: 'uri',
              criteria: [
                {
                  variable: 'uri',
                  conditional: 'if',
                  operator: 'matches',
                  inputValue: '/test',
                },
              ],
              behavior: {
                deny: true,
              },
            },
          ],
        },
      };

      const manifest = strategy.transformToManifest(config);
      expect(manifest).toEqual({
        name: 'Test Firewall',
        domains: ['example.com'],
        is_active: true,
        edge_functions_enabled: true,
        network_protection_enabled: true,
        waf_enabled: true,
        debug_rules: true,
        rules_engine: [
          {
            name: 'Test Rule',
            description: 'Test Description',
            is_active: true,
            behaviors: [{ name: 'deny', argument: '' }],
            criteria: [
              [
                {
                  variable: '${uri}',
                  conditional: 'if',
                  operator: 'matches',
                  input_value: '/test',
                },
              ],
            ],
          },
        ],
      });
    });

    it('should handle firewall config without rules', () => {
      const config: AzionConfig = {
        firewall: {
          name: 'Test Firewall',
          domains: ['example.com'],
          active: true,
        },
      };

      const manifest = strategy.transformToManifest(config);
      expect(manifest).toEqual({
        name: 'Test Firewall',
        domains: ['example.com'],
        is_active: true,
        edge_functions_enabled: false,
        network_protection_enabled: false,
        waf_enabled: false,
        debug_rules: false,
      });
    });

    it('should return empty object when no firewall config is provided', () => {
      const config: AzionConfig = {};
      const manifest = strategy.transformToManifest(config);
      expect(manifest).toBeUndefined();
    });

    it('should transform all behavior types correctly', () => {
      const config: AzionConfig = {
        firewall: {
          name: 'Test Firewall',
          rules: [
            {
              name: 'All Behaviors Rule',
              active: true,
              behavior: {
                runFunction: {
                  path: '/edge/function.js',
                },
                setWafRuleset: {
                  wafMode: 'learning',
                  wafId: '123',
                },
                setRateLimit: {
                  type: 'second',
                  limitBy: 'clientIp',
                  averageRateLimit: '1000',
                  maximumBurstSize: '1000',
                },
                setCustomResponse: {
                  statusCode: 403,
                  contentType: 'text/plain',
                  contentBody: 'Blocked',
                },
              },
            },
          ],
        },
      };

      const manifest = strategy.transformToManifest(config);
      expect(manifest.rules_engine[0].behaviors).toEqual([
        {
          name: 'run_function',
          argument: '/edge/function.js',
        },
        {
          name: 'set_waf_ruleset',
          argument: {
            mode: 'learning',
            waf_id: '123',
          },
        },
        {
          name: 'set_rate_limit',
          argument: {
            type: 'second',
            limit_by: 'clientIp',
          },
        },
        {
          name: 'set_custom_response',
          argument: {
            status_code: 403,
            content_type: 'text/plain',
            content_body: 'Blocked',
          },
        },
      ]);
    });
  });

  describe('transformToConfig', () => {
    it('should transform a complete manifest to config', () => {
      const manifest = {
        firewall: {
          name: 'Test Firewall',
          domains: ['example.com'],
          is_active: true,
          edge_functions_enabled: true,
          network_protection_enabled: true,
          waf_enabled: true,
          debug_rules: true,
          rules_engine: [
            {
              name: 'Test Rule',
              description: 'Test Description',
              is_active: true,
              criteria: [
                [
                  {
                    variable: '${uri}',
                    conditional: 'if',
                    operator: 'matches',
                    input_value: '/test',
                  },
                ],
              ],
              behaviors: [{ name: 'deny', argument: '' }],
            },
          ],
        },
      };

      const config = {};
      const result = strategy.transformToConfig(manifest, config);
      expect(result).toEqual({
        name: 'Test Firewall',
        domains: ['example.com'],
        active: true,
        edgeFunctions: true,
        networkProtection: true,
        waf: true,
        debugRules: true,
        rules: [
          {
            name: 'Test Rule',
            description: 'Test Description',
            active: true,
            criteria: [
              {
                variable: '${uri}',
                conditional: 'if',
                operator: 'matches',
                inputValue: '/test',
              },
            ],
            behavior: {
              deny: true,
            },
          },
        ],
      });
    });

    it('should handle manifest without rules', () => {
      const manifest = {
        firewall: {
          name: 'Test Firewall',
          domains: ['example.com'],
          is_active: true,
        },
      };

      const config = {};
      const result = strategy.transformToConfig(manifest, config);
      expect(result).toEqual({
        name: 'Test Firewall',
        domains: ['example.com'],
        active: true,
        edgeFunctions: false,
        networkProtection: false,
        waf: false,
        debugRules: false,
      });
    });

    it('should return undefined when no firewall manifest is provided', () => {
      const manifest = {};
      const config = {};
      const result = strategy.transformToConfig(manifest, config);
      expect(result).toStrictEqual(expect.objectContaining({}));
    });

    it('should transform all behavior types from manifest to config', () => {
      const manifest = {
        firewall: {
          name: 'Test Firewall',
          rules_engine: [
            {
              name: 'All Behaviors Rule',
              is_active: true,
              behaviors: [
                {
                  name: 'run_function',
                  argument: '/edge/function.js',
                },
                {
                  name: 'set_waf_ruleset',
                  argument: {
                    mode: 'learning',
                    waf_id: '123',
                  },
                },
                {
                  name: 'set_rate_limit',
                  argument: {
                    type: 'second',
                    value: '10',
                    limit_by: 'ip',
                  },
                },
                {
                  name: 'set_custom_response',
                  argument: {
                    status_code: 403,
                    content_type: 'text/plain',
                    content_body: 'Blocked',
                  },
                },
              ],
            },
          ],
        },
      };

      const config = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: any = strategy.transformToConfig(manifest, config);
      expect(result?.rules?.[0].behavior).toEqual({
        runFunction: {
          path: '/edge/function.js',
        },
        setWafRuleset: {
          wafMode: 'learning',
          wafId: '123',
        },
        setRateLimit: {
          type: 'second',
          value: '10',
          limitBy: 'ip',
        },
        setCustomResponse: {
          statusCode: 403,
          contentType: 'text/plain',
          contentBody: 'Blocked',
        },
      });
    });

    it('should handle empty behaviors array', () => {
      const manifest = {
        firewall: {
          name: 'Test Firewall',
          rules_engine: [
            {
              name: 'Empty Behaviors Rule',
              is_active: true,
              behaviors: [],
            },
          ],
        },
      };

      const config = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: any = strategy.transformToConfig(manifest, config);
      expect(result?.rules?.[0].behavior).toEqual({});
    });

    it('should handle unknown behavior types gracefully', () => {
      const manifest = {
        firewall: {
          name: 'Test Firewall',
          rules_engine: [
            {
              name: 'Unknown Behavior Rule',
              is_active: true,
              behaviors: [
                {
                  name: 'unknown_behavior',
                  argument: 'test',
                },
              ],
            },
          ],
        },
      };

      const config = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: any = strategy.transformToConfig(manifest, config);
      expect(result?.rules?.[0].behavior).toEqual({});
    });
  });
});
