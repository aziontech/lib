import { FetchEvent } from 'azion/types';

/* eslint-disable-next-line */
// @ts-ignore - Module will be generated during build
import init, * as WasmModule from './.wasm-bindgen/azion_rust_edge_function';
/* eslint-disable-next-line */
// @ts-ignore - Module will be generated during build
import wasmData from './.wasm-bindgen/azion_rust_edge_function_bg.wasm';

let wasmPromise: Promise<unknown> | null = null;

/**
 * Handles the 'fetch' event.
 * @param {import('azion/types').FetchEvent} event - The fetch event.
 * @returns {Promise<Response>} The response for the request.
 */
async function handler(event: FetchEvent): Promise<Response> {
  try {
    if (!wasmPromise) {
      wasmPromise = fetch(wasmData).then((response) => init(response.arrayBuffer()));
    }
    return wasmPromise.then(() => WasmModule.fetch_listener(event));
  } catch (e) {
    return new Response((e as Error).message || String(e), { status: 500 });
  }
}

export default handler;
