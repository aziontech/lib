import { describe, expect, it } from '@jest/globals';

import { getApplicationName, getFirewallReplacedKeys, getStorage } from './accessors';

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
  });

  it('reads the storage where each version keeps it', () => {
    expect(getStorage(v4)).toEqual({ bucket: 'bucket-1', prefix: 'p1' });
    expect(getStorage({ storage: [{ name: 'b', prefix: '', dir: './dist', workloadsAccess: 'read_only' }] })).toEqual({
      bucket: 'b',
      prefix: '',
    });
    expect(getStorage(v3)).toEqual({ bucket: 'bucket-3', prefix: 'p3' });
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
  });
});
