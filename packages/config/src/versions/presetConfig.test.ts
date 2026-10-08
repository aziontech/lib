import { describe, expect, it } from '@jest/globals';

import type { AzionBuildPreset } from '../types';
import { getPresetApiVersions, resolvePresetConfig } from './presetConfig';

const extend = (context: unknown) => context;

const preset = {
  metadata: { name: 'demo' },
  config: { build: { bundler: 'esbuild', extend }, applications: [{ name: 'app-v4' }] },
  configs: {
    3: { version: 3, build: { bundler: 'esbuild' }, origin: [{ name: 'o', type: 'object_storage' }] },
    4: { build: { bundler: 'esbuild', extend }, applications: [{ name: 'app-v4' }] },
  },
} as unknown as AzionBuildPreset;

describe('resolvePresetConfig', () => {
  it('returns the config of the requested version', () => {
    expect(resolvePresetConfig(preset, 3)).toHaveProperty('origin');
    expect(resolvePresetConfig(preset, 4)).toHaveProperty('applications');
  });

  it('uses the default version when none is requested', () => {
    expect(resolvePresetConfig(preset)).toHaveProperty('applications');
  });

  it('falls back to `config` for the default version when the preset declares no `configs`', () => {
    const legacy = { metadata: { name: 'legacy' }, config: { build: { bundler: 'webpack' } } } as AzionBuildPreset;
    expect(resolvePresetConfig(legacy, 4)).toEqual({ build: { bundler: 'webpack' } });
    expect(() => resolvePresetConfig(legacy, 3)).toThrow('Preset "legacy" does not support config version 3');
  });

  it('lists the supported versions when the requested one is missing', () => {
    const v3Only = { metadata: { name: 'v3-only' }, configs: { 3: { version: 3 } } } as unknown as AzionBuildPreset;
    expect(() => resolvePresetConfig(v3Only, 4)).toThrow('Supported versions: 3.');
  });

  it('returns a copy, so mutating it does not change the preset', () => {
    const copy = resolvePresetConfig(preset, 4) as { applications?: unknown; build: { extend: unknown } };
    delete copy.applications;
    expect(preset.configs?.[4]).toHaveProperty('applications');
    expect(copy.build.extend).toBe(extend);
  });
});

describe('getPresetApiVersions', () => {
  it('lists the versions the preset has configs for', () => {
    expect(getPresetApiVersions(preset)).toEqual([3, 4]);
    expect(getPresetApiVersions({ config: {} })).toEqual([4]);
  });
});
