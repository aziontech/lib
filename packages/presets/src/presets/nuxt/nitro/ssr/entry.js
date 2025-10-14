import '#nitro-internal-pollyfills';
import { isPublicAssetURL } from '#nitro-internal-virtual/public-assets';
import { useNitroApp } from 'nitropack/runtime';
import { requestHasBody } from 'nitropack/runtime/internal';

const nitroApp = useNitroApp();

function isPrerenderedRoute(url, manifest) {
  if (!manifest) {
    return;
  }
  try {
    const parsedManifest = JSON.parse(manifest);
    const prerenderedRoutes = parsedManifest?.prerendered;
    const prerenderedRoute = prerenderedRoutes?.find((route) => route === url.pathname);
    return prerenderedRoute;
  } catch {
    return;
  }
}

async function getPrerenderedAsset(request) {
  const newUrl = new URL(request.url);
  newUrl.pathname = `${newUrl.pathname}/index.html`;
  const prerenderedRequest = new Request(newUrl.toString(), request);
  return await getStorageAsset(prerenderedRequest);
}

async function handleEvent(request, ctx) {
  const url = new URL(request.url);
  const manifest = globalThis?.bundler?.__AZ_NUXT_MANIFEST__;
  const isPrerendered = isPrerenderedRoute(url, manifest);
  if (isPrerendered) {
    try {
      return await getPrerenderedAsset(request);
    } catch {
      // Ignore
    }
  }
  try {
    if (isPublicAssetURL(url.pathname) || url.pathname.startsWith('/_nuxt')) {
      return await getStorageAsset(request);
    }
  } catch {
    // Ignore
  }

  let body;
  if (requestHasBody(request)) {
    body = Buffer.from(await request.arrayBuffer());
  }

  return nitroApp.localFetch(url.pathname + url.search, {
    context: {
      waitUntil: (promise) => ctx.waitUntil(promise),
      _platform: {},
    },
    host: url.hostname,
    protocol: url.protocol,
    headers: request.headers,
    method: request.method,
    redirect: request.redirect,
    body,
  });
}

const getStorageAsset = async (request) => {
  try {
    const urlString = request instanceof Request ? request.url : request.toString();
    const requestPath = decodeURIComponent(new URL(urlString).pathname);
    const assetUrl = new URL(requestPath === '/' ? 'index.html' : requestPath, 'file://');
    return fetch(assetUrl);
  } catch (e) {
    return new Response(e.message || e.toString(), {
      status: 404,
    });
  }
};

export default {
  fetch: async (request, env, ctx) => {
    return handleEvent(request, ctx);
  },
};
