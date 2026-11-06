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

  it('keeps nitro without a v3 config, as it did not exist on v3', () => {
    expect(getPresetApiVersions(byName('nitro'))).toEqual([4, 6]);
    expect(() => resolvePresetConfig(byName('nitro'), 3)).toThrow('does not support config version 3');
  });

  it('has a v3 config for every preset that existed on v3', () => {
    expect(goldenPresets.length).toBe(24);
    goldenPresets.forEach((name) => expect(getPresetApiVersions(byName(name))).toEqual(expect.arrayContaining([3, 4])));
  });

  describe('v6', () => {
    it('is declared by every preset, nitro without a v3 config as it did not exist on v3', () => {
      const withoutV6 = presets.filter((preset) => !preset.configs?.[6]).map((preset) => preset.metadata.name);
      expect(withoutV6).toEqual([]);
      presets.forEach((preset) =>
        expect(getPresetApiVersions(preset)).toEqual(preset.metadata.name === 'nitro' ? [4, 6] : [3, 4, 6]),
      );
    });

    it.each(presets.map((preset) => [preset.metadata.name, preset] as const))(
      '%s: validates and produces the manifest of the v4 config, with the environment and the binding of the v6',
      (name) => {
        const config = resolvePresetConfig(byName(name), 6);
        expect(config.version).toBe(6);
        expect(() => validateConfig(config)).not.toThrow();

        // functions (e.g. build.extend) are different instances in each config, so compare through JSON
        const plain = (value: unknown) => JSON.parse(JSON.stringify(value));
        const v4 = processConfig(resolvePresetConfig(byName(name), 4));
        const v6 = processConfig(config);

        expect(v6.version).toBe(6);
        expect(plain(v6.build)).toEqual(plain(v4.build));
        expect(v6.storage).toEqual(v4.storage);
        expect(v6.connectors).toEqual(v4.connectors);
        expect(plain(v6.functions)).toEqual(plain(v4.functions));
        expect(v6.applications).toEqual(v4.applications);
        expect(v6.workload_deployments).toEqual(
          v4.workload_deployments.map((deployment: object) => ({ workload_name: '$WORKLOAD_NAME', ...deployment })),
        );
        expect(v6.environments.map((environment: { name: string }) => environment.name)).toEqual(['$ENVIRONMENT_NAME']);
        expect(v6.workloads[0].bindings).toEqual([
          { environment_name: '$ENVIRONMENT_NAME', deployment_name: '$DEPLOYMENT_NAME', domains: [] },
        ]);
      },
    );

    it('javascript: validates and keeps the build of the v4 config', () => {
      const config = resolvePresetConfig(byName('javascript'), 6);
      expect(config.version).toBe(6);
      expect(() => validateConfig(config)).not.toThrow();
      expect(config.build).toEqual(resolvePresetConfig(byName('javascript'), 4).build);
      const manifest = processConfig(config);
      expect(manifest.version).toBe(6);
      expect(manifest.build).toEqual({ entry: 'index.js' });
    });

    it('javascript: has the same functions and application in the manifest as the v4 config', () => {
      const v4 = processConfig(resolvePresetConfig(byName('javascript'), 4));
      const v6 = processConfig(resolvePresetConfig(byName('javascript'), 6));

      expect(v6.functions).toEqual(v4.functions);
      expect(v6.applications).toEqual(v4.applications);
      expect(v6.applications[0].modules.functions.enabled).toBe(true);
    });

    it('react: validates and has the same storage, connectors and application in the manifest as the v4 config', () => {
      const config = resolvePresetConfig(byName('react'), 6);
      expect(() => validateConfig(config)).not.toThrow();

      const v4 = processConfig(resolvePresetConfig(byName('react'), 4));
      const v6 = processConfig(config);

      expect(v6.version).toBe(6);
      expect(v6.storage).toEqual(v4.storage);
      expect(v6.connectors).toEqual(v4.connectors);
      expect(v6.applications).toEqual(v4.applications);
      expect(v6.applications[0].cache_settings).toHaveLength(1);
      // the rules deliver the static assets from the storage connector
      expect(JSON.stringify(v6.applications[0].rules)).toContain('"set_connector"');
      expect(v6.connectors.map((connector: { name: string }) => connector.name)).toEqual(['$CONNECTOR_NAME']);
    });

    it('eleventy: validates and has the same storage, connectors and application in the manifest as the v4 config', () => {
      const config = resolvePresetConfig(byName('eleventy'), 6);
      expect(() => validateConfig(config)).not.toThrow();

      const v4 = processConfig(resolvePresetConfig(byName('eleventy'), 4));
      const v6 = processConfig(config);

      expect(v6.version).toBe(6);
      expect(v6.storage).toEqual(v4.storage);
      expect(v6.connectors).toEqual(v4.connectors);
      expect(v6.applications).toEqual(v4.applications);
      expect(v6.applications[0].cache_settings).toHaveLength(1);
      expect(v6.storage[0].dir).toBe('./_site');
    });

    it('opennextjs: validates and has the same storage, connectors, functions and application in the manifest as the v4 config', () => {
      const config = resolvePresetConfig(byName('opennextjs'), 6);
      expect(() => validateConfig(config)).not.toThrow();

      const v4 = processConfig(resolvePresetConfig(byName('opennextjs'), 4));
      const v6 = processConfig(config);

      expect(v6.version).toBe(6);
      expect(v6.storage).toEqual(v4.storage);
      expect(v6.connectors).toEqual(v4.connectors);
      // the function keeps the storage binding
      expect(v6.functions).toEqual(v4.functions);
      expect(v6.functions[0].bindings).toEqual({ storage: { bucket: '$BUCKET_NAME', prefix: '$BUCKET_PREFIX' } });
      expect(v6.applications).toEqual(v4.applications);
    });

    it('javascript: binds the workload to an environment and to its own deployment', () => {
      const manifest = processConfig(resolvePresetConfig(byName('javascript'), 6));

      expect(manifest.environments.map((environment: { name: string }) => environment.name)).toEqual([
        '$ENVIRONMENT_NAME',
      ]);
      expect(
        manifest.environments.map((environment: { deployment_policy: string }) => environment.deployment_policy),
      ).toEqual(['single_version']);
      expect(manifest).not.toHaveProperty('deployments');
      expect(manifest.workloads).toHaveLength(1);
      expect(manifest.workloads[0]).toEqual(
        expect.objectContaining({ name: '$WORKLOAD_NAME', active: true, infrastructure: 1 }),
      );
      expect(manifest.workloads[0].bindings).toEqual([
        { environment_name: '$ENVIRONMENT_NAME', deployment_name: '$DEPLOYMENT_NAME', domains: [] },
      ]);
    });
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
      // the fixtures are frozen and do not carry the `version` the v3 manifest has (see v3/__fixtures__/README.md)
      expect(JSON.parse(JSON.stringify(processConfig(config)))).toEqual({ version: 3, ...golden(name, 'manifest') });
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
