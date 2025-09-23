import { AzionBuild, AzionConfig } from '../../../types';
import BuildProcessConfigStrategy from './buildProcessConfigStrategy';

describe('BuildProcessConfigStrategy', () => {
  let strategy: BuildProcessConfigStrategy;

  beforeEach(() => {
    strategy = new BuildProcessConfigStrategy();
  });

  describe('transformToManifest', () => {
    it('should return undefined when no build configuration is provided', () => {
      const config: AzionConfig = {};
      const result = strategy.transformToManifest(config);
      expect(result).toBeUndefined();
    });

    it('should transform a basic build configuration to manifest format', () => {
      const buildConfig: AzionBuild = {
        bundler: 'webpack',
        entry: './src/index.js',
      };

      const config: AzionConfig = {
        build: buildConfig,
      };

      const result = strategy.transformToManifest(config);

      expect(result).toEqual(buildConfig);
    });

    it('should transform a complete build configuration to manifest format', () => {
      const buildConfig: AzionBuild = {
        bundler: 'esbuild',
        entry: {
          main: './src/index.js',
          worker: './src/worker.js',
        },
        polyfills: true,
        worker: true,
        preset: 'next',
      };

      const config: AzionConfig = {
        build: buildConfig,
      };

      const result = strategy.transformToManifest(config);

      expect(result).toEqual(buildConfig);
    });

    it('should handle build configuration with memoryFS option', () => {
      const buildConfig: AzionBuild = {
        bundler: 'webpack',
        entry: './src/index.js',
        memoryFS: {
          injectionDirs: ['./src/injected'],
          removePathPrefix: './src',
        },
      };

      const config: AzionConfig = {
        build: buildConfig,
      };

      const result = strategy.transformToManifest(config);

      expect(result).toEqual(buildConfig);
      expect(result?.memoryFS?.injectionDirs).toEqual(['./src/injected']);
    });
  });

  describe('transformToConfig', () => {
    it('should not modify transformedPayload when no build is provided', () => {
      const payload = {};
      const transformedPayload: AzionConfig = {};

      const result = strategy.transformToConfig(payload, transformedPayload);

      expect(result).toBeUndefined();
      expect(transformedPayload.build).toBeUndefined();
    });

    it('should transform a basic build manifest to config format', () => {
      const buildConfig: AzionBuild = {
        bundler: 'webpack',
        entry: './src/index.js',
      };

      const payload = {
        build: buildConfig,
      };

      const transformedPayload: AzionConfig = {};

      const result = strategy.transformToConfig(payload, transformedPayload);

      expect(result).toEqual(buildConfig);
      expect(transformedPayload.build).toEqual(buildConfig);
    });

    it('should transform a complete build manifest to config format', () => {
      const buildConfig: AzionBuild = {
        bundler: 'esbuild',
        entry: {
          main: './src/index.js',
          worker: './src/worker.js',
        },
        polyfills: true,
        worker: true,
        preset: 'next',
      };

      const payload = {
        build: buildConfig,
      };

      const transformedPayload: AzionConfig = {};

      const result = strategy.transformToConfig(payload, transformedPayload);

      expect(result).toEqual(buildConfig);
      expect(transformedPayload.build).toEqual(buildConfig);
    });

    it('should handle existing build configuration in transformedPayload', () => {
      const existingBuildConfig: AzionBuild = {
        bundler: 'webpack',
        entry: './src/old-index.js',
      };

      const newBuildConfig: AzionBuild = {
        bundler: 'esbuild',
        entry: './src/new-index.js',
      };

      const payload = {
        build: newBuildConfig,
      };

      const transformedPayload: AzionConfig = {
        build: existingBuildConfig,
      };

      const result = strategy.transformToConfig(payload, transformedPayload);

      // The transformToConfig method should replace the existing build config
      expect(result).toEqual(newBuildConfig);
      expect(transformedPayload.build).toEqual(newBuildConfig);
      expect(transformedPayload.build).not.toEqual(existingBuildConfig);
    });
  });
});
