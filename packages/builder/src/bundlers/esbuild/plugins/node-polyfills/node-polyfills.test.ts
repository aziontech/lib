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
    const regexp = buildNodeModulesRegExp(['fs', 'node:unknown', 'unknown']);

    expect(regexp.test('node:fs')).toBe(true);
    expect(regexp.test('node:unknown')).toBe(false);
    expect(regexp.test('unknown')).toBe(false);
  });

  it('matches the prefix-only modules only with the node: prefix', () => {
    // Node.js 24 lists these with the node: prefix, unenv resolves them to a stub
    const regexp = buildNodeModulesRegExp(['fs', 'node:sqlite', 'node:test', 'node:test/reporters', 'node:sea']);

    for (const name of ['sqlite', 'test', 'test/reporters', 'sea']) {
      expect(regexp.test(`node:${name}`)).toBe(true);
      // could be an npm package with the same name
      expect(regexp.test(name)).toBe(false);
    }
    expect(regexp.test('fs')).toBe(true);
  });

  it('does not match unrelated names', () => {
    const regexp = buildNodeModulesRegExp(['fs']);

    expect(regexp.test('node:fs-extra')).toBe(false);
    expect(regexp.test('my-fs')).toBe(false);
  });

  it('does not match anything when no module can be resolved', () => {
    const regexp = buildNodeModulesRegExp(['node:unknown']);

    expect(regexp.test('node:unknown')).toBe(false);
    expect(regexp.test('')).toBe(false);
  });

  it('handles the same modules whatever the Node.js version is', () => {
    const regexp = buildNodeModulesRegExp();

    for (const name of ['node:test', 'node:test/reporters', 'node:sea', 'node:sqlite']) {
      expect(regexp.test(name)).toBe(true);
    }
    for (const name of ['test', 'sea', 'sqlite']) {
      expect(regexp.test(name)).toBe(false);
    }
  });

  it('matches every built-in module of the running Node.js that can be resolved', () => {
    const regexp = buildNodeModulesRegExp();

    for (const name of ['fs', 'path', 'stream', 'crypto', 'url', 'v8', 'worker_threads', 'perf_hooks']) {
      expect(builtinModules).toContain(name);
      expect(regexp.test(name)).toBe(true);
      expect(regexp.test(`node:${name}`)).toBe(true);
    }
  });
});
