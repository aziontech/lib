import { AzionConfig, AzionFunctionInstance } from '../../../../types';
import FunctionInstancesProcessConfigStrategy from './functionInstancesProcessConfigStrategy';

describe('FunctionInstancesProcessConfigStrategy', () => {
  let strategy: FunctionInstancesProcessConfigStrategy;

  beforeEach(() => {
    strategy = new FunctionInstancesProcessConfigStrategy();
  });

  describe('transformToManifest', () => {
    it('should return undefined when no function instances are provided', () => {
      const config: AzionConfig = {};
      const result = strategy.transformToManifest(undefined as unknown as AzionFunctionInstance[], config);
      expect(result).toBeUndefined();
    });

    it('should return undefined when function instances array is empty', () => {
      const config: AzionConfig = {};
      const result = strategy.transformToManifest([], config);
      expect(result).toBeUndefined();
    });

    it('should transform a single function instance to manifest format with default values', () => {
      const config: AzionConfig = {
        functions: [{ name: 'my-function', path: './functions/my-function.js' }],
      };
      const functionInstances: AzionFunctionInstance[] = [
        {
          name: 'my-function-instance',
          ref: 'my-function',
        },
      ];

      const result = strategy.transformToManifest(functionInstances, config);

      expect(result).toEqual([
        {
          name: 'my-function-instance',
          function: 'my-function',
          args: {},
          active: true,
        },
      ]);
    });

    it('should transform a function instance with explicit args and active value', () => {
      const config: AzionConfig = {
        functions: [{ name: 'my-function', path: './functions/my-function.js' }],
      };
      const functionInstances: AzionFunctionInstance[] = [
        {
          name: 'my-function-instance',
          ref: 'my-function',
          args: { key: 'value' },
          active: false,
        },
      ];

      const result = strategy.transformToManifest(functionInstances, config);

      expect(result).toEqual([
        {
          name: 'my-function-instance',
          function: 'my-function',
          args: { key: 'value' },
          active: false,
        },
      ]);
    });

    it('should not validate function reference when ref is a number (ID)', () => {
      const config: AzionConfig = {};
      const functionInstances: AzionFunctionInstance[] = [
        {
          name: 'my-function-instance',
          ref: 123,
        },
      ];

      expect(() => strategy.transformToManifest(functionInstances, config)).not.toThrow();

      const result = strategy.transformToManifest(functionInstances, config);
      expect(result![0].function).toBe(123);
    });

    it('should throw an error when function instance references a non-existent function', () => {
      const config: AzionConfig = {
        functions: [{ name: 'existing-function', path: './functions/existing-function.js' }],
      };
      const functionInstances: AzionFunctionInstance[] = [
        {
          name: 'my-function-instance',
          ref: 'non-existent-function',
        },
      ];

      expect(() => strategy.transformToManifest(functionInstances, config)).toThrow(
        'Function instance "my-function-instance" references non-existent Function "non-existent-function".',
      );
    });

    it('should transform multiple function instances to manifest format', () => {
      const config: AzionConfig = {
        functions: [
          { name: 'function-1', path: './functions/function-1.js' },
          { name: 'function-2', path: './functions/function-2.js' },
        ],
      };
      const functionInstances: AzionFunctionInstance[] = [
        { name: 'instance-1', ref: 'function-1' },
        { name: 'instance-2', ref: 'function-2', active: false },
      ];

      const result = strategy.transformToManifest(functionInstances, config);

      expect(result).toHaveLength(2);
      expect(result![0].name).toBe('instance-1');
      expect(result![0].active).toBe(true);
      expect(result![1].name).toBe('instance-2');
      expect(result![1].active).toBe(false);
    });
  });

  describe('transformToConfig', () => {
    it('should return empty array when no payload is provided', () => {
      const result = strategy.transformToConfig(
        undefined as unknown as Array<{
          name: string;
          function: number | string;
          args?: Record<string, unknown>;
          active?: boolean;
        }>,
      );
      expect(result).toEqual([]);
    });

    it('should return empty array when payload is empty', () => {
      const result = strategy.transformToConfig([]);
      expect(result).toEqual([]);
    });

    it('should transform a single function instance from manifest to config format', () => {
      const payload = [
        {
          name: 'my-function-instance',
          function: 'my-function',
          args: { key: 'value' },
          active: true,
        },
      ];

      const result = strategy.transformToConfig(payload);

      expect(result).toEqual([
        {
          name: 'my-function-instance',
          ref: 'my-function',
          args: { key: 'value' },
          active: true,
        },
      ]);
    });

    it('should default active to true when not provided', () => {
      const payload = [
        {
          name: 'my-function-instance',
          function: 'my-function',
        },
      ];

      const result = strategy.transformToConfig(payload);

      expect(result![0].active).toBe(true);
    });

    it('should transform a function instance referencing a function by ID', () => {
      const payload = [
        {
          name: 'my-function-instance',
          function: 123,
        },
      ];

      const result = strategy.transformToConfig(payload);

      expect(result![0].ref).toBe(123);
    });

    it('should transform multiple function instances from manifest to config format', () => {
      const payload = [
        { name: 'instance-1', function: 'function-1', active: true },
        { name: 'instance-2', function: 'function-2', active: false },
      ];

      const result = strategy.transformToConfig(payload);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('instance-1');
      expect(result[1].name).toBe('instance-2');
      expect(result[1].active).toBe(false);
    });
  });
});
