import { AzionConfig, AzionPurge } from '../../../types';
import ProcessConfigStrategy from '../processConfigStrategy';

/**
 * PurgeProcessConfigStrategy
 * @class PurgeProcessConfigStrategy
 * @description This class is implementation of the Purge ProcessConfig Strategy.
 */
class PurgeProcessConfigStrategy extends ProcessConfigStrategy {
  transformToManifest(config: AzionConfig) {
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    const payload: any[] = [];
    if (!Array.isArray(config?.purge) || config?.purge.length === 0) {
      return;
    }
    config?.purge.forEach((purge) => {
      purge?.items.forEach((value) => {
        if (purge.type === 'url' && !value.includes('http://') && !value.includes('https://')) {
          throw new Error('The URL must contain the protocol (http:// or https://).');
        }

        if (purge?.type === 'wildcard' && !value.includes('*')) {
          throw new Error('The URL must not contain the wildcard character (*).');
        }
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const purgeSetting: any = {
        type: purge.type,
        items: purge.items || [],
        layer: purge.layer ?? 'cache',
      };

      payload.push(purgeSetting);
    });
    return payload;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformToConfig(payload: any, transformedPayload: AzionConfig) {
    const purgeConfig = payload.purge;
    if (!Array.isArray(purgeConfig) || purgeConfig.length === 0) {
      return;
    }
    transformedPayload.purge = [];
    purgeConfig.forEach((purge) => {
      purge.items.forEach((value: string) => {
        if (purge.type === 'url' && !value.includes('http://') && !value.includes('https://')) {
          throw new Error('The URL must contain the protocol (http:// or https://).');
        }

        if (purge?.type === 'wildcard' && !value.includes('*')) {
          throw new Error('The URL must not contain the wildcard character (*).');
        }
      });
      const purgeSetting: AzionPurge = {
        type: purge.type,
        items: purge.items || [],
        layer: purge.layer ?? 'cache',
      };

      transformedPayload.purge!.push(purgeSetting);
    });
    return transformedPayload.purge;
  }
}

export default PurgeProcessConfigStrategy;
