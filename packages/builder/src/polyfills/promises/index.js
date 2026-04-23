/**
 * We are not exporting the promises.polyfill.js from this structure due to the context definition in runtime.env.js.
 * As we are proxying the Node.js promises lib, it is not possible to export the promises.polyfill.js file.
 */
import promisesContext from './context/index.js';

export default promisesContext;
