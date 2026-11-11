import ProcessConfigStrategy from '../../../../shared/processStrategy/processConfigStrategy';
import type { AzionConfigV6 } from '../../../types';

/**
 * NetworkListProcessConfigStrategy V6
 * @class NetworkListProcessConfigStrategy
 * @description Converts the v6 network lists between the config (`networkList`) and the manifest (`network_list`).
 */
class NetworkListProcessConfigStrategy extends ProcessConfigStrategy<AzionConfigV6> {
  /**
   * Transform azion.config Network List to V6 manifest format
   */
  transformToManifest(config: AzionConfigV6) {
    const networkList = config?.networkList;
    if (!Array.isArray(networkList) || networkList.length === 0) {
      return;
    }

    return networkList.map((network) => ({
      name: network.name,
      type: network.type,
      items: network.items,
    }));
  }

  /**
   * Transform V6 manifest format back to azion.config Network List
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformToConfig(payload: any, transformedPayload: AzionConfigV6) {
    const networkList = payload?.network_list;
    if (!Array.isArray(networkList) || networkList.length === 0) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transformedPayload.networkList = networkList.map((network: any) => ({
      name: network.name,
      type: network.type,
      items: network.items,
    }));

    return transformedPayload.networkList;
  }
}

export default NetworkListProcessConfigStrategy;
