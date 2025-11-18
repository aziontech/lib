import { copyFileSync, existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const name = 'sveltejs/adapter-azion';
// TODO: Implement version check
// const [kit_major, kit_minor] = VERSION.split('.');

/**
 * @template T
 * @template {keyof T} K
 * @typedef {Partial<Omit<T, K>> & Required<Pick<T, K>>} PartialExcept
 */

/**
 * We use a custom `Builder` type here to support the minimum version of SvelteKit.
 * @typedef {PartialExcept<import('@sveltejs/kit').Builder, 'log' | 'rimraf' | 'mkdirp' | 'config' | 'prerendered' | 'routes' | 'createEntries' | 'generateFallback' | 'generateEnvModule' | 'generateManifest' | 'getBuildDirectory' | 'getClientDirectory' | 'getServerDirectory' | 'getAppPath' | 'writeClient' | 'writePrerendered' | 'writePrerendered' | 'writeServer' | 'copy' | 'compress'>} Builder2_0_0
 */

/** @type {import('./index.js').default} */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function (options = {}) {
  return {
    name,
    /** @param {Builder2_0_0} builder */
    async adapt(builder) {
      if (!builder.routes) {
        throw new Error(
          '@sveltejs/adapter-azion >=2.x (possibly installed through @sveltejs/adapter-auto) requires @sveltejs/kit version 1.5 or higher. ' +
            'Either downgrade the adapter or upgrade @sveltejs/kit',
        );
      }

      if (existsSync(`${builder.config.kit.files.assets}/_headers`)) {
        throw new Error(
          `The _headers file should be placed in the project root rather than the ${builder.config.kit.files.assets} directory`,
        );
      }

      if (existsSync(`${builder.config.kit.files.assets}/_redirects`)) {
        throw new Error(
          `The _redirects file should be placed in the project root rather than the ${builder.config.kit.files.assets} directory`,
        );
      }

      let dest = builder.getBuildDirectory('azion');
      let assetsDest = builder.getBuildDirectory('../build');
      let workerDest = `${dest}/_worker.js`;
      let assetsBinding = 'ASSETS';

      const files = fileURLToPath(new URL('./files', import.meta.url).href);
      const tmp = builder.getBuildDirectory('azion-tmp');

      builder.rimraf(dest);
      builder.rimraf(workerDest);
      builder.rimraf(assetsDest);

      builder.mkdirp(dest);
      builder.mkdirp(assetsDest);
      builder.mkdirp(tmp);

      // client assets and prerendered pages
      builder.writeClient(assetsDest);
      builder.writePrerendered(assetsDest);

      // worker
      const workerDestDir = path.dirname(workerDest);
      writeFileSync(
        `${tmp}/manifest.js`,
        `export const manifest = ${builder.generateManifest({ relativePath: path.posix.relative(tmp, builder.getServerDirectory()) })};\n\n` +
          `export const prerendered = new Set(${JSON.stringify(builder.prerendered.paths)});\n\n` +
          `export const base_path = ${JSON.stringify(builder.config.kit.paths.base)};\n`,
      );

      // make buildId unique, with builder version and id 10 characters
      let buildId = generateId(10);
      try {
        const { name } = builder.config.kit.version;
        buildId = `${name}-${generateId(10)}`;
      } catch {
        console.log('Error parsing builder version, using random buildId');
      }

      builder.copy(`${files}/worker.js`, workerDest, {
        replace: {
          // the paths returned by the Wrangler config might be Windows paths,
          // so we need to convert them to POSIX paths or else the backslashes
          // will be interpreted as escape characters and create an incorrect import path
          SERVER: `${posixify(path.relative(workerDestDir, builder.getServerDirectory()))}/index.js`,
          MANIFEST: `${posixify(path.relative(workerDestDir, tmp))}/manifest.js`,
          ASSETS: assetsBinding,
          BUILD_ID: buildId,
        },
      });
      if (builder.hasServerInstrumentationFile?.()) {
        builder.instrument?.({
          entrypoint: workerDest,
          instrumentation: `${builder.getServerDirectory()}/instrumentation.server.js`,
        });
      }

      // _headers
      if (existsSync('_headers')) {
        copyFileSync('_headers', `${assetsDest}/_headers`);
      }
      writeFileSync(`${assetsDest}/_headers`, generate_headers(builder.getAppPath()), { flag: 'a' });

      // _redirects
      if (existsSync('_redirects')) {
        copyFileSync('_redirects', `${assetsDest}/_redirects`);
      }
      if (builder.prerendered.redirects.size > 0) {
        writeFileSync(`${assetsDest}/_redirects`, generate_redirects(builder.prerendered.redirects), {
          flag: 'a',
        });
      }
    },
    emulate() {
      // we want to invoke `getPlatformProxy` only once, but await it only when it is accessed.
      // If we would await it here, it would hang indefinitely because the platform proxy only resolves once a request happens
      const get_emulated = async () => {
        const platform = /** @type {App.Platform} */ ({});
        /** @type {Record<string, any>} */
        const env = {};
        const prerender_platform = /** @type {App.Platform} */ (/** @type {unknown} */ ({ env }));
        return { platform, prerender_platform };
      };

      /** @type {{ platform: App.Platform, prerender_platform: App.Platform }} */
      let emulated;

      return {
        platform: async ({ prerender }) => {
          emulated ??= await get_emulated();
          return prerender ? emulated.prerender_platform : emulated.platform;
        },
      };
    },
    supports: {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      read: ({ route }) => {
        // TODO bump peer dep in next adapter major to simplify this

        return true;
      },
      instrumentation: () => true,
    },
  };
}

/** @param {string} app_dir */
function generate_headers(app_dir) {
  return `
# === START AUTOGENERATED SVELTE IMMUTABLE HEADERS ===
/${app_dir}/*
  X-Robots-Tag: noindex
	Cache-Control: no-cache
/${app_dir}/immutable/*
  ! Cache-Control
	Cache-Control: public, immutable, max-age=31536000
# === END AUTOGENERATED SVELTE IMMUTABLE HEADERS ===
`.trimEnd();
}

/** @param {Map<string, { status: number; location: string }>} redirects */
function generate_redirects(redirects) {
  const rules = Array.from(
    redirects.entries(),
    ([path, redirect]) => `${path} ${redirect.location} ${redirect.status}`,
  ).join('\n');

  return `
# === START AUTOGENERATED SVELTE PRERENDERED REDIRECTS ===
${rules}
# === END AUTOGENERATED SVELTE PRERENDERED REDIRECTS ===
`.trimEnd();
}

/** @param {string} str */
function posixify(str) {
  return str.replace(/\\/g, '/');
}

function generateId(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
