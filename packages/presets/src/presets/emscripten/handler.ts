import { AzionRuntimeModule, AzionRuntimeRequest } from 'azion/types';
import metadata from './metadata';

interface WasmModule {
  fetch_listener: (request: AzionRuntimeRequest) => Promise<string>;
  module: EmscriptenModule;
}

interface EmscriptenModule {
  cwrap: (name: string, returnType: string, argTypes: string[]) => (...args: unknown[]) => unknown;
  setValue: (ptr: number, value: number | boolean | string, type: string) => void;
}

let wasmPromise: Promise<unknown> | null = null;

const handler: AzionRuntimeModule = {
  /**
   * Handles the 'fetch' event using Emscripten WASM.
   * @param {Request} request - The request object with metadata.
   * @param {Object} ctx - The execution context.
   * @param {Object} env - The environment context containing Azion services.
   * @returns {Promise<Response>} The response for the request.
   */
  fetch: async (request: AzionRuntimeRequest): Promise<Response> => {
    try {
      if (!wasmPromise) {
        wasmPromise = new Promise((resolve) => {
          // @ts-expect-error - Module will be generated during build
          import('./build/module').then(
            (module: { cwrap: (arg0: string, arg1: string, arg2: string[]) => unknown }) => {
              resolve({
                fetch_listener: module.cwrap('fetch_listener', 'string', ['object']),
                module: module,
              });
            },
          );
        });
      }
      const wasmModule = (await wasmPromise) as WasmModule;

      // Asyncfy transforms the call to fetch_listener into a promise. Therefore,
      // we need to await the result.
      const content = await wasmModule.fetch_listener(request);

      return new Response(content);
    } catch (e) {
      return new Response(
        JSON.stringify({
          error: `Failed to mount ${metadata.name} application`,
          message: e instanceof Error ? e.message : String(e),
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
