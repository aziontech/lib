import fs from 'node:fs';

export default function wasmPlugin() {
  return {
    name: 'vite-plugin-wasm-inline',

    async load(id) {
      if (!id.endsWith('.wasm')) {
        return null;
      }

      const wasmBuffer = await fs.promises.readFile(id);
      const base64 = wasmBuffer.toString('base64');

      return `
        const wasmBase64 = '${base64}';
        const wasmBinary = Uint8Array.from(atob(wasmBase64), c => c.charCodeAt(0));
        export default wasmBinary;
      `;
    },
  };
}
