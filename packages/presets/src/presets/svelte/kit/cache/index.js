/* eslint-disable */

const cacheStorageName = 'sveltekit-cache';
const hostname = 'cacheapisveltekit';

/**
 * @param {Request | string} request
 */
export async function lookup(request, buildId) {
  let isHEAD = typeof request !== 'string' && request.method === 'HEAD';
  if (isHEAD) request = new Request(request, { method: 'GET' });

  try {
    const pathname = new URL(request.url).pathname;
    const cache = await caches.open(`${cacheStorageName}-${buildId}`);
    const url = new URL(pathname, `http://${hostname}`);
    const newRequest = new Request(url);
    const result = await cache.match(newRequest);
    if (process.env.AZ_SVELTEKIT_CACHE_DEBUG) {
      console.log('[Cache lookup] Checking cache for', request.url, pathname, buildId);
    }
    if (result?.text) {
      const res = await result.text();
      if (isHEAD && res) {
        if (process.env.AZ_SVELTEKIT_CACHE_DEBUG)
          console.log('[Cache lookup] Found cache for', request.url, pathname, buildId);
        return res;
      }
      return new Response(null, res);
    }
    if (process.env.AZ_SVELTEKIT_CACHE_DEBUG)
      console.log('[Cache lookup] No cache found for', request.url, pathname, buildId);
    return null;
  } catch (error) {
    if (process.env.AZ_SVELTEKIT_CACHE_DEBUG) {
      const pathname = new URL(request.url).pathname;
      const message = error instanceof Error ? error.message : String(error);
      console.log(
        '[Cache lookup] No cache found for or caches not implemented',
        request.url,
        pathname,
        buildId,
        message,
      );
    }

    return null;
  }
}

/**
 * @param {Request | string} request
 * @param {Response} res
 * @param {any} ctx
 * @param {string} buildId
 */
export function save(request, res, ctx, buildId) {
  const isGET = typeof request === 'string' || request.method === 'GET';

  if (isGET && isCacheable(res)) {
    if (res.headers.has('Set-Cookie')) {
      res = new Response(res.body, res);
      res.headers.append('Cache-Control', 'private=Set-Cookie');
    }
    ctx.waitUntil(put(request, res.clone(), buildId));
  }
  return res;
}

/**
 * @param {Response} res
 */
export function isCacheable(res) {
  if (res.status === 206) return false;

  const vary = res.headers.get('Vary') || '';
  if (!!~vary.indexOf('*')) return false;

  const ccontrol = res.headers.get('Cache-Control') || '';
  if (/(private|no-cache|no-store)/i.test(ccontrol)) return false;

  return true;
}

/**
 * @param {Request | string} request
 * @param {Response} res
 * @param {any} ctx
 */
export async function put(request, res, buildId) {
  try {
    const pathname = new URL(request.url).pathname;
    const url = new URL(pathname, `http://${hostname}`);
    const newRequest = new Request(url);
    const cache = await caches.open(`${cacheStorageName}-${buildId}`);
    await cache.put(newRequest, res.clone());
    if (process.env.AZ_SVELTEKIT_CACHE_DEBUG) console.log('[Cache put] Cached for', request.url, pathname, buildId);
  } catch (error) {
    if (process.env.AZ_SVELTEKIT_CACHE_DEBUG) {
      const pathname = new URL(request.url).pathname;
      const message = error instanceof Error ? error.message : String(error);
      console.log('[Cache put] No cache found for or caches not implemented', request.url, pathname, buildId, message);
    }
  }
}
