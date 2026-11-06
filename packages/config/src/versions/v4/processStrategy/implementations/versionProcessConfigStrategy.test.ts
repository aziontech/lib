import type { AzionConfig } from '../../../../types';
import VersionProcessConfigStrategy from './versionProcessConfigStrategy';

describe('VersionProcessConfigStrategy (v4)', () => {
  let strategy: VersionProcessConfigStrategy;

  beforeEach(() => {
    strategy = new VersionProcessConfigStrategy();
  });

  describe('transformToManifest', () => {
    it('should write the version of the config to the manifest', () => {
      expect(strategy.transformToManifest({ version: 4 })).toBe(4);
    });

    it('should write the API version 4 when the config does not declare one', () => {
      expect(strategy.transformToManifest({})).toBe(4);
    });
  });

  describe('transformToConfig', () => {
    it('should read the version of the manifest into the config', () => {
      const transformedPayload: AzionConfig = {};

      const result = strategy.transformToConfig({ version: 4 }, transformedPayload);

      expect(result).toBe(4);
      expect(transformedPayload.version).toBe(4);
    });

    it('should leave the config without version when the manifest has none', () => {
      const transformedPayload: AzionConfig = {};

      const result = strategy.transformToConfig({}, transformedPayload);

      expect(result).toBeUndefined();
      expect(transformedPayload.version).toBeUndefined();
    });
  });
});
