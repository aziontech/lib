/* eslint-disable @typescript-eslint/no-explicit-any */
import tmp from 'tmp';
import { BuildEnv, BundlerConfig } from '../../types/bundler';
import { createAzionWebpackConfig } from './webpack';

describe('Webpack Bundler', () => {
  let tmpDir: tmp.DirResult;
  let tmpEntry: tmp.FileResult;
  let tmpOutput: tmp.FileResult;

  beforeEach(async () => {
    tmpDir = tmp.dirSync();
    tmpEntry = tmp.fileSync({
      postfix: '.js',
      dir: tmpDir.name,
      name: 'entry.js',
    });
    tmpOutput = tmp.fileSync({
      postfix: '.js',
      dir: tmpDir.name,
      name: 'output.js',
    });
  });

  afterEach(async () => {
    tmpEntry.removeCallback();
    tmpOutput.removeCallback();
    tmpDir.removeCallback();
  });

  describe('createAzionWebpackConfig', () => {
    it('should create base webpack config', () => {
      const bundlerConfig: BundlerConfig = {
        entry: tmpEntry.name,
        polyfills: true,
        contentToInject: 'console.log("Hello World")',
        preset: {
          name: 'javascript',
        },
        defineVars: {
          NODE_ENV: 'production',
        },
      };

      const ctx: BuildEnv = {
        production: true,
        output: tmpOutput.name,
      };

      const webpackConfig = createAzionWebpackConfig(bundlerConfig, ctx);

      expect(webpackConfig.baseConfig).toBeDefined();
      expect(webpackConfig.mergeConfig).toBeDefined();
      expect(webpackConfig.applyConfig).toBeDefined();
    });
  });

  describe('createAzionWebpackConfig.mergeConfig', () => {
    it('should merge config when extend config is provided', async () => {
      const bundlerConfig: BundlerConfig = {
        entry: tmpEntry.name,
        polyfills: true,
        contentToInject: 'console.log("Hello World")',
        preset: {
          name: 'javascript',
        },
        defineVars: {
          NODE_ENV: 'production',
        },
        extend(context: any) {
          const config = context;
          config.optimization.minimize = false;
          return config;
        },
      };

      const ctx: BuildEnv = {
        production: true,
        output: tmpOutput.name,
      };

      const webpackConfig = createAzionWebpackConfig(bundlerConfig, ctx);
      webpackConfig.mergeConfig(webpackConfig.baseConfig);

      expect(webpackConfig.baseConfig.entry).toEqual(tmpEntry.name);
      expect(webpackConfig.baseConfig.output?.filename).toEqual(expect.stringContaining('output.js'));
      expect(webpackConfig.baseConfig.optimization?.minimize).toEqual(false);
      expect(webpackConfig.baseConfig.plugins).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            options: expect.objectContaining({
              banner: expect.stringContaining('Built with Azion CLI'),
            }),
          }),
        ]),
      );
    });

    it('should merge config when extend config is not provided', async () => {
      const bundlerConfig: BundlerConfig = {
        entry: tmpEntry.name,
        polyfills: true,
        contentToInject: 'console.log("Hello World")',
        preset: {
          name: 'javascript',
        },
        defineVars: {
          NODE_ENV: 'production',
        },
      };

      const ctx: BuildEnv = {
        production: true,
        output: tmpOutput.name,
      };

      const webpackConfig = createAzionWebpackConfig(bundlerConfig, ctx);
      webpackConfig.mergeConfig(webpackConfig.baseConfig);

      expect(webpackConfig.baseConfig.entry).toEqual(tmpEntry.name);
      expect(webpackConfig.baseConfig.output?.filename).toEqual(expect.stringContaining('output.js'));
      expect(webpackConfig.baseConfig.optimization?.minimize).toEqual(true);
      expect(webpackConfig.baseConfig.plugins).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            options: expect.objectContaining({
              banner: expect.stringContaining('Built with Azion CLI'),
            }),
          }),
        ]),
      );
    });
  });
});
