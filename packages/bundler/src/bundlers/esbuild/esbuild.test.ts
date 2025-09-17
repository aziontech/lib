// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import tmp from 'tmp';

import { BuildConfiguration, BuildContext } from 'azion/config';
import { createAzionESBuildConfig } from './esbuild';
import helper from './plugins/node-polyfills/helper';

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

describe('Esbuild Bundler', () => {
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

  describe('createAzionESBuildConfig', () => {
    it('should create base esbuild config', () => {
      const bundlerConfig: BuildConfiguration = {
        entry: { output: tmpEntry.name },
        baseOutputDir: tmpDir.name,
        polyfills: true,
        preset: mockJavascriptPreset,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        extend(context: any) {
          const config = context;
          config.minify = false;
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

      const esbuildConfig = createAzionESBuildConfig(bundlerConfig, ctx);

      expect(esbuildConfig.baseConfig).toBeDefined();
      expect(esbuildConfig.mergeConfig).toBeDefined();
      expect(esbuildConfig.applyConfig).toBeDefined();
    });
  });

  describe('createAzionESBuildConfig.mergeConfig', () => {
    it('should merge config when extend config is provided', () => {
      const bundlerConfig: BuildConfiguration = {
        entry: { output: tmpEntry.name },
        baseOutputDir: tmpDir.name,
        polyfills: true,
        preset: mockJavascriptPreset,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        extend(context: any) {
          const config = context;
          config.minify = false;
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

      const esbuildConfig = createAzionESBuildConfig(bundlerConfig, ctx);
      esbuildConfig.mergeConfig(esbuildConfig.baseConfig);

      expect(esbuildConfig.baseConfig.entryPoints).toEqual({ output: tmpEntry.name });
      expect(esbuildConfig.baseConfig.outdir).toEqual(tmpDir.name);
      expect(esbuildConfig.baseConfig.entryNames).toEqual('[dir]/[name]');
      expect(esbuildConfig.baseConfig.minify).toEqual(false);
      expect(esbuildConfig.baseConfig.banner?.js).toEqual(expect.stringContaining('Built with Azion CLI'));
      expect(esbuildConfig.baseConfig.banner?.js).toEqual(expect.stringContaining('console.log("Hello World")'));
    });

    it('should merge config when extend config is not provided', () => {
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

      const esbuildConfig = createAzionESBuildConfig(bundlerConfig, ctx);
      esbuildConfig.mergeConfig(esbuildConfig.baseConfig);

      expect(esbuildConfig.baseConfig.entryPoints).toEqual({ output: tmpEntry.name });
      expect(esbuildConfig.baseConfig.outdir).toEqual(tmpDir.name);
      expect(esbuildConfig.baseConfig.entryNames).toEqual('[dir]/[name]');
      expect(esbuildConfig.baseConfig.minify).toEqual(true);
      expect(esbuildConfig.baseConfig.banner?.js).toEqual(expect.stringContaining('Built with Azion CLI'));
    });
  });

  describe('createAzionESBuildConfig.executeBuild', () => {
    it('should execute build with provided config and env production false', async () => {
      const code = `import fs from 'node:fs';console.log(process.env.NODE_ENV);`;
      await fs.promises.writeFile(tmpEntry.name, code);

      const bundlerConfig: BuildConfiguration = {
        entry: { output: tmpEntry.name },
        baseOutputDir: tmpDir.name,
        polyfills: true,
        preset: mockJavascriptPreset,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        extend(context: any) {
          const config = context;
          config.minify = false;
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
        production: false,
        handler: tmpEntry.name,
      };

      jest.spyOn(helper, 'getAbsolutePath').mockImplementation((moving, internalPath) => {
        const pathDir = path.resolve('../bundler', moving);
        return `${pathDir}${internalPath ? internalPath : ''}`;
      });

      const esbuildConfig = createAzionESBuildConfig(bundlerConfig, ctx);
      await esbuildConfig.executeBuild(esbuildConfig);

      const outputPath = path.join(tmpDir.name, 'output.js');
      const result = fs.readFileSync(outputPath, 'utf-8');

      expect(result).toEqual(expect.stringContaining('production'));
      expect(result).toEqual(expect.stringContaining('internal-env-dev:fs'));
      expect(esbuildConfig.baseConfig.entryPoints).toEqual({ output: tmpEntry.name });
      expect(esbuildConfig.baseConfig.outdir).toEqual(tmpDir.name);
      expect(esbuildConfig.baseConfig.entryNames).toEqual('[dir]/[name]');
      expect(esbuildConfig.baseConfig.minify).toEqual(false);
    });

    it('should execute build with node polyfills and env production true', async () => {
      const code = `import crypto from 'node:crypto';const id = crypto.randomUUID();`;
      await fs.promises.writeFile(tmpEntry.name, code);

      const bundlerConfig: BuildConfiguration = {
        entry: { output: tmpEntry.name },
        baseOutputDir: tmpDir.name,
        polyfills: true,
        preset: mockJavascriptPreset,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        extend(context: any) {
          const config = context;
          config.minify = false;
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

      const esbuildConfig = createAzionESBuildConfig(bundlerConfig, ctx);
      await esbuildConfig.executeBuild(esbuildConfig);

      const outputPath = path.join(tmpDir.name, 'output.js');
      const result = fs.readFileSync(outputPath, 'utf-8');

      expect(result).toEqual(expect.stringContaining('node-built-in-modules:'));

      expect(esbuildConfig.baseConfig.entryPoints).toEqual({ output: tmpEntry.name });
      expect(esbuildConfig.baseConfig.outdir).toEqual(tmpDir.name);
      expect(esbuildConfig.baseConfig.entryNames).toEqual('[dir]/[name]');
      expect(esbuildConfig.baseConfig.minify).toEqual(false);
      expect(esbuildConfig.baseConfig.banner?.js).toEqual(expect.stringContaining('Built with Azion CLI'));
    });
  });
});
