import type { AzionConfigV6 } from '../../../types';
import WafProcessConfigStrategy from './wafProcessConfigStrategy';

describe('WafProcessConfigStrategy (v6)', () => {
  let strategy: WafProcessConfigStrategy;

  beforeEach(() => {
    strategy = new WafProcessConfigStrategy();
  });

  describe('transformToManifest', () => {
    it('should return undefined when there is no waf', () => {
      expect(strategy.transformToManifest({ version: 6 })).toBeUndefined();
      expect(strategy.transformToManifest({ version: 6, waf: [] })).toBeUndefined();
    });

    it('should apply the defaults of the API to a waf with only the name', () => {
      expect(strategy.transformToManifest({ version: 6, waf: [{ name: 'my-waf' }] })).toEqual([
        {
          name: 'my-waf',
          engine_settings: {
            engine_version: '2021-Q3',
            type: 'score',
            attributes: { rulesets: [1], thresholds: [] },
          },
        },
      ]);
    });

    it('should map every field of the waf to the manifest', () => {
      expect(
        strategy.transformToManifest({
          version: 6,
          waf: [
            {
              name: 'my-waf',
              engineSettings: {
                engineVersion: '2021-Q3',
                type: 'score',
                attributes: {
                  rulesets: [1],
                  thresholds: [{ threat: 'sql_injection', sensitivity: 'high' }, { threat: 'file_upload' }],
                },
              },
            },
          ],
        }),
      ).toEqual([
        {
          name: 'my-waf',
          engine_settings: {
            engine_version: '2021-Q3',
            type: 'score',
            attributes: {
              rulesets: [1],
              thresholds: [{ threat: 'sql_injection', sensitivity: 'high' }, { threat: 'file_upload' }],
            },
          },
        },
      ]);
    });

    it('should not write product_version (it is not in the v6 request)', () => {
      const [waf] = strategy.transformToManifest({ version: 6, waf: [{ name: 'my-waf' }] }) ?? [];

      expect(waf).not.toHaveProperty('product_version');
    });
  });

  describe('transformToConfig', () => {
    it('should not set waf when the manifest has none', () => {
      const transformedPayload: AzionConfigV6 = { version: 6 };

      expect(strategy.transformToConfig({}, transformedPayload)).toBeUndefined();
      expect(transformedPayload.waf).toBeUndefined();
    });

    it('should round trip a waf through the manifest', () => {
      const config: AzionConfigV6 = {
        version: 6,
        waf: [
          {
            name: 'my-waf',
            engineSettings: {
              engineVersion: '2021-Q3',
              type: 'score',
              attributes: {
                rulesets: [1],
                thresholds: [{ threat: 'cross_site_scripting', sensitivity: 'low' }],
              },
            },
          },
        ],
      };
      const transformedPayload: AzionConfigV6 = { version: 6 };

      strategy.transformToConfig({ waf: strategy.transformToManifest(config) }, transformedPayload);

      expect(transformedPayload.waf).toEqual(config.waf);
    });
  });
});
