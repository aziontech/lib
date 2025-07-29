import { AzionConfig } from '../../../../types';
import ProcessConfigStrategy from '../../processConfigStrategy';

/**
 * NetworkListProcessConfigStrategy
 * @class NetworkListProcessConfigStrategy
 * @description This class is implementation of the NetworkList Process Config Strategy.
 */
class NetworkListProcessConfigStrategy extends ProcessConfigStrategy {
  transformToManifest(config: AzionConfig) {
    const networkList = config?.networkList;
    if (!Array.isArray(networkList) || networkList.length === 0) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any[] = [];
    networkList.forEach((network) => {
      const item = {
        id: network.id,
        list_type: network.listType,
        items_values: network.listContent,
      };
      payload.push(item);
    });

    return payload;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformToConfig(payload: any, transformedPayload: AzionConfig) {
    const networkList = payload?.networkList;
    if (!Array.isArray(networkList) || networkList.length === 0) {
      return;
    }
    transformedPayload.networkList = [];
    networkList.forEach((network) => {
      const item = {
        id: network.id,
        listType: network.list_type,
        listContent: network.items_values,
      };
      transformedPayload.networkList!.push(item);
    });
    return transformedPayload.networkList;
  }
}

export default NetworkListProcessConfigStrategy;
