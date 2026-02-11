import { AzionConfig } from '../../../types';
import KvProcessConfigStrategy from './kvProcessConfigStrategy';

describe('KvProcessConfigStrategy', () => {
  let strategy: KvProcessConfigStrategy;

  beforeEach(() => {
    strategy = new KvProcessConfigStrategy();
  });

  describe('transformToManifest', () => {
    it('should return undefined when no kv is provided', () => {
      const config: AzionConfig = {};
      const result = strategy.transformToManifest(config);
      expect(result).toBeUndefined();
    });

    it('should return undefined when kv array is empty', () => {
      const config: AzionConfig = { kv: [] };
      const result = strategy.transformToManifest(config);
      expect(result).toBeUndefined();
    });

    it('should transform a basic kv configuration to manifest format', () => {
      const config: AzionConfig = {
        kv: [
          {
            name: 'my-kv',
          },
        ],
      };

      const result = strategy.transformToManifest(config);

      expect(result).toEqual([
        {
          name: 'my-kv',
        },
      ]);
    });

    it('should transform multiple kv configurations to manifest format', () => {
      const config: AzionConfig = {
        kv: [
          {
            name: 'kv-1',
          },
          {
            name: 'kv-2',
          },
        ],
      };

      const result = strategy.transformToManifest(config);

      expect(result).toHaveLength(2);
      expect(result![0].name).toBe('kv-1');
      expect(result![1].name).toBe('kv-2');
    });
  });

  describe('transformToConfig', () => {
    it('should return undefined when no kv is provided', () => {
      const payload = {};
      const transformedPayload: AzionConfig = {};
      const result = strategy.transformToConfig(payload, transformedPayload);
      expect(result).toBeUndefined();
    });

    it('should return undefined when kv array is empty', () => {
      const payload = { kv: [] };
      const transformedPayload: AzionConfig = {};
      const result = strategy.transformToConfig(payload, transformedPayload);
      expect(result).toBeUndefined();
    });

    it('should transform a basic kv manifest to config format', () => {
      const payload = {
        kv: [
          {
            name: 'my-kv',
          },
        ],
      };
      const transformedPayload: AzionConfig = {};

      const result = strategy.transformToConfig(payload, transformedPayload);

      expect(result).toEqual([
        {
          name: 'my-kv',
        },
      ]);
      expect(transformedPayload.kv).toEqual([
        {
          name: 'my-kv',
        },
      ]);
    });

    it('should transform multiple kv manifests to config format', () => {
      const payload = {
        kv: [
          {
            name: 'kv-1',
          },
          {
            name: 'kv-2',
          },
        ],
      };
      const transformedPayload: AzionConfig = {};

      const result = strategy.transformToConfig(payload, transformedPayload);

      expect(result).toHaveLength(2);
      expect(result![0].name).toBe('kv-1');
      expect(result![1].name).toBe('kv-2');
      expect(transformedPayload.kv).toEqual(result);
    });

    it('should handle existing kv in transformedPayload', () => {
      const payload = {
        kv: [
          {
            name: 'new-kv',
          },
        ],
      };
      const transformedPayload: AzionConfig = {
        kv: [
          {
            name: 'existing-kv',
          },
        ],
      };

      strategy.transformToConfig(payload, transformedPayload);

      // The transformToConfig method replaces the existing kv array
      expect(transformedPayload.kv).toHaveLength(1);
      expect(transformedPayload.kv![0].name).toBe('new-kv');
    });
  });
});
