import initAsync, { initSync } from './photon';

import wasmBase64 from './photon.wasm';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MODULE = new WebAssembly.Module(wasmBase64 as any);

initSync(MODULE);

export * from './photon';
export { MODULE, initAsync };
