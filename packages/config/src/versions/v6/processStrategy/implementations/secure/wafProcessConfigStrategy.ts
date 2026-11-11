import ProcessConfigStrategy from '../../../../shared/processStrategy/processConfigStrategy';
import type { AzionConfigV6 } from '../../../types';

/**
 * WafProcessConfigStrategy V6
 * @class WafProcessConfigStrategy
 * @description Converts the v6 wafs between the config and the manifest.
 * The engine settings are optional: the manifest defaults them to the ones of the API (engine 2021-Q3, type score,
 * ruleset 1 and no thresholds). A threshold without sensitivity is left to the API.
 */
class WafProcessConfigStrategy extends ProcessConfigStrategy<AzionConfigV6> {
  /**
   * Transform azion.config WAF to V6 manifest format
   */
  transformToManifest(config: AzionConfigV6) {
    const waf = config?.waf;
    if (!Array.isArray(waf) || waf.length === 0) {
      return;
    }

    return waf.map((wafConfig) => ({
      name: wafConfig.name,
      engine_settings: {
        engine_version: wafConfig.engineSettings?.engineVersion ?? '2021-Q3',
        type: wafConfig.engineSettings?.type ?? 'score',
        attributes: {
          rulesets: wafConfig.engineSettings?.attributes?.rulesets ?? [1],
          thresholds: (wafConfig.engineSettings?.attributes?.thresholds ?? []).map((threshold) => ({
            threat: threshold.threat,
            ...(threshold.sensitivity && { sensitivity: threshold.sensitivity }),
          })),
        },
      },
    }));
  }

  /**
   * Transform V6 manifest format back to azion.config WAF
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformToConfig(payload: any, transformedPayload: AzionConfigV6) {
    const waf = payload?.waf;
    if (!Array.isArray(waf) || waf.length === 0) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transformedPayload.waf = waf.map((wafItem: any) => ({
      name: wafItem.name,
      engineSettings: wafItem.engine_settings && {
        engineVersion: wafItem.engine_settings.engine_version,
        type: wafItem.engine_settings.type,
        attributes: wafItem.engine_settings.attributes && {
          rulesets: wafItem.engine_settings.attributes.rulesets,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          thresholds: wafItem.engine_settings.attributes.thresholds?.map((threshold: any) => ({
            threat: threshold.threat,
            sensitivity: threshold.sensitivity,
          })),
        },
      },
    }));

    return transformedPayload.waf;
  }
}

export default WafProcessConfigStrategy;
