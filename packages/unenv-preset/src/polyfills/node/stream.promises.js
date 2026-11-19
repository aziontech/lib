import * as nodeStream from 'node:stream';

/**
 * `node:stream/promises`. unenv only has stubs for it (`pipeline` and `finished` throw), but Next.js uses
 * `pipeline` to read the body of a server action.
 *
 * `node:stream` is provided by the runtime, so its own `promises` is used when it has one. Otherwise
 * `pipeline` and `finished` are built on the callback versions of `node:stream`.
 */
const nativePromises = nodeStream.promises ?? nodeStream.default?.promises;

/**
 * The last argument of `pipeline` can be an options object (`{ signal, end }`) instead of a stream.
 * @param {unknown} arg Last argument of `pipeline`
 * @returns {boolean} Whether it is the options object
 */
function isOptions(arg) {
  return (
    arg !== null &&
    typeof arg === 'object' &&
    !Array.isArray(arg) &&
    typeof arg.pipe !== 'function' &&
    typeof arg.read !== 'function' &&
    typeof arg.write !== 'function' &&
    typeof arg.getReader !== 'function' &&
    !(Symbol.asyncIterator in arg) &&
    !(Symbol.iterator in arg)
  );
}

/**
 * Fallback for runtimes where `node:stream` has no `promises`. The `end` option is not supported.
 * @param {...unknown} args Streams, with an optional options object at the end
 * @returns {Promise<unknown>} Resolves when the pipeline is done, rejects with the first error
 */
function pipelineFallback(...args) {
  return new Promise((resolve, reject) => {
    let streams = args;
    let options;
    if (streams.length > 1 && isOptions(streams[streams.length - 1])) {
      options = streams[streams.length - 1];
      streams = streams.slice(0, -1);
    }
    if (streams.length === 1 && Array.isArray(streams[0])) {
      streams = streams[0];
    }

    const signal = options?.signal;
    const onAbort = () => {
      const error = new Error('The operation was aborted');
      error.name = 'AbortError';
      error.code = 'ABORT_ERR';
      streams.forEach((stream) => stream?.destroy?.(error));
    };

    nodeStream.pipeline(...streams, (error, value) => {
      signal?.removeEventListener('abort', onAbort);
      if (error) reject(error);
      else resolve(value);
    });

    if (signal?.aborted) onAbort();
    else signal?.addEventListener('abort', onAbort, { once: true });
  });
}

/**
 * Fallback for runtimes where `node:stream` has no `promises`.
 * @param {unknown} stream Stream to wait for
 * @param {object} [options] Options of `stream.finished`
 * @returns {Promise<void>} Resolves when the stream is finished, rejects on error
 */
function finishedFallback(stream, options) {
  return new Promise((resolve, reject) => {
    nodeStream.finished(stream, options ?? {}, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

export const pipeline = nativePromises?.pipeline ?? pipelineFallback;
export const finished = nativePromises?.finished ?? finishedFallback;

export default { finished, pipeline };
