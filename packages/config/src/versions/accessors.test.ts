import { describe, expect, it } from '@jest/globals';

import { getApplicationName, getFirewallReplacedKeys, getStorage } from './accessors';
import v4Schema from './v4/schemas/schema';
import v6Schema from './v6/schemas/schema';

const v4 = {
  applications: [{ name: 'app-1' }, { name: 'app-2' }],
  storage: [{ name: 'bucket-1', prefix: 'p1', dir: './dist', workloadsAccess: 'read_only' as const }],
};

const v3 = {
  version: 3 as const,
  origin: [
    { name: 'web', type: 'single_origin' },
    { name: 'origin-storage-default', type: 'object_storage', bucket: 'bucket-3', prefix: 'p3' },
  ],
};

describe('version accessors', () => {
  it('reads the application name where each version keeps it', () => {
    expect(getApplicationName(v4)).toBe('app-1');
    expect(getApplicationName({})).toBeUndefined();
    expect(getApplicationName(v3)).toBeUndefined();
    expect(getApplicationName({ version: 6, applications: [{ name: 'app-6' }] })).toBe('app-6');
    expect(getApplicationName({ version: 6 })).toBeUndefined();
  });

  it('reads the storage where each version keeps it', () => {
    expect(getStorage(v4)).toEqual({ bucket: 'bucket-1', prefix: 'p1' });
    expect(getStorage({ storage: [{ name: 'b', prefix: '', dir: './dist', workloadsAccess: 'read_only' }] })).toEqual({
      bucket: 'b',
      prefix: '',
    });
    expect(getStorage(v3)).toEqual({ bucket: 'bucket-3', prefix: 'p3' });
    expect(getStorage({ version: 6, storage: [{ name: 'bucket-6', prefix: 'p6', dir: './dist' }] })).toEqual({
      bucket: 'bucket-6',
      prefix: 'p6',
    });
  });

  it('reads the first v6 storage and falls back to an empty prefix, as the prefix is optional in v6', () => {
    expect(getStorage({ version: 6, storage: [{ name: 'bucket-6', dir: './dist' }] })).toEqual({
      bucket: 'bucket-6',
      prefix: '',
    });
    expect(
      getStorage({
        version: 6,
        storage: [
          { name: 'first-bucket', dir: './a' },
          { name: 'second-bucket', dir: './b' },
        ],
      }),
    ).toEqual({ bucket: 'first-bucket', prefix: '' });
    expect(getStorage({ version: 6 })).toBeUndefined();
    expect(getStorage({ version: 6, storage: [] })).toBeUndefined();
  });

  it('returns undefined when the config has no storage', () => {
    expect(getStorage({})).toBeUndefined();
    expect(getStorage({ version: 3, origin: [{ name: 'web', type: 'single_origin' }] })).toBeUndefined();
  });

  it('falls back to empty strings for a v3 object storage origin without bucket/prefix', () => {
    expect(getStorage({ version: 3, origin: [{ name: 'o', type: 'object_storage' }] })).toEqual({
      bucket: '',
      prefix: '',
    });
  });

  it('allows forcing the version used to read', () => {
    expect(getStorage(v4, 4)).toEqual({ bucket: 'bucket-1', prefix: 'p1' });
  });

  it('lists the preset keys a firewall-only project must not inherit', () => {
    expect(getFirewallReplacedKeys(4)).toEqual(['applications', 'workloads', 'connectors', 'functions']);
    expect(getFirewallReplacedKeys(3)).toEqual(['origin', 'cache', 'rules', 'functions']);
    expect(getFirewallReplacedKeys(6)).toEqual([
      'applications',
      'workloads',
      'connectors',
      'functions',
      'environments',
      'deployments',
    ]);
  });

  it('lists only keys that exist in the config schema of each version', () => {
    const properties = (schema: { definitions: { mainConfig: { properties: object } } }) =>
      Object.keys(schema.definitions.mainConfig.properties);
    const schemas = { 4: properties(v4Schema), 6: properties(v6Schema) };

    getFirewallReplacedKeys(4).forEach((key) => expect(schemas[4]).toContain(key));
    getFirewallReplacedKeys(6).forEach((key) => expect(schemas[6]).toContain(key));
  });
});
