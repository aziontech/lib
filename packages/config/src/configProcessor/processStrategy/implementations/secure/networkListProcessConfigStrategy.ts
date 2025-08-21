import { AzionConfig } from '../../../../types';
import ProcessConfigStrategy from '../../processConfigStrategy';

/**
 * NetworkListProcessConfigStrategy V4
 * @class NetworkListProcessConfigStrategy
 * @description This class is implementation of the Network List Process Config Strategy for API V4.
 */
class NetworkListProcessConfigStrategy extends ProcessConfigStrategy {
  /**
   * Transform azion.config Network List to V4 manifest format
   */
  transformToManifest(config: AzionConfig) {
    const networkList = config?.networkList;
    if (!Array.isArray(networkList) || networkList.length === 0) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any[] = [];
    networkList.forEach((network) => {
      const item = {
        name: network.name,
        type: network.type,
        items: network.items,
        active: network.active ?? true,
      };
      payload.push(item);
    });

    return payload;
  }

  /**
   * Transform V4 manifest format back to azion.config Network List
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformToConfig(payload: any, transformedPayload: AzionConfig) {
    const networkList = payload?.networkList;
    if (!Array.isArray(networkList) || networkList.length === 0) {
      return;
    }

    transformedPayload.networkList = [];
    networkList.forEach((network) => {
      const item = {
        name: network.name,
        type: network.type,
        items: network.items,
        active: network.active,
      };
      transformedPayload.networkList!.push(item);
    });

    return transformedPayload.networkList;
  }
}

export default NetworkListProcessConfigStrategy;
