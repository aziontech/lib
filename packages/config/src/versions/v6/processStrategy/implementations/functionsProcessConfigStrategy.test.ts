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
          active: true,
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
            active: false,
          },
        ],
      });

      expect(result).toEqual([
        {
          name: 'my-function',
          runtime: 'azion_js',
          default_args: { key: 'value' },
          execution_environment: 'firewall',
          active: false,
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
              active: false,
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
          active: false,
        },
      ]);
    });
  });
});
