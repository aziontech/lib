import { AzionConfig } from '../../../types';
import ManifestStrategy from '../manifestStrategy';

/**
 * PurgeManifestStrategy
 * @class PurgeManifestStrategy
 * @description This class is implementation of the Purge Manifest Strategy.
 */
class PurgeManifestStrategy extends ManifestStrategy {
  generate(config: AzionConfig) {
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    const payload: any[] = [];
    if (!Array.isArray(config?.purge) || config?.purge.length === 0) {
      return payload;
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
}

export default PurgeManifestStrategy;
