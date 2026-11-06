import ProcessConfigStrategy from '../../../../shared/processStrategy/processConfigStrategy';
import type { AzionConfigV6, AzionDeviceGroupV6 } from '../../../types';

/**
 * DeviceGroupsProcessConfigStrategy V6
 * @class DeviceGroupsProcessConfigStrategy
 * @description Converts the device groups of a v6 application between the config and the manifest.
 */
class DeviceGroupsProcessConfigStrategy extends ProcessConfigStrategy<AzionConfigV6> {
  /**
   * Transform azion.config device groups to the v6 manifest format
   */
  transformToManifest(deviceGroups: AzionDeviceGroupV6[]) {
    if (!Array.isArray(deviceGroups) || deviceGroups.length === 0) {
      return;
    }

    return deviceGroups.map((deviceGroup) => ({
      name: deviceGroup.name,
      user_agent: deviceGroup.userAgent,
    }));
  }

  /**
   * Transform the v6 manifest format back to azion.config device groups
   */
  transformToConfig(payload: Array<{ name: string; user_agent: string }>): AzionDeviceGroupV6[] {
    if (!Array.isArray(payload) || payload.length === 0) {
      return [];
    }

    return payload.map((deviceGroup) => ({
      name: deviceGroup.name,
      userAgent: deviceGroup.user_agent,
    }));
  }
}

export default DeviceGroupsProcessConfigStrategy;
