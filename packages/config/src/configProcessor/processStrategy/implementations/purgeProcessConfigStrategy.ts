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
      purge?.urls.forEach((value) => {
        if (!value.includes('http://') && !value.includes('https://')) {
          throw new Error('The URL must contain the protocol (http:// or https://).');
        }

        if (purge?.type === 'wildcard' && !value.includes('*')) {
          throw new Error('The URL must not contain the wildcard character (*).');
        }
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const purgeSetting: any = {
        type: purge.type,
        urls: purge.urls || [],
        method: purge.method || 'delete',
      };

      if (purge?.type === 'cachekey') {
        purgeSetting.layer = purge.layer || 'edge_caching';
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
      purge.urls.forEach((value: string) => {
        if (!value.includes('http://') && !value.includes('https://')) {
          throw new Error('The URL must contain the protocol (http:// or https://).');
        }

        if (purge?.type === 'wildcard' && !value.includes('*')) {
          throw new Error('The URL must not contain the wildcard character (*).');
        }
      });
      const purgeSetting: AzionPurge = {
        type: purge.type,
        urls: purge.urls || [],
        method: purge.method || 'delete',
      };

      if (purge?.type === 'cachekey') {
        purgeSetting.layer = purge.layer || 'edge_caching';
      }

      transformedPayload.purge!.push(purgeSetting);
    });
    return transformedPayload.purge;
  }
}

export default PurgeProcessConfigStrategy;
