import { mountMPA } from 'azion/utils/edge';

/**
 * Handles the 'fetch' event.
 * @param {import('azion/types').FetchEvent} event - The fetch event.
 * @returns {Promise<Response>} The response for the request.
 */
async function handler(event) {
  try {
    const myApp = await mountMPA(event.request.url);
    return myApp;
  } catch (e) {
    return new Response('Not Found', { status: 404 });
  }
}

export default handler;
