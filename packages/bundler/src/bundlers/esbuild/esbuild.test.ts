// eslint-disable-next-line @typescript-eslint/no-explicit-any
import fs from 'fs';
import tmp from 'tmp';
import { BuildEnv, BundlerConfig } from '../../types/bundler';
import { createAzionESBuildConfig } from './esbuild';

describe('Esbuild Bundler', () => {
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

  describe('createAzionESBuildConfig', () => {
    it('should create base esbuild config', () => {
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        extend(context: any) {
          const config = context;
          config.minify = false;
          return config;
        },
      };

      const ctx: BuildEnv = {
        production: true,
        output: tmpOutput.name,
      };

      const esbuildConfig = createAzionESBuildConfig(bundlerConfig, ctx);

      expect(esbuildConfig.baseConfig).toBeDefined();
      expect(esbuildConfig.mergeConfig).toBeDefined();
      expect(esbuildConfig.applyConfig).toBeDefined();
    });
  });

  describe('createAzionESBuildConfig.mergeConfig', () => {
    it('should merge config when extend config is provided', () => {
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        extend(context: any) {
          const config = context;
          config.minify = false;
          return config;
        },
      };

      const ctx: BuildEnv = {
        production: true,
        output: tmpOutput.name,
      };

      const esbuildConfig = createAzionESBuildConfig(bundlerConfig, ctx);
      esbuildConfig.mergeConfig(esbuildConfig.baseConfig);

      expect(esbuildConfig.baseConfig.entryPoints).toEqual([tmpEntry.name]);
      expect(esbuildConfig.baseConfig.outfile).toEqual(tmpOutput.name);
      expect(esbuildConfig.baseConfig.minify).toEqual(false);
      expect(esbuildConfig.baseConfig.banner?.js).toEqual(expect.stringContaining('Built with Azion CLI'));
      expect(esbuildConfig.baseConfig.banner?.js).toEqual(expect.stringContaining('console.log("Hello World")'));
    });

    it('should merge config when extend config is not provided', () => {
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

      const esbuildConfig = createAzionESBuildConfig(bundlerConfig, ctx);
      esbuildConfig.mergeConfig(esbuildConfig.baseConfig);

      expect(esbuildConfig.baseConfig.entryPoints).toEqual([tmpEntry.name]);
      expect(esbuildConfig.baseConfig.outfile).toEqual(tmpOutput.name);
      expect(esbuildConfig.baseConfig.minify).toEqual(true);
      expect(esbuildConfig.baseConfig.banner?.js).toEqual(expect.stringContaining('Built with Azion CLI'));
    });
  });

  describe('createAzionESBuildConfig.executeBuild', () => {
    it('should execute build with provided config and env production false', async () => {
      const code = `import fs from 'node:fs';console.log(process.env.NODE_ENV);`;
      await fs.promises.writeFile(tmpEntry.name, code);

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        extend(context: any) {
          const config = context;
          config.minify = false;
          return config;
        },
      };

      const ctx: BuildEnv = {
        production: false,
        output: tmpOutput.name,
      };

      const esbuildConfig = createAzionESBuildConfig(bundlerConfig, ctx);
      await esbuildConfig.executeBuild(esbuildConfig);

      const result = fs.readFileSync(tmpOutputDev.name, 'utf-8');

      expect(result).toEqual(expect.stringContaining('production'));
      expect(result).toEqual(expect.stringContaining('internal-env-dev:fs'));
      expect(esbuildConfig.baseConfig.entryPoints).toEqual([tmpEntry.name]);
      expect(esbuildConfig.baseConfig.outfile).toEqual(tmpOutputDev.name);
      expect(esbuildConfig.baseConfig.minify).toEqual(false);
    });

    it('should execute build with node polyfills and env production true', async () => {
      const code = `import crypto from 'node:crypto';const id = crypto.randomUUID();`;
      await fs.promises.writeFile(tmpEntry.name, code);

      const bundlerConfig: BundlerConfig = {
        entry: tmpEntry.name,
        polyfills: true,
        preset: {
          name: 'javascript',
        },
        defineVars: {
          NODE_ENV: 'production',
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        extend(context: any) {
          const config = context;
          config.minify = false;
          return config;
        },
      };

      const ctx: BuildEnv = {
        production: true,
        output: tmpOutput.name,
      };

      const esbuildConfig = createAzionESBuildConfig(bundlerConfig, ctx);
      await esbuildConfig.executeBuild(esbuildConfig);

      const result = fs.readFileSync(tmpOutput.name, 'utf-8');

      expect(result).toEqual(expect.stringContaining('node-built-in-modules:'));

      expect(esbuildConfig.baseConfig.entryPoints).toEqual([tmpEntry.name]);
      expect(esbuildConfig.baseConfig.outfile).toEqual(tmpOutput.name);
      expect(esbuildConfig.baseConfig.minify).toEqual(false);
      expect(esbuildConfig.baseConfig.banner?.js).toEqual(expect.stringContaining('Built with Azion CLI'));
    });
  });
});
