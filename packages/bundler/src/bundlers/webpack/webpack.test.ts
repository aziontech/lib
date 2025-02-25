import { BuildConfiguration, BuildContext } from 'azion/config';
import { JavaScript } from 'azion/presets';
import fs from 'fs';
import tmp from 'tmp';
import { Configuration as WebpackConfig } from 'webpack';
import { createAzionWebpackConfig } from './webpack';

describe('Webpack Bundler', () => {
  let tmpDir: tmp.DirResult;
  let tmpEntry: tmp.FileResult;
  let tmpOutput: tmp.FileResult;
  let tmpOutputDev: tmp.FileResult;

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
    tmpOutputDev = tmp.fileSync({
      postfix: '.js',
      dir: tmpDir.name,
      name: 'output.dev.js',
    });
  });

  afterEach(async () => {
    tmpEntry.removeCallback();
    tmpOutput.removeCallback();
    tmpOutputDev.removeCallback();
    tmpDir.removeCallback();
  });

  describe('createAzionWebpackConfig', () => {
    it('should create base webpack config', () => {
      const bundlerConfig: BuildConfiguration = {
        entry: tmpEntry.name,
        polyfills: true,
        preset: JavaScript,
        setup: {
          contentToInject: 'console.log("Hello World")',
          defineVars: {
            NODE_ENV: 'production',
          },
        },
      };

      const ctx: BuildContext = {
        production: true,
        output: tmpOutput.name,
        entrypoint: tmpEntry.name,
        event: 'fetch',
      };

      const webpackConfig = createAzionWebpackConfig(bundlerConfig, ctx);

      expect(webpackConfig.baseConfig).toBeDefined();
      expect(webpackConfig.mergeConfig).toBeDefined();
      expect(webpackConfig.applyConfig).toBeDefined();
    });
  });

  describe('createAzionWebpackConfig.mergeConfig', () => {
    it('should merge config when extend config is provided', async () => {
      const bundlerConfig: BuildConfiguration = {
        entry: tmpEntry.name,
        polyfills: true,
        preset: JavaScript,
        extend: (config) => {
          (config as WebpackConfig).optimization = {
            minimize: false,
          };
          return config;
        },
        setup: {
          contentToInject: 'console.log("Hello World")',
          defineVars: {
            NODE_ENV: 'production',
          },
        },
      };

      const ctx: BuildContext = {
        production: true,
        output: tmpOutput.name,
        entrypoint: tmpEntry.name,
        event: 'fetch',
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
      const bundlerConfig: BuildConfiguration = {
        entry: tmpEntry.name,
        polyfills: true,
        preset: JavaScript,
        setup: {
          contentToInject: 'console.log("Hello World")',
          defineVars: {
            NODE_ENV: 'production',
          },
        },
      };

      const ctx: BuildContext = {
        production: true,
        output: tmpOutput.name,
        entrypoint: tmpEntry.name,
        event: 'fetch',
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

  describe('createAzionWebpackConfig.executeBuild', () => {
    it('should execute webpack build process when env production false ', async () => {
      const code = `console.log(process.env.NODE_ENV);`;
      await fs.promises.writeFile(tmpEntry.name, code);

      const bundlerConfig: BuildConfiguration = {
        entry: tmpEntry.name,
        polyfills: true,
        preset: JavaScript,
        setup: {
          contentToInject: 'console.log("Hello World")',
          defineVars: {
            NODE_ENV: 'production',
          },
        },
      };

      const ctx: BuildContext = {
        production: false,
        output: tmpOutput.name,
        entrypoint: tmpEntry.name,
        event: 'fetch',
      };

      const webpackConfig = createAzionWebpackConfig(bundlerConfig, ctx);
      await webpackConfig.executeBuild(webpackConfig);
      const result = fs.readFileSync(tmpOutputDev.name, 'utf-8');

      expect(result).toEqual(expect.stringContaining('production'));

      expect(webpackConfig.baseConfig.entry).toEqual(tmpEntry.name);
      expect(webpackConfig.baseConfig.output?.filename).toEqual(expect.stringContaining('output.dev.js'));
      expect(webpackConfig.baseConfig.optimization?.minimize).toEqual(false);
    });

    it('should execute webpack build process when node polyfills and env production true', async () => {
      const code = `import crypto from 'node:crypto';const id = crypto.randomUUID();`;
      await fs.promises.writeFile(tmpEntry.name, code);

      const bundlerConfig: BuildConfiguration = {
        entry: tmpEntry.name,
        polyfills: true,
        preset: JavaScript,
        setup: {
          contentToInject: 'console.log("Hello World")',
          defineVars: {
            NODE_ENV: 'production',
          },
        },
      };

      const ctx: BuildContext = {
        production: true,
        output: tmpOutput.name,
        entrypoint: tmpEntry.name,
        event: 'fetch',
      };

      const webpackConfig = createAzionWebpackConfig(bundlerConfig, ctx);
      await webpackConfig.executeBuild(webpackConfig);
      const result = fs.readFileSync(tmpOutput.name, 'utf-8');
      // remove file output.LICENSE.txt
      fs.rmSync(`${tmpOutput.name}.LICENSE.txt`);

      expect(result).toEqual(expect.stringContaining('randomUUID()'));

      expect(webpackConfig.baseConfig.entry).toEqual(tmpEntry.name);
      expect(webpackConfig.baseConfig.output?.filename).toEqual(expect.stringContaining('output.js'));
      expect(webpackConfig.baseConfig.optimization?.minimize).toEqual(true);
    }, 10000);
  });
});
