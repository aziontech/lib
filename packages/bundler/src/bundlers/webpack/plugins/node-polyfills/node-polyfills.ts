import unenvPresetAzion from 'azion/unenv-preset';
import fs from 'fs';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const getAbsolutePath = () => path.resolve(dirname, '../../../', '../');
const unenvPackagePath = () => path.resolve(dirname, '../../../../', '../../unenv-preset');

import path from 'path';
import { env, nodeless } from 'unenv';
import { Compiler, WebpackPluginInstance } from 'webpack';

const require = createRequire(import.meta.url);

const INTERNAL_POLYFILL_PATH = `${getAbsolutePath()}/polyfills`;
const INTERNAL_POLYFILL_PATH_PROD = `${unenvPackagePath()}/src/polyfills/node`;
const POLYFILL_PREFIX_DEV = 'aziondev:';
const POLYFILL_PREFIX_PROD = 'azionprd:';

const { alias, inject, polyfill, external } = env(nodeless, unenvPresetAzion);

class NodePolyfillPlugin implements WebpackPluginInstance {
  private buildProd: boolean;
  private prefix: string;

  constructor(buildProd: boolean) {
    this.buildProd = buildProd;
    this.prefix = 'node:';
  }

  #changeToPolyfillPath = (key: string, value: string, polyfillPrefix: string, polyfillPath: string) => {
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
      // eslint-disable-next-line no-underscore-dangle
      envsNext.__NEXT_BUILD_ID = buildId;
    }

    compiler.options.plugins.push(new compiler.webpack.EnvironmentPlugin(envsNext));

    if (this.buildProd) {
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
    if (this.buildProd) {
      compiler.options.resolve.alias = {
        ...Object.fromEntries(
          Object.entries(compiler.options.resolve.alias).map(([key, value]) => {
            // change value to polyfill path
            return this.#changeToPolyfillPath(key, value, POLYFILL_PREFIX_PROD, INTERNAL_POLYFILL_PATH_PROD);
          }),
        ),
      };
      compiler.options.resolve.fallback = {
        ...Object.fromEntries(
          Object.entries(compiler.options.resolve.fallback).map(([key, value]) => {
            // change value to polyfill path
            return this.#changeToPolyfillPath(key, value, POLYFILL_PREFIX_PROD, INTERNAL_POLYFILL_PATH_PROD);
          }),
        ),
      };
    } else {
      compiler.options.resolve.alias = {
        ...Object.fromEntries(
          Object.entries(compiler.options.resolve.alias).map(([key, value]) => {
            // change value to polyfill path
            return this.#changeToPolyfillPath(key, value, POLYFILL_PREFIX_DEV, INTERNAL_POLYFILL_PATH);
          }),
        ),
      };
      compiler.options.resolve.fallback = {
        ...Object.fromEntries(
          Object.entries(compiler.options.resolve.fallback).map(([key, value]) => {
            // change value to polyfill path
            return this.#changeToPolyfillPath(key, value, POLYFILL_PREFIX_DEV, INTERNAL_POLYFILL_PATH);
          }),
        ),
      };
    }
  }
}

export default NodePolyfillPlugin;
