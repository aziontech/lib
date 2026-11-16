import { describe, expect, it } from '@jest/globals';
import { builtinModules } from 'node:module';

import { buildNodeModulesRegExp } from './node-polyfills';

describe('buildNodeModulesRegExp', () => {
  it('matches the modules that have a polyfill, with and without the node: prefix', () => {
    const regexp = buildNodeModulesRegExp(['fs', 'stream', 'crypto', 'async_hooks', 'util']);

    for (const name of ['fs', 'stream', 'crypto', 'async_hooks', 'util']) {
      expect(regexp.test(name)).toBe(true);
      expect(regexp.test(`node:${name}`)).toBe(true);
    }
  });

  it('does not match the modules without alias, polyfill or external entry', () => {
    // Node.js 24 lists these with the node: prefix, they have nothing to resolve to
    const regexp = buildNodeModulesRegExp(['fs', 'node:test', 'node:test/reporters', 'node:sea']);

    expect(regexp.test('node:fs')).toBe(true);
    expect(regexp.test('node:test')).toBe(false);
    expect(regexp.test('node:test/reporters')).toBe(false);
    expect(regexp.test('node:sea')).toBe(false);
  });

  it('matches the prefix-only modules that unenv resolves to a stub', () => {
    const regexp = buildNodeModulesRegExp(['node:sqlite']);

    expect(regexp.test('node:sqlite')).toBe(true);
  });

  it('does not match unrelated names', () => {
    const regexp = buildNodeModulesRegExp(['fs']);

    expect(regexp.test('node:fs-extra')).toBe(false);
    expect(regexp.test('my-fs')).toBe(false);
  });

  it('only matches modules of the running Node.js that can be resolved', () => {
    const regexp = buildNodeModulesRegExp();
    const unresolved = builtinModules.filter((name) => ['node:test', 'node:sea', 'node:test/reporters'].includes(name));

    for (const name of unresolved) {
      expect(regexp.test(name)).toBe(false);
    }
  });
});
