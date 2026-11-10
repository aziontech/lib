import type { AzionConfigV6 } from '../../../types';
import NetworkListProcessConfigStrategy from './networkListProcessConfigStrategy';

describe('NetworkListProcessConfigStrategy (v6)', () => {
  let strategy: NetworkListProcessConfigStrategy;

  beforeEach(() => {
    strategy = new NetworkListProcessConfigStrategy();
  });

  describe('transformToManifest', () => {
    it('should return undefined when there are no network lists', () => {
      expect(strategy.transformToManifest({ version: 6 })).toBeUndefined();
      expect(strategy.transformToManifest({ version: 6, networkList: [] })).toBeUndefined();
    });

    it('should map a network list to the manifest and default active to true', () => {
      expect(
        strategy.transformToManifest({
          version: 6,
          networkList: [
            { name: 'blocked-ips', type: 'ip_cidr', items: ['10.0.0.0/8', '2001:db8::/32'] },
            { name: 'blocked-countries', type: 'countries', items: ['BR', 'US'] },
            { name: 'blocked-asns', type: 'asn', items: ['13335'] },
          ],
        }),
      ).toEqual([
        { name: 'blocked-ips', type: 'ip_cidr', items: ['10.0.0.0/8', '2001:db8::/32'] },
        { name: 'blocked-countries', type: 'countries', items: ['BR', 'US'] },
        { name: 'blocked-asns', type: 'asn', items: ['13335'] },
      ]);
    });
  });

  describe('transformToConfig', () => {
    it('should not set network lists when the manifest has none', () => {
      const transformedPayload: AzionConfigV6 = { version: 6 };

      expect(strategy.transformToConfig({}, transformedPayload)).toBeUndefined();
      expect(strategy.transformToConfig({ network_list: [] }, transformedPayload)).toBeUndefined();
      expect(transformedPayload.networkList).toBeUndefined();
    });

    it('should read the network_list key of the manifest back into the config (v4 read the wrong key)', () => {
      const config: AzionConfigV6 = {
        version: 6,
        networkList: [{ name: 'blocked-ips', type: 'ip_cidr', items: ['10.0.0.0/8'] }],
      };
      const transformedPayload: AzionConfigV6 = { version: 6 };

      strategy.transformToConfig({ network_list: strategy.transformToManifest(config) }, transformedPayload);

      expect(transformedPayload.networkList).toEqual(config.networkList);
    });
  });
});
