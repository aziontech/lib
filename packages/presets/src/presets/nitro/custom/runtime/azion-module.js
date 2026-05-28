import '#nitro/virtual/polyfills';
import { isPublicAssetURL } from '#nitro/virtual/public-assets';
import { useNitroApp } from 'nitro/app';

function attachRuntimeContext(request, ctx) {
  request.runtime ??= { name: 'azion' };
  request.runtime.azion = {
    ...request.runtime.azion,
    ...ctx,
  };
  request.waitUntil = ctx.context?.waitUntil.bind(ctx.context);
}

async function fetchStaticAsset(url) {
  try {
    const pathname = decodeURIComponent(url.pathname);
    const assetUrl = new URL(pathname === '/' ? 'index.html' : pathname, 'file://');
    return fetch(assetUrl);
  } catch (e) {
    return new Response(e.message || e.toString(), { status: 404 });
  }
}

const nitroApp = useNitroApp();

export default {
  async fetch(request, env, context) {
    globalThis.__env__ = env;
    attachRuntimeContext(request, { env, context });

    const url = new URL(request.url);

    if (isPublicAssetURL(url.pathname)) {
      return await fetchStaticAsset(url);
    }

    return await nitroApp.fetch(request);
  },
};
