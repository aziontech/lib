import FunctionInstancesProcessConfigStrategy from './functionInstancesProcessConfigStrategy';

describe('FunctionInstancesProcessConfigStrategy (v6)', () => {
  let strategy: FunctionInstancesProcessConfigStrategy;

  beforeEach(() => {
    strategy = new FunctionInstancesProcessConfigStrategy();
  });

  describe('transformToManifest', () => {
    const config = { version: 6 as const, functions: [{ name: 'fn', path: './fn.js' }] };

    it('should return undefined when there are no instances', () => {
      expect(strategy.transformToManifest([], config)).toBeUndefined();
    });

    it('should map an instance to the manifest and apply the defaults', () => {
      expect(strategy.transformToManifest([{ name: 'instance', ref: 'fn' }], config)).toEqual([
        { name: 'instance', function: 'fn', args: {}, active: true },
      ]);
      expect(strategy.transformToManifest([{ name: 'i', ref: 'fn', args: { a: 1 }, active: false }], config)).toEqual([
        { name: 'i', function: 'fn', args: { a: 1 }, active: false },
      ]);
    });

    it('should throw when a referenced function name is not defined', () => {
      expect(() => strategy.transformToManifest([{ name: 'instance', ref: 'missing' }], config)).toThrow(
        'Function instance "instance" references non-existent Function "missing".',
      );
      expect(() => strategy.transformToManifest([{ name: 'instance', ref: 'fn' }], { version: 6 })).toThrow(
        'references non-existent Function "fn"',
      );
    });

    it('should not validate a function referenced by id', () => {
      expect(strategy.transformToManifest([{ name: 'instance', ref: 10 }], { version: 6 })).toEqual([
        { name: 'instance', function: 10, args: {}, active: true },
      ]);
    });
  });

  describe('transformToConfig', () => {
    it('should return an empty array when there is nothing to convert', () => {
      expect(strategy.transformToConfig([])).toEqual([]);
    });

    it('should map the manifest instances back to the config', () => {
      expect(strategy.transformToConfig([{ name: 'i', function: 10, args: { a: 1 } }])).toEqual([
        { name: 'i', ref: 10, args: { a: 1 }, active: true },
      ]);
    });
  });
});
