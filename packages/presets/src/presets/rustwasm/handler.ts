import { FetchEvent } from 'azion/types';

let wasmPromise: Promise<unknown> | null = null;

/**
 * Handles the 'fetch' event.
 * @param {import('azion/types').FetchEvent} event - The fetch event.
 * @returns {Promise<Response>} The response for the request.
 */
async function handler(event: FetchEvent): Promise<Response> {
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
    const WasmModule = (await wasmPromise) as { fetch_listener: (event: FetchEvent) => Promise<Response> };
    return WasmModule.fetch_listener(event);
  } catch (e) {
    return new Response((e as Error).message || String(e), { status: 500 });
  }
}

export default handler;
