import { AzionConfig, FunctionExecutionEnvironment } from '../../../types';
import FunctionsProcessConfigStrategy from './functionsProcessConfigStrategy';

describe('FunctionsProcessConfigStrategy', () => {
  let strategy: FunctionsProcessConfigStrategy;

  beforeEach(() => {
    strategy = new FunctionsProcessConfigStrategy();
  });

  describe('transformToManifest', () => {
    it('should return empty array when no functions are provided', () => {
      const config: AzionConfig = {};
      const result = strategy.transformToManifest(config);
      expect(result).toEqual([]);
    });

    it('should return empty array when functions array is empty', () => {
      const config: AzionConfig = { functions: [] };
      const result = strategy.transformToManifest(config);
      expect(result).toEqual([]);
    });

    it('should transform a basic function configuration to manifest format', () => {
      const config: AzionConfig = {
        functions: [
          {
            name: 'test-function',
            path: './functions/test-function.js',
            runtime: 'azion_js',
            active: true,
          },
        ],
      };

      const result = strategy.transformToManifest(config);

      expect(result).toEqual([
        {
          name: 'test-function',
          runtime: 'azion_js',
          default_args: {},
          execution_environment: 'application',
          active: true,
          path: './functions/test-function.js',
          bindings: undefined,
        },
      ]);
    });

    it('should use default values when optional properties are not provided', () => {
      const config: AzionConfig = {
        functions: [
          {
            name: 'minimal-function',
            path: './functions/minimal-function.js',
          },
        ],
      };

      const result = strategy.transformToManifest(config);

      expect(result).toEqual([
        {
          name: 'minimal-function',
          runtime: 'azion_js',
          default_args: {},
          execution_environment: 'application',
          active: true,
          path: './functions/minimal-function.js',
          bindings: undefined,
        },
      ]);
    });

    it('should transform a complete function configuration to manifest format', () => {
      const config: AzionConfig = {
        storage: [
          {
            name: 'my-bucket',
            dir: './public',
            prefix: 'assets',
          },
        ],
        functions: [
          {
            name: 'complete-function',
            path: './functions/complete-function.js',
            runtime: 'azion_js',
            defaultArgs: { key: 'value' },
            executionEnvironment: 'firewall' as FunctionExecutionEnvironment,
            active: false,
            bindings: {
              storage: {
                bucket: 'my-bucket',
              },
            },
          },
        ],
      };

      const result = strategy.transformToManifest(config);

      expect(result).toEqual([
        {
          name: 'complete-function',
          runtime: 'azion_js',
          default_args: { key: 'value' },
          execution_environment: 'firewall',
          active: false,
          path: './functions/complete-function.js',
          bindings: {
            storage: {
              bucket: 'my-bucket',
            },
          },
        },
      ]);
    });

    it('should transform multiple functions to manifest format', () => {
      const config: AzionConfig = {
        functions: [
          {
            name: 'function-1',
            path: './functions/function-1.js',
          },
          {
            name: 'function-2',
            path: './functions/function-2.js',
            runtime: 'azion_js',
          },
        ],
      };

      const result = strategy.transformToManifest(config);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('function-1');
      expect(result[1].name).toBe('function-2');
      expect(result[1].runtime).toBe('azion_js');
    });

    it('should validate storage binding reference and throw error for non-existent bucket', () => {
      const config: AzionConfig = {
        functions: [
          {
            name: 'function-with-invalid-storage',
            path: './functions/function-with-invalid-storage.js',
            bindings: {
              storage: {
                bucket: 'non-existent-bucket',
              },
            },
          },
        ],
      };

      expect(() => strategy.transformToManifest(config)).toThrow(
        'Function "function-with-invalid-storage" references storage bucket "non-existent-bucket" which is not defined in the storage configuration.',
      );
    });

    it('should validate storage binding reference and not throw error for valid bucket', () => {
      const config: AzionConfig = {
        storage: [
          {
            name: 'valid-bucket',
            dir: './public',
            prefix: 'assets',
          },
        ],
        functions: [
          {
            name: 'function-with-valid-storage',
            path: './functions/function-with-valid-storage.js',
            bindings: {
              storage: {
                bucket: 'valid-bucket',
              },
            },
          },
        ],
      };

      expect(() => strategy.transformToManifest(config)).not.toThrow();
    });

    it('should not validate storage binding if bucket is a number (ID)', () => {
      const config: AzionConfig = {
        functions: [
          {
            name: 'function-with-id-storage',
            path: './functions/function-with-id-storage.js',
            bindings: {
              storage: {
                bucket: 123 as unknown as string, // Type assertion to handle the number case
              },
            },
          },
        ],
      };

      expect(() => strategy.transformToManifest(config)).not.toThrow();
    });
  });

  describe('transformToConfig', () => {
    it('should not modify transformedPayload when no functions are provided', () => {
      const payload = {};
      const transformedPayload: AzionConfig = {};
      strategy.transformToConfig(payload, transformedPayload);
      expect(transformedPayload.functions).toBeUndefined();
    });

    it('should not modify transformedPayload when functions array is empty', () => {
      const payload = { functions: [] };
      const transformedPayload: AzionConfig = {};
      strategy.transformToConfig(payload, transformedPayload);
      expect(transformedPayload.functions).toBeUndefined();
    });

    it('should transform a basic function manifest to config format', () => {
      const payload = {
        functions: [
          {
            name: 'test-function',
            runtime: 'azion_js',
            default_args: {},
            execution_environment: 'application',
            active: true,
          },
        ],
      };
      const transformedPayload: AzionConfig = {};

      strategy.transformToConfig(payload, transformedPayload);

      expect(transformedPayload.functions).toEqual([
        {
          name: 'test-function',
          path: './functions/test-function.js',
          runtime: 'azion_js',
          defaultArgs: {},
          executionEnvironment: 'application',
          active: true,
        },
      ]);
    });

    it('should transform a complete function manifest to config format', () => {
      const payload = {
        functions: [
          {
            name: 'complete-function',
            runtime: 'azion_js',
            default_args: { key: 'value' },
            execution_environment: 'firewall',
            active: false,
          },
        ],
      };
      const transformedPayload: AzionConfig = {};

      strategy.transformToConfig(payload, transformedPayload);

      expect(transformedPayload.functions).toEqual([
        {
          name: 'complete-function',
          path: './functions/complete-function.js',
          runtime: 'azion_js',
          defaultArgs: { key: 'value' },
          executionEnvironment: 'firewall',
          active: false,
        },
      ]);
    });

    it('should transform multiple function manifests to config format', () => {
      const payload = {
        functions: [
          {
            name: 'function-1',
            runtime: 'azion_js',
            default_args: {},
            execution_environment: 'application',
            active: true,
          },
          {
            name: 'function-2',
            runtime: 'azion_js',
            default_args: { test: true },
            execution_environment: 'firewall',
            active: false,
          },
        ],
      };
      const transformedPayload: AzionConfig = {};

      strategy.transformToConfig(payload, transformedPayload);

      expect(transformedPayload.functions).toHaveLength(2);
      expect(transformedPayload.functions![0].name).toBe('function-1');
      expect(transformedPayload.functions![1].name).toBe('function-2');
      expect(transformedPayload.functions![0].runtime).toBe('azion_js');
      expect(transformedPayload.functions![1].runtime).toBe('azion_js');
    });

    it('should handle existing functions in transformedPayload', () => {
      const payload = {
        functions: [
          {
            name: 'new-function',
            runtime: 'azion_js',
            default_args: {},
            execution_environment: 'application',
            active: true,
          },
        ],
      };
      const transformedPayload: AzionConfig = {
        functions: [
          {
            name: 'existing-function',
            path: './functions/existing-function.js',
            runtime: 'azion_js',
          },
        ],
      };

      strategy.transformToConfig(payload, transformedPayload);

      // The transformToConfig method replaces the existing functions array
      expect(transformedPayload.functions).toHaveLength(1);
      expect(transformedPayload.functions![0].name).toBe('new-function');
    });
  });
});
