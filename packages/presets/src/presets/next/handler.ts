/* eslint-disable */
import { AzionRuntimeCtx, AzionRuntimeRequest } from 'azion/types';
import { handleImageResizingRequest } from './default/handler/images.js';
import { adjustRequestForVercel } from './default/handler/routing/http.js';
import { handleRequest } from './default/handler/routing/index.js';
import handlerStatic from './static/handler.js';

const getStorageAsset = async (request: Request) => {
  try {
    const requestPath = new URL(request.url).pathname;
    const assetUrl = new URL(requestPath === '/' ? 'index.html' : requestPath, 'file://');

    return fetch(assetUrl);
  } catch (e) {
    return new Response((e as Error).message || (e as Error).toString(), { status: 500 });
  }
};

/**
 *
 * @param request
 * @param env
 * @param ctx
 */
async function main(request: Request, env: Record<string, any>, ctx: any) {
  // @ts-expect-error - Ignore TS error because this file is not compiled
  const envAsyncLocalStorage = new AsyncLocalStorage();

  globalThis.process.env = { ...globalThis.process.env, ...env };

  return envAsyncLocalStorage.run({ ...env }, async () => {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/_next/image')) {
      return handleImageResizingRequest(request, {
        // @ts-expect-error - Ignore TS error because this file is not compiled
        buildOutput: __BUILD_OUTPUT__,
        assetsFetcher: env.ASSETS,
        // @ts-expect-error - Ignore TS error because this file is not compiled
        imagesConfig: __CONFIG__.images,
      });
    }

    const adjustedRequest = adjustRequestForVercel(request);
    return handleRequest(
      {
        request: adjustedRequest,
        ctx,
        assetsFetcher: env.ASSETS,
      },
      // @ts-expect-error - Ignore TS error because this file is not compiled
      __CONFIG__,
      // @ts-expect-error - Ignore TS error because this file is not compiled
      __BUILD_OUTPUT__,
      // @ts-expect-error - Ignore TS error because this file is not compiled
      __BUILD_METADATA__,
    );
  });
}

/**
 * Handles the request.
 * @param {AzionRuntimeRequest} request - The request.
 * @param {AzionRuntimeCtx} ctx - The context.
 * @returns {Promise<Response>} The response for the request.
 */
async function handlerDefault(request: AzionRuntimeRequest, ctx: AzionRuntimeCtx): Promise<Response> {
  const env = {
    ASSETS: {
      fetch: getStorageAsset,
    },
  };

  const context = {
    waitUntil: ctx.waitUntil,
    passThroughOnException: () => null,
  };

  const url = new URL(decodeURI(request.url));
  const adjustedRequest = new Request(url, request);

  return main(adjustedRequest, env, context);
}

async function handleFetch(request: AzionRuntimeRequest, ctx: AzionRuntimeCtx): Promise<Response> {
  if ((globalThis as any).bundler?.nextBuildStatic) {
    return handlerStatic.fetch(request);
  }
  return handlerDefault(request, ctx);
}

export default { fetch: handleFetch };
