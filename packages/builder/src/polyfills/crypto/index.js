/**
 * We are not exporting the crypto.polyfill.js from this structure due to the context definition in runtime.env.js.
 * As we are proxying the Node.js crypto lib, it is not possible to export the crypto.polyfill.js file.
 */
import cryptoContext from './context/index.js';

export default { cryptoContext };
