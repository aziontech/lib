/* eslint-disable consistent-return */
import unenvPresetAzion from 'azion/unenv-preset';
import { PluginBuild } from 'esbuild';
import fs from 'fs';
import { createRequire } from 'module';
import { builtinModules } from 'node:module';
import path from 'path';
import { env, nodeless } from 'unenv';
import helper from './helper/index';

const requireCustom = createRequire(import.meta.url);

const { alias, inject, polyfill, external } = env(nodeless, unenvPresetAzion);

interface BuildOptions {
  define?: Record<string, string>;
}

interface GlobalInjectResult {
  importStatement: string;
  exportName: string;
}

type GlobalInjectValue = string | string[] | [string, string];

/**
 * Get global inject
 * @param {*} globalInject Global inject
 * @returns {*} Return import statement and export name
 */
function getGlobalInject(globalInject: GlobalInjectValue): GlobalInjectResult {
  if (typeof globalInject === 'string') {
    return {
      importStatement: `import globalVar from "${globalInject}";`,
      exportName: 'globalVar',
    };
  }
  if (Array.isArray(globalInject) && globalInject.length === 2) {
    const [moduleSpecifier, exportName] = globalInject;
    return {
      importStatement: `import { ${exportName} } from "${moduleSpecifier}";`,
      exportName,
    };
  }
  throw new Error(`Invalid global inject value: ${globalInject}`);
}

/**
 * Handle alias unenv
 * @param {*} build Build object
 */
function handleAliasUnenv(build: PluginBuild) {
  const UNENV_ALIAS_NAMESPACE = 'imported-unenv-alias';

  const aliasAbsolute: Record<string, string> = {};

  Object.entries(alias).forEach(([module, unresolvedAlias]: [string, string]) => {
    try {
      aliasAbsolute[module] = requireCustom.resolve(unresolvedAlias).replace(/\.cjs$/, '.mjs');
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error.message);
      }
      // this is an alias for package that is not installed in the current app => ignore
    }
  });

  const UNENV_ALIAS_RE = new RegExp(`^(${Object.keys(aliasAbsolute).join('|')})$`);

  build.onResolve({ filter: UNENV_ALIAS_RE }, (args) => {
    return {
      path: args.path,
      namespace: UNENV_ALIAS_NAMESPACE,
    };
  });

  build.onLoad({ filter: /.*/, namespace: UNENV_ALIAS_NAMESPACE }, async (args) => {
    const filePath = aliasAbsolute[args.path];
    const contents = await fs.promises.readFile(filePath, 'utf8');
    const resolveDir = path.dirname(filePath);

    return {
      loader: 'js',
      contents,
      resolveDir,
    };
  });
}

/**
 * Node built in modules
 * @param {*} build Build object
 * @param {*} isProd Is production build
 */
function nodeBuiltInModules(
  build: PluginBuild,
  isProd: boolean,
  prefixProd: string,
  prefixDev: string,
  internalNameProd: string,
  internalNameDev: string,
) {
  const IMPORTED_NODE_BUILT_IN_NAMESPACE = 'node-built-in-modules';

  const NODEJS_MODULES_RE = new RegExp(`^(node:)?(${builtinModules.join('|')})$`);

  build.onResolve({ filter: NODEJS_MODULES_RE }, (args) => {
    const nameModuleWithoutNode = args.path.replace('node:', '');
    const pathAlias = alias[nameModuleWithoutNode] ?? alias[args.path] ?? args.path;

    const findModulePolyfill = (prefix: string, nameModule: string): string | undefined => {
      return polyfill.find((p) => p.startsWith(`${prefix}${nameModule}`));
    };

    const resolvePolyfill = (
      prefix: string,
      namespace: string,
      nameModule: string,
    ): { path: string; namespace?: string; external?: boolean } | undefined => {
      const externalModule = external.find((ext) => {
        return ext === nameModule || ext === args.path || `node:${nameModule}` === ext;
      });
      const polyfillResult = findModulePolyfill(prefix, nameModule);
      // if polyfill is not found, check if the module is external
      if (!polyfillResult && externalModule) {
        return {
          path: args.path,
          external: externalModule.includes(args.path),
        };
      }
      if (polyfillResult) {
        return { path: nameModule, namespace };
      }
    };

    const result = isProd
      ? resolvePolyfill(prefixProd, internalNameProd, nameModuleWithoutNode)
      : resolvePolyfill(prefixDev, internalNameDev, nameModuleWithoutNode);

    return (
      result ?? {
        path: pathAlias,
        namespace: IMPORTED_NODE_BUILT_IN_NAMESPACE,
        external: external.includes(args.path),
      }
    );
  });

  build.onLoad({ filter: /.*/, namespace: IMPORTED_NODE_BUILT_IN_NAMESPACE }, async (args) => {
    const resolved = requireCustom.resolve(args.path);
    const contents = await fs.promises.readFile(resolved, 'utf8');
    const resolveDir = path.dirname(resolved);

    return {
      loader: 'js',
      contents,
      resolveDir,
    };
  });
}

/**
 * Handle node js globals
 * @param {*} build Build object
 */
function handleNodeJSGlobals(build: PluginBuild, getAbsolutePath: (moving: string) => string) {
  const UNENV_GLOBALS_RE = /_global_polyfill-([^.]+)\.js$/;
  const prefix = path.resolve(getAbsolutePath('../'), '_global_polyfill-');

  // eslint-disable-next-line no-param-reassign
  build.initialOptions.inject = [
    ...(build.initialOptions.inject ?? []),
    ...Object.keys(inject).map((globalName) => `${prefix}${globalName}.js`),
  ];

  build.onResolve({ filter: UNENV_GLOBALS_RE }, (args) => ({
    path: args.path,
  }));

  build.onLoad({ filter: UNENV_GLOBALS_RE }, (args) => {
    const match = args.path.match(UNENV_GLOBALS_RE);
    if (!match?.[1]) throw new Error(`Invalid global name: ${args.path}`);

    const globalName = match[1];
    const { importStatement, exportName } = getGlobalInject(inject[globalName]);

    return {
      contents: `
				${importStatement}
				globalThis.${globalName} = ${exportName};
			`,
    };
  });
}

/**
 * Handle internal polyfill env dev
 * @param {*} build Build object
 */
function handleInternalPolyfillEnvDev(build: PluginBuild, namespace: string, prefix: string, internalPath: string) {
  build.onLoad({ filter: /.*/, namespace: namespace }, async (args) => {
    try {
      const argsPathWhitoutNode = args.path.replace('node:', '');
      const polyfillPath = polyfill.find((p) => p.startsWith(`${prefix}${argsPathWhitoutNode}`));
      if (!polyfillPath) {
        throw new Error(`Polyfill not found for ${argsPathWhitoutNode}`);
      }
      const internalPolyfillsPath = path.join(
        internalPath,
        polyfillPath.replace(`${prefix}${argsPathWhitoutNode}:/`, ''),
      );
      const contents = await fs.promises.readFile(internalPolyfillsPath, 'utf8');
      const resolveDir = path.dirname(internalPolyfillsPath);
      return {
        loader: 'js',
        contents,
        resolveDir,
      };
    } catch (error) {
      console.error(`Error loading polyfill for ${args.path}`, error);
    }
  });
}

/**
 * Handle internal polyfill env prod
 */
function handleInternalPolyfillEnvProd(build: PluginBuild, namespace: string, prefix: string, internalPath: string) {
  build.onLoad({ filter: /.*/, namespace: namespace }, async (args) => {
    try {
      const polyfillPath = polyfill.find((p) => p.startsWith(`${prefix}${args.path}`));
      if (!polyfillPath) {
        throw new Error(`Polyfill not found for ${args.path}`);
      }

      const internalPolyfillsPath = path.join(internalPath, polyfillPath.replace(`${prefix}${args.path}:/`, ''));
      const resolved = requireCustom.resolve(internalPolyfillsPath);

      const contents = await fs.promises.readFile(resolved, 'utf8');
      const resolveDir = path.dirname(resolved);
      return {
        loader: 'js',
        contents,
        resolveDir,
      };
    } catch (error) {
      console.error(`Error loading polyfill prod for ${args.path}`, error);
    }
  });
}

function defineNextJsRuntime(options: BuildOptions) {
  if (fs.existsSync(path.join(process.cwd(), '.next'))) {
    const buildId = fs.readFileSync(path.join(process.cwd(), '.next/BUILD_ID'), 'utf-8');
    // eslint-disable-next-line no-param-reassign
    options.define = {
      ...options.define,
      'process.env.NEXT_RUNTIME': '"edge"',
      'process.env.NEXT_COMPUTE_JS': 'true',
      'process.env.__NEXT_BUILD_ID': `"${buildId}"`,
    };
  }
}

/**
 * ESBuild Node Module Plugin for polyfilling node modules.
 */
const ESBuildNodeModulePlugin = (buildProd: boolean) => {
  const NAME = 'bundler-node-modules-polyfills';

  const INTERNAL_POLYFILL_DEV = 'internal-env-dev';
  const INTERNAL_POLYFILL_PROD = 'internal-env-prod';
  const INTERNAL_POLYFILL_PATH = '/polyfills';
  const INTERNAL_POLYFILL_PATH_PROD = '/polyfills/node';
  const POLYFILL_PREFIX_DEV = 'aziondev:';
  const POLYFILL_PREFIX_PROD = 'azionprd:';

  const getAbsolutePath = (moving: string, internalPath?: string) => {
    return helper.getAbsolutePath(moving, internalPath);
  };

  return {
    /**
     * Name and setup of the ESBuild plugin.
     * @param {object} build - ESBuild build object.
     */
    name: NAME,
    setup: (build: PluginBuild) => {
      // build options
      const options = build.initialOptions;
      options.define = options.define || {};

      if (!options.define?.global) {
        options.define.global = 'globalThis';
      }

      // define env
      options.define = {
        ...options.define,
        'process.env.NODE_ENV': '"production"',
      };

      // define nextjs runtime
      defineNextJsRuntime(options);

      // build inject
      options.inject = options.inject || [];

      options.alias = {
        ...options.alias,
      };

      // resolve modules
      nodeBuiltInModules(
        build,
        buildProd,
        POLYFILL_PREFIX_PROD,
        POLYFILL_PREFIX_DEV,
        INTERNAL_POLYFILL_PROD,
        INTERNAL_POLYFILL_DEV,
      );
      handleAliasUnenv(build);
      handleNodeJSGlobals(build, getAbsolutePath);
      handleInternalPolyfillEnvDev(
        build,
        INTERNAL_POLYFILL_DEV,
        POLYFILL_PREFIX_DEV,
        getAbsolutePath('src', INTERNAL_POLYFILL_PATH),
      );
      handleInternalPolyfillEnvProd(
        build,
        INTERNAL_POLYFILL_PROD,
        POLYFILL_PREFIX_PROD,
        getAbsolutePath('../unenv-preset/src', INTERNAL_POLYFILL_PATH_PROD),
      );
    },
  };
};

export default ESBuildNodeModulePlugin;
