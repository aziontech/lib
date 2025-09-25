import { AzionConfig } from '../../../types';
import PurgeProcessConfigStrategy from './purgeProcessConfigStrategy';

describe('PurgeProcessConfigStrategy', () => {
  let strategy: PurgeProcessConfigStrategy;

  beforeEach(() => {
    strategy = new PurgeProcessConfigStrategy();
  });

  describe('transformToManifest', () => {
    it('should return undefined when no purge is provided', () => {
      const config: AzionConfig = {};
      const result = strategy.transformToManifest(config);
      expect(result).toBeUndefined();
    });

    it('should return undefined when purge array is empty', () => {
      const config: AzionConfig = { purge: [] };
      const result = strategy.transformToManifest(config);
      expect(result).toBeUndefined();
    });

    it('should transform a basic purge configuration to manifest format', () => {
      const config: AzionConfig = {
        purge: [
          {
            type: 'url',
            items: ['https://example.com/path'],
            layer: 'edge_cache',
          },
        ],
      };

      const result = strategy.transformToManifest(config);

      expect(result).toEqual([
        {
          type: 'url',
          items: ['https://example.com/path'],
          layer: 'edge_cache',
        },
      ]);
    });

    it('should use default layer when not provided', () => {
      const config: AzionConfig = {
        purge: [
          {
            type: 'url',
            items: ['https://example.com/path'],
          },
        ],
      };

      const result = strategy.transformToManifest(config);

      expect(result![0].layer).toBe('edge_cache');
    });

    it('should transform multiple purge configurations to manifest format', () => {
      const config: AzionConfig = {
        purge: [
          {
            type: 'url',
            items: ['https://example.com/path1'],
            layer: 'edge_cache',
          },
          {
            type: 'wildcard',
            items: ['https://example.com/path*'],
            layer: 'tiered_cache',
          },
        ],
      };

      const result = strategy.transformToManifest(config);

      expect(result).toHaveLength(2);
      expect(result![0].type).toBe('url');
      expect(result![1].type).toBe('wildcard');
      expect(result![0].layer).toBe('edge_cache');
      expect(result![1].layer).toBe('tiered_cache');
    });

    it('should throw error when URL type does not contain protocol', () => {
      const config: AzionConfig = {
        purge: [
          {
            type: 'url',
            items: ['example.com/path'], // Missing protocol
          },
        ],
      };

      expect(() => strategy.transformToManifest(config)).toThrow(
        'The URL must contain the protocol (http:// or https://).',
      );
    });

    it('should throw error when wildcard type does not contain asterisk', () => {
      const config: AzionConfig = {
        purge: [
          {
            type: 'wildcard',
            items: ['https://example.com/path'], // Missing asterisk
          },
        ],
      };

      expect(() => strategy.transformToManifest(config)).toThrow(
        'The URL must not contain the wildcard character (*).',
      );
    });

    it('should handle multiple items in a single purge configuration', () => {
      const config: AzionConfig = {
        purge: [
          {
            type: 'url',
            items: ['https://example.com/path1', 'https://example.com/path2', 'http://example.org/path3'],
          },
        ],
      };

      const result = strategy.transformToManifest(config);

      expect(result![0].items).toHaveLength(3);
      expect(result![0].items).toContain('https://example.com/path1');
      expect(result![0].items).toContain('https://example.com/path2');
      expect(result![0].items).toContain('http://example.org/path3');
    });
  });

  describe('transformToConfig', () => {
    it('should return undefined when no purge is provided', () => {
      const payload = {};
      const transformedPayload: AzionConfig = {};
      const result = strategy.transformToConfig(payload, transformedPayload);
      expect(result).toBeUndefined();
    });

    it('should return undefined when purge array is empty', () => {
      const payload = { purge: [] };
      const transformedPayload: AzionConfig = {};
      const result = strategy.transformToConfig(payload, transformedPayload);
      expect(result).toBeUndefined();
    });

    it('should transform a basic purge manifest to config format', () => {
      const payload = {
        purge: [
          {
            type: 'url',
            items: ['https://example.com/path'],
            layer: 'edge_cache',
          },
        ],
      };
      const transformedPayload: AzionConfig = {};

      const result = strategy.transformToConfig(payload, transformedPayload);

      expect(result).toEqual([
        {
          type: 'url',
          items: ['https://example.com/path'],
          layer: 'edge_cache',
        },
      ]);
      expect(transformedPayload.purge).toEqual([
        {
          type: 'url',
          items: ['https://example.com/path'],
          layer: 'edge_cache',
        },
      ]);
    });

    it('should use default layer when not provided', () => {
      const payload = {
        purge: [
          {
            type: 'url',
            items: ['https://example.com/path'],
          },
        ],
      };
      const transformedPayload: AzionConfig = {};

      const result = strategy.transformToConfig(payload, transformedPayload);

      expect(result![0].layer).toBe('edge_cache');
    });

    it('should transform multiple purge manifests to config format', () => {
      const payload = {
        purge: [
          {
            type: 'url',
            items: ['https://example.com/path1'],
            layer: 'edge_cache',
          },
          {
            type: 'wildcard',
            items: ['https://example.com/path*'],
            layer: 'tiered_cache',
          },
        ],
      };
      const transformedPayload: AzionConfig = {};

      const result = strategy.transformToConfig(payload, transformedPayload);

      expect(result).toHaveLength(2);
      expect(result![0].type).toBe('url');
      expect(result![1].type).toBe('wildcard');
      expect(transformedPayload.purge).toHaveLength(2);
    });

    it('should throw error when URL type does not contain protocol', () => {
      const payload = {
        purge: [
          {
            type: 'url',
            items: ['example.com/path'], // Missing protocol
          },
        ],
      };
      const transformedPayload: AzionConfig = {};

      expect(() => strategy.transformToConfig(payload, transformedPayload)).toThrow(
        'The URL must contain the protocol (http:// or https://).',
      );
    });

    it('should throw error when wildcard type does not contain asterisk', () => {
      const payload = {
        purge: [
          {
            type: 'wildcard',
            items: ['https://example.com/path'], // Missing asterisk
          },
        ],
      };
      const transformedPayload: AzionConfig = {};

      expect(() => strategy.transformToConfig(payload, transformedPayload)).toThrow(
        'The URL must not contain the wildcard character (*).',
      );
    });

    it('should handle existing purge in transformedPayload', () => {
      const payload = {
        purge: [
          {
            type: 'url',
            items: ['https://example.com/new-path'],
            layer: 'edge_cache',
          },
        ],
      };
      const transformedPayload: AzionConfig = {
        purge: [
          {
            type: 'url',
            items: ['https://example.com/existing-path'],
            layer: 'edge_cache',
          },
        ],
      };

      strategy.transformToConfig(payload, transformedPayload);

      // The transformToConfig method replaces the existing purge array
      expect(transformedPayload.purge).toHaveLength(1);
      expect(transformedPayload.purge![0].items[0]).toBe('https://example.com/new-path');
    });

    it('should handle multiple items in a single purge configuration', () => {
      const payload = {
        purge: [
          {
            type: 'url',
            items: ['https://example.com/path1', 'https://example.com/path2', 'http://example.org/path3'],
          },
        ],
      };
      const transformedPayload: AzionConfig = {};

      const result = strategy.transformToConfig(payload, transformedPayload);

      expect(result![0].items).toHaveLength(3);
      expect(result![0].items).toContain('https://example.com/path1');
      expect(result![0].items).toContain('https://example.com/path2');
      expect(result![0].items).toContain('http://example.org/path3');
    });
  });
});
