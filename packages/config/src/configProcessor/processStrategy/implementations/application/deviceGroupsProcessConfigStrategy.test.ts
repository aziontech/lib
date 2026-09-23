import { AzionDeviceGroup } from '../../../../types';
import DeviceGroupsProcessConfigStrategy from './deviceGroupsProcessConfigStrategy';

describe('DeviceGroupsProcessConfigStrategy', () => {
  let strategy: DeviceGroupsProcessConfigStrategy;

  beforeEach(() => {
    strategy = new DeviceGroupsProcessConfigStrategy();
  });

  describe('transformToManifest', () => {
    it('should return undefined when no device groups are provided', () => {
      const result = strategy.transformToManifest(undefined as unknown as AzionDeviceGroup[]);
      expect(result).toBeUndefined();
    });

    it('should return undefined when device groups array is empty', () => {
      const result = strategy.transformToManifest([]);
      expect(result).toBeUndefined();
    });

    it('should transform a single device group to manifest format', () => {
      const deviceGroups: AzionDeviceGroup[] = [
        {
          name: 'mobile',
          userAgent: 'Mobile|Android|iPhone',
        },
      ];

      const result = strategy.transformToManifest(deviceGroups);

      expect(result).toEqual([
        {
          name: 'mobile',
          user_agent: 'Mobile|Android|iPhone',
        },
      ]);
    });

    it('should transform multiple device groups to manifest format', () => {
      const deviceGroups: AzionDeviceGroup[] = [
        {
          name: 'mobile',
          userAgent: 'Mobile|Android|iPhone',
        },
        {
          name: 'desktop',
          userAgent: 'Windows|Macintosh',
        },
      ];

      const result = strategy.transformToManifest(deviceGroups);

      expect(result).toEqual([
        { name: 'mobile', user_agent: 'Mobile|Android|iPhone' },
        { name: 'desktop', user_agent: 'Windows|Macintosh' },
      ]);
    });
  });

  describe('transformToConfig', () => {
    it('should return empty array when no payload is provided', () => {
      const result = strategy.transformToConfig(undefined as unknown as Array<{ name: string; user_agent: string }>);
      expect(result).toEqual([]);
    });

    it('should return empty array when payload is empty', () => {
      const result = strategy.transformToConfig([]);
      expect(result).toEqual([]);
    });

    it('should transform a single device group from manifest to config format', () => {
      const payload = [
        {
          name: 'mobile',
          user_agent: 'Mobile|Android|iPhone',
        },
      ];

      const result = strategy.transformToConfig(payload);

      expect(result).toEqual([
        {
          name: 'mobile',
          userAgent: 'Mobile|Android|iPhone',
        },
      ]);
    });

    it('should transform multiple device groups from manifest to config format', () => {
      const payload = [
        { name: 'mobile', user_agent: 'Mobile|Android|iPhone' },
        { name: 'desktop', user_agent: 'Windows|Macintosh' },
      ];

      const result = strategy.transformToConfig(payload);

      expect(result).toEqual([
        { name: 'mobile', userAgent: 'Mobile|Android|iPhone' },
        { name: 'desktop', userAgent: 'Windows|Macintosh' },
      ]);
    });
  });
});
