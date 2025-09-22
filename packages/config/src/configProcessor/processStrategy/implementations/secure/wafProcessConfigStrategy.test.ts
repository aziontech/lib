/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  AzionConfig,
  WafEngineType,
  WafEngineVersion,
  WafRuleset,
  WafSensitivity,
  WafThreatType,
} from '../../../../types';
import WafProcessConfigStrategy from './wafProcessConfigStrategy';

describe('WafProcessConfigStrategy', () => {
  let strategy: WafProcessConfigStrategy;

  beforeEach(() => {
    strategy = new WafProcessConfigStrategy();
  });

  describe('transformToManifest', () => {
    it('should return undefined when no WAF configurations are provided', () => {
      const config: AzionConfig = {};
      const result = strategy.transformToManifest(config);
      expect(result).toBeUndefined();
    });

    it('should return undefined when WAF array is empty', () => {
      const config: AzionConfig = { waf: [] };
      const result = strategy.transformToManifest(config);
      expect(result).toBeUndefined();
    });

    it('should transform a single WAF configuration to manifest format', () => {
      const config: AzionConfig = {
        waf: [
          {
            name: 'test-waf',
            productVersion: '1.5',
            engineSettings: {
              engineVersion: '2021-Q3' as WafEngineVersion,
              type: 'score' as WafEngineType,
              attributes: {
                rulesets: [1] as WafRuleset[],
                thresholds: [
                  {
                    threat: 'sql_injection' as WafThreatType,
                    sensitivity: 'high' as WafSensitivity,
                  },
                ],
              },
            },
          },
        ],
      };

      const result = strategy.transformToManifest(config);

      expect(result).toEqual([
        {
          name: 'test-waf',
          product_version: '1.5',
          engine_settings: {
            engine_version: '2021-Q3',
            type: 'score',
            attributes: {
              rulesets: [1],
              thresholds: [
                {
                  threat: 'sql_injection',
                  sensitivity: 'high',
                },
              ],
            },
          },
        },
      ]);
    });

    it('should use default product_version when not provided', () => {
      const config: AzionConfig = {
        waf: [
          {
            name: 'test-waf',
            engineSettings: {
              engineVersion: '2021-Q3' as WafEngineVersion,
              type: 'score' as WafEngineType,
              attributes: {
                rulesets: [1] as WafRuleset[],
                thresholds: [],
              },
            },
          },
        ],
      };

      const result = strategy.transformToManifest(config);

      expect(result![0].product_version).toBe('1.0');
    });

    it('should transform multiple WAF configurations to manifest format', () => {
      const config: AzionConfig = {
        waf: [
          {
            name: 'first-waf',
            productVersion: '1.5',
            engineSettings: {
              engineVersion: '2021-Q3' as WafEngineVersion,
              type: 'score' as WafEngineType,
              attributes: {
                rulesets: [1] as WafRuleset[],
                thresholds: [
                  {
                    threat: 'sql_injection' as WafThreatType,
                    sensitivity: 'high' as WafSensitivity,
                  },
                ],
              },
            },
          },
          {
            name: 'second-waf',
            productVersion: '2.0',
            engineSettings: {
              engineVersion: '2021-Q3' as WafEngineVersion,
              type: 'score' as WafEngineType,
              attributes: {
                rulesets: [1] as WafRuleset[],
                thresholds: [
                  {
                    threat: 'cross_site_scripting' as WafThreatType,
                    sensitivity: 'medium' as WafSensitivity,
                  },
                  {
                    threat: 'directory_traversal' as WafThreatType,
                    sensitivity: 'highest' as WafSensitivity,
                  },
                ],
              },
            },
          },
        ],
      };

      const result = strategy.transformToManifest(config);

      expect(result).toHaveLength(2);
      expect(result![0].name).toBe('first-waf');
      expect(result![1].name).toBe('second-waf');
      expect(result![1].engine_settings.attributes.thresholds).toHaveLength(2);
      expect(result![1].engine_settings.attributes.thresholds[0].threat).toBe('cross_site_scripting');
      expect(result![1].engine_settings.attributes.thresholds[1].sensitivity).toBe('highest');
    });
  });

  describe('transformToConfig', () => {
    it('should return undefined when no WAF configurations are provided', () => {
      const payload = {};
      const transformedPayload: AzionConfig = {};

      const result = strategy.transformToConfig(payload, transformedPayload);

      expect(result).toBeUndefined();
      expect(transformedPayload.waf).toBeUndefined();
    });

    it('should return undefined when WAF array is empty', () => {
      const payload = { waf: [] };
      const transformedPayload: AzionConfig = {};

      const result = strategy.transformToConfig(payload, transformedPayload);

      expect(result).toBeUndefined();
      expect(transformedPayload.waf).toBeUndefined();
    });

    it('should transform a single WAF configuration from manifest to config format', () => {
      const payload = {
        waf: [
          {
            name: 'test-waf',
            product_version: '1.5',
            engine_settings: {
              engine_version: '2021-Q3',
              type: 'score',
              attributes: {
                rulesets: [1],
                thresholds: [
                  {
                    threat: 'sql_injection',
                    sensitivity: 'high',
                  },
                ],
              },
            },
          },
        ],
      };
      const transformedPayload: AzionConfig = {};

      const result = strategy.transformToConfig(payload, transformedPayload);

      expect(transformedPayload.waf).toEqual([
        {
          name: 'test-waf',
          productVersion: '1.5',
          engineSettings: {
            engineVersion: '2021-Q3',
            type: 'score',
            attributes: {
              rulesets: [1],
              thresholds: [
                {
                  threat: 'sql_injection',
                  sensitivity: 'high',
                },
              ],
            },
          },
        },
      ]);
      expect(result).toBe(transformedPayload.waf);
    });

    it('should transform multiple WAF configurations from manifest to config format', () => {
      const payload = {
        waf: [
          {
            name: 'first-waf',
            product_version: '1.5',
            engine_settings: {
              engine_version: '2021-Q3',
              type: 'score',
              attributes: {
                rulesets: [1],
                thresholds: [
                  {
                    threat: 'sql_injection',
                    sensitivity: 'high',
                  },
                ],
              },
            },
          },
          {
            name: 'second-waf',
            product_version: '2.0',
            engine_settings: {
              engine_version: '2021-Q3',
              type: 'score',
              attributes: {
                rulesets: [1],
                thresholds: [
                  {
                    threat: 'cross_site_scripting',
                    sensitivity: 'medium',
                  },
                  {
                    threat: 'directory_traversal',
                    sensitivity: 'highest',
                  },
                ],
              },
            },
          },
        ],
      };
      const transformedPayload: AzionConfig = {};

      strategy.transformToConfig(payload, transformedPayload);

      expect(transformedPayload.waf).toHaveLength(2);
      expect(transformedPayload.waf![0].name).toBe('first-waf');
      expect(transformedPayload.waf![1].name).toBe('second-waf');
      expect(transformedPayload.waf![0].productVersion).toBe('1.5');
      expect(transformedPayload.waf![1].productVersion).toBe('2.0');
      expect(transformedPayload.waf![1].engineSettings.attributes.thresholds).toHaveLength(2);
      expect(transformedPayload.waf![1].engineSettings.attributes.thresholds[0].threat).toBe('cross_site_scripting');
      expect(transformedPayload.waf![1].engineSettings.attributes.thresholds[1].sensitivity).toBe('highest');
    });

    it('should handle existing WAF configurations in transformedPayload', () => {
      const payload = {
        waf: [
          {
            name: 'new-waf',
            product_version: '2.0',
            engine_settings: {
              engine_version: '2021-Q3',
              type: 'score',
              attributes: {
                rulesets: [1],
                thresholds: [],
              },
            },
          },
        ],
      };
      const transformedPayload: AzionConfig = {
        waf: [
          {
            name: 'existing-waf',
            productVersion: '1.0',
            engineSettings: {
              engineVersion: '2021-Q3' as WafEngineVersion,
              type: 'score' as WafEngineType,
              attributes: {
                rulesets: [1] as WafRuleset[],
                thresholds: [],
              },
            },
          },
        ],
      };

      strategy.transformToConfig(payload, transformedPayload);

      // The transformToConfig method replaces the existing waf array
      expect(transformedPayload.waf).toHaveLength(1);
      expect(transformedPayload.waf![0].name).toBe('new-waf');
    });
  });
});
