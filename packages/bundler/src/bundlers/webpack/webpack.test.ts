import { jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import tmp from 'tmp';

import { BuildConfiguration, BuildContext } from 'azion/config';
import { Configuration as WebpackConfig } from 'webpack';
import NodePolyfills from './plugins/node-polyfills';
import { createAzionWebpackConfig } from './webpack';
import AzionWebpackConfig from './webpack.config';

// Mock preset to avoid loading modules that might cause issues
const mockJavascriptPreset = {
  config: {
    build: {
      entry: 'index.js',
    },
  },
  metadata: {
    name: 'javascript',
    ext: 'js',
  },
};

describe('Webpack Bundler', () => {
  let tmpDir: tmp.DirResult;
  let tmpEntry: tmp.FileResult;

  beforeEach(async () => {
    tmpDir = tmp.dirSync();
    tmpEntry = tmp.fileSync({
      postfix: '.js',
      dir: tmpDir.name,
      name: 'entry.js',
    });
  });

  afterEach(async () => {
    tmpEntry.removeCallback();
    fs.rmSync(tmpDir.name, { recursive: true, force: true });
  });

  afterAll(async () => {
    jest.restoreAllMocks();
  });

  describe('createAzionWebpackConfig', () => {
    it('should create base webpack config', () => {
      const bundlerConfig = {
        entry: { output: tmpEntry.name },
        baseOutputDir: tmpDir.name,
        polyfills: true,
        preset: mockJavascriptPreset,
        setup: {
          contentToInject: 'console.log("Hello World")',
          defineVars: {
            NODE_ENV: 'production',
          },
        },
      };

      const ctx: BuildContext = {
        production: true,
        handler: tmpEntry.name,
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
        entry: { output: tmpEntry.name },
        baseOutputDir: tmpDir.name,
        polyfills: true,
        preset: mockJavascriptPreset,
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
        handler: tmpEntry.name,
      };

      const webpackConfig = createAzionWebpackConfig(bundlerConfig, ctx);
      webpackConfig.mergeConfig(webpackConfig.baseConfig);

      expect(webpackConfig.baseConfig.entry).toEqual({ output: tmpEntry.name });
      expect(webpackConfig.baseConfig.output?.filename).toEqual('[name]');
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
        entry: { output: tmpEntry.name },
        baseOutputDir: tmpDir.name,
        polyfills: true,
        preset: mockJavascriptPreset,
        setup: {
          contentToInject: 'console.log("Hello World")',
          defineVars: {
            NODE_ENV: 'production',
          },
        },
      };

      const ctx: BuildContext = {
        production: true,
        handler: tmpEntry.name,
      };

      const webpackConfig = createAzionWebpackConfig(bundlerConfig, ctx);
      webpackConfig.mergeConfig(webpackConfig.baseConfig);

      expect(webpackConfig.baseConfig.entry).toEqual({ output: tmpEntry.name });
      expect(webpackConfig.baseConfig.output?.filename).toEqual('[name]');
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
    beforeEach(() => {
      Object.defineProperty(AzionWebpackConfig, 'plugins', {
        configurable: true,
        writable: true,
        value: [],
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });
    it('should execute webpack build process when env production false ', async () => {
      const code = `console.log(process.env.NODE_ENV);`;
      await fs.promises.writeFile(tmpEntry.name, code);

      const bundlerConfig: BuildConfiguration = {
        entry: { output: tmpEntry.name },
        baseOutputDir: tmpDir.name,
        polyfills: true,
        preset: mockJavascriptPreset,
        setup: {
          contentToInject: 'console.log("Hello World")',
          defineVars: {
            NODE_ENV: 'production',
          },
        },
      };

      const ctx: BuildContext = {
        production: false,
        handler: tmpEntry.name,
      };

      jest.spyOn(NodePolyfills, 'getAbsolutePath').mockImplementation((internalPath, moving) => {
        const pathDir = path.resolve('../bundler', moving);
        return `${pathDir}${internalPath}`;
      });

      const webpackConfig = createAzionWebpackConfig(bundlerConfig, ctx);
      await webpackConfig.executeBuild(webpackConfig);

      const outputPath = path.join(tmpDir.name, 'output');
      const result = fs.readFileSync(outputPath, 'utf-8');

      expect(result).toEqual(expect.stringContaining('production'));

      expect(webpackConfig.baseConfig.entry).toEqual({ output: tmpEntry.name });
      expect(webpackConfig.baseConfig.output?.filename).toEqual('[name]');
      expect(webpackConfig.baseConfig.optimization?.minimize).toEqual(false);
    });

    it('should execute webpack build process when node polyfills and env production true', async () => {
      const code = `import crypto from 'node:crypto';const id = crypto.randomUUID();`;
      await fs.promises.writeFile(tmpEntry.name, code);

      const bundlerConfig: BuildConfiguration = {
        entry: { output: tmpEntry.name },
        baseOutputDir: tmpDir.name,
        polyfills: true,
        preset: mockJavascriptPreset,
        setup: {
          contentToInject: 'console.log("Hello World")',
          defineVars: {
            NODE_ENV: 'production',
          },
        },
      };

      const ctx: BuildContext = {
        production: true,
        handler: tmpEntry.name,
      };

      jest.spyOn(NodePolyfills, 'getAbsolutePath').mockImplementation((internalPath, moving) => {
        const pathDir = path.resolve('../bundler', moving);
        return `${pathDir}${internalPath}`;
      });

      const webpackConfig = createAzionWebpackConfig(bundlerConfig, ctx);
      await webpackConfig.executeBuild(webpackConfig);
      const outputPath = path.join(tmpDir.name, 'output');
      const result = fs.readFileSync(outputPath, 'utf-8');

      expect(result).toEqual(expect.stringContaining('randomUUID()'));

      expect(webpackConfig.baseConfig.entry).toEqual({ output: tmpEntry.name });
      expect(webpackConfig.baseConfig.output?.filename).toEqual('[name]');
      expect(webpackConfig.baseConfig.optimization?.minimize).toEqual(true);
    }, 10000);
  });
});
