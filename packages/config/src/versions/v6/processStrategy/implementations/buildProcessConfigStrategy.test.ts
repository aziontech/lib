import type { AzionBuild } from '../../../../types';
import type { AzionConfigV6 } from '../../types';
import BuildProcessConfigStrategy from './buildProcessConfigStrategy';

describe('BuildProcessConfigStrategy (v6)', () => {
  let strategy: BuildProcessConfigStrategy;

  beforeEach(() => {
    strategy = new BuildProcessConfigStrategy();
  });

  describe('transformToManifest', () => {
    it('should return undefined when no build configuration is provided', () => {
      const config: AzionConfigV6 = { version: 6 };
      expect(strategy.transformToManifest(config)).toBeUndefined();
    });

    it('should transform a complete build configuration to manifest format', () => {
      const buildConfig: AzionBuild = {
        bundler: 'esbuild',
        entry: { main: './src/index.js', worker: './src/worker.js' },
        polyfills: true,
        worker: true,
        preset: 'next',
        memoryFS: { injectionDirs: ['./src/injected'], removePathPrefix: './src' },
      };

      const result = strategy.transformToManifest({ version: 6, build: buildConfig });

      expect(result).toEqual(buildConfig);
    });
  });

  describe('transformToConfig', () => {
    it('should not set build when the manifest has none', () => {
      const transformedPayload: AzionConfigV6 = { version: 6 };

      const result = strategy.transformToConfig({}, transformedPayload);

      expect(result).toBeUndefined();
      expect(transformedPayload.build).toBeUndefined();
    });

    it('should transform a build manifest to config format and replace an existing build', () => {
      const newBuildConfig: AzionBuild = { bundler: 'esbuild', entry: './src/new-index.js' };
      const transformedPayload: AzionConfigV6 = {
        version: 6,
        build: { bundler: 'webpack', entry: './src/old-index.js' },
      };

      const result = strategy.transformToConfig({ build: newBuildConfig }, transformedPayload);

      expect(result).toEqual(newBuildConfig);
      expect(transformedPayload.build).toEqual(newBuildConfig);
    });
  });
});
