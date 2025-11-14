import { base_path, manifest, prerendered } from 'MANIFEST';
import { Server } from 'SERVER';
import { lookup as lookupCache, save as saveCache } from 'azion/preset/sveltekit/cache';

const server = new Server(manifest);

const app_path = `/${manifest.appPath}`;

const immutable = `${app_path}/immutable/`;
const version_file = `${app_path}/version.json`;

/**
 * We don't know the origin until we receive a request, but
 * that's guaranteed to happen before we call `read`
 * @type {string}
 */
let origin;

/**
 * @param {Request | string} request
 * @returns {Promise<Response>}
 */
const getStorageAsset = async (request) => {
  try {
    const urlString = request instanceof Request ? request.url : request;
    const requestPath = decodeURIComponent(new URL(urlString).pathname);
    const assetUrl = new URL(requestPath === '/' ? 'index.html' : requestPath, 'file://');
    return fetch(assetUrl);
  } catch (e) {
    return new Response(e.message || e.toString(), { status: 404 });
  }
};

/**
 * @type {{ ASSETS: { fetch: typeof fetch } }}
 */
const env = {
  ASSETS: {
    fetch: getStorageAsset,
  },
};

const initialized = server.init({
  // @ts-expect-error env contains environment variables and bindings
  env,
  read: async (file) => {
    const url = `${origin}/${file}`;
    const response = await /** @type {{ ASSETS: { fetch: typeof fetch } }} */ (env).ASSETS.fetch(url);

    if (!response.ok) {
      throw new Error(`read(...) failed: could not fetch ${url} (${response.status} ${response.statusText})`);
    }

    return response.body;
  },
});

export default {
  /**
   * @param {Request} req
   * @param {{ ASSETS: { fetch: typeof fetch } }} env
   * @param {unknown} ctx
   * @returns {Promise<Response>}
   */
  async fetch(req, env, ctx) {
    env = {
      ...env,
      ASSETS: {
        fetch: getStorageAsset,
      },
    };

    if (!origin) {
      origin = new URL(req.url).origin;
      await initialized;
    }

    // skip cache if "cache-control: no-cache" in request
    let pragma = req.headers.get('cache-control') || '';
    let res = !pragma.includes('no-cache') && (await lookupCache(req));
    if (res) return res;

    let { pathname, search } = new URL(req.url);
    try {
      pathname = decodeURIComponent(pathname);
    } catch {
      // ignore invalid URI
    }

    const stripped_pathname = pathname.replace(/\/$/, '');

    // files in /static, the service worker, and Vite imported server assets
    let is_static_asset = false;
    const filename = stripped_pathname.slice(base_path.length + 1);
    if (filename) {
      is_static_asset =
        manifest.assets.has(filename) ||
        manifest.assets.has(filename + '/index.html') ||
        filename in manifest._.server_assets ||
        filename + '/index.html' in manifest._.server_assets;
    }

    let location = pathname.at(-1) === '/' ? stripped_pathname : pathname + '/';

    if (is_static_asset || prerendered.has(pathname) || pathname === version_file || pathname.startsWith(immutable)) {
      res = await env.ASSETS.fetch(req);
    } else if (location && prerendered.has(location)) {
      // trailing slash redirect for prerendered pages
      if (search) location += search;
      res = new Response('', {
        status: 308,
        headers: {
          location,
        },
      });
    } else {
      // dynamically-generated pages
      res = await server.respond(req, {
        // @ts-expect-error caches is not defined
        platform: {
          env,
          ctx,
        },
        getClientAddress() {
          return /** @type {string} */ (req.headers.get('metadata.client_ip'));
        },
      });
    }

    // write to `Cache` only if response is not an error,
    // let `Cache.save` handle the Cache-Control and Vary headers
    pragma = res.headers.get('cache-control') || '';
    return pragma && res.status < 400 ? saveCache(req, res, ctx) : res;
  },
};
