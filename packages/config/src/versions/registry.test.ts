import { describe, expect, it } from '@jest/globals';

import { convertJsonConfigToObject, processConfig, validateConfig, validateManifest } from '../configProcessor';
import { defineConfig } from '../index';
import { SUPPORTED_API_VERSIONS, getVersionModule, isSupportedApiVersion, resolveApiVersion } from './registry';
import { DEFAULT_API_VERSION } from './types';

describe('resolveApiVersion', () => {
  it('falls back to the default version when version is not declared', () => {
    expect(resolveApiVersion({})).toBe(DEFAULT_API_VERSION);
    expect(resolveApiVersion(undefined)).toBe(DEFAULT_API_VERSION);
    expect(resolveApiVersion(null)).toBe(DEFAULT_API_VERSION);
  });

  it('returns the declared version when supported', () => {
    expect(resolveApiVersion({ version: 4 })).toBe(4);
  });

  it('throws listing the supported versions when the declared version is not supported', () => {
    expect(() => resolveApiVersion({ version: 99 })).toThrow(
      `Unsupported config version "99". Supported versions: ${SUPPORTED_API_VERSIONS.join(', ')}.`,
    );
    expect(() => resolveApiVersion({ version: '4' })).toThrow('Unsupported config version "4"');
  });
});

describe('getVersionModule', () => {
  it('returns the module of the requested version', () => {
    expect(getVersionModule(4).version).toBe(4);
  });

  it('uses the default version when none is requested', () => {
    expect(getVersionModule().version).toBe(DEFAULT_API_VERSION);
  });

  it('throws for an unsupported version', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => getVersionModule(99 as any)).toThrow('Unsupported config version "99"');
  });
});

describe('isSupportedApiVersion', () => {
  it('accepts only registered versions', () => {
    expect(isSupportedApiVersion(4)).toBe(true);
    expect(isSupportedApiVersion(5)).toBe(false);
    expect(isSupportedApiVersion('4')).toBe(false);
  });
});

describe('version dispatch', () => {
  const config = { build: { bundler: 'esbuild' as const } };

  it('validates and processes a config that declares the default version', () => {
    expect(() => validateConfig({ ...config, version: 4 })).not.toThrow();
    expect(processConfig({ ...config, version: 4 })).toEqual(processConfig(config));
  });

  it('does not leak version into the manifest', () => {
    expect(processConfig({ ...config, version: 4 })).not.toHaveProperty('version');
  });

  it('rejects a config that declares an unsupported version', () => {
    expect(() => validateConfig({ ...config, version: 99 })).toThrow('Unsupported config version "99"');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => processConfig({ ...config, version: 99 } as any)).toThrow('Unsupported config version "99"');
  });

  it('forwards the optional version to manifest helpers', () => {
    // an empty manifest is invalid for v4: the explicit and the default version must fail the same way
    expect(() => validateManifest({}, undefined, { version: 4 })).toThrow(/fields are required in the manifest/);
    expect(() => validateManifest({})).toThrow(/fields are required in the manifest/);
    expect(() => convertJsonConfigToObject('{', { version: 4 })).toThrow('Invalid JSON configuration.');
  });
});

describe('v3 support', () => {
  const v3Config = {
    version: 3 as const,
    build: { bundler: 'esbuild' as const, preset: 'angular' },
    origin: [{ name: 'origin-storage-default', type: 'object_storage' as const }],
    rules: {
      request: [
        {
          name: 'Redirect to index.html',
          match: '^\\/',
          behavior: { rewrite: '/index.html' },
        },
      ],
    },
  };

  it('is registered and selected by `version: 3`', () => {
    expect(resolveApiVersion(v3Config)).toBe(3);
    expect(getVersionModule(3).version).toBe(3);
    expect(SUPPORTED_API_VERSIONS).toContain(3);
  });

  it('keeps v4 as the default when version is omitted', () => {
    expect(DEFAULT_API_VERSION).toBe(4);
    expect(resolveApiVersion({ build: {} })).toBe(4);
  });

  it('validates and processes a v3 config with the v3 strategies', () => {
    expect(() => validateConfig(v3Config)).not.toThrow();
    const manifest = processConfig(v3Config);
    expect(manifest).toHaveProperty('origin');
    expect(manifest).toHaveProperty('rules');
    expect(manifest).not.toHaveProperty('applications');
    expect(manifest).not.toHaveProperty('version');
  });

  it('rejects v3-only fields on a v4 config and vice versa', () => {
    expect(() => validateConfig({ version: 4, origin: [] })).toThrow();
    expect(() => validateConfig({ version: 3, applications: [] })).toThrow();
  });

  it('types defineConfig by the declared version', () => {
    const v3 = defineConfig(v3Config);
    const v4 = defineConfig({ build: { bundler: 'esbuild' } });
    expect(v3.version).toBe(3);
    expect(v4.version).toBeUndefined();
  });
});
