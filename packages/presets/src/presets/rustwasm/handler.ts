import { AzionRuntimeModule, AzionRuntimeRequest } from 'azion/types';
import metadata from './metadata';
let wasmPromise: Promise<unknown> | null = null;

const handler: AzionRuntimeModule = {
  /**
   * Handles the 'fetch' event using Rust WASM.
   * @param {Request} request - The request object with metadata.
   * @param {Object} env - The environment context containing Azion services.
   * @param {Object} ctx - The execution context.
   * @returns {Promise<Response>} The response for the request.
   */
  fetch: async (request: AzionRuntimeRequest): Promise<Response> => {
    try {
      if (!wasmPromise) {
        wasmPromise = fetch('./.wasm-bindgen/azion_rust_edge_function_bg.wasm')
          .then((response) => response.arrayBuffer())
          .then(async (buffer) => {
            // @ts-expect-error - Module will be generated during build
            return import('./.wasm-bindgen/azion_rust_edge_function').then((module) => {
              return module.default(buffer).then(() => module);
            });
          });
      }
      const WasmModule = (await wasmPromise) as { fetch_listener: (request: AzionRuntimeRequest) => Promise<Response> };
      return WasmModule.fetch_listener(request);
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
