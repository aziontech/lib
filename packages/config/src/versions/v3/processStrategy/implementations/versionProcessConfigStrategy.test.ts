import type { AzionConfig } from '../../types';
import VersionProcessConfigStrategy from './versionProcessConfigStrategy';

describe('VersionProcessConfigStrategy (v3)', () => {
  let strategy: VersionProcessConfigStrategy;

  beforeEach(() => {
    strategy = new VersionProcessConfigStrategy();
  });

  describe('transformToManifest', () => {
    it('should write the version of the config to the manifest', () => {
      expect(strategy.transformToManifest({ version: 3 })).toBe(3);
    });

    it('should write the API version 3 when the config does not declare one', () => {
      expect(strategy.transformToManifest({})).toBe(3);
    });
  });

  describe('transformToConfig', () => {
    it('should read the version of the manifest into the config', () => {
      const transformedPayload: AzionConfig = {};

      const result = strategy.transformToConfig({ version: 3 }, transformedPayload);

      expect(result).toBe(3);
      expect(transformedPayload.version).toBe(3);
    });

    it('should leave the config without version when the manifest has none', () => {
      const transformedPayload: AzionConfig = {};

      const result = strategy.transformToConfig({}, transformedPayload);

      expect(result).toBeUndefined();
      expect(transformedPayload.version).toBeUndefined();
    });
  });
});
