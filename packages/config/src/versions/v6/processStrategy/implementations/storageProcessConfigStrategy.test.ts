import type { AzionConfigV6 } from '../../types';
import StorageProcessConfigStrategy from './storageProcessConfigStrategy';

describe('StorageProcessConfigStrategy (v6)', () => {
  let strategy: StorageProcessConfigStrategy;

  beforeEach(() => {
    strategy = new StorageProcessConfigStrategy();
  });

  describe('transformToManifest', () => {
    it('should return undefined when there is no storage', () => {
      expect(strategy.transformToManifest({ version: 6 })).toBeUndefined();
      expect(strategy.transformToManifest({ version: 6, storage: [] })).toBeUndefined();
    });

    it('should default workloads_access to read_only and leave the prefix out when it is not set', () => {
      expect(strategy.transformToManifest({ version: 6, storage: [{ name: 'my-bucket', dir: './dist' }] })).toEqual([
        { name: 'my-bucket', workloads_access: 'read_only', dir: './dist' },
      ]);
    });

    it('should map every field of the storage to the manifest', () => {
      expect(
        strategy.transformToManifest({
          version: 6,
          storage: [{ name: 'my-bucket', dir: './dist', workloadsAccess: 'restricted', prefix: 'assets' }],
        }),
      ).toEqual([{ name: 'my-bucket', workloads_access: 'restricted', dir: './dist', prefix: 'assets' }]);
    });
  });

  describe('transformToConfig', () => {
    it('should not set storage when the manifest has none', () => {
      const transformedPayload: AzionConfigV6 = { version: 6 };

      expect(strategy.transformToConfig({}, transformedPayload)).toBeUndefined();
      expect(transformedPayload.storage).toBeUndefined();
    });

    it('should map the manifest storage back to the config', () => {
      const transformedPayload: AzionConfigV6 = { version: 6 };

      strategy.transformToConfig(
        { storage: [{ name: 'my-bucket', workloads_access: 'read_write', dir: './dist', prefix: 'p' }] },
        transformedPayload,
      );

      expect(transformedPayload.storage).toEqual([
        { name: 'my-bucket', workloadsAccess: 'read_write', dir: './dist', prefix: 'p' },
      ]);
    });
  });
});
