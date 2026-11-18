import stripPresetConfigs from './stripPresetConfigs';

describe('stripPresetConfigs', () => {
  it('should keep the build as is when the preset is a string', () => {
    const build = { preset: 'next', polyfills: true };
    expect(stripPresetConfigs(build)).toEqual(build);
  });

  it('should keep the build as is when there is no preset', () => {
    const build: { polyfills: boolean; preset?: string } = { polyfills: true };
    expect(stripPresetConfigs(build)).toEqual(build);
  });

  it('should remove config and configs from a preset object', () => {
    const build = {
      polyfills: true,
      preset: {
        metadata: { name: 'javascript', ext: 'js' },
        config: { version: 3 },
        configs: { 3: { version: 3 } },
      },
    };

    expect(stripPresetConfigs(build)).toEqual({
      polyfills: true,
      preset: { metadata: { name: 'javascript', ext: 'js' } },
    });
  });

  it('should not change the received build', () => {
    const build = { preset: { metadata: { name: 'custom' }, config: {}, configs: {} } };
    stripPresetConfigs(build);
    expect(build.preset).toHaveProperty('config');
    expect(build.preset).toHaveProperty('configs');
  });
});
