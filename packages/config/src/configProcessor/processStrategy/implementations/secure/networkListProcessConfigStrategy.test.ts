import { AzionConfig, NetworkListType } from '../../../../types';
import NetworkListProcessConfigStrategy from './networkListProcessConfigStrategy';

describe('NetworkListProcessConfigStrategy', () => {
  let strategy: NetworkListProcessConfigStrategy;

  beforeEach(() => {
    strategy = new NetworkListProcessConfigStrategy();
  });

  describe('transformToManifest', () => {
    it('should return undefined when no network lists are provided', () => {
      const config: AzionConfig = {};
      const result = strategy.transformToManifest(config);
      expect(result).toBeUndefined();
    });

    it('should return undefined when network list array is empty', () => {
      const config: AzionConfig = { networkList: [] };
      const result = strategy.transformToManifest(config);
      expect(result).toBeUndefined();
    });

    it('should transform a single network list to manifest format with default active value', () => {
      const config: AzionConfig = {
        networkList: [
          {
            name: 'test-network-list',
            type: 'ip_cidr' as NetworkListType,
            items: ['192.168.1.1/24', '10.0.0.1/16'],
          },
        ],
      };

      const result = strategy.transformToManifest(config);

      expect(result).toEqual([
        {
          name: 'test-network-list',
          type: 'ip_cidr',
          items: ['192.168.1.1/24', '10.0.0.1/16'],
          active: true,
        },
      ]);
    });

    it('should transform a single network list to manifest format with explicit active value', () => {
      const config: AzionConfig = {
        networkList: [
          {
            name: 'test-network-list',
            type: 'ip_cidr' as NetworkListType,
            items: ['192.168.1.1/24', '10.0.0.1/16'],
            active: false,
          },
        ],
      };

      const result = strategy.transformToManifest(config);

      expect(result).toEqual([
        {
          name: 'test-network-list',
          type: 'ip_cidr',
          items: ['192.168.1.1/24', '10.0.0.1/16'],
          active: false,
        },
      ]);
    });

    it('should transform multiple network lists to manifest format', () => {
      const config: AzionConfig = {
        networkList: [
          {
            name: 'ip-list',
            type: 'ip_cidr' as NetworkListType,
            items: ['192.168.1.1/24', '10.0.0.1/16'],
            active: true,
          },
          {
            name: 'asn-list',
            type: 'asn' as NetworkListType,
            items: ['AS13335', 'AS16509'],
            active: false,
          },
          {
            name: 'countries-list',
            type: 'countries' as NetworkListType,
            items: ['BR', 'US', 'CA'],
            active: true,
          },
        ],
      };

      const result = strategy.transformToManifest(config);

      expect(result).toHaveLength(3);
      expect(result![0].name).toBe('ip-list');
      expect(result![0].type).toBe('ip_cidr');
      expect(result![0].items).toEqual(['192.168.1.1/24', '10.0.0.1/16']);
      expect(result![0].active).toBe(true);

      expect(result![1].name).toBe('asn-list');
      expect(result![1].type).toBe('asn');
      expect(result![1].items).toEqual(['AS13335', 'AS16509']);
      expect(result![1].active).toBe(false);

      expect(result![2].name).toBe('countries-list');
      expect(result![2].type).toBe('countries');
      expect(result![2].items).toEqual(['BR', 'US', 'CA']);
      expect(result![2].active).toBe(true);
    });
  });

  describe('transformToConfig', () => {
    it('should return undefined when no network lists are provided', () => {
      const payload = {};
      const transformedPayload: AzionConfig = {};

      const result = strategy.transformToConfig(payload, transformedPayload);

      expect(result).toBeUndefined();
      expect(transformedPayload.networkList).toBeUndefined();
    });

    it('should return undefined when network list array is empty', () => {
      const payload = { networkList: [] };
      const transformedPayload: AzionConfig = {};

      const result = strategy.transformToConfig(payload, transformedPayload);

      expect(result).toBeUndefined();
      expect(transformedPayload.networkList).toBeUndefined();
    });

    it('should transform a single network list from manifest to config format', () => {
      const payload = {
        networkList: [
          {
            name: 'test-network-list',
            type: 'ip_cidr',
            items: ['192.168.1.1/24', '10.0.0.1/16'],
            active: true,
          },
        ],
      };
      const transformedPayload: AzionConfig = {};

      const result = strategy.transformToConfig(payload, transformedPayload);

      expect(transformedPayload.networkList).toEqual([
        {
          name: 'test-network-list',
          type: 'ip_cidr',
          items: ['192.168.1.1/24', '10.0.0.1/16'],
          active: true,
        },
      ]);
      expect(result).toBe(transformedPayload.networkList);
    });

    it('should transform multiple network lists from manifest to config format', () => {
      const payload = {
        networkList: [
          {
            name: 'ip-list',
            type: 'ip_cidr',
            items: ['192.168.1.1/24', '10.0.0.1/16'],
            active: true,
          },
          {
            name: 'asn-list',
            type: 'asn',
            items: ['AS13335', 'AS16509'],
            active: false,
          },
          {
            name: 'countries-list',
            type: 'countries',
            items: ['BR', 'US', 'CA'],
            active: true,
          },
        ],
      };
      const transformedPayload: AzionConfig = {};

      strategy.transformToConfig(payload, transformedPayload);

      expect(transformedPayload.networkList).toHaveLength(3);
      expect(transformedPayload.networkList![0].name).toBe('ip-list');
      expect(transformedPayload.networkList![0].type).toBe('ip_cidr');
      expect(transformedPayload.networkList![0].items).toEqual(['192.168.1.1/24', '10.0.0.1/16']);
      expect(transformedPayload.networkList![0].active).toBe(true);

      expect(transformedPayload.networkList![1].name).toBe('asn-list');
      expect(transformedPayload.networkList![1].type).toBe('asn');
      expect(transformedPayload.networkList![1].items).toEqual(['AS13335', 'AS16509']);
      expect(transformedPayload.networkList![1].active).toBe(false);

      expect(transformedPayload.networkList![2].name).toBe('countries-list');
      expect(transformedPayload.networkList![2].type).toBe('countries');
      expect(transformedPayload.networkList![2].items).toEqual(['BR', 'US', 'CA']);
      expect(transformedPayload.networkList![2].active).toBe(true);
    });

    it('should handle existing network lists in transformedPayload', () => {
      const payload = {
        networkList: [
          {
            name: 'new-network-list',
            type: 'ip_cidr',
            items: ['192.168.1.1/24'],
            active: true,
          },
        ],
      };
      const transformedPayload: AzionConfig = {
        networkList: [
          {
            name: 'existing-network-list',
            type: 'countries' as NetworkListType,
            items: ['US', 'CA'],
            active: true,
          },
        ],
      };

      strategy.transformToConfig(payload, transformedPayload);

      // The transformToConfig method replaces the existing networkList array
      expect(transformedPayload.networkList).toHaveLength(1);
      expect(transformedPayload.networkList![0].name).toBe('new-network-list');
      expect(transformedPayload.networkList![0].type).toBe('ip_cidr');
      expect(transformedPayload.networkList![0].items).toEqual(['192.168.1.1/24']);
    });
  });
});
