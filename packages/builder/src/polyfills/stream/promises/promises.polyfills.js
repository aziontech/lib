/* eslint-disable */
/**
 * STREAM_CONTEXT is defined in runtime.env.js for use on the local server
 */

// `node:stream/promises` of the host Node.js. A bundler that does not pass `promises` in STREAM_CONTEXT
// gets a clear error when it is called, instead of the unenv stub one.
const notAvailable = (name) => () => {
  throw new Error(`[azion] stream/promises.${name} is not available, update @aziontech/bundler`);
};

export const pipeline = STREAM_CONTEXT.promises?.pipeline ?? notAvailable('pipeline');
export const finished = STREAM_CONTEXT.promises?.finished ?? notAvailable('finished');

export default { pipeline, finished };
