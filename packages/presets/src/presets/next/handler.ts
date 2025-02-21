/* eslint-disable */
// @ts-expect-error - Ignore TS error because this file is not compiled
import { handleImageResizingRequest } from 'VULCAN_LIB_PATH/presets/next/default/handler/images.js';
// @ts-expect-error - Ignore TS error because this file is not compiled
import { handleRequest } from 'VULCAN_LIB_PATH/presets/next/default/handler/routing/index.js';
// @ts-expect-error - Ignore TS error because this file is not compiled
import { adjustRequestForVercel } from 'VULCAN_LIB_PATH/presets/next/default/handler/routing/http.js';
// @ts-expect-error - Ignore TS error because this file is not compiled
import handlerStatic from 'VULCAN_LIB_PATH/presets/next/static/handler.js';
import { FetchEvent } from 'azion/types';

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
 * Handles the 'fetch' event.
 * @param {import('azion/types').FetchEvent} event - The fetch event.
 * @returns {Promise<Response>} The response for the request.
 */
async function handlerDefault(event: FetchEvent): Promise<Response> {
  const env = {
    ASSETS: {
      fetch: getStorageAsset,
    },
  };

  const context = {
    waitUntil: event.waitUntil.bind(event),
    passThroughOnException: () => null,
  };

  const url = new URL(decodeURI(event.request.url));
  const request = new Request(url, event.request);

  return main(request, env, context);
}

async function handler(event: FetchEvent): Promise<Response> {
  if ((globalThis as any).nextBuildStatic) {
    return handlerStatic(event);
  }
  return handlerDefault(event);
}

export default handler;
