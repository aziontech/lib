/* eslint-disable consistent-return */
import { PluginBuild } from 'esbuild';
import fs from 'fs';
import path from 'path';
import azionLibs from '../../../../helpers/azion-local-polyfills';

/**
 * ESBuild Azion Module Plugin for polyfilling node modules.
 * @param {boolean} isProduction Parameter to identify whether the build is dev or prod
 * @returns {object} - ESBuild plugin object.
 */
const ESBuildAzionModulePlugin = (isProduction: boolean) => {
  const NAME = 'bundler-azion-modules-polyfills';
  const NAMESPACE = NAME;
  const filter = /^azion:/;
  const prefix = 'azion:';

  return {
    /**
     * Name and setup of the ESBuild plugin.
     * @param {object} build - ESBuild build object.
     */
    name: NAME,
    setup: (build: PluginBuild) => {
      const options = build.initialOptions;

      // external
      if (isProduction) {
        options.external = options.external || [];
        [...azionLibs.external].forEach(([key]) => {
          options.external = options.external || [];
          if (/^[^:]+:/.test(key) && !options.external.includes(key)) {
            options.external.push(key);
          }
        });
      }

      if (!isProduction) {
        // build inject prefix (azion:) is not present and the polyfill is Azion
        options.inject = options.inject || [];
        if (azionLibs.external) {
          [...azionLibs.external].forEach(([key, value]) => {
            const hasPrefix = /^[^:]+:/.test(key);
            if (!hasPrefix && key?.toLowerCase()?.includes(prefix.replace(':', ''))) {
              options.inject = options.inject || [];
              options.inject.push(value);
            }
          });
        }
      }

      /**
       * Resolve callback for ESBuild.
       * @param {object} args - Arguments object.
       * @returns {object|undefined} - Object with path and namespace or undefined.
       */
      build.onResolve({ filter }, async (args) => {
        if (!isProduction && azionLibs.external.has(args.path)) {
          return {
            path: args.path,
            namespace: NAMESPACE,
          };
        }
        if (!azionLibs.external.has(args.path)) {
          return;
        }

        // external bypass
        if (Array.isArray(options?.external) && options.external.includes(args.path)) {
          return;
        }

        return {
          path: args.path,
          namespace: NAMESPACE,
        };
      });

      /**
       * Load callback for node module files.
       * @param {object} args - Arguments object.
       * @returns {object} - Object with loader, contents, and resolve directory.
       */
      build.onLoad({ filter, namespace: NAMESPACE }, async (args) => {
        if (!azionLibs.external.has(args.path)) {
          return;
        }
        const resolved = azionLibs.external.get(args.path);
        if (!resolved) {
          throw new Error(`Could not resolve module: ${args.path}`);
        }

        const contents = await fs.promises.readFile(resolved, 'utf8');
        const resolveDir = path.dirname(resolved);

        return {
          loader: 'js',
          contents,
          resolveDir,
        };
      });
    },
  };
};

export default ESBuildAzionModulePlugin;
