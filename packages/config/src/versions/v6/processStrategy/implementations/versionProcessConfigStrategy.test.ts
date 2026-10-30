import type { AzionConfigV6 } from '../../types';
import VersionProcessConfigStrategy from './versionProcessConfigStrategy';

describe('VersionProcessConfigStrategy (v6)', () => {
  let strategy: VersionProcessConfigStrategy;

  beforeEach(() => {
    strategy = new VersionProcessConfigStrategy();
  });

  describe('transformToManifest', () => {
    it('should write the version of the config to the manifest', () => {
      expect(strategy.transformToManifest({ version: 6 })).toBe(6);
    });
  });

  describe('transformToConfig', () => {
    it('should read the version of the manifest into the config', () => {
      const transformedPayload: AzionConfigV6 = { version: 6 };

      const result = strategy.transformToConfig({ version: 6 }, transformedPayload);

      expect(result).toBe(6);
      expect(transformedPayload.version).toBe(6);
    });

    it('should keep the version of the config when the manifest has none', () => {
      const transformedPayload: AzionConfigV6 = { version: 6 };

      const result = strategy.transformToConfig({}, transformedPayload);

      expect(result).toBe(6);
      expect(transformedPayload.version).toBe(6);
    });
  });
});
