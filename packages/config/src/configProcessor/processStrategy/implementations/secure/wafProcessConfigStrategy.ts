import { AzionConfig, AzionWaf, WafThreshold } from '../../../../types';
import ProcessConfigStrategy from '../../processConfigStrategy';

/**
 * WafProcessConfigStrategy V4
 * @class WafProcessConfigStrategy
 * @description This class is implementation of the WAF Process Config Strategy for API V4.
 */
class WafProcessConfigStrategy extends ProcessConfigStrategy {
  /**
   * Transform azion.config WAF to V4 manifest format
   */
  transformToManifest(config: AzionConfig) {
    const waf = config?.waf;
    if (!Array.isArray(waf) || waf.length === 0) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any[] = [];
    waf.forEach((wafConfig) => {
      const item = {
        name: wafConfig.name,
        product_version: wafConfig.productVersion || '1.0',
        engine_settings: {
          engine_version: wafConfig.engineSettings.engineVersion,
          type: wafConfig.engineSettings.type,
          attributes: {
            rulesets: wafConfig.engineSettings.attributes.rulesets,
            thresholds: wafConfig.engineSettings.attributes.thresholds.map((threshold) => ({
              threat: threshold.threat,
              sensitivity: threshold.sensitivity,
            })),
          },
        },
      };

      if (wafConfig.versionId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (item as any).version_id = wafConfig.versionId;
      }

      payload.push(item);
    });

    return payload;
  }

  /**
   * Transform V4 manifest format back to azion.config WAF
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformToConfig(payload: any, transformedPayload: AzionConfig) {
    const waf = payload?.waf;
    if (!Array.isArray(waf) || waf.length === 0) {
      return;
    }

    transformedPayload.waf = [];
    waf.forEach((wafItem) => {
      const item: AzionWaf = {
        name: wafItem.name,
        productVersion: wafItem.product_version,
        engineSettings: {
          engineVersion: wafItem.engine_settings.engine_version,
          type: wafItem.engine_settings.type,
          attributes: {
            rulesets: wafItem.engine_settings.attributes.rulesets,
            thresholds: wafItem.engine_settings.attributes.thresholds.map((threshold: WafThreshold) => ({
              threat: threshold.threat,
              sensitivity: threshold.sensitivity,
            })),
          },
        },
      };

      if (wafItem.version_id) {
        item.versionId = wafItem.version_id;
      }

      transformedPayload.waf!.push(item);
    });

    return transformedPayload.waf;
  }
}

export default WafProcessConfigStrategy;
