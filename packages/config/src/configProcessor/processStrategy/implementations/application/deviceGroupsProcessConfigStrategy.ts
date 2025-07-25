import { AzionDeviceGroup } from '../../../../types';
import ProcessConfigStrategy from '../../processConfigStrategy';

/**
 * DeviceGroupsProcessConfigStrategy V4
 * @class DeviceGroupsProcessConfigStrategy
 * @description This class is implementation of the Device Groups Process Config Strategy for API V4.
 */
class DeviceGroupsProcessConfigStrategy extends ProcessConfigStrategy {
  /**
   * Transform azion.config Device Groups to V4 manifest format
   */
  transformToManifest(deviceGroups: AzionDeviceGroup[]) {
    if (!Array.isArray(deviceGroups) || deviceGroups.length === 0) {
      return;
    }

    return deviceGroups.map((deviceGroup) => ({
      name: deviceGroup.name,
      user_agent: deviceGroup.userAgent,
    }));
  }

  /**
   * Transform V4 manifest format back to azion.config Device Groups
   */
  transformToConfig(payload: Array<{ name: string; user_agent: string }>): AzionDeviceGroup[] {
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
