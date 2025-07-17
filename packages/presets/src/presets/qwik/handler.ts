import { AzionRuntimeModule, AzionRuntimeRequest } from 'azion/types';
import { mountMPA } from 'azion/utils/edge';
import metadata from './metadata';

const handler: AzionRuntimeModule = {
  /**
   * Handles the 'fetch' event using Azion Workers pattern.
   * @param {Request} request - The request object with metadata.
   * @param {Object} env - The environment context containing Azion services.
   * @param {Object} ctx - The execution context.
   * @returns {Promise<Response>} The response for the request.
   */
  fetch: async (request: AzionRuntimeRequest): Promise<Response> => {
    try {
      const myApp: Response = await mountMPA(request.url);
      return myApp;
    } catch (e) {
      return new Response(
        JSON.stringify({
          error: `Failed to mount ${metadata.name} application`,
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
