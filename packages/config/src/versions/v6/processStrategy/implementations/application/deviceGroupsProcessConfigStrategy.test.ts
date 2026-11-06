import DeviceGroupsProcessConfigStrategy from './deviceGroupsProcessConfigStrategy';

describe('DeviceGroupsProcessConfigStrategy (v6)', () => {
  const strategy = new DeviceGroupsProcessConfigStrategy();

  describe('transformToManifest', () => {
    it('should map each device group to the manifest', () => {
      expect(
        strategy.transformToManifest([
          { name: 'mobile', userAgent: 'Android|iPhone' },
          { name: 'desktop', userAgent: 'Windows|Macintosh' },
        ]),
      ).toEqual([
        { name: 'mobile', user_agent: 'Android|iPhone' },
        { name: 'desktop', user_agent: 'Windows|Macintosh' },
      ]);
    });

    it('should return undefined when there are no device groups', () => {
      expect(strategy.transformToManifest([])).toBeUndefined();
      expect(strategy.transformToManifest(undefined as never)).toBeUndefined();
    });
  });

  describe('transformToConfig', () => {
    it('should map the manifest device groups back to the config', () => {
      expect(strategy.transformToConfig([{ name: 'mobile', user_agent: 'Android|iPhone' }])).toEqual([
        { name: 'mobile', userAgent: 'Android|iPhone' },
      ]);
    });

    it('should return an empty array when there are no device groups', () => {
      expect(strategy.transformToConfig([])).toEqual([]);
      expect(strategy.transformToConfig(undefined as never)).toEqual([]);
    });
  });
});
