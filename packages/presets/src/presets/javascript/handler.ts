import { FetchEvent } from 'azion/types';

/**
 * Handles the 'fetch' event.
 * @param {import('azion/types').FetchEvent} event - The fetch event.
 * @returns {Promise<Response>} The response for the request.
 */
async function handler(event: FetchEvent): Promise<Response> {
  try {
    __JS_CODE__;
  } catch (e) {
    return new Response((e as Error).message || String(e), { status: 500 });
  }
}

export default handler;
