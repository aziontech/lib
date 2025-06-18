import { mountMPA } from 'azion/utils/edge';
/**
 * Handles the request using Azion Workers pattern.
 * @param {import('azion/types').AzionRuntimeRequest} request - The request object with metadata.
 * @param {import('azion/types').AzionRuntimeCtx} ctx - The execution context.
 * @returns {Promise<Response>} The response for the request.
 */
const handler = {
  fetch: async (request) => {
    try {
      const myApp = await mountMPA(request.url);
      return myApp;
    } catch (e) {
      return new Response(
        JSON.stringify({
          error: `Failed to mount Next.js application`,
          message: e instanceof Error ? e.message : 'Unknown error occurred',
          path: request.url,
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    }
  },
};

export default handler;
