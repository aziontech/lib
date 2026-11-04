import ProcessConfigStrategy from '../../../shared/processStrategy/processConfigStrategy';
import type { AzionConfigV6, AzionPurgeV6 } from '../../types';

/**
 * Checks the items of a purge as the Azion CLI needs them: a `url` carries the protocol and a `wildcard` the asterisk.
 */
function validatePurgeItems(purge: Pick<AzionPurgeV6, 'type' | 'items'>) {
  purge.items.forEach((value) => {
    if (purge.type === 'url' && !value.includes('http://') && !value.includes('https://')) {
      throw new Error('The URL must contain the protocol (http:// or https://).');
    }

    if (purge.type === 'wildcard' && !value.includes('*')) {
      throw new Error('The wildcard purge must contain the wildcard character (*).');
    }
  });
}

/**
 * PurgeProcessConfigStrategy V6
 * @class PurgeProcessConfigStrategy
 * @description Converts the v6 purge between the config and the manifest.
 */
class PurgeProcessConfigStrategy extends ProcessConfigStrategy<AzionConfigV6> {
  transformToManifest(config: AzionConfigV6) {
    if (!Array.isArray(config?.purge) || config.purge.length === 0) {
      return;
    }

    return config.purge.map((purge) => {
      validatePurgeItems(purge);

      return {
        type: purge.type,
        items: purge.items,
        layer: purge.layer ?? 'cache',
      };
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformToConfig(payload: any, transformedPayload: AzionConfigV6) {
    const purgeConfig = payload.purge;
    if (!Array.isArray(purgeConfig) || purgeConfig.length === 0) {
      return;
    }

    transformedPayload.purge = purgeConfig.map((purge: AzionPurgeV6) => {
      validatePurgeItems(purge);

      return {
        type: purge.type,
        items: purge.items,
        layer: purge.layer ?? 'cache',
      };
    });

    return transformedPayload.purge;
  }
}

export default PurgeProcessConfigStrategy;
