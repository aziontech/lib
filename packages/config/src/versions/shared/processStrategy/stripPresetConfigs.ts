/**
 * Returns the build as it should be written to the manifest.
 *
 * When `build.preset` is an object (a custom preset or one resolved from `@aziontech/presets`) it carries the config of
 * the preset itself (`config` and `configs`). Those are inputs of the build, not part of the manifest, so they are left
 * out. The rest of the preset (e.g. `metadata`) is kept, and the received build is not changed.
 */
function stripPresetConfigs<T extends { preset?: unknown }>(build: T): T {
  const { preset } = build;
  if (!preset || typeof preset !== 'object') {
    return build;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { config, configs, ...rest } = preset as Record<string, unknown>;
  return { ...build, preset: rest };
}

export default stripPresetConfigs;
