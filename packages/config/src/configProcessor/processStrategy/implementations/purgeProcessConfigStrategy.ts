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
      const itemsArray = purge.items || [];

      itemsArray.forEach((value) => {
        if (!value.includes('http://') && !value.includes('https://')) {
          throw new Error('The URL must contain the protocol (http:// or https://).');
        }

        if (purge?.type === 'wildcard' && !value.includes('*')) {
          throw new Error('The URL must contain the wildcard character (*) when type is wildcard.');
        }
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const purgeSetting: any = {
        type: purge.type,
        items: itemsArray,
      };

      if (purge?.type === 'cachekey') {
        purgeSetting.layer = purge.layer || 'edge_cache';
      }

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
      const itemsArray = purge.items || [];

      itemsArray.forEach((value: string) => {
        if (!value.includes('http://') && !value.includes('https://')) {
          throw new Error('The URL must contain the protocol (http:// or https://).');
        }

        if (purge?.type === 'wildcard' && !value.includes('*')) {
          throw new Error('The URL must contain the wildcard character (*) when type is wildcard.');
        }
      });

      const purgeSetting: AzionPurge = {
        type: purge.type,
        items: itemsArray,
      };

      if (purge?.type === 'cachekey') {
        purgeSetting.layer = purge.layer || 'edge_cache';
      }

      transformedPayload.purge!.push(purgeSetting);
    });
    return transformedPayload.purge;
  }
}

export default PurgeProcessConfigStrategy;
