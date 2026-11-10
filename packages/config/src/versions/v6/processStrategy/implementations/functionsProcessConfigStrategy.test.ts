import type { AzionConfigV6 } from '../../types';
import FunctionsProcessConfigStrategy from './functionsProcessConfigStrategy';

describe('FunctionsProcessConfigStrategy (v6)', () => {
  let strategy: FunctionsProcessConfigStrategy;

  beforeEach(() => {
    strategy = new FunctionsProcessConfigStrategy();
  });

  describe('transformToManifest', () => {
    it('should return an empty array when there are no functions', () => {
      expect(strategy.transformToManifest({ version: 6 })).toEqual([]);
      expect(strategy.transformToManifest({ version: 6, functions: [] })).toEqual([]);
    });

    it('should apply the defaults to a minimal function', () => {
      const result = strategy.transformToManifest({
        version: 6,
        functions: [{ name: 'my-function', path: './functions/index.js' }],
      });

      expect(result).toEqual([
        {
          name: 'my-function',
          runtime: 'azion_js',
          default_args: {},
          execution_environment: 'application',
          path: './functions/index.js',
        },
      ]);
    });

    it('should map every field of the function to the manifest', () => {
      const result = strategy.transformToManifest({
        version: 6,
        functions: [
          {
            name: 'my-function',
            path: './functions/index.js',
            runtime: 'azion_js',
            defaultArgs: { key: 'value' },
            executionEnvironment: 'firewall',
          },
        ],
      });

      expect(result).toEqual([
        {
          name: 'my-function',
          runtime: 'azion_js',
          default_args: { key: 'value' },
          execution_environment: 'firewall',
          path: './functions/index.js',
        },
      ]);
    });
  });

  describe('bindings', () => {
    const withBinding = (bucket: string, storage?: AzionConfigV6['storage']): AzionConfigV6 => ({
      version: 6,
      storage,
      functions: [
        { name: 'my-function', path: './functions/index.js', bindings: { storage: { bucket, prefix: 'p' } } },
      ],
    });

    it('should write the bindings to the manifest', () => {
      const [func] = strategy.transformToManifest(
        withBinding('my-bucket', [{ name: 'my-bucket', dir: './dist', prefix: 'p' }]),
      );

      expect(func.bindings).toEqual({ storage: { bucket: 'my-bucket', prefix: 'p' } });
    });

    it('should leave the bindings out of the manifest when the function has none', () => {
      const [func] = strategy.transformToManifest({ version: 6, functions: [{ name: 'f', path: './f.js' }] });

      expect(func.bindings).toBeUndefined();
    });

    it('should throw when the storage bucket of a binding is not defined', () => {
      const message =
        'Function "my-function" references storage bucket "my-bucket" which is not defined in the storage configuration.';

      expect(() => strategy.transformToManifest(withBinding('my-bucket'))).toThrow(message);
      expect(() =>
        strategy.transformToManifest(withBinding('my-bucket', [{ name: 'other-bucket', dir: './dist' }])),
      ).toThrow(message);
    });

    it('should not validate a bucket referenced by id', () => {
      expect(() => strategy.transformToManifest(withBinding(10 as unknown as string))).not.toThrow();
    });
  });

  describe('transformToConfig', () => {
    it('should not set functions when the manifest has none', () => {
      const transformedPayload: AzionConfigV6 = { version: 6 };

      expect(strategy.transformToConfig({}, transformedPayload)).toBeUndefined();
      expect(transformedPayload.functions).toBeUndefined();
    });

    it('should map the manifest functions back to the config', () => {
      const transformedPayload: AzionConfigV6 = { version: 6 };

      strategy.transformToConfig(
        {
          functions: [
            {
              name: 'my-function',
              runtime: 'azion_js',
              default_args: { key: 'value' },
              execution_environment: 'firewall',
            },
          ],
        },
        transformedPayload,
      );

      expect(transformedPayload.functions).toEqual([
        {
          name: 'my-function',
          path: './functions/my-function.js',
          runtime: 'azion_js',
          defaultArgs: { key: 'value' },
          executionEnvironment: 'firewall',
        },
      ]);
    });
  });

  describe('dependencies', () => {
    const config = (dependencies: object[], extra: Partial<AzionConfigV6> = {}) =>
      ({
        version: 6,
        connectors: [{ name: 'my-origin', type: 'live_ingest', attributes: { region: 'us-east-1' } }],
        networkList: [{ name: 'my-list', type: 'countries', items: ['BR'] }],
        functions: [{ name: 'fn', path: './fn.js', dependencies }],
        ...extra,
      }) as AzionConfigV6;

    it('should write the dependencies with the name or the ID of the resource', () => {
      const [fn] = strategy.transformToManifest(
        config([
          { type: 'connector', ref: 'my-origin' },
          { type: 'network_list', ref: 'my-list' },
          { type: 'connector', ref: 10 },
        ]),
      );

      expect(fn.dependencies).toEqual([
        { type: 'connector', id: 'my-origin' },
        { type: 'network_list', id: 'my-list' },
        { type: 'connector', id: 10 },
      ]);
    });

    it('should not write dependencies when the function has none', () => {
      expect(strategy.transformToManifest(config([]))[0]).not.toHaveProperty('dependencies');
    });

    it('should throw when the connector or network list is not declared', () => {
      expect(() => strategy.transformToManifest(config([{ type: 'connector', ref: 'other' }]))).toThrow(
        'Function "fn" depends on non-existent Connector "other".',
      );
      expect(() => strategy.transformToManifest(config([{ type: 'network_list', ref: 'my-origin' }]))).toThrow(
        'Function "fn" depends on non-existent Network List "my-origin".',
      );
    });

    it('should read the dependencies back from the manifest', () => {
      const transformedPayload: AzionConfigV6 = { version: 6 };

      strategy.transformToConfig(
        { functions: [{ name: 'fn', dependencies: [{ type: 'connector', id: 'my-origin' }] }] },
        transformedPayload,
      );

      expect(transformedPayload.functions?.[0].dependencies).toEqual([{ type: 'connector', ref: 'my-origin' }]);
    });
  });
});
