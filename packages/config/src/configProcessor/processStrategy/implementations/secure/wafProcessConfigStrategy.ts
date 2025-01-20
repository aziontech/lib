import { AzionConfig } from '../../../../types';
import ProcessConfigStrategy from '../../processConfigStrategy';

/**
 * WafProcessConfigStrategy
 * @class WafProcessConfigStrategy
 * @description This class is implementation of the Waf Process Config Strategy.
 */
class WafProcessConfigStrategy extends ProcessConfigStrategy {
  transformToManifest(config: AzionConfig) {
    const waf = config?.waf;
    if (!Array.isArray(waf) || waf.length === 0) {
      return;
    }

    const validField = (conf: Record<string, unknown> | undefined, name: string) => {
      if (conf) {
        return {
          [name]: true,
          [`${name}_sensitivity`]: conf.sensitivity,
        };
      } else {
        return {
          [name]: false,
          [`${name}_sensitivity`]: 'low',
        };
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any[] = [];
    waf.forEach((conf) => {
      const item = {
        name: conf.name,
        active: conf.active,
        mode: conf.mode,
        ...validField(conf.crossSiteScripting, 'cross_site_scripting'),
        ...validField(conf.directoryTraversal, 'directory_traversal'),
        ...validField(conf.evadingTricks, 'evading_tricks'),
        ...validField(conf.fileUpload, 'file_upload'),
        ...validField(conf.remoteFileInclusion, 'remote_file_inclusion'),
        ...validField(conf.sqlInjection, 'sql_injection'),
        ...validField(conf.unwantedAccess, 'unwanted_access'),
        ...validField(conf.identifiedAttack, 'identified_attack'),
        bypass_addresses: conf.bypassAddresses || [],
      };
      payload.push(item);
    });

    return payload;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformToConfig(payload: any, transformedPayload: AzionConfig) {
    const waf = payload?.waf;
    if (!Array.isArray(waf) || waf.length === 0) {
      return;
    }
    transformedPayload.waf = [];
    waf.forEach((conf) => {
      const validField = (name: string) => {
        if (conf[name]) {
          return {
            sensitivity: conf[`${name}_sensitivity`],
          };
        }
      };

      const item = {
        name: conf.name,
        active: conf.active,
        mode: conf.mode,
        crossSiteScripting: validField('cross_site_scripting'),
        directoryTraversal: validField('directory_traversal'),
        evadingTricks: validField('evading_tricks'),
        fileUpload: validField('file_upload'),
        remoteFileInclusion: validField('remote_file_inclusion'),
        sqlInjection: validField('sql_injection'),
        unwantedAccess: validField('unwanted_access'),
        identifiedAttack: validField('identified_attack'),
        bypassAddresses: conf.bypass_addresses || [],
      };

      transformedPayload.waf!.push(item);
    });
    return transformedPayload.waf;
  }
}

export default WafProcessConfigStrategy;
