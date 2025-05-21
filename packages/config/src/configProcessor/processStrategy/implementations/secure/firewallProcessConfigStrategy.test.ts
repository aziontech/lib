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
        firewall: [
          {
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
        ],
      };

      const manifest = strategy.transformToManifest(config);
      expect(manifest).toEqual([
        {
          main_settings: {
            name: 'Test Firewall',
            domains: ['example.com'],
            is_active: true,
            edge_functions_enabled: true,
            network_protection_enabled: true,
            waf_enabled: true,
            debug_rules: true,
          },
          rules_engine: [
            {
              name: 'Test Rule',
              description: 'Test Description',
              is_active: true,
              behaviors: [{ name: 'deny', target: '' }],
              criteria: [
                [
                  {
                    variable: 'uri',
                    conditional: 'if',
                    operator: 'matches',
                    input_value: '/test',
                  },
                ],
              ],
            },
          ],
        },
      ]);
    });

    it('should handle firewall config without rules', () => {
      const config: AzionConfig = {
        firewall: [
          {
            name: 'Test Firewall',
            domains: ['example.com'],
            active: true,
          },
        ],
      };

      const manifest = strategy.transformToManifest(config);
      expect(manifest).toEqual([
        {
          main_settings: {
            name: 'Test Firewall',
            domains: ['example.com'],
            is_active: true,
            edge_functions_enabled: false,
            network_protection_enabled: false,
            waf_enabled: false,
            debug_rules: false,
          },
        },
      ]);
    });

    it('should return undefined when no firewall config is provided', () => {
      const config: AzionConfig = {};
      const manifest = strategy.transformToManifest(config);
      expect(manifest).toBeUndefined();
    });
  });

  describe('transformToConfig', () => {
    it('should transform a complete manifest to config', () => {
      const manifest = [
        {
          main_settings: {
            name: 'Test Firewall',
            domains: ['example.com'],
            is_active: true,
            edge_functions_enabled: true,
            network_protection_enabled: true,
            waf_enabled: true,
            debug_rules: true,
          },
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
              behaviors: [{ name: 'deny', target: '' }],
            },
          ],
        },
      ];

      const config = {};
      const result = strategy.transformToConfig({ firewall: manifest }, config);

      expect(result).toEqual([
        {
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
        },
      ]);
    });

    it('should handle manifest without rules', () => {
      const manifest = [
        {
          main_settings: {
            name: 'Test Firewall',
            domains: ['example.com'],
            is_active: true,
          },
        },
      ];

      const config = {};
      const result = strategy.transformToConfig({ firewall: manifest }, config);
      expect(result).toEqual([
        {
          name: 'Test Firewall',
          domains: ['example.com'],
          active: true,
          edgeFunctions: false,
          networkProtection: false,
          waf: false,
          debugRules: false,
        },
      ]);
    });

    it('should return undefined when no firewall manifest is provided', () => {
      const manifest = {};
      const config = {};
      const result = strategy.transformToConfig(manifest, config);
      expect(result).toStrictEqual(expect.objectContaining({}));
    });
  });
});
