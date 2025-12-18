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
        const wasmJsUrl = new URL('./azion_rust_edge_function.js', 'file://');
        const wasmDataUrl = new URL('./azion_rust_edge_function_bg.wasm', 'file://');

        wasmPromise = Promise.all([
          fetch(wasmJsUrl).then((response) => response.text()),
          fetch(wasmDataUrl).then((response) => response.arrayBuffer()),
        ]).then(async ([jsCode, buffer]) => {
          // Create a CommonJS-like environment
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const module: any = { exports: {} };
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const exports: any = module.exports;

          // Transform ES module syntax to CommonJS
          const transformedCode = jsCode
            .replace(/export\s+default\s+/g, 'module.exports.default = ')
            .replace(/export\s+function\s+(\w+)/g, 'module.exports.$1 = function $1')
            .replace(/export\s+const\s+(\w+)\s*=/g, 'module.exports.$1 =')
            .replace(/export\s+let\s+(\w+)\s*=/g, 'module.exports.$1 =')
            .replace(/export\s+\{([^}]+)\}/g, (match, exports) => {
              return exports
                .split(',')
                .map((exp: string) => {
                  const name = exp.trim();
                  return `module.exports.${name} = ${name};`;
                })
                .join('\n');
            })
            .replace(/import\s+.*?from\s+['"].*?['"];?/g, '');

          // Execute the code in a function scope with module and exports
          const moduleFunc = new Function('module', 'exports', transformedCode);
          moduleFunc(module, exports);

          const wasmExports = module.exports;

          // With --target=web, the default export is the init function
          const init = wasmExports.default;

          if (typeof init !== 'function') {
            throw new Error('Could not find init function in WASM module');
          }

          // Initialize with the ArrayBuffer
          await init(buffer);

          return wasmExports;
        });
      }

      const WasmModule = await wasmPromise;

      // Call fetch_listener - it should return a Promise<Response>
      // @ts-expect-error - wasm-bindgen
      const wasmResponse = await WasmModule.fetch_listener({ request });

      // WASM returns a Response-like object, but not a native Response instance
      // We need to create a new Response from the WASM response data
      if (!wasmResponse) {
        throw new Error('WASM fetch_listener returned null or undefined');
      }

      // Create a proper Response object from the WASM response
      return new Response(wasmResponse.body, {
        status: wasmResponse.status || 200,
        statusText: wasmResponse.statusText || '',
        headers: wasmResponse.headers || {},
      });
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
