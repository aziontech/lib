/* eslint-disable */
// export const Cache = (caches as any).default;

/**
 * @param {Request | string} request
 */
export async function lookup(request) {
  let req = request || request;
  let isHEAD = typeof req !== 'string' && req.method === 'HEAD';
  if (isHEAD) req = new Request(req, { method: 'GET' });

  console.log('Cache.lookup', req instanceof Request ? req.url : req);
  // TODO: implement cache
  // let res = await Cache.match(req);
  let res = null;
  if (isHEAD && res) res = new Response(null, res);
  return res;
}

/**
 * @param {Request | string} request
 * @param {Response} res
 * @param {any} ctx
 */
export function save(request, res, ctx) {
  const req = request || request;
  const isGET = typeof req === 'string' || req.method === 'GET';

  if (isGET && isCacheable(res)) {
    if (res.headers.has('Set-Cookie')) {
      res = new Response(res.body, res);
      res.headers.append('Cache-Control', 'private=Set-Cookie');
    }
    // ctx.waitUntil(Cache.put(req, res.clone()));
    // TODO: implement cache
    console.log('Cache.put', req instanceof Request ? req.url : req);
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
