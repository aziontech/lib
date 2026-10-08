import { describe, expect, it } from '@jest/globals';
import { getPresetApiVersions, processConfig, resolvePresetConfig, validateConfig } from '@aziontech/config';
import type { AzionBuildPreset } from '@aziontech/config';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import * as presetModules from '../index';

const presets = Object.values(presetModules).filter((preset): preset is AzionBuildPreset =>
  Boolean((preset as AzionBuildPreset)?.metadata?.name),
);

// Frozen outputs of the original v3 line (1.20.x), kept next to the v3 implementation in @aziontech/config.
// Jest runs from the package root, which is what makes this relative path stable.
const goldenDir = join(process.cwd(), '..', 'config', 'src', 'versions', 'v3', '__fixtures__', 'golden');
const golden = (preset: string, kind: 'input' | 'manifest') =>
  JSON.parse(readFileSync(join(goldenDir, `${preset}.${kind}.json`), 'utf8'));
const goldenPresets = readdirSync(goldenDir)
  .filter((file) => file.endsWith('.input.json'))
  .map((file) => file.replace('.input.json', ''));

const byName = (name: string) => presets.find((preset) => preset.metadata.name === name) as AzionBuildPreset;

describe('preset configs by API version', () => {
  it.each(presets.map((preset) => [preset.metadata.name, preset] as const))(
    '%s: `config` is the default (v4) config',
    (_name, preset) => {
      expect(preset.configs?.[4]).toBe(preset.config);
      expect(resolvePresetConfig(preset)).toEqual(preset.config);
    },
  );

  it('keeps nitro v4 only, as it did not exist on v3', () => {
    expect(getPresetApiVersions(byName('nitro'))).toEqual([4]);
    expect(() => resolvePresetConfig(byName('nitro'), 3)).toThrow('does not support config version 3');
  });

  it('has a v3 config for every preset that existed on v3', () => {
    expect(goldenPresets.length).toBe(24);
    goldenPresets.forEach((name) => expect(getPresetApiVersions(byName(name))).toEqual([3, 4]));
  });

  describe.each(goldenPresets)('%s (v3)', (name) => {
    it('matches the config the 1.20.x preset used', () => {
      const { version, ...config } = resolvePresetConfig(byName(name), 3);
      expect(version).toBe(3);
      // functions (e.g. build.extend) are not serializable, the golden input does not carry them
      expect(JSON.parse(JSON.stringify(config))).toEqual(golden(name, 'input'));
    });

    it('produces the manifest the 1.20.x implementation produced', () => {
      const config = resolvePresetConfig(byName(name), 3);
      expect(() => validateConfig(config)).not.toThrow();
      // the golden is JSON, so compare through JSON as well (drops `undefined` fields)
      expect(JSON.parse(JSON.stringify(processConfig(config)))).toEqual(golden(name, 'manifest'));
    });
  });

  // the bundler reads the default build (entry, bundler) from the config of the version of the project and falls back to
  // `preset.config` for what it does not declare (prebuilds such as nuxt and svelte change `preset.config`), so a version
  // may have its own entry, but it must not declare a bundler that differs without being on purpose
  it.each(presets.filter((preset) => preset.configs?.[3]).map((preset) => [preset.metadata.name, preset] as const))(
    '%s: build.bundler is the same in every version',
    (_name, preset) => {
      // a preset that does not declare the bundler gets the default one of the bundler, esbuild
      const bundler = (build?: { bundler?: unknown }) => build?.bundler ?? 'esbuild';

      expect(bundler(preset.configs?.[3]?.build)).toEqual(bundler(preset.configs?.[4]?.build));
    },
  );

  // The bundler names the generated function after the entry (the key of an object entry, the file name of a string
  // one) or `handler` for a preset with a built-in handler and no entry, and fails the build when `functions[].path` is
  // not that file.
  const outputName = (entry: unknown): string => {
    if (!entry) return 'handler';
    if (typeof entry === 'string')
      return entry
        .split('/')
        .pop()!
        .replace(/\.[^.]+$/, '');
    if (Array.isArray(entry)) return outputName(entry[0]);
    return Object.keys(entry as Record<string, string>)[0];
  };

  describe.each(presets.map((preset) => [preset.metadata.name, preset] as const))('%s', (_name, preset) => {
    it.each(getPresetApiVersions(preset))('v%i: functions[].path is the file the bundler generates', (version) => {
      const config = resolvePresetConfig(preset, version) as {
        build?: { entry?: unknown };
        functions?: { path: string }[];
      };

      (config.functions ?? []).forEach((fn) => {
        expect(fn.path).toBe(`./functions/${outputName(config.build?.entry)}.js`);
      });
    });
  });
});
