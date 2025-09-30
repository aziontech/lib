import { FetchEvent } from 'azion/types';
import { mountSPA } from 'azion/utils/edge';

/**
 * Handles the 'fetch' event.
 * @param {import('azion/types').FetchEvent} event - The fetch event.
 * @returns {Promise<Response>} The response for the request.
 */
async function handler(event: FetchEvent): Promise<Response> {
  try {
    const myApp = await mountSPA(event.request.url);
    return myApp;
  } catch {
    return new Response('Not Found', { status: 500 });
  }
}

export default handler;
