import { FetchEvent } from 'azion/types';

/**
 * Handles the 'fetch' event.
 * @param {import('azion/types').FetchEvent} event - The fetch event.
 * @returns {Promise<Response>} The response for the request.
 */
// @ts-expect-error - Expecting a TypeScript error because the '__JS_CODE__' variable is injected by the bundler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function handler(event: FetchEvent): Promise<Response> {
  try {
    // @ts-expect-error - Ignoring the TypeScript error because the '__JS_CODE__' variable is injected by the bundler
    __JS_CODE__;
  } catch (e) {
    return new Response((e as Error).message || String(e), { status: 500 });
  }
}

export default handler;
