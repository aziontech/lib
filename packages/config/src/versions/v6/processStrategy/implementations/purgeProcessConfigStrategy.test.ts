import type { AzionConfigV6 } from '../../types';
import PurgeProcessConfigStrategy from './purgeProcessConfigStrategy';

describe('PurgeProcessConfigStrategy (v6)', () => {
  let strategy: PurgeProcessConfigStrategy;

  beforeEach(() => {
    strategy = new PurgeProcessConfigStrategy();
  });

  describe('transformToManifest', () => {
    it('should return undefined when there is no purge', () => {
      expect(strategy.transformToManifest({ version: 6 })).toBeUndefined();
      expect(strategy.transformToManifest({ version: 6, purge: [] })).toBeUndefined();
    });

    it('should map a purge to the manifest and default the layer to cache', () => {
      const config: AzionConfigV6 = {
        version: 6,
        purge: [
          { type: 'url', items: ['https://example.com/path'] },
          { type: 'wildcard', items: ['https://example.com/path*'], layer: 'tiered_cache' },
          { type: 'cachekey', items: ['example.com/path'] },
        ],
      };

      expect(strategy.transformToManifest(config)).toEqual([
        { type: 'url', items: ['https://example.com/path'], layer: 'cache' },
        { type: 'wildcard', items: ['https://example.com/path*'], layer: 'tiered_cache' },
        { type: 'cachekey', items: ['example.com/path'], layer: 'cache' },
      ]);
    });

    it('should throw when a url item has no protocol', () => {
      expect(() =>
        strategy.transformToManifest({ version: 6, purge: [{ type: 'url', items: ['example.com/path'] }] }),
      ).toThrow('The URL must contain the protocol (http:// or https://).');
    });

    it('should throw when a wildcard item has no asterisk', () => {
      expect(() =>
        strategy.transformToManifest({
          version: 6,
          purge: [{ type: 'wildcard', items: ['https://example.com/path'] }],
        }),
      ).toThrow('The wildcard purge must contain the wildcard character (*).');
    });
  });

  describe('transformToConfig', () => {
    it('should return undefined when the manifest has no purge', () => {
      const transformedPayload: AzionConfigV6 = { version: 6 };

      expect(strategy.transformToConfig({}, transformedPayload)).toBeUndefined();
      expect(strategy.transformToConfig({ purge: [] }, transformedPayload)).toBeUndefined();
      expect(transformedPayload.purge).toBeUndefined();
    });

    it('should map the manifest back to the config and replace an existing purge', () => {
      const transformedPayload: AzionConfigV6 = {
        version: 6,
        purge: [{ type: 'url', items: ['https://example.com/old'] }],
      };

      const result = strategy.transformToConfig(
        { purge: [{ type: 'url', items: ['https://example.com/new'] }] },
        transformedPayload,
      );

      expect(result).toEqual([{ type: 'url', items: ['https://example.com/new'], layer: 'cache' }]);
      expect(transformedPayload.purge).toEqual(result);
    });

    it('should apply the same item checks as the config', () => {
      const transformedPayload: AzionConfigV6 = { version: 6 };

      expect(() =>
        strategy.transformToConfig({ purge: [{ type: 'url', items: ['example.com'] }] }, transformedPayload),
      ).toThrow('The URL must contain the protocol (http:// or https://).');
      expect(() =>
        strategy.transformToConfig(
          { purge: [{ type: 'wildcard', items: ['https://example.com'] }] },
          transformedPayload,
        ),
      ).toThrow('The wildcard purge must contain the wildcard character (*).');
    });
  });
});
