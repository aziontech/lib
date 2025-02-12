import { FetchEvent } from 'azion/types';
/* eslint-disable-next-line */
// @ts-ignore - Module will be generated during build
import createModule from './build/module';

interface WasmModule {
  fetch_listener: (event: FetchEvent) => Promise<string>;
  module: EmscriptenModule;
}

interface EmscriptenModule {
  cwrap: (name: string, returnType: string, argTypes: string[]) => (...args: unknown[]) => unknown;
  setValue: (ptr: number, value: number | boolean | string, type: string) => void;
}

let wasmPromise: Promise<unknown> | null = null;

/**
 * Handles the 'fetch' event.
 * @param {import('azion/types').FetchEvent} event - The fetch event.
 * @returns {Promise<Response>} The response for the request.
 */
async function handler(event: FetchEvent): Promise<Response> {
  try {
    if (!wasmPromise) {
      wasmPromise = new Promise((resolve) => {
        createModule().then((module: { cwrap: (arg0: string, arg1: string, arg2: string[]) => unknown }) => {
          resolve({
            fetch_listener: module.cwrap('fetch_listener', 'string', ['object']),
            module: module,
          });
        });
      });
    }
    const wasmModule = (await wasmPromise) as WasmModule;

    // Asyncfy transforms the call to fetch_listener into a promise. Therefore,
    // we need to await the result.
    const content = await wasmModule.fetch_listener(event);

    return new Response(content);
  } catch (e) {
    return new Response((e as Error).message || String(e), { status: 500 });
  }
}

export default handler;
