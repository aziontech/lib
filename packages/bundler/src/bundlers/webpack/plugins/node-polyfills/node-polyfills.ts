import unenvPresetAzion from 'azion/unenv-preset';
import { getAbsoluteDirPath } from 'azion/utils/node';
import fs from 'fs';
import { createRequire } from 'module';
import path from 'path';
import { defineEnv } from 'unenv';
import { Compiler, WebpackPluginInstance } from 'webpack';

const require = createRequire(import.meta.url);

const { env } = defineEnv({
  nodeCompat: true,
  resolve: false,
  overrides: {
    ...unenvPresetAzion,
  },
});

const { alias, inject, polyfill, external } = env;

class NodePolyfillPlugin implements WebpackPluginInstance {
  private INTERNAL_POLYFILL_PATH = '/polyfills';
  private INTERNAL_POLYFILL_PATH_PROD = '/polyfills/node';
  private POLYFILL_PREFIX_DEV = 'aziondev:';
  private POLYFILL_PREFIX_PROD = 'azionprd:';
  private isProduction: boolean;
  private prefix: string;

  constructor(isProduction: boolean) {
    this.isProduction = isProduction;
    this.prefix = 'node:';
  }

  static getAbsolutePath = (internalPath: string, moving: string) => {
    const pathDir = path.join(getAbsoluteDirPath(import.meta.url, 'bundler'), moving);
    return `${pathDir}${internalPath}`;
  };

  changeToPolyfillPath = (key: string, value: string, polyfillPrefix: string, polyfillPath: string) => {
    const keyModule = key.replace(new RegExp(`^${this.prefix}`), '');
    const foundPolyfill = polyfill.find((p) => p.startsWith(`${polyfillPrefix}${keyModule}`));
    if (foundPolyfill) {
      const [, , pathPolyfill] = foundPolyfill.split(':');
      const internalPolyfillsPath = path.join(polyfillPath, pathPolyfill);
      const resolved = require.resolve(internalPolyfillsPath);
      return [key, resolved];
    }
    return [key, require.resolve(value)];
  };

  apply(compiler: Compiler): void {
    if (!compiler.options.plugins?.length) {
      compiler.options.plugins = [];
    }

    // additional plugin to handle "node:" URIs
    compiler.options.plugins.push(
      new compiler.webpack.NormalModuleReplacementPlugin(new RegExp(`^${this.prefix}`), (resource) => {
        const mod = resource.request.replace(new RegExp(`^${this.prefix}`), '');
        resource.request = mod;
      }),
    );

    // globals
    compiler.options.plugins.push(
      new compiler.webpack.ProvidePlugin(
        Object.fromEntries(
          Object.entries(inject).map(([key, value]) => {
            if (typeof value === 'string') {
              return [key, require.resolve(value)];
            }
            return [key, value];
          }),
        ),
      ),
    );

    // env
    const envsNext: Record<string, string | boolean> = {
      NODE_ENV: 'production',
    };
    if (fs.existsSync(path.join(process.cwd(), '.next'))) {
      const buildId = fs.readFileSync(path.join(process.cwd(), '.next/BUILD_ID'), 'utf-8');
      envsNext.NEXT_RUNTIME = 'edge';
      envsNext.NEXT_COMPUTE_JS = true;

      envsNext.__NEXT_BUILD_ID = buildId;
    }

    compiler.options.plugins.push(new compiler.webpack.EnvironmentPlugin(envsNext));

    if (this.isProduction) {
      compiler.options.externals = {
        ...(typeof compiler.options.externals === 'object' ? compiler.options.externals : {}),
        ...Object.fromEntries(
          [...external].flatMap((key) => {
            const moduleName = key.replace(new RegExp(`^${this.prefix}`), '');
            return [
              [key, key],
              [moduleName, moduleName],
            ];
          }),
        ),
      };
    }

    compiler.options.resolve.alias = {
      ...compiler.options.resolve.alias,
      ...alias,
    };

    compiler.options.resolve.fallback = {
      ...compiler.options.resolve.fallback,
      ...alias,
    };

    // change alias and fallback to polyfill path
    if (this.isProduction) {
      compiler.options.resolve.alias = {
        ...Object.fromEntries(
          Object.entries(compiler.options.resolve.alias).map(([key, value]) => {
            // change value to polyfill path
            return this.changeToPolyfillPath(
              key,
              value,
              this.POLYFILL_PREFIX_PROD,
              NodePolyfillPlugin.getAbsolutePath(this.INTERNAL_POLYFILL_PATH_PROD, '../unenv-preset/src'),
            );
          }),
        ),
      };
      compiler.options.resolve.fallback = {
        ...Object.fromEntries(
          Object.entries(compiler.options.resolve.fallback).map(([key, value]) => {
            // change value to polyfill path
            return this.changeToPolyfillPath(
              key,
              value,
              this.POLYFILL_PREFIX_PROD,
              NodePolyfillPlugin.getAbsolutePath(this.INTERNAL_POLYFILL_PATH_PROD, '../unenv-preset/src'),
            );
          }),
        ),
      };
    } else {
      compiler.options.resolve.alias = {
        ...Object.fromEntries(
          Object.entries(compiler.options.resolve.alias).map(([key, value]) => {
            // change value to polyfill path
            return this.changeToPolyfillPath(
              key,
              value,
              this.POLYFILL_PREFIX_DEV,
              NodePolyfillPlugin.getAbsolutePath(this.INTERNAL_POLYFILL_PATH, 'src'),
            );
          }),
        ),
      };
      compiler.options.resolve.fallback = {
        ...Object.fromEntries(
          Object.entries(compiler.options.resolve.fallback).map(([key, value]) => {
            // change value to polyfill path
            return this.changeToPolyfillPath(
              key,
              value,
              this.POLYFILL_PREFIX_DEV,
              NodePolyfillPlugin.getAbsolutePath(this.INTERNAL_POLYFILL_PATH, 'src'),
            );
          }),
        ),
      };
    }
  }
}

export default NodePolyfillPlugin;
